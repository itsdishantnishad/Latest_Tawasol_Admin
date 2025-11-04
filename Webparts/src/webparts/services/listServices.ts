import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPFI, spfi, SPFx } from '@pnp/sp';
import "@pnp/sp/webs";
import "@pnp/sp/sites";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/sp/files/folder";
import "@pnp/sp/clientside-pages";
import "@pnp/sp/search"
import { ISearchQuery } from "@pnp/sp/search";
import moment from "moment";

moment.updateLocale('en', {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: 'a few seconds',
    ss: '%d seconds',
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
    yy: "%d years"
  }
});

export type OurValueCard = { id: number; title: string; desc: string; icon?: string; sort: number; };
export type OrgMember = { id: number; name: string; role: string; level: number; sort: number; photoUrl?: string; user: string; };
export type OrgDepartment = { name: string; url?: string; };

/** ===== Dashboards (CLEAN TYPES) ===== */
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
  body?: string;       // TIRBody
  thumbUrl?: string;   // TIRThumbURL
  sort: number;
  embedUrl?: string;   // TIREmbedURL
};

export class listServices {

  private sp: SPFI;

  constructor(private context: WebPartContext) {
    this.sp = spfi().using(SPFx(this.context));
  }

  public static convertToRelativeUrl(absoluteUrl: string) {
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
        const lastIndex = serverRelativePath ? serverRelativePath.lastIndexOf('/') + 1 : 1;
        const fileName = serverRelativePath && serverRelativePath.substring(lastIndex, serverRelativePath.length);
        const fileFinalURL = serverRelativePath.replace(fileName, encodeURIComponent(fileName));
        const previewUrl = `${sitePathInfo}/_layouts/15/getpreview.ashx?resolution=6&path=${fileFinalURL}&clientType=modernWebPart`;
        return previewUrl;
      }
    }
    catch (err) {
      return "";
    }
  }

  // eslint-disable-line @typescript-eslint/no-explicit-any
  public async getNewsStory(rowCount?: number): Promise<any[]> {
    let results;
    const constraints = `AND ContentTypeId:(0x0101009D1CB255DA76424F860D91F20E6C411800B8C2DF9C7C0D3343B05E3F3EC59E444E0070F67800B7FC224AB6F421620C7A7297*)`;
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
          "Description"
        ],
        QueryTemplate: `{searchTerms}`,
        HiddenConstraints: `-SitePageFlags:Template ${constraints}`,
        EnableInterleaving: true,
      } as ISearchQuery);

      return results.PrimarySearchResults.map((item: any) => {
        return {
          title: item.Title,
          readTime: item.TIRReadTimeOWSNMBR ? Math.trunc(item.TIRReadTimeOWSNMBR) : 0,
          department: item.TIRDepartment ? item.TIRDepartment : "",
          tags: item.TIRTags,
          pageView: item.ViewCount ? Math.trunc(item.ViewCount) : 0,
          newsImage: listServices.getImageUrlFromPage(item.URL, 200),
          newsType: item.TIRNewsType ? item.TIRNewsType : "",
          author: item.CreatedBy,
          authorEmail: item.AuthorOWSUSER ? item.AuthorOWSUSER.split('|')[0] : "",
          path: item.FileRef,
          created: item.Created,
          pageDescription: item.Description,
          lastModified: item.ModifiedOWSDATE ? moment(item.ModifiedOWSDATE.split(";")[0]).fromNow() : "",
          publishedISO: item.ModifiedOWSDATE
            ? String(item.ModifiedOWSDATE).split(';')[0]
            : (item.Created ? String(item.Created).split(';')[0] : ""),
        } as any;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // eslint-disable-line @typescript-eslint/no-explicit-any
  public async getNewsStorybyID(ID?: number): Promise<any[]> {
    let results;
    const constraints = `AND ContentTypeId:(0x0101009D1CB255DA76424F860D91F20E6C411800B8C2DF9C7C0D3343B05E3F3EC59E444E0070F67800B7FC224AB6F421620C7A7297*)`;
    try {
      results = await this.sp.search({
        Querytext: "*",
        RowLimit: 3,
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
          "Created"
        ],
        QueryTemplate: ID ? `{searchTerms} ListItemID:${ID}` : `{searchTerms}`,
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
          authorEmail: item.AuthorOWSUSER ? item.AuthorOWSUSER.split('|')[0] : "",
          path: item.FileRef,
          created: item.Created
        } as any;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // eslint-disable-line @typescript-eslint/no-explicit-any
  public async getTrainingByID(ID?: number): Promise<any[]> {
    let results;
    const constraints = `AND ContentTypeId:(0x0101009D1CB255DA76424F860D91F20E6C411800B721B228147AA74E9D35C742E0E4560C00B86D6AF04B11174DB95E36FF7ADB455C*)`;
    try {
      results = await this.sp.search({
        Querytext: "*",
        RowLimit: 1,
        TrimDuplicates: false,
        SelectProperties: [
          "Title",
          "TIREventEndDate",
          "TIREventStartDate",
          "TIRLocation",
          "TIR"
        ],
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

  // eslint-disable-line @typescript-eslint/no-explicit-any
  public async getApps(listName: string): Promise<any[]> {
    let results: any[] = [];
    try {
      results = await this.sp.web.lists.getByTitle(listName)
        .items
        .select("Title", "TIRSortOrder", "TIRIconURL", "URL").orderBy("TIRSortOrder", true)();
      return results.map((item: any) => {
        return {
          Title: item.Title,
          SortOrder: item.TIRSortOrder,
          IconURL: item.TIRIconURL ? item.TIRIconURL.Url : "#",
          URL: item.URL ? item.URL.Url : "#"
        } as any;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // eslint-disable-line @typescript-eslint/no-explicit-any
  public async getNewJoiners(listName: string): Promise<any[]> {
    let results: any[] = [];
    try {
      results = await this.sp.web.lists.getByTitle(listName)
        .items
        .select("Title", "TIRDesignation", "TIRUserPicture", "TIRDescription")();
      return results.map((item: any) => {
        return {
          Title: item.Title,
          Designation: item.TIRDesignation,
          UserPicture: item.TIRUserPicture ? item.TIRUserPicture.Url : "#",
          Description: item.TIRDescription
        } as any;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // eslint-disable-line @typescript-eslint/no-explicit-any
  public async getOurPortfolio(listName: string): Promise<any[]> {
    let results: any[] = [];
    try {
      results = await this.sp.web.lists.getByTitle(listName)
        .items
        .select("Title", "TIRSortOrder", "TIRIconURL", "TIRPortfolioCategory", "TIRColumnLayout").orderBy("TIRSortOrder", true)();
      return results.map((item: any) => {
        return {
          Title: item.Title,
          SortOrder: item.TIRSortOrder,
          IconURL: item.TIRIconURL ? item.TIRIconURL.Url : "#",
          PortfolioCategory: item.TIRPortfolioCategory ? item.TIRPortfolioCategory : "",
          ColumnLayout: Number(item.TIRColumnLayout) || 2
        } as any;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async getOrganisationMembers(listTitle: string): Promise<OrgMember[]> {
    const rows = await this.sp.web.lists.getByTitle(listTitle).items
      .select("Title,TIRDesignation,TIRLevel,TIRSortOrder,TIRUserPicture,TIRUser/Title")
      .orderBy("TIRLevel", true)
      .orderBy("TIRSortOrder", true)
      .expand("TIRUser")();

    const mapped: OrgMember[] = rows.map((it: any) => {
      const ph = it?.TIRUserPicture;
      const photoUrl = typeof ph === "string" ? ph : ph?.Url || undefined;
      return {
        id: Number(it?.Id) || 0,
        name: it?.Title || "",
        role: it?.TIRDesignation || "",
        level: Number(it?.TIRLevel ?? 99),
        sort: Number(it?.TIRSortOrder ?? 9999),
        photoUrl,
        user: it?.TIRUser?.Title || ""
      };
    });

    mapped.sort((a, b) =>
      a.level !== b.level ? a.level - b.level :
        a.sort !== b.sort ? a.sort - b.sort :
          a.name.localeCompare(b.name)
    );

    return mapped;
  }

  public async getOurValues(listName: string): Promise<any[]> {
    let results: any[] = [];
    try {
      results = await this.sp.web.lists.getByTitle(listName)
        .items
        .select("Title", "TIRDescription", "TIRIconURL", "TIRSortOrder").orderBy("TIRSortOrder", true)();
      return results.map((item: any) => {
        return {
          title: item.Title,
          description: item.TIRDescription,
          icon: item.TIRIconURL ? item.TIRIconURL.Url : "#",
          sortOrder: item.TIRSortOrder
        } as any;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /** Departments mapped to a member (MM field reused: TIRDepartment) */
  public async getDepartmentsByMember(listTitle: string, memberDisplayName: string): Promise<OrgDepartment[]> {
    let results: any[] = [];
    try {
      results = await this.sp.web.lists.getByTitle(listTitle).items
        .select(
          "Id",
          "Title",
          "URL",
          "TIRDepartment",
          "TaxCatchAll/Term",
          "TIRDepartmentMember/Title",
        )
        .expand("TaxCatchAll,TIRDepartmentMember")();

      const matches = results.filter(item => {
        const people: any[] = Array.isArray(item?.TIRDepartmentMember) ? item.TIRDepartmentMember : [];
        return people.some(p => (p?.Title || "").trim().toLowerCase() === memberDisplayName.trim().toLowerCase());
      });

      return matches.map((item: any) => {
        return {
          id: item.Id,
          title: item.Title,
          url: item.URL ? item.URL.Url : "#",
          department: item.TaxCatchAll && item.TaxCatchAll[0] ? item.TaxCatchAll[0].Term : "#",
          TIRDepartmentMember: item.TIRDepartmentMember
        } as any;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Function to get all trainings
  public async getAllTraining(): Promise<any[]> {
    let results;
    const constraints = `AND ContentTypeId:(0x0101009D1CB255DA76424F860D91F20E6C411800B721B228147AA74E9D35C742E0E4560C00B86D6AF04B11174DB95E36FF7ADB455C*)`;
    try {
      const searchOptions: ISearchQuery = {
        Querytext: "*",
        TrimDuplicates: false,
        SelectProperties: [
          "Title",
          "TIREventEndDate",
          "TIREventStartDate",
          "TIRLocation",
          'TIRInstructorOWSUSER',
          "URL",
          "TIRJoiningURLOWSMTXT"
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
          instructor: instructorInfo
        } as any;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // helper function for the instructor name
  private parseUserField(userFieldValue: string) {
    if (!userFieldValue) return null;

    try {
      // Split by " | " — this format: "email | displayName | extraData i:0#.f|membership|email"
      const parts = userFieldValue.split(" | ").map((p) => p.trim()).filter(Boolean);

      if (parts.length === 0) return null;

      const email = parts[0] || "";
      const name = parts[1] || "";
      const role = parts[2]?.includes("i:0#.f|membership|") ? "" : parts[2] || ""; // Optional role, if exists

      return {
        id: email,
        name,
        email,
        role
      };
    } catch (err) {
      console.error("Error parsing user field:", err, userFieldValue);
      return null;
    }
  }

  // Function to get all events
  public async getAllEvents(): Promise<any[]> {
    let results;
    const constraints = `AND ContentTypeId:(0x0101009D1CB255DA76424F860D91F20E6C41180091B43BD03BCDD947979C2884C4C8FF39*)`;
    try {
      const searchOptions: ISearchQuery = {
        Querytext: "*",
        TrimDuplicates: false,
        SelectProperties: [
          "Id",
          "Title",
          "TIREventEndDate",
          "TIREventStartDate",
          "TIRLocation",
          "TIREventCategory",
          "URL",
        ],
        QueryTemplate: `{searchTerms}`,
        HiddenConstraints: `-SitePageFlags:Template ${constraints}`,
        EnableInterleaving: true,
      };

      searchOptions.RowLimit = 500;

      results = await this.sp.search(searchOptions);

      return results.PrimarySearchResults.map((item: any) => {
        return {
          ID: item.Id,
          title: item.Title,
          eventEndDate: item.TIREventEndDate,
          eventStartDate: item.TIREventStartDate,
          location: item.TIRLocation,
          newsImage: listServices.getImageUrlFromPage(item.URL, 200),
          category: item.TIREventCategory,
        } as any;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /* ===================== DASHBOARDS (NEW SERVICES) ===================== */

  /** Load Dashboard categories (left rail on master view) */
  public async getDashboardCategories(listTitle: string): Promise<DashboardCategory[]> {
    try {
      const rows: any[] = await this.sp.web.lists.getByTitle(listTitle).items
        .select("Id", "Title", "TIRSortOrder", "TIRIsActive")
        .orderBy("TIRSortOrder", true)();

      return rows.map((row: any) => ({
        id: Number(row?.Id) || 0,
        name: row?.Title || "",
        sort: Number(row?.TIRSortOrder ?? 9999),
        isActive: Boolean(row?.TIRIsActive)
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
      let query = this.sp.web.lists.getByTitle(listTitle).items
        .select(
          "Id","Title","TIRBody","TIRThumbURL","TIRSortOrder",
          "TIREmbedURL","TIRCategory/Id","TIRCategory/Title")
        .expand("TIRCategory")
        .orderBy("TIRSortOrder", true);

      // Filter strictly by lookup Id
      const filters: string[] = [];
      if (typeof categoryId === "number") filters.push(`TIRCategoryId eq ${categoryId}`);
      if (typeof excludeId === "number") filters.push(`Id ne ${excludeId}`);
      if (filters.length) query = query.filter(filters.join(" and "));

      if (typeof top === "number" && top > 0)  query = query.top(top);
      if (typeof skip === "number" && skip > 0) query = query.skip(skip);

      const rows: any[] = await query();

      return rows.map((row: any) => {
        const thumb = row?.TIRThumbURL;
        const embed = row?.TIREmbedURL;
        const cat = row?.TIRCategory || {};
        const categoryName = cat?.Title || "";
        const categoryIdValue = Number(cat?.Id || row?.TIRCategoryId || 0);

        return {
          id: Number(row?.Id) || 0,
          title: row?.Title || "",
          categoryId: categoryIdValue,
          categoryName,
          body: row?.TIRBody || "",
          thumbUrl: typeof thumb === "string" ? thumb : thumb?.Url || undefined,
          sort: Number(row?.TIRSortOrder ?? 9999),
          embedUrl: typeof embed === "string" ? embed : embed?.Url || undefined
        } as DashboardItem;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /** Convenience: fetch a single Dashboard item by ID */
  public async getDashboardById(listTitle: string, itemId: number): Promise<DashboardItem | null> {
    try {
      const allItems = await this.getDashboards(listTitle);
      const match = allItems.find(it => it.id === itemId);
      return match || null;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
