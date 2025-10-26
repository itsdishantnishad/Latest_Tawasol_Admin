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
      subtitle: [p.jobTitle, p.department].filter(Boolean).join(' - ') || p.userPrincipalName || '',
      url: `mailto:${p.userPrincipalName || ''}`,
      imageUrl: '', // avatar added by caller if desired
      kind: 'person'
    }));
  }

  async queryContent(text: string, take: number): Promise<ISuggestItem[]> {
    const kql = `${text}*`;
    const select = [
      'Title','Path','FileType','contentclass','SPWebUrl',
      'PictureThumbnailURL','SiteTitle','Author','HitHighlightedSummary'
    ].join(',');

    const url = `${this.webUrl}/_api/search/query?querytext='${encodeURIComponent(kql)}'&rowlimit=${take}&selectproperties='${select}'`;
    const r: SPHttpClientResponse = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
    const json: any = await r.json();
    const rows: any[] = json?.PrimaryQueryResult?.RelevantResults?.Table?.Rows || [];

    return rows.map(row => {
      const cells: Record<string, string> = {};
      (row?.Cells || []).forEach((c: any) => { cells[c.Key] = c.Value; });

      const isPage = (cells['contentclass'] || '').indexOf('STS_ListItem') === 0;
      const thumb = cells['PictureThumbnailURL'] || '';

      return {
        title: cells['Title'] || (cells['Path'] || '').split('/').pop() || '(no title)',
        subtitle: isPage
          ? (cells['SiteTitle'] || cells['SPWebUrl'] || '')
          : (cells['FileType'] ? (cells['FileType'] + ' • ' + (cells['SiteTitle'] || '')) : (cells['SiteTitle'] || '')),
        url: cells['Path'] || '#',
        imageUrl: isPage ? (thumb || undefined) : undefined,
        kind: isPage ? 'page' : 'doc'
      } as ISuggestItem;
    });
  }
}
