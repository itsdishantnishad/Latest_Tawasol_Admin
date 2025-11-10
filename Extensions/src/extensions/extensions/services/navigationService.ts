// Loads FloatingNav items from the "Navigation" list.
// Columns (internal names): Title (Text), URL (Hyperlink), TIRIconURL (Hyperlink), TIRSortOrder (Number)

import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export interface INavListItem {
  Id: number;
  Title: string;
  URL?: { Url?: string; URL?: string; url?: string; Description?: string };
  TIRIconURL?: { Url?: string; URL?: string; url?: string; Description?: string };
  TIRSortOrder?: number;
}

export interface INavLink {
  id: string;
  label: string;
  url: string;
  icon: string;
  order: number;
}

export class NavigationService {
  private cache: INavLink[] | null = null;

  constructor(private readonly spHttpClient: SPHttpClient, private readonly webUrl: string) {}

  private linkValue(v: any): string {
    if (!v) return '';
    return v.Url || v.URL || v.url || '';
  }

  public async getNavLinks(listTitle: string = 'Navigation'): Promise<INavLink[]> {
    if (this.cache) return this.cache;

    const select = '$select=Id,Title,TIRSortOrder,TIRIconURL,URL';
    const order = '$orderby=TIRSortOrder asc,Id asc';
    const endpoint = `${this.webUrl}/_api/web/lists/GetByTitle('${encodeURIComponent(listTitle)}')/items?${select}&${order}`;

    try {
      const r: SPHttpClientResponse = await this.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
      const json: any = await r.json();
      const rows: INavListItem[] = json?.value || [];

      const links: INavLink[] = rows.map(it => ({
        id: String(it.Id),
        label: it.Title || '',
        url: this.linkValue(it.URL),
        icon: this.linkValue(it.TIRIconURL),
        order: typeof it.TIRSortOrder === 'number' ? it.TIRSortOrder : 9999
      })).filter(l => !!l.label && !!l.url);

      // already ordered by REST; extra safety:
      links.sort((a, b) => (a.order - b.order) || (a.label.localeCompare(b.label)));

      this.cache = links;
      return links;
    } catch {
      // If list missing or query fails, return empty; caller will fallback.
      return [];
    }
  }
}
