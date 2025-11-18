import { MSGraphClientV3, SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export type SuggestKind = 'person' | 'page' | 'doc';
export interface ISuggestItem {
  title: string;
  subtitle?: string;
  url: string;
  imageUrl?: string;
  kind: SuggestKind;
}

export class SearchService {
  private graph?: MSGraphClientV3;

  constructor(
    private readonly webUrl: string,
    private readonly msGraphClientFactory: { getClient: (v: string) => Promise<MSGraphClientV3> },
    private readonly spHttpClient: SPHttpClient
  ) {}

  private async getGraph(): Promise<MSGraphClientV3> {
    if (!this.graph) this.graph = await this.msGraphClientFactory.getClient('3');
    return this.graph;
  }

  async queryPeople(text: string, top: number): Promise<ISuggestItem[]> {
    const client = await this.getGraph();
    const res = await client.api('/me/people')
      .header('ConsistencyLevel', 'eventual')
      .query({ $search: `"${text}"`, $top: top })
      .get();

    const people = (res?.value || []) as Array<any>;
    return people.map(p => ({
      title: p.displayName || '',
      // Figma-style: Job Title – Department
      subtitle: [p.jobTitle, p.department].filter(Boolean).join(' - ') || p.userPrincipalName || '',
      url: `mailto:${p.userPrincipalName || ''}`,
      imageUrl: '', // avatar added by caller if desired
      kind: 'person'
    }));
  }

  /**
   * Search ONLY modern site pages (Site Pages library):
   *  - ContentClass: STS_ListItem_WebPageLibrary
   *  - FileExtension: aspx
   *  - Path: current site only
   * Then map CT name -> News / Events / Training / Page.
   */
  async queryContent(text: string, take: number): Promise<ISuggestItem[]> {
    const q = text.trim();
    if (!q) return [];

    // KQL restricted to modern Site Pages only
    const kqlParts: string[] = [
      `${q}*`,
      `Path:"${this.webUrl}"`,
      'ContentClass:STS_ListItem_WebPageLibrary',
      'FileExtension:aspx',
      // hard filters to avoid system/internal stuff
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
      `${this.webUrl}/_api/search/query?querytext='${encodeURIComponent(kql)}'` +
      `&rowlimit=${take}&selectproperties='${select}'`;

    const r: SPHttpClientResponse = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
    const json: any = await r.json();
    const rows: any[] = json?.PrimaryQueryResult?.RelevantResults?.Table?.Rows || [];

    const items: ISuggestItem[] = [];

    for (const row of rows) {
      const cells: Record<string, string> = {};
      (row?.Cells || []).forEach((c: any) => { cells[c.Key] = c.Value; });

      const path = cells['Path'] || '';
      const pathLower = path.toLowerCase();
      const contentClass = (cells['contentclass'] || '').toLowerCase();
      const thumb = cells['PictureThumbnailURL'] || '';
      const contentType = cells['ContentType'] || '';

      // Only *real* modern pages in Site Pages
      const isPage =
        contentClass === 'sts_listitem_webpagelibrary' &&
        pathLower.includes('/sitepages/') &&
        pathLower.endsWith('.aspx');

      // Strict: skip anything that is not a modern Site Page
      if (!isPage) continue;

      // ---- label to show in subtitle (page category) --------------------
      let scopeLabel = 'Page';
      const ct = contentType.toLowerCase();

      if (ct.includes('news')) {
        scopeLabel = 'News';
      } else if (ct.includes('event')) {
        scopeLabel = 'Events';
      } else if (ct.includes('training')) {
        scopeLabel = 'Training';
      }
      // else keep "Page"

      const title =
        cells['Title'] ||
        path.split('/').pop() ||
        '(no title)';

      items.push({
        title,
        subtitle: scopeLabel,         // ONLY "News" / "Events" / "Training" / "Page"
        url: path || '#',
        imageUrl: thumb || undefined, // page preview if available
        kind: 'page'                  // no docs, images, etc.
      });
    }

    return items;
  }
}