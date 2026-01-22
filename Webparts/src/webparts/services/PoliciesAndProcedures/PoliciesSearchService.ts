// PoliciesSearchService.ts
// Centralized search logic used by Tiles + ViewPage deep file search + auto-expand.
// KEY FIXES:
// 1) Use POST _api/search/postquery (stable) instead of long GET query URL.
// 2) Normalize IDs so encoded (%20) and decoded (spaces) always match.
// 3) Return serverRelativeUrl in the SAME "display" format that your provider/UI uses.

import type { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPHttpClient, ISPHttpClientOptions } from "@microsoft/sp-http";
import type { IPoliciesAndProceduresItem } from "./ViewPageListTypes";

type SearchHit = {
  serverRelativeUrl: string; // normalized "display" server-relative
  name: string;
  ext?: string;
  modifiedOn?: Date;
};

export default class PoliciesSearchService {
  private readonly _ctx?: WebPartContext;

  constructor(ctx?: WebPartContext) {
    this._ctx = ctx;
  }

  // ---------------- Shared text match (Tiles + local filters) ----------------
  public static matches(text: string, query: string): boolean {
    const q = (query || "").trim().toLowerCase();
    if (!q) return true;
    return (text || "").toLowerCase().includes(q);
  }

  /** Normalized KEY for comparisons (case-insensitive + decodeDeep) */
  public static toKey(pathOrId: string): string {
    return PoliciesSearchService.normalizeServerRelDisplay(pathOrId).toLowerCase();
  }

  // ---------------- URL helpers ----------------
  /** decode multiple times safely (handles %2520 etc.) */
  private static decodeDeep(s: string): string {
    let v = (s || "").trim();
    for (let i = 0; i < 3; i++) {
      try {
        const d = decodeURIComponent(v);
        if (d === v) break;
        v = d;
      } catch {
        break;
      }
    }
    return v;
  }

  /**
   * Normalize any URL/path to a "display" server-relative path:
   * - accepts absolute or server-relative
   * - strips query/hash
   * - decodes segments (so %20 => space, %26 => &)
   * Output matches what your provider returns in screenshots:
   *   /sites/.../GRC framework Documents/Commercial/Commercial strategy & Customer Experience
   */
  public static normalizeServerRelDisplay(pathOrAbs: string): string {
    let raw = (pathOrAbs || "").trim();
    if (!raw) return "";

    // if absolute -> take pathname
    if (/^https?:\/\//i.test(raw)) {
      try {
        raw = new URL(raw).pathname || raw;
      } catch {
        // keep raw
      }
    }

    // strip query/hash
    raw = raw.split("?")[0].split("#")[0];

    // ensure leading slash
    if (!raw.startsWith("/")) raw = `/${raw}`;

    const parts = raw
      .split("/")
      .filter(Boolean)
      .map((seg) => PoliciesSearchService.decodeDeep(seg));

    return "/" + parts.join("/");
  }

  /** Build absolute URL for KQL Path filter (must be URL-safe => encodeURI) */
  private static toAbsForKql(origin: string, serverRelDisplay: string): string {
    const rel = serverRelDisplay.startsWith("/") ? serverRelDisplay : `/${serverRelDisplay}`;
    return `${origin}${encodeURI(rel)}`;
  }

  // ---------------- Function root + folder chain (AUTO EXPAND) ----------------
  public static buildFunctionRootRel(libraryRootServerRelative: string, functionDisplayName: string): string {
    const root = (libraryRootServerRelative || "").trim().replace(/\/$/, "");
    const safeFn = (functionDisplayName || "").replace(/\/+/g, " ").trim();
    return PoliciesSearchService.normalizeServerRelDisplay(`${root}/${safeFn}`);
  }

  /**
   * Given a FILE serverRelativeUrl, return the folder chain server-relative URLs (DISPLAY)
   * under the function root. Returned IDs will match folder.id from your provider/UI.
   */
  public static getFolderChainFromFile(fileServerRelativeUrl: string, functionRootRel: string): string[] {
    const fileNorm = PoliciesSearchService.normalizeServerRelDisplay(fileServerRelativeUrl);
    const rootNorm = PoliciesSearchService.normalizeServerRelDisplay(functionRootRel);

    if (!fileNorm || !rootNorm) return [];

    const fileParts = fileNorm.split("/").filter(Boolean);
    const rootParts = rootNorm.split("/").filter(Boolean);

    // prefix check (case-insensitive)
    for (let i = 0; i < rootParts.length; i++) {
      if ((fileParts[i] || "").toLowerCase() !== rootParts[i].toLowerCase()) return [];
    }

    // after root, before filename
    if (fileParts.length <= rootParts.length + 1) return [];

    const folderParts = fileParts.slice(rootParts.length, fileParts.length - 1);

    const chain: string[] = [];
    const currentParts = [...rootParts];

    for (const seg of folderParts) {
      currentParts.push(seg);
      chain.push("/" + currentParts.join("/"));
    }

    return chain;
  }

  // ---------------- SharePoint Search (deep file search) ----------------
  private escapeKqlValue(v: string): string {
    // simple safe token cleaning
    return (v || "")
      .replace(/["']/g, "")
      .replace(/[<>]/g, " ")
      .trim();
  }

  private buildFilenameTitleKql(query: string): string {
    const tokens = (query || "")
      .trim()
      .split(/\s+/)
      .map((t) => this.escapeKqlValue(t))
      .filter(Boolean);

    if (!tokens.length) return "";

    // (Filename:"emp*" OR Title:"emp*") AND ...
    return tokens.map((t) => `(Filename:"${t}*" OR Title:"${t}*")`).join(" AND ");
  }

  /**
   * Deep search inside the selected function folder using SharePoint Search API.
   * Returns FILE items only (not folders).
   */
  public async searchFilesInFunction(
    libraryRootServerRelative: string,
    functionDisplayName: string,
    query: string,
    rowLimit: number = 50
  ): Promise<IPoliciesAndProceduresItem[]> {
    if (!this._ctx) return [];

    const q = (query || "").trim();
    if (!q) return [];

    const webAbs = (this._ctx.pageContext.web.absoluteUrl || "").replace(/\/$/, "");
    const origin = new URL(webAbs).origin;

    // DISPLAY root (matches provider IDs)
    const functionRootRel = PoliciesSearchService.buildFunctionRootRel(libraryRootServerRelative, functionDisplayName);

    // ABS for KQL Path restriction (URL-safe)
    const functionRootAbsForKql = PoliciesSearchService.toAbsForKql(origin, functionRootRel);

    const textKql = this.buildFilenameTitleKql(q);
    if (!textKql) return [];

    // Path filter works as "under this path" in SharePoint search
    const kql = `IsDocument:1 AND Path:"${functionRootAbsForKql}" AND (${textKql})`;

    const selectProps = ["Title", "Path", "Filename", "FileExtension", "LastModifiedTime"];

    // ---- POST _api/search/postquery (fixes your 400) ----
    const endpoint = `${webAbs}/_api/search/postquery`;

    const body = JSON.stringify({
      request: {
        __metadata: { type: "Microsoft.Office.Server.Search.REST.SearchRequest" },
        Querytext: kql,
        RowLimit: rowLimit,
        TrimDuplicates: false,
        SelectProperties: { results: selectProps }
      }
    });

    const options: ISPHttpClientOptions = {
      headers: {
        accept: "application/json;odata=verbose",
        "content-type": "application/json;odata=verbose"
      },
      body
    };

    let json: any;
    try {
      const res = await this._ctx.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, options);
      if (!res.ok) return [];
      json = await res.json();
    } catch {
      return [];
    }

    // ---- response shape variations ----
    const rows: any[] =
      json?.PrimaryQueryResult?.RelevantResults?.Table?.Rows ??
      json?.d?.postquery?.PrimaryQueryResult?.RelevantResults?.Table?.Rows ??
      json?.d?.PrimaryQueryResult?.RelevantResults?.Table?.Rows ??
      [];

    const getCell = (r: any, key: string): string => {
      const cells: any[] = r?.Cells ?? [];
      const found = cells.find((c) => (c?.Key || "").toLowerCase() === key.toLowerCase());
      return (found?.Value ?? "").toString();
    };

    const hits: SearchHit[] = rows
      .map((r) => {
        const pathAbs = getCell(r, "Path"); // absolute
        if (!pathAbs) return null;

        let pathname = "";
        try {
          pathname = new URL(pathAbs).pathname; // encoded
        } catch {
          return null;
        }

        const filename = getCell(r, "Filename");
        const title = getCell(r, "Title");
        const name = (title || filename || "").trim() || "Document";

        const ext = (getCell(r, "FileExtension") || "").toLowerCase();
        const lastMod = getCell(r, "LastModifiedTime");
        const modifiedOn = lastMod ? new Date(lastMod) : undefined;

        // IMPORTANT: convert to DISPLAY server-relative (decodes %20 -> spaces)
        const serverRelativeUrl = PoliciesSearchService.normalizeServerRelDisplay(pathname);

        return { serverRelativeUrl, name, ext, modifiedOn } as SearchHit;
      })
      .filter(Boolean) as SearchHit[];

    // Deduplicate by normalized key
    const byKey = new Map<string, SearchHit>();
    for (const h of hits) {
      byKey.set(PoliciesSearchService.toKey(h.serverRelativeUrl), h);
    }

    return Array.from(byKey.values()).map((h) => ({
      id: h.serverRelativeUrl,
      name: h.name,
      isFolder: false,
      ext: h.ext as any,
      modifiedOn: h.modifiedOn,
      previewUrl: `${encodeURI(h.serverRelativeUrl)}?web=1`,
      serverRelativeUrl: h.serverRelativeUrl
    }));
  }
}
