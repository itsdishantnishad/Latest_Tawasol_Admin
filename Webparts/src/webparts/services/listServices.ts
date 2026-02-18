import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPFI, spfi, SPFx } from "@pnp/sp";

import "@pnp/sp/webs";
import "@pnp/sp/sites";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/sp/files/folder";
import "@pnp/sp/clientside-pages";
import "@pnp/sp/search";

import { ISearchQuery } from "@pnp/sp/search";
import moment from "moment";

moment.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "a few seconds",
    ss: "%d seconds",
    m: "a minute",
    mm: "%d minutes",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    w: "a week",
    ww: "%d weeks",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years",
  },
});

/** ===== Site-level Content Type IDs (from ContentTypes-All.xml) ===== */
export enum ContentTypeId {
  NEWS_STORY = "0x0101009D1CB255DA76424F860D91F20E6C411800B8C2DF9C7C0D3343B05E3F3EC59E444E",
  TRAINING = "0x0101009D1CB255DA76424F860D91F20E6C411800B721B228147AA74E9D35C742E0E4560C",
  EVENT = "0x0101009D1CB255DA76424F860D91F20E6C41180091B43BD03BCDD947979C2884C4C8FF39",
  LETSCONNECT = "0x0101009D1CB255DA76424F860D91F20E6C4118002B6231845DC1944FBF97864C855DA046",
}

/** ===== Types ===== */

export type OurValueCard = {
  id: number;
  title: string;
  desc: string;
  icon?: string;
  sort: number;
};

export type OrgMember = {
  id: number;
  name: string;
  role: string;
  level: number;
  sort: number;
  photoUrl?: string;
  user: string;
  userEmail?: string;
};

// UPDATED (ONLY dept+pointers related change)
export type OrgDepartment = { name: string; url?: string; itemsText?: string };

export type DashboardCategory = {
  id: number;
  name: string;
  sort: number;
  isActive: boolean;
};

export type DashboardItem = {
  id: number;
  title: string;
  categoryId: number;
  categoryName: string;
  body?: string;
  thumbUrl?: string;
  sort: number;
  embedUrl?: string;
};

export type DocumentFunctionRow = {
  id: number;
  title: string;
  functionType: "Core Function" | "Support Function" | string;
  iconUrl?: string;
  targetUrl?: string;
  sortOrder: number;
};

export type DocumentSummary = {
  id: string;
  name: string;
  url?: string;
  ext?: string;
  dept?: string;
  tag?: string;
};

export type AnnouncementBannerListItem = {
  id: number;
  title: string;
  description?: string;
  iconUrl?: string;
  startIso?: string;
  endIso?: string;
  isActive: boolean;
};

export type UrlFieldValue = { Url?: string; Description?: string };

export type LetsMeetPageItem = {
  id: number;
  title: string;
  pageUrl: string;
  youtubeUrl: string;
};

export class listServices {
  private sp: SPFI;

  constructor(private context: WebPartContext) {
    this.sp = spfi().using(SPFx(this.context));
  }

  /** ===== Helpers ===== */

  public static convertToRelativeUrl(absoluteUrl: string): string {
    const parser = document.createElement("a");
    parser.href = absoluteUrl;
    return absoluteUrl.replace(`${parser.protocol}//${parser.hostname}`, "");
  }

  public static getImageUrlFromPage(pathToAspxPage: string, imageWidth: any): string {
    try {
      const serverRelativePath = listServices.convertToRelativeUrl(pathToAspxPage);
      const parser = document.createElement("a");
      parser.href = pathToAspxPage;
      const sitePath = pathToAspxPage.replace(`${parser.protocol}//${parser.hostname}`, "");
      const sitePathArray = sitePath.split("/");
      const sitePathInfo = sitePathArray[0] + "/" + sitePathArray[1] + "/" + sitePathArray[2];

      if (serverRelativePath.indexOf(".aspx") === -1) {
        return "";
      } else {
        const lastIndex = serverRelativePath ? serverRelativePath.lastIndexOf("/") + 1 : 0;

        const fileName = serverRelativePath.substring(lastIndex);
        const fileFinalURL = serverRelativePath.replace(fileName, encodeURIComponent(fileName));
        const previewUrl = `${sitePathInfo}/_layouts/15/getpreview.ashx?resolution=6&path=${fileFinalURL}&clientType=modernWebPart`;
        return previewUrl;
      }
    } catch {
      return "";
    }
  }

  private static toPlainText(html?: string): string {
    if (!html) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
  }

  private normalizePhotoUrl(raw?: string): string | undefined {
    const val = (raw || "").trim();
    if (!val) return undefined;

    // If stored URL is a SPO thumbnail/transform link, try to use the underlying docid (original)
    try {
      const base = this.context.pageContext.web.absoluteUrl;
      const u = new URL(val, base);

      const isThumb = u.pathname.includes("/transform/thumbnail");
      if (isThumb) {
        const docid = u.searchParams.get("docid");
        if (docid) return decodeURIComponent(docid);
      }
    } catch {
      // ignore and return original
    }

    return val;
  }

  private normalizeFavouriteKey(url?: string): string {
    const raw = (url || "").trim();
    if (!raw) return "";

    const webAbs = this.context.pageContext.web.absoluteUrl.replace(/\/$/, "");
    const origin = new URL(webAbs).origin;

    try {
      // Build absolute URL safely
      const abs = /^https?:\/\//i.test(raw)
        ? raw
        : `${origin}${raw.startsWith("/") ? "" : "/"}${raw}`;

      const u = new URL(abs);

      // remove any encoding differences (spaces vs %20 etc.)
      let path = u.pathname || "";
      try { path = decodeURI(path); } catch { /* ignore */ }

      // standardize slashes + case
      path = path.replace(/\/{2,}/g, "/").trim();
      return path.toLowerCase(); // server-relative key (matches getFavouriteIndex usage)
    } catch {
      // fallback
      const clean = raw.split(/[?#]/)[0];
      return listServices.convertToRelativeUrl(clean).toLowerCase();
    }
  }

/** Build a clean absolute URL to store in TIRFileUrl */
private toStoredAbsoluteUrl(serverRelPath: string): string {
  const webAbs = this.context.pageContext.web.absoluteUrl.replace(/\/$/, "");
  const origin = new URL(webAbs).origin;

  let rel = serverRelPath || "";
  try { rel = decodeURI(rel); } catch { /* ignore */ }
  rel = rel.startsWith("/") ? rel : `/${rel}`;

  // store encoded absolute (safe for spaces etc.)
  return `${origin}${encodeURI(rel)}`;
}

  // UPDATED helper: strip HTML BUT keep line breaks (for bullet pointers)
  private static toPlainTextWithLines(raw?: string): string {
    if (!raw) return "";

    let s = String(raw);

    // decode entities (handles &lt;div ...&gt; cases). Try twice for double-encoding.
    const decodeOnce = (val: string): string => {
      const ta = document.createElement("textarea");
      ta.innerHTML = val;
      return ta.value;
    };

    for (let i = 0; i < 2; i++) {
      if (/[&](lt|gt|amp|quot|apos|nbsp|#\d+);/i.test(s)) {
        const decoded = decodeOnce(s);
        if (decoded === s) break;
        s = decoded;
      }
    }

    // normalize common entities
    s = s
      .replace(/&nbsp;/gi, " ")
      .replace(/&#160;/g, " ")
      .replace(/\u00A0/g, " ");

    // If it contains HTML tags, convert block boundaries to newlines BEFORE removing tags
    const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(s) || s.indexOf("ExternalClass") > -1;

    if (looksLikeHtml) {
      s = s
        // br => newline
        .replace(/<br\s*\/?>/gi, "\n")
        // opening block tags => newline (fixes "Kartik<p>Arnav</p>" => Kartik\nArnav)
        .replace(/<(p|div|li|tr|h[1-6]|blockquote|ul|ol)(\s[^>]*)?>/gi, "\n")
        // closing block tags => newline
        .replace(/<\/(p|div|li|tr|h[1-6]|blockquote|ul|ol)>/gi, "\n")
        // remove any remaining tags
        .replace(/<[^>]+>/g, "");
    }

    // Treat pasted bullet symbols as separators too
    s = s.replace(/\u2022/g, "\n").replace(/\u00B7/g, "\n");

    // normalize newlines + spaces
    s = s
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");

    const lines = s
      .split("\n")
      .map((l) => l.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    // collapse too many lines, then join back with real \n
    return lines.join("\n");
  }

  private toAbsoluteUrl(path: string): string {
    const webAbs = this.context.pageContext.web.absoluteUrl.replace(/\/$/, "");
    const val = (path || "").trim();

    if (!val) return webAbs;

    // already absolute
    if (/^https?:\/\//i.test(val)) return val;

    const origin = new URL(webAbs).origin;

    // server-relative (starts with /sites/..., /teams/..., /_layouts/...)
    if (val.startsWith("/")) {
      return `${origin}${val}`;
    }

    // web-relative (SitePages/..., Shared%20Documents/..., etc.)
    if (val.startsWith("./")) {
      return `${webAbs}/${val.substring(2)}`;
    }

    return `${webAbs}/${val}`;
  }

  /** Convert SharePoint ISO (UTC or with offset) into local ISO string. */
  private toLocalIso(iso?: string): string | undefined {
    if (!iso) return undefined;
    const m = moment.parseZone(iso).local();
    return m.isValid() ? m.toISOString() : undefined;
  }

  /** Map SPO Search table rows → DocumentSummary[] */
  private static mapSearchRowsToDocs(rows: any[]): DocumentSummary[] {
    return (rows || []).map((r: any, idx: number) => {
      const cells: Record<string, any> = {};
      (r?.Cells || []).forEach((c: any) => {
        cells[c.Key] = c.Value;
      });

      return {
        id: cells["WorkId"]?.toString() || `row-${idx}`,
        name: cells["Title"] || cells["Filename"] || "Document",
        url: cells["Path"],
        ext: (cells["FileType"] || "").toLowerCase(),
        dept: cells["TIRDepartmentOWSTEXT"] || cells["DepartmentOWSTEXT"] || cells["Department"] || "",
        tag: cells["TIRTagOWSTEXT"] || cells["ContentType"] || "",
      } as DocumentSummary;
    });
  }

  private parseUserField(userFieldValue: string) {
    if (!userFieldValue) return null;
    try {
      const parts = userFieldValue
        .split(" | ")
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length === 0) return null;
      const email = parts[0] || "";
      const name = parts[1] || "";
      const role = parts[2]?.includes("i:0#.f|membership|") ? "" : parts[2] || "";
      return { id: email, name, email, role };
    } catch (err) {
      console.error("Error parsing user field:", err, userFieldValue);
      return null;
    }
  }

  /** ===== NEWS ===== */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getNewsStory(rowCount?: number): Promise<any[]> {
    let results;

    const siteUrl = this.context.pageContext.web.absoluteUrl.replace(/\/$/, "");
    const constraints = `AND ContentTypeId:(${ContentTypeId.NEWS_STORY}*) AND Path:"${siteUrl}/*"`;

    try {
      results = await this.sp.search({
        Querytext: "*",
        RowLimit: rowCount || 3,
        TrimDuplicates: false,
        SelectProperties: [
          "Title",
          "TIRReadTimeOWSNMBR",
          "ViewCount",
          "owstaxIdTIRTags",
          "owstaxIdTIRDepartment",
          "TIRDepartment",
          "URL",
          "owstaxIdTIRNewsType",
          "TIRNewsType",
          "ModifiedOWSDATE",
          "CreatedBy",
          "FileRef",
          "AuthorOWSUSER",
          "TIRTags",
          "Created",
          "Description",
        ],
        QueryTemplate: `{searchTerms}`,
        HiddenConstraints: `-SitePageFlags:Template ${constraints}`,
        EnableInterleaving: true,
      } as ISearchQuery);

      return results.PrimarySearchResults.map((item: any) => {
        const readTimeRaw = item.TIRReadTimeOWSNMBR;
        const viewCountRaw = item.ViewCount;

        const readTime = readTimeRaw === "" || readTimeRaw == null ? 0 : Math.trunc(Number(readTimeRaw));
        const pageView = viewCountRaw === "" || viewCountRaw == null ? 0 : Math.trunc(Number(viewCountRaw));

        return {
          title: item.Title,
          readTime,
          department: item.TIRDepartment ? item.TIRDepartment : "",
          tags: item.TIRTags,
          pageView,
          newsImage: listServices.getImageUrlFromPage(item.URL, 200),
          newsType: item.TIRNewsType ? item.TIRNewsType : "",
          author: item.CreatedBy,
          authorEmail: item.AuthorOWSUSER ? item.AuthorOWSUSER.split("|")[0] : "",
          path: item.FileRef,
          created: item.Created,
          pageDescription: item.Description,
          lastModified: item.ModifiedOWSDATE ? moment(item.ModifiedOWSDATE.split(";")[0]).fromNow() : "",
          publishedISO: item.ModifiedOWSDATE
            ? String(item.ModifiedOWSDATE).split(";")[0]
            : item.Created
            ? String(item.Created).split(";")[0]
            : "",
        } as any;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getNewsStorybyID(ID?: number, ctxArg?: WebPartContext): Promise<any[]> {
    let results;

    const siteCtx = ctxArg || this.context;
    const siteAbsoluteUrl = siteCtx.pageContext.site.absoluteUrl;
    const serverRequestPath = siteCtx.pageContext.site.serverRequestPath;
    const origin = new URL(siteAbsoluteUrl).origin;
    const pageUrl = `${origin}${serverRequestPath}`;

    const constraints = `AND ContentTypeId:(${ContentTypeId.NEWS_STORY}*) AND Path:"${pageUrl}"`;

    try {
      results = await this.sp.search({
        Querytext: "*",
        RowLimit: 1,
        TrimDuplicates: false,
        SelectProperties: [
          "Title",
          "TIRReadTimeOWSNMBR",
          "ViewCount",
          "owstaxIdTIRTags",
          "owstaxIdTIRDepartment",
          "TIRDepartment",
          "URL",
          "owstaxIdTIRNewsType",
          "TIRNewsType",
          "ModifiedOWSDATE",
          "CreatedBy",
          "FileRef",
          "AuthorOWSUSER",
          "TIRTags",
          "Created",
        ],
        QueryTemplate: "{searchTerms}",
        HiddenConstraints: `-SitePageFlags:Template ${constraints}`,
        EnableInterleaving: true,
      } as ISearchQuery);

      return results.PrimarySearchResults.map((item: any) => {
        return {
          title: item.Title,
          readTime: item.TIRReadTimeOWSNMBR,
          department: item.TIRDepartment ? item.TIRDepartment : "",
          tags: item.TIRTags,
          pageView: item.ViewCount ? Math.trunc(item.ViewCount) : 0,
          newsImage: listServices.getImageUrlFromPage(item.URL, 200),
          newsType: item.TIRNewsType ? item.TIRNewsType : "",
          author: item.CreatedBy,
          authorEmail: item.AuthorOWSUSER ? item.AuthorOWSUSER.split("|")[0] : "",
          path: item.FileRef,
          created: item.Created,
        } as any;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /** ===== TRAINING ===== */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getTrainingByID(ID?: number): Promise<any[]> {
    let results;
    const constraints = `AND ContentTypeId:(${ContentTypeId.TRAINING}*)`;

    try {
      results = await this.sp.search({
        Querytext: "*",
        RowLimit: 1,
        TrimDuplicates: false,
        SelectProperties: ["Title", "TIREventEndDate", "TIREventStartDate", "TIRLocation"],
        QueryTemplate: ID ? `{searchTerms} ListItemID:${ID}` : `{searchTerms}`,
        HiddenConstraints: `-SitePageFlags:Template ${constraints}`,
        EnableInterleaving: true,
      } as ISearchQuery);

      return results.PrimarySearchResults.map((item: any) => {
        return {
          title: item.Title,
          eventEndDate: item.TIREventEndDate,
          eventStartDate: item.TIREventStartDate,
          location: item.TIRLocation,
        } as any;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /** ===== Events ===== */
  public async getEventsByID(ID?: number): Promise<any[]> {
    let results;
    const constraints = `AND ContentTypeId:(${ContentTypeId.EVENT}*)`;

    try {
      results = await this.sp.search({
        Querytext: "*",
        RowLimit: 1,
        TrimDuplicates: false,
        SelectProperties: ["Id", "ListItemID", "Title", "TIREventEndDate", "TIREventStartDate", "TIRLocation", "TIREventCategory", "URL"],
        QueryTemplate: ID ? `{searchTerms} ListItemID:${ID}` : `{searchTerms}`,
        HiddenConstraints: `-SitePageFlags:Template ${constraints}`,
        EnableInterleaving: true,
      } as ISearchQuery);

      return results.PrimarySearchResults.map((item: any) => {
        return {
          ID: Number(item.ListItemID || item.ListItemId || item.Id) || 0,
          title: item.Title,
          eventEndDate: item.TIREventEndDate,
          eventStartDate: item.TIREventStartDate,
          location: item.TIRLocation,
          newsImage: listServices.getImageUrlFromPage(item.URL, 200),
          category: item.TIREventCategory,
          pageUrl: item.URL,
        } as any;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getAllTraining(): Promise<any[]> {
    let results;
    const constraints = `AND ContentTypeId:(${ContentTypeId.TRAINING}*)`;

    try {
      const searchOptions: ISearchQuery = {
        Querytext: "*",
        TrimDuplicates: false,
        SelectProperties: [
          "Title",
          "TIREventEndDate",
          "TIREventStartDate",
          "TIRLocation",
          "TIRInstructorOWSUSER",
          "URL",
          "TIRJoiningURLOWSMTXT",
        ],
        QueryTemplate: `{searchTerms}`,
        HiddenConstraints: `-SitePageFlags:Template ${constraints}`,
        EnableInterleaving: true,
      };

      searchOptions.RowLimit = 500;
      results = await this.sp.search(searchOptions);

      return results.PrimarySearchResults.map((item: any) => {
        const instructorInfo = this.parseUserField(item.TIRInstructorOWSUSER);
        return {
          title: item.Title,
          eventEndDate: item.TIREventEndDate,
          eventStartDate: item.TIREventStartDate,
          location: item.TIRLocation,
          newsImage: listServices.getImageUrlFromPage(item.URL, 200),
          joiningURL: item.TIRJoiningURLOWSMTXT,
          instructor: instructorInfo,
          pageUrl: item.URL,
        } as any;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /** ===== EVENTS ===== */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getAllEvents(): Promise<any[]> {
    let results;
    const constraints = `AND ContentTypeId:(${ContentTypeId.EVENT}*)`;

    try {
      const searchOptions: ISearchQuery = {
        Querytext: "*",
        TrimDuplicates: false,
        SelectProperties: [
          "Id",
          "ListItemID",
          "Title",
          "TIREventEndDate",
          "TIREventStartDate",
          "TIRLocation",
          "TIREventCategory",
          "URL",
          "PictureThumbnailURL",
          "BannerImageUrlOWSURLH",
          "PublishingImage",
          "Path",
        ],
        QueryTemplate: `{searchTerms}`,
        HiddenConstraints: `-SitePageFlags:Template ${constraints}`,
        EnableInterleaving: true,
      };

      searchOptions.RowLimit = 500;
      results = await this.sp.search(searchOptions);

      return results.PrimarySearchResults.map((item: any) => {
        let img: string = "";

        if (item.PictureThumbnailURL) {
          img = item.PictureThumbnailURL;
        }
        if (!img && item.BannerImageUrlOWSURLH) {
          const raw = String(item.BannerImageUrlOWSURLH);
          img = raw.split(",")[0].trim();
        }

        if (!img && item.PublishingImage) {
          const match = String(item.PublishingImage).match(/src="([^"]+)"/i);
          if (match && match[1]) {
            img = match[1];
          }
        }
        if (!img && item.URL) {
          img = listServices.getImageUrlFromPage(item.URL, 200);
        }

        return {
          ID: Number(item.ListItemID || item.ListItemId || item.Id) || 0,
          title: item.Title,
          eventEndDate: item.TIREventEndDate,
          eventStartDate: item.TIREventStartDate,
          location: item.TIRLocation,
          newsImage: img,
          category: item.TIREventCategory,
          pageUrl: item.URL,
          path: item.Path,
        } as any;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // ===== Lets Meet (Site Pages) =====

  private readUrlField(val?: UrlFieldValue | string): string {
    if (!val) return "";
    if (typeof val === "string") return val.trim();
    return (val.Url || "").trim();
  }

  private escOData(val: string): string {
    return (val || "").replace(/'/g, "''");
  }

  public async getLetsMeetPagesFromSitePages(
    sitePagesListTitle: string,
    contentTypeId: string,
    top: number = 12
  ): Promise<LetsMeetPageItem[]> {
    const listTitle = sitePagesListTitle || "Site Pages";
    const ctId = contentTypeId;

    const rows: any[] = await this.sp.web.lists
      .getByTitle(listTitle)
      .items.select("Id", "Title", "FileRef", "URL", "TIRSortOrder", "Modified", "ContentTypeId")
      .filter(`startswith(ContentTypeId,'${this.escOData(ctId)}')`)
      .orderBy("TIRSortOrder", true)
      .orderBy("Modified", false)
      .top(top)();

    return (rows || []).map((r: any) => {
      const pageUrl = this.toAbsoluteUrl(r?.FileRef || "");
      const youtubeUrl = this.readUrlField(r?.URL);

      return {
        id: Number(r?.Id) || 0,
        title: r?.Title || "",
        pageUrl,
        youtubeUrl,
      } as LetsMeetPageItem;
    });
  }

  /** ===== Simple list-based loaders (Apps, Joiners, Portfolio, Values) ===== */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getApps(listName: string): Promise<any[]> {
    let results: any[] = [];
    try {
      results = await this.sp.web.lists
        .getByTitle(listName)
        .items.select("Title", "TIRSortOrder", "TIRIconURL", "URL", "TIRAppType")
        .orderBy("TIRSortOrder", true)();

      return results.map((item: any) => {
        return {
          Title: item.Title,
          SortOrder: item.TIRSortOrder,
          IconURL: item.TIRIconURL ? item.TIRIconURL.Url : "#",
          URL: item.URL ? item.URL.Url : "#",
          AppType: item.TIRAppType ? item.TIRAppType : "",
        } as any;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getCustomAppLinks(listName: string, userEmail: string): Promise<any[]> {
    let results: any[] = [];
    try {
      results = await this.sp.web.lists
        .getByTitle(listName)
        .items.select("Id", "TIRUserEmail", "TIRCustomLinkAttribute")
        .filter(`TIRUserEmail eq '${userEmail}'`)();
      return results;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getNewJoiners(listName: string): Promise<any[]> {
    const results = await this.sp.web.lists
      .getByTitle(listName)
      .items.select("Title", "TIRSortOrder", "TIRDesignation", "TIRUserPicture", "TIRDescription", "TIRUserEmail")
      .orderBy("TIRSortOrder", false)();

    return results.map((item: any) => ({
      Title: item.Title,
      SortOrder: Number(item.TIRSortOrder),
      Designation: item.TIRDesignation,
      UserPicture: item.TIRUserPicture ? item.TIRUserPicture.Url : "#",
      Description: item.TIRDescription,
      TIRUserEmail: item.TIRUserEmail,
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getOurPortfolio(listName: string): Promise<any[]> {
    let results: any[] = [];
    try {
      results = await this.sp.web.lists
        .getByTitle(listName)
        .items.select("Title", "TIRSortOrder", "TIRIconURL", "TIRPortfolioCategory", "TIRColumnLayout")
        .orderBy("TIRSortOrder", true)();

      return results.map((item: any) => {
        return {
          Title: item.Title,
          SortOrder: item.TIRSortOrder,
          IconURL: item.TIRIconURL ? item.TIRIconURL.Url : "#",
          PortfolioCategory: item.TIRPortfolioCategory ? item.TIRPortfolioCategory : "",
          ColumnLayout: Number(item.TIRColumnLayout) || 2,
        } as any;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async getOurValues(listName: string): Promise<any[]> {
    let results: any[] = [];
    try {
      results = await this.sp.web.lists
        .getByTitle(listName)
        .items.select("Title", "TIRDescription", "TIRIconURL", "TIRSortOrder")
        .orderBy("TIRSortOrder", true)();

      return results.map((item: any) => {
        return {
          title: item.Title,
          description: item.TIRDescription,
          icon: item.TIRIconURL ? item.TIRIconURL.Url : "#",
          sortOrder: item.TIRSortOrder,
        } as any;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /** ===== Org Structure / Departments ===== */

  public async getOrganisationMembers(listTitle: string): Promise<OrgMember[]> {
    const rows = await this.sp.web.lists
      .getByTitle(listTitle)
      .items.select("Id", "Title", "TIRDesignation", "TIRLevel", "TIRSortOrder", "TIRUserPicture", "TIRUser/Title")
      .orderBy("TIRLevel", true)
      .orderBy("TIRSortOrder", true)
      .expand("TIRUser")();

    const mapped: OrgMember[] = rows.map((it: any) => {
      const ph = it?.TIRUserPicture;
      const rawUrl = typeof ph === "string" ? ph : ph?.Url || "";
      const photoUrl = this.normalizePhotoUrl(rawUrl);
      const userField = it?.TIRUser || {};
      const userTitle = (userField?.Title || "").trim();

      return {
        id: Number(it.Id),
        name: it?.Title || "",
        role: it?.TIRDesignation || "",
        level: Number(it?.TIRLevel ?? 99),
        sort: Number(it?.TIRSortOrder ?? 9999),
        photoUrl,
        user: userTitle,
      };
    });

    mapped.sort((a, b) =>
      a.level !== b.level ? a.level - b.level : a.sort !== b.sort ? a.sort - b.sort : a.name.localeCompare(b.name)
    );

    return mapped;
  }

  // UPDATED (ONLY dept+pointers related change)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getDepartmentsByMember(listTitle: string, memberDisplayName: string): Promise<OrgDepartment[]> {
    const targetName = memberDisplayName.trim().toLowerCase();

    const deptRows: any[] = await this.sp.web.lists
      .getByTitle(listTitle)
      .items.select("Id", "Title", "URL", "TIRDepartment", "TIRDepartmentItems", "TIRDepartmentMember/Title")
      .expand("TIRDepartmentMember")();

    const memberRows = deptRows.filter((item) => {
      const people: any[] = Array.isArray(item.TIRDepartmentMember) ? item.TIRDepartmentMember : [];
      return people.some((p) => (p?.Title || "").trim().toLowerCase() === targetName);
    });

    if (!memberRows.length) return [];

    const wssIds: number[] = [];

    memberRows.forEach((item) => {
      const raw = item.TIRDepartment;
      const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
      values.forEach((v: any) => {
        const id = Number(v?.WssId);
        if (id && !wssIds.includes(id)) wssIds.push(id);
      });
    });

    const labelById = new Map<number, string>();

    if (wssIds.length) {
      const filter = wssIds.map((id) => `Id eq ${id}`).join(" or ");

      const termRows: any[] = await this.sp.web.lists
        .getByTitle("TaxonomyHiddenList")
        .items.select("Id", "Title")
        .filter(filter)();

      termRows.forEach((row) => {
        labelById.set(Number(row.Id), row.Title as string);
      });
    }

    const result: OrgDepartment[] = memberRows.map((item) => {
      const raw = item.TIRDepartment;
      const values = Array.isArray(raw) ? raw : raw ? [raw] : [];

      let deptName = "";

      if (values.length) {
        const first = values[0];
        const wssId = Number(first?.WssId);
        const label = wssId ? labelById.get(wssId) : undefined;
        deptName = label || "";
      }

      if (!deptName) deptName = item?.Title || "";

      const urlField = item.URL;
      const url = urlField && typeof urlField === "object" ? urlField.Url : urlField || undefined;

      // IMPORTANT: normalize pointers => multiline plain text with \n between items
      const pointersRaw: string = item?.TIRDepartmentItems || "";
      const pointersClean = listServices.toPlainTextWithLines(pointersRaw);

      return {
        name: deptName,
        url,
        itemsText: pointersClean,
      };
    });

    return result;
  }

  /** ===== Policies & Procedures: Document Functions ===== */

  public async getDocumentFunctions(listTitle: string): Promise<DocumentFunctionRow[]> {
    try {
      const rows: any[] = await this.sp.web.lists
        .getByTitle(listTitle)
        .items.select("Id", "Title", "TIRDocumentFunction", "TIRIconURL", "URL", "TIRSortOrder")
        .orderBy("TIRSortOrder", true)();

      return rows.map((r: any) => {
        const iconField = r?.TIRIconURL;
        const urlField = r?.URL;

        return {
          id: Number(r?.Id) || 0,
          title: r?.Title || "",
          functionType: r?.TIRDocumentFunction || "",
          iconUrl: typeof iconField === "string" ? iconField : iconField?.Url || undefined,
          targetUrl: typeof urlField === "string" ? urlField : urlField?.Url || undefined,
          sortOrder: Number(r?.TIRSortOrder ?? 9999),
        } as DocumentFunctionRow;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /** ===== Dashboards ===== */

  public async getDashboardCategories(listTitle: string): Promise<DashboardCategory[]> {
    try {
      const rows: any[] = await this.sp.web.lists
        .getByTitle(listTitle)
        .items.select("Id", "Title", "TIRSortOrder", "TIRIsActive")
        .orderBy("TIRSortOrder", true)();

      return rows.map((row: any) => ({
        id: Number(row?.Id) || 0,
        name: row?.Title || "",
        sort: Number(row?.TIRSortOrder ?? 9999),
        isActive: Boolean(row?.TIRIsActive),
      }));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async getDashboards(
    listTitle: string,
    categoryId?: number,
    top?: number,
    skip?: number,
    excludeId?: number
  ): Promise<DashboardItem[]> {
    try {
      let query = this.sp.web.lists
        .getByTitle(listTitle)
        .items.select(
          "Id",
          "Title",
          "TIRDescription",
          "TIRIconURL",
          "TIRSortOrder",
          "URL",
          "TIRCategoryIDId",
          "TIRCategoryID/Id",
          "TIRCategoryID/Title"
        )
        .expand("TIRCategoryID")
        .orderBy("TIRSortOrder", true);

      const filters: string[] = [];
      if (typeof categoryId === "number") filters.push(`TIRCategoryIDId eq ${categoryId}`);
      if (typeof excludeId === "number") filters.push(`Id ne ${excludeId}`);
      if (filters.length) query = query.filter(filters.join(" and "));

      if (typeof top === "number" && top > 0) query = query.top(top);
      if (typeof skip === "number" && skip > 0) query = query.skip(skip);

      const rows: any[] = await query();

      return rows.map((row: any) => {
        const icon = row?.TIRIconURL;
        const thumbUrl = typeof icon === "string" ? icon : icon?.Url || undefined;

        const cat = row?.TIRCategoryID || {};
        const categoryName = cat?.Title || "";
        const categoryIdValue = Number(row?.TIRCategoryIDId || cat?.Id || 0);

        const embedField = row?.URL;
        const embedUrl = typeof embedField === "string" ? embedField : embedField?.Url || undefined;

        return {
          id: Number(row?.Id) || 0,
          title: row?.Title || "",
          categoryId: categoryIdValue,
          categoryName,
          body: listServices.toPlainText(row?.TIRDescription || ""),
          thumbUrl,
          sort: Number(row?.TIRSortOrder ?? 9999),
          embedUrl,
        } as DashboardItem;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async getDashboardById(listTitle: string, itemId: number): Promise<DashboardItem | null> {
    try {
      const allItems = await this.getDashboards(listTitle);
      const match = allItems.find((it) => it.id === itemId);
      return match || null;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /** ===== Boards: Recently Updated / Most Used ===== */

  public async getRecentlyUpdatedDocuments(dmsLibraryRoot: string, rowLimit: number = 6): Promise<DocumentSummary[]> {
    const rootRel = (dmsLibraryRoot || "").replace(/\/$/, "");
    if (!rootRel) return [];

    const rootAbs = this.toAbsoluteUrl(rootRel);

    const query: ISearchQuery = {
      Querytext: `Path:"${rootAbs}" IsDocument:True`,
      RowLimit: rowLimit,
      TrimDuplicates: true,
      SelectProperties: [
        "WorkId",
        "Title",
        "Path",
        "FileType",
        "Filename",
        "LastModifiedTime",
        "TIRDepartmentOWSTEXT",
        "TIRTagOWSTEXT",
        "DepartmentOWSTEXT",
        "Department",
        "ContentType",
      ],
      SortList: [{ Property: "LastModifiedTime", Direction: 1 }],
    };

    const res: any = await this.sp.search(query);
    const rows =
      res?.RawSearchResults?.PrimaryQueryResult?.RelevantResults?.Table?.Rows ||
      res?.PrimaryQueryResult?.RelevantResults?.Table?.Rows ||
      res?.PrimarySearchResultsTable?.Rows ||
      [];

    return listServices.mapSearchRowsToDocs(rows);
  }

  public async getMostUsedDocumentsOnSite(rowLimit: number = 6): Promise<DocumentSummary[]> {
    const siteUrl = this.context.pageContext.web.absoluteUrl.replace(/\/$/, "");

    const query: ISearchQuery = {
      Querytext: `Path:"${siteUrl}/*" IsDocument:True`,
      RowLimit: rowLimit,
      TrimDuplicates: true,
      SelectProperties: [
        "WorkId",
        "Title",
        "Path",
        "FileType",
        "Filename",
        "ViewsLifeTime",
        "TIRDepartmentOWSTEXT",
        "TIRTagOWSTEXT",
        "DepartmentOWSTEXT",
        "Department",
        "ContentType",
      ],
      SortList: [{ Property: "ViewsLifeTime", Direction: 1 }],
    };

    const res: any = await this.sp.search(query);
    const rows =
      res?.RawSearchResults?.PrimaryQueryResult?.RelevantResults?.Table?.Rows ||
      res?.PrimaryQueryResult?.RelevantResults?.Table?.Rows ||
      res?.PrimarySearchResultsTable?.Rows ||
      [];

    return listServices.mapSearchRowsToDocs(rows);
  }

  // Policies and Procedures Document Library
  public async getMostUsedDocumentsInLibrary(dmsLibraryRoot: string, rowLimit: number = 6): Promise<DocumentSummary[]> {
    const rootRel = (dmsLibraryRoot || "").replace(/\/$/, "");
    if (!rootRel) return [];

    const rootAbs = this.toAbsoluteUrl(rootRel);

    const query: ISearchQuery = {
      Querytext: `Path:"${rootAbs}" IsDocument:True`,
      RowLimit: rowLimit,
      TrimDuplicates: true,
      SelectProperties: [
        "WorkId",
        "Title",
        "Path",
        "FileType",
        "Filename",
        "ViewsLifeTime",
        "LastModifiedTime",
        "TIRDepartmentOWSTEXT",
        "TIRTagOWSTEXT",
        "DepartmentOWSTEXT",
        "Department",
        "ContentType",
      ],
      SortList: [{ Property: "ViewsLifeTime", Direction: 1 }],
    };

    const res: any = await this.sp.search(query);
    const rows =
      res?.RawSearchResults?.PrimaryQueryResult?.RelevantResults?.Table?.Rows ||
      res?.PrimaryQueryResult?.RelevantResults?.Table?.Rows ||
      res?.PrimarySearchResultsTable?.Rows ||
      [];

    return listServices.mapSearchRowsToDocs(rows);
  }

  private readHyperlink(val: any): string {
    if (!val) return "";
    if (typeof val === "string") return val.trim();
    return (val.Url || val.url || "").trim();
  }

private readTaxonomyLabel(val: any): string {
  if (!val) return "";
  if (typeof val === "string") {
    // sometimes "Label|TermGuid" or just "Label"
    return String(val).split("|")[0].trim();
  }
  if (Array.isArray(val)) {
    return val
      .map((v) => (v?.Label ? String(v.Label) : String(v?.label || "")))
      .filter(Boolean)
      .join(", ");
  }
  if (val?.Label) return String(val.Label);
  return "";
}

  private guessExt(name?: string, url?: string): string {
    const pick = (s?: string) => {
      const t = (s || "").toLowerCase();
      const m = t.match(/\.([0-9a-z]+)(?:$|\?)/i);
      return (m?.[1] || "").toLowerCase();
    };
    return pick(name) || pick(url) || "";
  }

  public async getUserFavouriteDocuments(
    favouritesListTitle: string = "Document Favourites",
    rowLimit: number = 3
  ): Promise<DocumentSummary[]> {
    let userId: number | undefined = (this.context.pageContext as any)?.legacyPageContext?.userId;
    if (!userId) {
      const me: any = await this.sp.web.currentUser();
      userId = Number(me?.Id) || 0;
    }

    const baseSelect: string[] = [
      "Id",
      "Title",
      "TIRFileUrl",
      "TIRTags",
      "TIRIsActive",
      "Modified",
      "AuthorId",
      "TIRDepartment",
    ];

    const fetchLimit = Math.max(rowLimit * 5, rowLimit);

    let rows: any[] = [];
    try {
      rows = await this.sp.web.lists
        .getByTitle(favouritesListTitle)
        .items.select(...baseSelect)
        .filter(`AuthorId eq ${userId}`)  
        .orderBy("Modified", false)
        .top(fetchLimit)();
    } catch {
      const fallbackSelect = baseSelect.filter(x => x !== "TIRDepartment");
      rows = await this.sp.web.lists
        .getByTitle(favouritesListTitle)
        .items.select(...fallbackSelect)
        .filter(`AuthorId eq ${userId}`)
        .orderBy("Modified", false)
        .top(fetchLimit)();
    }

    const mapped: DocumentSummary[] = (rows || [])
      .filter((r) => r?.TIRIsActive !== false)
      .map((r: any) => {
        const url = this.readHyperlink(r?.TIRFileUrl);

        const name =
          r?.Title ||
          (url ? decodeURIComponent(url.split("/").pop() || "Document") : "Document");

        return {
          id: String(r?.Id ?? ""),
          name,
          url,
          ext: this.guessExt(name, url),
          tag: this.readTaxonomyLabel(r?.TIRTags),
          dept: this.readTaxonomyLabel(r?.TIRDepartment), 
        } as DocumentSummary;
      })
      .slice(0, rowLimit);

    return mapped;
  }

  public async getFavouriteIndex(
    favouritesListTitle: string = "Document Favourites"
  ): Promise<Record<string, number>> {

    let userId: number | undefined = (this.context.pageContext as any)?.legacyPageContext?.userId;
    if (!userId) {
      const me: any = await this.sp.web.currentUser();
      userId = Number(me?.Id) || 0;
    }

    const rows = await this.sp.web.lists
      .getByTitle(favouritesListTitle)
      .items.select("Id", "TIRFileUrl", "TIRIsActive", "AuthorId")
      .filter(`AuthorId eq ${userId}`)
      .top(5000)();

    const map: Record<string, number> = {};
    (rows || []).forEach((r: any) => {
      if (r?.TIRIsActive === false) return;

      const url = this.readHyperlink(r?.TIRFileUrl);
      const key = this.normalizeFavouriteKey(url);
      if (!key) return;

      map[key] = Number(r?.Id);
    });

    return map;
  }

  public async toggleFavourite(
    fileUrl: string,
    title?: string,
    _tags?: any,
    _department?: any,
    favouritesListTitle: string = "Document Favourites"
  ): Promise<void> {
    const input = (fileUrl || "").trim();
    if (!input) return;

    let userId: number | undefined = (this.context.pageContext as any)?.legacyPageContext?.userId;
    if (!userId) {
      const me: any = await this.sp.web.currentUser();
      userId = Number(me?.Id) || 0;
    }

    const list = this.sp.web.lists.getByTitle(favouritesListTitle);

    const rows = await list.items
      .select("Id", "TIRFileUrl", "TIRIsActive", "AuthorId", "Modified")
      .filter(`AuthorId eq ${userId}`)
      .orderBy("Modified", false)
      .top(5000)();

    const targetKey = this.normalizeFavouriteKey(input);

    const matches = (rows || []).filter((r: any) => {
      const u = this.readHyperlink(r?.TIRFileUrl);
      return this.normalizeFavouriteKey(u) === targetKey;
    });

    // ========= IF EXISTS =========
    if (matches.length) {
      const anyActive = matches.some((m: any) => m?.TIRIsActive !== false);

      // ---- REMOVE favourite (PRIMARY = HARD DELETE) ----
      if (anyActive) {
        try {
          // delete all duplicates (active + inactive)
          await Promise.all(matches.map((m: any) => list.items.getById(m.Id).delete()));
          return;
        } catch (err) {
          // fallback: soft delete if user can't delete
          await Promise.all(
            matches.map((m: any) =>
              list.items.getById(m.Id).update({ TIRIsActive: false })
            )
          );
          return;
        }
      }

      // ---- ADD favourite again (reactivate newest + cleanup duplicates) ----
      const [keep, ...rest] = matches;

      try {
        await list.items.getById(keep.Id).update({ TIRIsActive: true });

        // cleanup old duplicates (try delete, fallback set inactive)
        await Promise.all(
          rest.map(async (m: any) => {
            try {
              await list.items.getById(m.Id).delete();
            } catch {
              await list.items.getById(m.Id).update({ TIRIsActive: false });
            }
          })
        );

        return;
      } catch {
        // if reactivate fails, fall through to add fresh row
      }
    }

    // ========= ADD NEW =========
    const serverRelKey = targetKey; // already server-relative lowercased
    const absToStore = this.toStoredAbsoluteUrl(serverRelKey);

    const fileName =
      (title || "").trim() ||
      decodeURIComponent(serverRelKey.split("/").pop() || "Document");

    await list.items.add({
      Title: fileName,
      TIRFileUrl: { Url: absToStore, Description: "" },
      TIRIsActive: true,
    });
  }
  /** ===== Announcement Banner (time-window & timezone aware) ===== */
  public async getActiveAnnouncementBannersByListTitle(
    listTitle: string,
    currentDateTime: Date = new Date()
  ): Promise<AnnouncementBannerListItem[]> {
    try {
      const sharePointItems: any[] = await this.sp.web.lists
        .getByTitle(listTitle)
        .items.select("Id,Title,TIRDescription,TIRIconURL,TIREventStartDate,TIREventEndDate,TIRIsActive")
        .orderBy("TIREventStartDate", false)();

      const currentLocalMs = currentDateTime.getTime();

      const mappedItems: AnnouncementBannerListItem[] = (sharePointItems || []).map((rawItem: any) => {
        const rawIconField = rawItem?.TIRIconURL;
        const resolvedIconUrl = typeof rawIconField === "string" ? rawIconField : rawIconField?.Url || undefined;

        const startIsoRaw = rawItem?.TIREventStartDate ? String(rawItem.TIREventStartDate) : undefined;
        const endIsoRaw = rawItem?.TIREventEndDate ? String(rawItem.TIREventEndDate) : undefined;

        const startIsoLocal = this.toLocalIso(startIsoRaw);
        const endIsoLocal = this.toLocalIso(endIsoRaw);

        return {
          id: Number(rawItem?.Id) || 0,
          title: rawItem?.Title || "",
          description: listServices.toPlainText(rawItem?.TIRDescription || ""),
          iconUrl: resolvedIconUrl,
          startIso: startIsoLocal,
          endIso: endIsoLocal,
          isActive: Boolean(rawItem?.TIRIsActive),
        } as AnnouncementBannerListItem;
      });

      const filteredActiveItems = mappedItems.filter((item) => {
        if (!item.isActive) return false;

        const startTimestampMs = item.startIso ? new Date(item.startIso).getTime() : Number.NEGATIVE_INFINITY;
        const endTimestampMs = item.endIso ? new Date(item.endIso).getTime() : Number.POSITIVE_INFINITY;

        return startTimestampMs <= currentLocalMs && currentLocalMs <= endTimestampMs;
      });

      filteredActiveItems.sort((left, right) => {
        const leftEndMs = left.endIso ? new Date(left.endIso).getTime() : Number.POSITIVE_INFINITY;
        const rightEndMs = right.endIso ? new Date(right.endIso).getTime() : Number.POSITIVE_INFINITY;

        if (leftEndMs !== rightEndMs) return leftEndMs - rightEndMs;

        const leftStartMs = left.startIso ? new Date(left.startIso).getTime() : 0;
        const rightStartMs = right.startIso ? new Date(right.startIso).getTime() : 0;

        return rightStartMs - leftStartMs;
      });

      return filteredActiveItems;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
