// src/extensions/services/FooterService.ts

import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export interface IFooterListItem {
  Id: number;
  Title: string;
  URL?: { Url?: string; URL?: string; url?: string; Description?: string };
  TIRIconURL?: { Url?: string; URL?: string; url?: string; Description?: string };
  TIRSortOrder?: number;
}

export interface IFooterLink {
  id: string;
  Title: string;
  URL: string;
  TIRIconURL: string;
  TIRSortOrder: number;
}

export class FooterService {
  private cache: IFooterLink[] | null = null;

  constructor(
    private readonly spHttpClient: SPHttpClient,
    private readonly webUrl: string
  ) {}

  private linkValue(v: any): string {
    if (!v) return '';
    return v.Url || v.URL || v.url || '';
  }

  public async getFooterLinks(listTitle: string = 'Footer'): Promise<IFooterLink[]> {
    if (this.cache) return this.cache;

    const select = '$select=Id,Title,TIRSortOrder,TIRIconURL,URL';
    const order = '$orderby=TIRSortOrder asc,Id asc';
    const endpoint = `${this.webUrl}/_api/web/lists/GetByTitle('${encodeURIComponent(
      listTitle
    )}')/items?${select}&${order}`;

    try {
      const r: SPHttpClientResponse = await this.spHttpClient.get(
        endpoint,
        SPHttpClient.configurations.v1
      );
      const json: any = await r.json();
      const rows: IFooterListItem[] = json?.value || [];

      const links: IFooterLink[] = rows
        .map((it) => ({
          id: String(it.Id),
          Title: it.Title || '',
          URL: this.linkValue(it.URL),
          TIRIconURL: this.linkValue(it.TIRIconURL),
          TIRSortOrder: typeof it.TIRSortOrder === 'number' ? it.TIRSortOrder : 9999
        }))
        .filter((l) => !!l.Title && !!l.URL);

      // Sort only main links by TIRSortOrder
      links.sort(
        (a, b) =>
          a.TIRSortOrder - b.TIRSortOrder || a.Title.localeCompare(b.Title)
      );

      this.cache = links;
      return links;
    } catch (err) {
      console.error('FooterService: Failed to load footer links', err);
      return [];
    }
  }

  // NEW: Helper to split main links vs social icons
  public getMainAndSocialLinks(links: IFooterLink[]): {
    main: IFooterLink[];
    social: IFooterLink[];
  } {
    const main: IFooterLink[] = [];
    const social: IFooterLink[] = [];

    for (const link of links) {
      if (link.TIRIconURL.trim() !== '') {
        social.push(link);
      } else {
        main.push(link);
      }
    }

    return { main, social };
  }
}