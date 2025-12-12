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

/**
 * ================================================
 * PROFILE PAGE CONFIG
 * ================================================
 *
 * Only change PROFILE_PAGE_NAME (and optionally PROFILE_PAGE_FOLDER).
 *
 * Example 1 – custom modern page in current site:
 *   PROFILE_PAGE_FOLDER = 'SitePages';
 *   PROFILE_PAGE_NAME   = 'profile-page.aspx';
 *   => https://<current-site>/SitePages/profile-page.aspx?accountname=<upn>
 *
 * Example 2 – classic user profile page:
 *   USE_CLASSIC_PROFILE = true;
 *   => https://<current-site>/_layouts/15/userprofile.aspx?accountname=<upn>
 */
const PROFILE_PAGE_FOLDER: string = 'SitePages';        // 'SitePages' or 'Pages' etc.
const PROFILE_PAGE_NAME: string   = 'profile.aspx'; // only file name to change

// Set this true if you want classic userprofile.aspx instead of custom page.
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
   * Build the profile URL for a given user UPN/email.
   * - Tenant + site come from this.webUrl (dynamic)
   * - Only PROFILE_PAGE_NAME is edited manually
   */
  private buildPersonProfileUrl(upn: string): string {
    if (!upn) return '#';

    // Current web URL without trailing slash
    const baseWeb = this.webUrl.replace(/\/$/, '');

    if (USE_CLASSIC_PROFILE) {
      // Classic profile page under _layouts
      const classicUrl = `${baseWeb}/_layouts/15/userprofile.aspx`;
      const sep = classicUrl.indexOf('?') >= 0 ? '&' : '?';
      return `${classicUrl}${sep}accountname=${encodeURIComponent(upn)}`;
    }

    // Custom modern page: <current-site>/<folder>/<page>.aspx
    const folder = PROFILE_PAGE_FOLDER.replace(/^\/|\/$/g, ''); // no leading/trailing slash
    const page   = PROFILE_PAGE_NAME.replace(/^\//, '');        // no leading slash

    const pagePath = `${baseWeb}/${folder}/${page}`;
    const sep = pagePath.indexOf('?') >= 0 ? '&' : '?';

    return `${pagePath}${sep}accountname=${encodeURIComponent(upn)}`;
  }

  // ------------------------------------------------------------------
  // PEOPLE SUGGESTIONS  (Graph directory search: /users?$search=)
  // ------------------------------------------------------------------
  /**
   * Uses Microsoft Graph directory search:
   *   GET /users?$search="text"&$top=n&$count=true
   *
   * Returns:
   *  - title:     displayName
   *  - subtitle:  "jobTitle - department"
   *  - imageUrl:  userphoto.aspx (built from UPN/mail)
   *  - url:       profile page (custom or classic) via buildPersonProfileUrl
   */
  public async queryPeople(text: string, top: number): Promise<ISuggestItem[]> {
    const q = text.trim();
    if (!q) return [];

    try {
      const client = await this.getGraph();

      // Strip quotes just in case
      const term = q.replace(/["']/g, '');

      // Graph directory search requires property:value format
      // Allowed props: displayName, mail, givenName, surname, userPrincipalName
      const searchExpr = `"displayName:${term}"`;

      const res = await client
        .api('/users')
        .header('ConsistencyLevel', 'eventual') // required for $search + $count
        .query({
          $search: searchExpr,
          $top: top,
          $count: 'true'
        })
        .get();

      const users: any[] = res?.value || [];

      const items: ISuggestItem[] = users.map(u => {
        const displayName: string = u.displayName || '';
        const jobTitle: string = u.jobTitle || '';
        const dept: string = u.department || '';
        const upn: string = u.userPrincipalName || u.mail || '';

        const subtitleParts = [jobTitle, dept].filter(Boolean);
        const subtitle: string = subtitleParts.join(' - ') || upn || '';

        const photoKey: string = upn || u.id || '';
        const photoUrl: string = photoKey
          ? `${this.webUrl}/_layouts/15/userphoto.aspx?size=M&username=${encodeURIComponent(
              photoKey
            )}`
          : '';

        const personUrl = this.buildPersonProfileUrl(upn);

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
      // console.error('[SearchService.queryPeople] Graph error', e);
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
