import {
  MSGraphClientV3,
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';

export type SuggestKind = 'person' | 'page' | 'doc';

export interface ISuggestItem {
  title: string;
  subtitle?: string;
  url: string;
  imageUrl?: string;
  kind: SuggestKind;
}


// ================================================
// PROFILE PAGE CONFIG
// ================================================

const PROFILE_PAGE_FOLDER: string = 'SitePages';
const PROFILE_PAGE_NAME: string = 'Profile.aspx';
const USE_CLASSIC_PROFILE: boolean = false;

export class SearchService {
  private graph?: MSGraphClientV3;

  constructor(
    private readonly webUrl: string,
    private readonly msGraphClientFactory: { getClient: (v: string) => Promise<MSGraphClientV3> },
    private readonly spHttpClient: SPHttpClient
  ) {}

  private async getGraph(): Promise<MSGraphClientV3> {
    if (!this.graph) {
      this.graph = await this.msGraphClientFactory.getClient('3');
    }
    return this.graph;
  }

  private escapeKql(text: string): string {
    return (text || '').replace(/["']/g, '');
  }

  /**
   * Build the profile URL for a given user.
   * Best practice: use AAD ObjectId (uid) + optional UPN for fallback.
   */
  private buildPersonProfileUrl(args: { uid?: string; upn?: string }): string {
    const uid = String(args?.uid || '').trim();
    const upn = String(args?.upn || '').trim();

    if (!uid && !upn) return '#';

    // Current web URL without trailing slash
    const baseWeb = this.webUrl.replace(/\/$/, '');

    if (USE_CLASSIC_PROFILE) {
      // Classic profile page under _layouts (supports accountname)
      const classicUrl = `${baseWeb}/_layouts/15/userprofile.aspx`;
      const account = upn || uid; // fallback if UPN missing
      const sep = classicUrl.indexOf('?') >= 0 ? '&' : '?';
      return `${classicUrl}${sep}accountname=${encodeURIComponent(account)}`;
    }

    // Custom modern page: <current-site>/<folder>/<page>.aspx
    const folder = PROFILE_PAGE_FOLDER.replace(/^\/|\/$/g, '');
    const page = PROFILE_PAGE_NAME.replace(/^\//, '');

    const pagePath = `${baseWeb}/${folder}/${page}`;

    const qp: string[] = [];
    if (uid) qp.push(`uid=${encodeURIComponent(uid)}`);
    if (upn) qp.push(`accountname=${encodeURIComponent(upn)}`);

    return `${pagePath}?${qp.join('&')}`;
  }

  // ------------------------------------------------------------------
  // PEOPLE SUGGESTIONS  (Graph directory search: /users?$search=)
  // ------------------------------------------------------------------
  public async queryPeople(text: string, top: number): Promise<ISuggestItem[]> {
    const q = text.trim();
    if (!q) return [];

    try {
      const client = await this.getGraph();
      const term = q.replace(/["']/g, '');

      // Better search coverage: name OR email OR UPN
      const searchExpr =
        `"displayName:${term}" OR "mail:${term}" OR "userPrincipalName:${term}"`;

      const res = await client
        .api('/users')
        .header('ConsistencyLevel', 'eventual') // required for $search + $count
        .query({
          $search: searchExpr,
          $top: top,
          $count: 'true'
        })
        .select('id,displayName,jobTitle,department,mail,userPrincipalName')
        .get();

      const users: any[] = res?.value || [];

      const baseWeb = this.webUrl.replace(/\/$/, '');
      const items: ISuggestItem[] = users.map(u => {
        const displayName: string = u.displayName || '';
        const jobTitle: string = u.jobTitle || '';
        const dept: string = u.department || '';

        // Prefer UPN for thumbnails and fallback
        const upn: string = u.userPrincipalName || u.mail || '';
        const uid: string = u.id || '';

        const subtitleParts = [jobTitle, dept].filter(Boolean);
        const subtitle: string = subtitleParts.join(' - ') || upn || '';

        // userphoto.aspx works best with accountname=<UPN>
        const photoUrl: string = upn
          ? `${baseWeb}/_layouts/15/userphoto.aspx?size=M&accountname=${encodeURIComponent(upn)}`
          : '';

        // Build your custom profile page URL using uid + upn fallback
        const personUrl = this.buildPersonProfileUrl({ uid, upn });

        return {
          title: displayName || upn || '(no name)',
          subtitle,
          url: personUrl,
          imageUrl: photoUrl || undefined,
          kind: 'person' as const
        };
      });

      return items;
    } catch {
      return [];
    }
  }

  // ------------------------------------------------------------------
  // PAGE SUGGESTIONS  (modern Site Pages only)
  // ------------------------------------------------------------------
  public async queryContent(text: string, take: number): Promise<ISuggestItem[]> {
    const q = text.trim();
    if (!q) return [];

    const safe = this.escapeKql(q);

    const kqlParts: string[] = [
      `(Title:${safe}* OR FileName:${safe}*)`,
      `Path:"${this.webUrl}"`,
      'ContentClass:STS_ListItem_WebPageLibrary',
      'FileExtension:aspx',
      `-Path:"${this.webUrl}/_layouts/"`,
      `-Path:"${this.webUrl}/_catalogs/"`,
      `-Path:"${this.webUrl}/Lists/"`,
      `-Path:"${this.webUrl}/SiteAssets/"`
    ];
    const kql = kqlParts.join(' AND ');

    const select = [
      'Title',
      'Path',
      'FileType',
      'contentclass',
      'ContentType',
      'SPWebUrl',
      'PictureThumbnailURL',
      'SiteTitle',
      'Author',
      'HitHighlightedSummary'
    ].join(',');

    const url =
      `${this.webUrl}/_api/search/query?` +
      `querytext='${encodeURIComponent(kql)}'` +
      `&rowlimit=${take}` +
      `&selectproperties='${select}'`;

    const r: SPHttpClientResponse = await this.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    const json: any = await r.json();
    const rows: any[] =
      json?.PrimaryQueryResult?.RelevantResults?.Table?.Rows || [];

    const items: ISuggestItem[] = [];

    for (const row of rows) {
      const cells: Record<string, string> = {};
      (row?.Cells || []).forEach((c: any) => {
        cells[c.Key] = c.Value;
      });

      const path = cells['Path'] || '';
      const pathLower = path.toLowerCase();
      const contentClass = (cells['contentclass'] || '').toLowerCase();
      const thumb = cells['PictureThumbnailURL'] || '';
      const contentType = cells['ContentType'] || '';
      const isPage =
        contentClass === 'sts_listitem_webpagelibrary' &&
        pathLower.includes('/sitepages/') &&
        pathLower.endsWith('.aspx');

      if (!isPage) continue;

      let scopeLabel = 'Page';
      const ct = contentType.toLowerCase();

      if (ct.includes('news')) {
        scopeLabel = 'News';
      } else if (ct.includes('event')) {
        scopeLabel = 'Events';
      } else if (ct.includes('training')) {
        scopeLabel = 'Training';
      }

      const title =
        cells['Title'] ||
        path.split('/').pop() ||
        '(no title)';

      items.push({
        title,
        subtitle: scopeLabel,
        url: path || '#',
        imageUrl: thumb || undefined,
        kind: 'page'
      });
    }

    return items;
  }
}
