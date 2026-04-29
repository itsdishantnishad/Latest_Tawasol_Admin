// searchService.ts

import {
  MSGraphClientV3,
  MSGraphClientFactory,
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

  /**
   * Normalized identifiers for the current logged-in user.
   * Used to detect when the search result is "me" and avoid adding uid/accountname.
   */
  private readonly _meIds: Set<string>;

  constructor(
    private readonly webUrl: string,
    private readonly msGraphClientFactory: MSGraphClientFactory,
    private readonly spHttpClient: SPHttpClient,
    me?: { upn?: string; email?: string; loginName?: string }
  ) {
    const ids = new Set<string>();

    const rawUpn = (me?.upn || '').trim();
    const rawEmail = (me?.email || '').trim();
    const rawLogin = (me?.loginName || '').trim();

    const n1 = this._normalizeAccount(rawUpn);
    const n2 = this._normalizeAccount(rawEmail);
    const n3 = this._normalizeAccount(rawLogin);

    if (n1) ids.add(n1);
    if (n2) ids.add(n2);
    if (n3) ids.add(n3);

    // loginName can be: i:0#.f|membership|user@tenant.com
    if (rawLogin.includes('|')) {
      const last = rawLogin.split('|').pop() || '';
      const nLast = this._normalizeAccount(last);
      if (nLast) ids.add(nLast);
    }

    this._meIds = ids;
  }

  private _normalizeAccount(value: string): string {
    const v = (value || '').trim();
    if (!v) return '';
    const noClaims = v.includes('|') ? (v.split('|').pop() || v) : v;
    return noClaims.trim().toLowerCase();
  }

  private _isMe(upn?: string): boolean {
    const n = this._normalizeAccount(upn || '');
    return !!n && this._meIds.has(n);
  }

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

    // ✅ SELF: open clean Profile.aspx (no params) so right panel is not hidden
    if (this._isMe(upn)) {
      return pagePath;
    }

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
      `-FileName:Form.aspx`
    ];

    const kql = kqlParts.filter(Boolean).join(' AND ');

    const select = [
      'Title',
      'Path',
      'FileName',
      'HitHighlightedSummary',
      'ListItemId',
      'ParentLink'
    ].join(',');

    const api =
      `${this.webUrl.replace(/\/$/, '')}/_api/search/query` +
      `?querytext='${encodeURIComponent(kql)}'` +
      `&selectproperties='${encodeURIComponent(select)}'` +
      `&rowlimit=${take}` +
      `&trimduplicates=true`;

    try {
      const res: SPHttpClientResponse = await this.spHttpClient.get(
        api,
        SPHttpClient.configurations.v1
      );

      if (!res.ok) return [];

      const data = await res.json();

      const rows: any[] =
        data?.PrimaryQueryResult?.RelevantResults?.Table?.Rows || [];

      const items: ISuggestItem[] = [];

      for (const r of rows) {
        const cells: any[] = r?.Cells || [];
        const get = (k: string): string => {
          const c = cells.find(x => x?.Key === k);
          return (c?.Value || '').toString();
        };

        const title = get('Title') || get('FileName') || '(no title)';
        const path = get('Path');
        const thumb = ''; // reserved

        // Scope label
        const scopeLabel = 'Page';

        items.push({
          title,
          subtitle: scopeLabel,
          url: path || '#',
          imageUrl: thumb || undefined,
          kind: 'page'
        });
      }

      return items;
    } catch {
      return [];
    }
  }
}
