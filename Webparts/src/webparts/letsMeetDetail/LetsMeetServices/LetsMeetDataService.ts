// src/webparts/letsMeetDetail/services/LetsMeetDataService.ts
import { SPHttpClient } from "@microsoft/sp-http";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export type PageVideoItem = {
  Id: number;
  Title: string;
  FileRef: string;
  LetsMeetYouTubeUrl?: string;
  LetsMeetIsActive?: boolean;
  LetsMeetSortOrder?: number;
};

export class LetsMeetDataService {
  constructor(
    private context: WebPartContext,
    private listTitle: string,
    private contentTypeName: string
  ) {}

  public async fetchCurrentPageItem(): Promise<PageVideoItem> {
    const webUrl = this.context.pageContext.web.absoluteUrl;
    const fileRef = decodeURIComponent(window.location.pathname);

    const url =
      `${webUrl}/_api/web/getfilebyserverrelativeurl('${this.escOData(
        fileRef
      )}')/ListItemAllFields` +
      `?$select=Id,Title,FileRef,LetsMeetYouTubeUrl,LetsMeetIsActive,LetsMeetSortOrder`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );
    
    if (!res.ok) {
      throw new Error(`Failed to load current page fields. (${res.status})`);
    }
    
    return (await res.json()) as PageVideoItem;
  }

  public async fetchSuggestions(
    currentId: number,
    maxSuggestions: number
  ): Promise<PageVideoItem[]> {
    const webUrl = this.context.pageContext.web.absoluteUrl;

    const url =
      `${webUrl}/_api/web/lists/getbytitle('${this.escOData(
        this.listTitle
      )}')/items` +
      `?$select=Id,Title,FileRef,LetsMeetYouTubeUrl,LetsMeetIsActive,LetsMeetSortOrder,ContentType/Name` +
      `&$expand=ContentType` +
      `&$filter=(LetsMeetIsActive eq 1) and (Id ne ${currentId}) and (ContentType/Name eq '${this.escOData(
        this.contentTypeName
      )}')` +
      `&$orderby=LetsMeetSortOrder asc,Modified desc` +
      `&$top=${maxSuggestions}`;

    const res = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1
    );

    if (!res.ok) {
      return await this.fetchSuggestionsFallback(currentId, maxSuggestions);
    }

    const json = await res.json();
    return (json?.value || []) as PageVideoItem[];
  }

  private async fetchSuggestionsFallback(
    currentId: number,
    maxSuggestions: number
  ): Promise<PageVideoItem[]> {
    const webUrl = this.context.pageContext.web.absoluteUrl;
    
    const fallbackUrl =
      `${webUrl}/_api/web/lists/getbytitle('${this.escOData(
        this.listTitle
      )}')/items` +
      `?$select=Id,Title,FileRef,LetsMeetYouTubeUrl,LetsMeetIsActive,LetsMeetSortOrder` +
      `&$filter=(LetsMeetIsActive eq 1) and (Id ne ${currentId})` +
      `&$orderby=LetsMeetSortOrder asc,Modified desc` +
      `&$top=${maxSuggestions}`;

    const res = await this.context.spHttpClient.get(
      fallbackUrl,
      SPHttpClient.configurations.v1
    );
    
    if (!res.ok) {
      throw new Error(`Failed to load suggestions. (${res.status})`);
    }
    
    const json = await res.json();
    return (json?.value || []) as PageVideoItem[];
  }

  private escOData(val: string): string {
    return (val || "").replace(/'/g, "''");
  }
}