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

  async queryContent(text: string, take: number): Promise<ISuggestItem[]> {
    // only search in current site
    const kql = `${text}* AND Path:"${this.webUrl}"`;

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

    return rows.map(row => {
      const cells: Record<string, string> = {};
      (row?.Cells || []).forEach((c: any) => { cells[c.Key] = c.Value; });

      const path = cells['Path'] || '';
      const pathLower = path.toLowerCase();
      const contentClass = (cells['contentclass'] || '').toLowerCase();
      const thumb = cells['PictureThumbnailURL'] || '';
      const fileType = cells['FileType'] || '';
      const contentType = cells['ContentType'] || '';

      // true only for *real* modern pages in Site Pages
      const isPage =
        contentClass === 'sts_listitem_webpagelibrary' &&
        pathLower.includes('/sitepages/') &&
        pathLower.endsWith('.aspx');

      const isSiteAsset = pathLower.includes('/siteassets/');

      // ---- label to show in subtitle (no site name now) --------------------
      let scopeLabel = '';

      if (isPage) {
        const ct = contentType.toLowerCase();
        if (ct.includes('news'))      scopeLabel = 'News';
        else if (ct.includes('event')) scopeLabel = 'Events';
        else                           scopeLabel = 'Page';
      } else {
        if (isSiteAsset) {
          // e.g. SiteAssets/SitePages/... (image web part folders)
          scopeLabel = 'Site Assets';
        } else if (fileType) {
          scopeLabel = fileType.toUpperCase();   // PDF, PPTX, DOCX...
        } else {
          scopeLabel = 'Item';
        }
      }

      const subtitle = scopeLabel; // <- only the label, no site title

      return {
        title: cells['Title'] || path.split('/').pop() || '(no title)',
        subtitle,
        url: path || '#',
        imageUrl: isPage ? (thumb || undefined) : undefined,
        kind: isPage ? 'page' : 'doc'
      } as ISuggestItem;
    });
  }
}
