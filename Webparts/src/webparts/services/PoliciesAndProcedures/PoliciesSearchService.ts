import type { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPHttpClient, ISPHttpClientOptions } from "@microsoft/sp-http";
import type { IPoliciesAndProceduresItem } from "./ViewPageListTypes";

type SearchHit = {
  serverRelativeUrl: string;
  name: string;
  ext?: string;
  modifiedOn?: Date;
};

type SearchResultPage = {
  items: IPoliciesAndProceduresItem[];
  totalCount: number;
  nextStartRow?: number;
};

export default class PoliciesSearchService {
  private readonly _ctx?: WebPartContext;

  constructor(context?: WebPartContext) {
    this._ctx = context;
  }

  public static matches(text: string, query: string): boolean {
    const normalizedQuery = (query || "").trim().toLowerCase();
    if (!normalizedQuery) return true;
    return (text || "").toLowerCase().includes(normalizedQuery);
  }

  public static toKey(pathOrId: string): string {
    return PoliciesSearchService.normalizeServerRelDisplay(pathOrId).toLowerCase();
  }

  private static decodeDeep(input: string): string {
    let currentValue = (input || "").trim();
    for (let attemptIndex = 0; attemptIndex < 3; attemptIndex++) {
      try {
        const decodedValue = decodeURIComponent(currentValue);
        if (decodedValue === currentValue) break;
        currentValue = decodedValue;
      } catch {
        break;
      }
    }
    return currentValue;
  }

  public static normalizeServerRelDisplay(pathOrAbsoluteUrl: string): string {
    let rawValue = (pathOrAbsoluteUrl || "").trim();
    if (!rawValue) return "";

    if (/^https?:\/\//i.test(rawValue)) {
      try {
        rawValue = new URL(rawValue).pathname || rawValue;
      } catch {
        // keep rawValue
      }
    }

    rawValue = rawValue.split("?")[0].split("#")[0];
    if (!rawValue.startsWith("/")) rawValue = `/${rawValue}`;

    const pathSegments = rawValue
      .split("/")
      .filter(Boolean)
      .map((segment) => PoliciesSearchService.decodeDeep(segment));

    return "/" + pathSegments.join("/");
  }

  private static encodeServerRelForUrl(serverRelativeDisplayPath: string): string {
    const trimmedPath = (serverRelativeDisplayPath || "").trim();
    if (!trimmedPath) return "";
    const encodedSegments = trimmedPath.split("/").filter(Boolean).map(encodeURIComponent);
    return "/" + encodedSegments.join("/");
  }

  private static toAbsoluteForKql(origin: string, serverRelativeDisplayPath: string): string {
    const encodedServerRelative = PoliciesSearchService.encodeServerRelForUrl(serverRelativeDisplayPath);
    return `${origin}${encodedServerRelative}`;
  }

  public static buildFunctionRootRel(libraryRootServerRelative: string, functionDisplayName: string): string {
    const normalizedLibraryRoot = (libraryRootServerRelative || "").trim().replace(/\/$/, "");
    const safeFunctionName = (functionDisplayName || "").replace(/\/+/g, " ").trim();
    return PoliciesSearchService.normalizeServerRelDisplay(`${normalizedLibraryRoot}/${safeFunctionName}`);
  }

  public static getFolderChainFromFile(fileServerRelativeUrl: string, functionRootRel: string): string[] {
    const normalizedFilePath = PoliciesSearchService.normalizeServerRelDisplay(fileServerRelativeUrl);
    const normalizedFunctionRoot = PoliciesSearchService.normalizeServerRelDisplay(functionRootRel);

    if (!normalizedFilePath || !normalizedFunctionRoot) return [];

    const fileSegments = normalizedFilePath.split("/").filter(Boolean);
    const rootSegments = normalizedFunctionRoot.split("/").filter(Boolean);

    for (let segmentIndex = 0; segmentIndex < rootSegments.length; segmentIndex++) {
      if ((fileSegments[segmentIndex] || "").toLowerCase() !== rootSegments[segmentIndex].toLowerCase()) {
        return [];
      }
    }

    if (fileSegments.length <= rootSegments.length + 1) return [];

    const folderSegments = fileSegments.slice(rootSegments.length, fileSegments.length - 1);

    const folderChain: string[] = [];
    const currentSegments = [...rootSegments];

    for (const folderSegment of folderSegments) {
      currentSegments.push(folderSegment);
      folderChain.push("/" + currentSegments.join("/"));
    }

    return folderChain;
  }

  private escapeKqlValue(value: string): string {
    return (value || "")
      .replace(/["']/g, "")
      .replace(/[<>]/g, " ")
      .trim();
  }

  private buildFilenameTitleKql(query: string): string {
    const tokens = (query || "")
      .trim()
      .split(/\s+/)
      .map((token) => this.escapeKqlValue(token))
      .filter(Boolean);

    if (!tokens.length) return "";
    return tokens.map((token) => `(Filename:"${token}*" OR Title:"${token}*")`).join(" AND ");
  }

  private extractRows(searchJson: any): any[] {
    return (
      searchJson?.PrimaryQueryResult?.RelevantResults?.Table?.Rows ??
      searchJson?.d?.postquery?.PrimaryQueryResult?.RelevantResults?.Table?.Rows ??
      searchJson?.d?.PrimaryQueryResult?.RelevantResults?.Table?.Rows ??
      []
    );
  }

  private mapRowsToHits(rows: any[]): SearchHit[] {
    const getCellValue = (row: any, cellKey: string): string => {
      const cells: any[] = row?.Cells ?? [];
      const matchingCell = cells.find((cell) => (cell?.Key || "").toLowerCase() === cellKey.toLowerCase());
      return (matchingCell?.Value ?? "").toString();
    };

    return rows
      .map((row) => {
        const absolutePath = getCellValue(row, "Path");
        if (!absolutePath) return null;

        let encodedPathname = "";
        try {
          encodedPathname = new URL(absolutePath).pathname;
        } catch {
          return null;
        }

        const filename = getCellValue(row, "Filename");
        const title = getCellValue(row, "Title");
        const displayName = (title || filename || "").trim() || "Document";

        const extension = (getCellValue(row, "FileExtension") || "").toLowerCase();
        const lastModifiedText = getCellValue(row, "LastModifiedTime");
        const modifiedDate = lastModifiedText ? new Date(lastModifiedText) : undefined;

        const serverRelativeUrl = PoliciesSearchService.normalizeServerRelDisplay(encodedPathname);
        return { serverRelativeUrl, name: displayName, ext: extension, modifiedOn: modifiedDate } as SearchHit;
      })
      .filter(Boolean) as SearchHit[];
  }

  private hitsToItems(searchHits: SearchHit[]): IPoliciesAndProceduresItem[] {
    const uniqueHitByKey = new Map<string, SearchHit>();
    for (const searchHit of searchHits) {
      uniqueHitByKey.set(PoliciesSearchService.toKey(searchHit.serverRelativeUrl), searchHit);
    }

    return Array.from(uniqueHitByKey.values()).map((searchHit) => {
      const encodedServerRelative = PoliciesSearchService.encodeServerRelForUrl(searchHit.serverRelativeUrl);
      return {
        id: searchHit.serverRelativeUrl,
        name: searchHit.name,
        isFolder: false,
        ext: searchHit.ext as any,
        modifiedOn: searchHit.modifiedOn,
        previewUrl: `${encodedServerRelative}?web=1`,
        serverRelativeUrl: searchHit.serverRelativeUrl
      };
    });
  }

  private buildNoMetadataOptions(
    kqlQueryText: string,
    rowLimit: number,
    startRow: number = 0,
    selectProperties: string[]
  ): ISPHttpClientOptions {
    return {
      headers: {
        "Accept": "application/json;odata=nometadata",
        "Content-Type": "application/json;odata=nometadata",
        "odata-version": ""
      },
      body: JSON.stringify({
        request: {
          Querytext: kqlQueryText,
          RowLimit: rowLimit,
          StartRow: startRow,
          TrimDuplicates: false,
          ClientType: "ContentSearchRegular",
          SelectProperties: selectProperties
        }
      })
    };
  }

  public async searchFilesInFunctionPaged(
    libraryRootServerRelative: string,
    functionDisplayName: string,
    query: string,
    options: {
      pageSize?: number;
      startRow?: number;
      maxTotal?: number;  // New: optional cap on total items to fetch
    } = {}
  ): Promise<SearchResultPage> {
    if (!this._ctx) return { items: [], totalCount: 0 };

    const { pageSize = 500, startRow = 0, maxTotal = 2000 } = options;
    const trimmedQuery = (query || "").trim();
    if (!trimmedQuery) return { items: [], totalCount: 0 };

    const webAbsoluteUrl = this._ctx.pageContext.web.absoluteUrl.replace(/\/$/, "");
    const origin = new URL(webAbsoluteUrl).origin;

    const functionRootServerRelative = PoliciesSearchService.buildFunctionRootRel(
      libraryRootServerRelative,
      functionDisplayName
    );

    const functionRootAbsoluteForKql = PoliciesSearchService.toAbsoluteForKql(origin, functionRootServerRelative);

    const filenameTitleKql = this.buildFilenameTitleKql(trimmedQuery);
    if (!filenameTitleKql) return { items: [], totalCount: 0 };

    const kqlQueryText = `IsDocument:1 AND Path:"${functionRootAbsoluteForKql}/*" AND (${filenameTitleKql})`;

    const searchEndpointUrl = `${webAbsoluteUrl}/_api/search/postquery`;

    const requestOptions = this.buildNoMetadataOptions(kqlQueryText, pageSize, startRow, ["Title", "Path", "Filename", "FileExtension", "LastModifiedTime"]);

    try {
      const response = await this._ctx.spHttpClient.post(
        searchEndpointUrl,
        SPHttpClient.configurations.v1,
        requestOptions
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[PoliciesSearch] Search failed", response.status, errorText);
        return { items: [], totalCount: 0 };
      }

      const searchJson = await response.json();
      const rows = this.extractRows(searchJson);

      const total = Math.min(searchJson?.PrimaryQueryResult?.RelevantResults?.TotalRows ?? 0, maxTotal);
      const searchHits = this.mapRowsToHits(rows);
      const items = this.hitsToItems(searchHits);

      return {
        items,
        totalCount: total,
        nextStartRow: (total > startRow + pageSize) ? startRow + pageSize : undefined
      };
    } catch (error) {
      console.error("[PoliciesSearch] Search error:", error);
      return { items: [], totalCount: 0 };
    }
  }

  // Legacy method - wraps paged to fetch first page only
  public async searchFilesInFunction(
    libraryRootServerRelative: string,
    functionDisplayName: string,
    query: string,
    rowLimit: number = 500
  ): Promise<IPoliciesAndProceduresItem[]> {
    const result = await this.searchFilesInFunctionPaged(
      libraryRootServerRelative,
      functionDisplayName,
      query,
      { pageSize: rowLimit }
    );
    return result.items;
  }
}