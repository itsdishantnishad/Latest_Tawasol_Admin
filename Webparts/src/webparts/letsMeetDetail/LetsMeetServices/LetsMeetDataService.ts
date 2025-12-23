
import { SPHttpClient } from "@microsoft/sp-http";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export type PageVideoItem = {
  Id: number;
  Title: string;
  FileRef: string;
  URL?: any;
  SortOrder?: number;
};

export class LetsMeetDataService {
  private _urlInternal: string | null = null;
  private _sortInternal: string | null = null;
  private _ctIdPrefix: string | null = null;

  constructor(
    private context: WebPartContext,
    private listTitle: string,
    private contentTypeName: string 
  ) {}

  public async fetchCurrentPageItem(): Promise<PageVideoItem> {
    const webUrl = this.context.pageContext.web.absoluteUrl;
    const fileRef = decodeURIComponent(window.location.pathname);

    const { urlInternal, sortInternal } = await this.ensureFieldInternalNames();

    const url =
      `${webUrl}/_api/web/getfilebyserverrelativeurl('${this.escOData(fileRef)}')/ListItemAllFields` +
      `?$select=Id,Title,FileRef,${urlInternal},${sortInternal}`;

    const res = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1);

    if (!res.ok) {
      throw new Error(`Failed to load current page fields. (${res.status})`);
    }

    const raw = await res.json();
    return this.normalizeItem(raw, urlInternal, sortInternal);
  }

  public async fetchSuggestions(currentId: number, maxSuggestions: number): Promise<PageVideoItem[]> {
    const webUrl = this.context.pageContext.web.absoluteUrl;

    const { urlInternal, sortInternal } = await this.ensureFieldInternalNames();
    const ctPrefix = await this.ensureContentTypeIdPrefix();

    const url =
      `${webUrl}/_api/web/lists/getbytitle('${this.escOData(this.listTitle)}')/items` +
      `?$select=Id,Title,FileRef,${urlInternal},${sortInternal},Modified,ContentTypeId` +
      `&$filter=(Id ne ${currentId}) and startswith(ContentTypeId,'${this.escOData(ctPrefix)}')` +
      `&$orderby=${sortInternal} asc,Modified desc` +
      `&$top=${maxSuggestions}`;

    const res = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1);

    if (!res.ok) {
      return await this.fetchSuggestionsFallback(currentId, maxSuggestions, urlInternal, sortInternal);
    }

    const json = await res.json();
    const items = (json?.value || []) as any[];
    return items.map(i => this.normalizeItem(i, urlInternal, sortInternal));
  }

  private async fetchSuggestionsFallback(
    currentId: number,
    maxSuggestions: number,
    urlInternal: string,
    sortInternal: string
  ): Promise<PageVideoItem[]> {
    const webUrl = this.context.pageContext.web.absoluteUrl;

    const fallbackUrl =
      `${webUrl}/_api/web/lists/getbytitle('${this.escOData(this.listTitle)}')/items` +
      `?$select=Id,Title,FileRef,${urlInternal},${sortInternal},Modified` +
      `&$filter=(Id ne ${currentId})` +
      `&$orderby=${sortInternal} asc,Modified desc` +
      `&$top=${maxSuggestions}`;

    const res = await this.context.spHttpClient.get(fallbackUrl, SPHttpClient.configurations.v1);

    if (!res.ok) {
      throw new Error(`Failed to load suggestions. (${res.status})`);
    }

    const json = await res.json();
    const items = (json?.value || []) as any[];
    return items.map(i => this.normalizeItem(i, urlInternal, sortInternal));
  }

  // ✅ Resolve internal names by display Title ("URL" and "Sort Order")
  private async ensureFieldInternalNames(): Promise<{ urlInternal: string; sortInternal: string }> {
    if (this._urlInternal && this._sortInternal) {
      return { urlInternal: this._urlInternal, sortInternal: this._sortInternal };
    }

    const urlInternal = await this.getFieldInternalNameByTitle("URL");
    const sortInternal = await this.getFieldInternalNameByTitle("Sort Order");

    this._urlInternal = urlInternal;
    this._sortInternal = sortInternal;

    return { urlInternal, sortInternal };
  }

  private async getFieldInternalNameByTitle(title: string): Promise<string> {
    const webUrl = this.context.pageContext.web.absoluteUrl;

    const url =
      `${webUrl}/_api/web/lists/getbytitle('${this.escOData(this.listTitle)}')/fields` +
      `?$select=InternalName,Title` +
      `&$filter=Title eq '${this.escOData(title)}'` +
      `&$top=1`;

    const res = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    if (!res.ok) {
      throw new Error(`Failed to resolve internal name for field '${title}'. (${res.status})`);
    }

    const json = await res.json();
    const field = json?.value?.[0];

    if (!field?.InternalName) {
      throw new Error(`Field '${title}' not found on list '${this.listTitle}'. Please check column name.`);
    }

    return field.InternalName as string;
  }
  private async ensureContentTypeIdPrefix(): Promise<string> {
    if (this._ctIdPrefix) return this._ctIdPrefix;

    const webUrl = this.context.pageContext.web.absoluteUrl;

    const url =
      `${webUrl}/_api/web/lists/getbytitle('${this.escOData(this.listTitle)}')/contenttypes` +
      `?$select=Name,Id` +
      `&$filter=Name eq '${this.escOData(this.contentTypeName)}'` +
      `&$top=1`;

    const res = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    if (!res.ok) {
      throw new Error(`Failed to resolve content type '${this.contentTypeName}'. (${res.status})`);
    }

    const json = await res.json();
    const ct = json?.value?.[0];
    const id: string | undefined = ct?.Id?.StringValue || ct?.Id;

    if (!id) {
      throw new Error(
        `Content type '${this.contentTypeName}' not found on list '${this.listTitle}'. Ensure CT exists in this site.`
      );
    }

    this._ctIdPrefix = id;
    return id;
  }
  private normalizeItem(raw: any, urlInternal: string, sortInternal: string): PageVideoItem {
    return {
      Id: raw?.Id,
      Title: raw?.Title,
      FileRef: raw?.FileRef,
      URL: raw?.[urlInternal],
      SortOrder: raw?.[sortInternal],
    };
  }

  private escOData(val: string): string {
    return (val || "").replace(/'/g, "''");
  }
}
