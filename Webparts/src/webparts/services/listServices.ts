
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
            }
            else {
                const lastIndex = serverRelativePath ? serverRelativePath.lastIndexOf('/') + 1 : 1;
                const fileName = serverRelativePath && serverRelativePath.substring(lastIndex, serverRelativePath.length);
                const fileFinalURL = serverRelativePath.replace(fileName, encodeURIComponent(fileName));
                const previewUrl = `${sitePathInfo}/_layouts/15/getpreview.ashx?resolution=6&path=${fileFinalURL}&clientType=modernWebPart`;
                //const previewUrl = `${sitePathInfo}/_layouts/15/getpreview.ashx?resolution=6&path=${encodeURI(serverRelativePath)}&clientType=modernWebPart`; 
                // return Util.getImageUrl(previewUrl, imageWidth); 
                return previewUrl;
            }
        }
        catch (err) {
            return "";
        }
    }

    // eslint-disable-line @typescript-eslint/no-explicit-any
    public async getNewsStory(rowCount?: number): Promise<any[]> {
        // eslint-disable-line @typescript-eslint/no-explicit-any
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
                //  SortList: sort ? sort : [{ Property: SearchProperties.FIRST_PUBLISHED_DATE, Direction: SortDirection.Descending }], 

                EnableInterleaving: true,
            } as ISearchQuery);

            // eslint-disable-line @typescript-eslint/no-explicit-any
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
                    // lastModified: item.ModifiedOWSDATE,
                    lastModified: item.ModifiedOWSDATE ? moment(item.ModifiedOWSDATE.split(";")[0]).fromNow() : "",
                     publishedISO: item.ModifiedOWSDATE
                    ? String(item.ModifiedOWSDATE).split(';')[0]
                    : (item.Created ? String(item.Created).split(';')[0] : ""),

                    //  Description: item.AcronymDetail
                } as any;
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }



    // eslint-disable-line @typescript-eslint/no-explicit-any
    public async getNewsStorybyID(ID?: number): Promise<any[]> {
        // eslint-disable-line @typescript-eslint/no-explicit-any
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
                //  SortList: sort ? sort : [{ Property: SearchProperties.FIRST_PUBLISHED_DATE, Direction: SortDirection.Descending }], 

                EnableInterleaving: true,
            } as ISearchQuery);

            // eslint-disable-line @typescript-eslint/no-explicit-any
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
                    //  lastModified: item.ModifiedOWSDATE ? moment(item.ModifiedOWSDATE.split(";")[0]).utc().format("DD MMM, yyyy") : "",
                    //  Description: item.AcronymDetail
                } as any;
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // eslint-disable-line @typescript-eslint/no-explicit-any
    public async getTrainingByID(ID?: number): Promise<any[]> {
        // eslint-disable-line @typescript-eslint/no-explicit-any
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
                //  SortList: sort ? sort : [{ Property: SearchProperties.FIRST_PUBLISHED_DATE, Direction: SortDirection.Descending }], 

                EnableInterleaving: true,
            } as ISearchQuery);

            // eslint-disable-line @typescript-eslint/no-explicit-any
            return results.PrimarySearchResults.map((item: any) => {
                return {
                    title: item.Title,
                    eventEndDate: item.TIREventEndDate,
                    eventStartDate: item.TIREventStartDate,
                    location: item.TIRLocation,
                    //  lastModified: item.ModifiedOWSDATE ? moment(item.ModifiedOWSDATE.split(";")[0]).utc().format("DD MMM, yyyy") : "",
                    //  Description: item.AcronymDetail
                } as any;
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }


    // eslint-disable-line @typescript-eslint/no-explicit-any
    public async getApps(listName: string): Promise<any[]> {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        let results: any[] = [];
        try {
            results = await this.sp.web.lists.getByTitle(listName)
                .items
                .select("Title", "TIRSortOrder", "TIRIconURL", "URL").orderBy("TIRSortOrder", true)();
            // eslint-disable-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-line @typescript-eslint/no-explicit-any
        let results: any[] = [];
        try {
            results = await this.sp.web.lists.getByTitle(listName)
                .items
                .select("Title", "TIRDesignation", "TIRUserPicture", "TIRDescription")();
            // eslint-disable-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-line @typescript-eslint/no-explicit-any
        let results: any[] = [];
        try {
            results = await this.sp.web.lists.getByTitle(listName)
                .items
                .select("Title", "TIRSortOrder", "TIRIconURL", "TIRPortfolioCategory", "TIRColumnLayout").orderBy("TIRSortOrder", true)();
            // eslint-disable-line @typescript-eslint/no-explicit-any
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


            // const result = matches.map(it => {
            //     let deptName = "";
            //     const mm: any = it?.TIRDepartment;

            //     if (typeof mm === "string" && mm.length > 0) {
            //         deptName = mm.split("|")[0];   // "Label|Guid"
            //     } else if (mm && typeof mm?.Label === "string") {
            //         deptName = mm.Label;
            //     } else {
            //         deptName = it?.Title || "";
            //     }
            //     const urlVal = it?.URL;
            //     const url = typeof urlVal === "string" ? urlVal : urlVal?.Url;

            //     return { name: deptName || "Department", url } as OrgDepartment;
            // });

            // de-dupe by name
            //     const unique: OrgDepartment[] = [];
            //     const seen = new Set<string>();
            //     result.forEach(r => {
            //         const key = (r.name || "").toLowerCase();
            //         if (!seen.has(key)) { seen.add(key); unique.push(r); }
            //     });
            //     unique.sort((a, b) => a.name.localeCompare(b.name));
            //     return unique;
        } catch (error) {
            return Promise.reject(error);
        }
    }



    // Function to get all trainings
    public async getAllTraining(): Promise<any[]> {
    // eslint-disable-line @typescript-eslint/no-explicit-any
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
            // SortList: sort ? sort : [{ Property: SearchProperties.FIRST_PUBLISHED_DATE, Direction: SortDirection.Descending }], 
        };

        // Set RowLimit dynamically: 1 for specific ID, higher for all (e.g., 500 to respect SharePoint limits)
        searchOptions.RowLimit = 500;

        results = await this.sp.search(searchOptions);

        // eslint-disable-line @typescript-eslint/no-explicit-any
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
                // lastModified: item.ModifiedOWSDATE ? moment(item.ModifiedOWSDATE.split(";")[0]).utc().format("DD MMM, yyyy") : "",
                // Description: item.AcronymDetail
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
    // eslint-disable-line @typescript-eslint/no-explicit-any
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
            // SortList: sort ? sort : [{ Property: SearchProperties.FIRST_PUBLISHED_DATE, Direction: SortDirection.Descending }], 
        };

        // Set RowLimit dynamically: 1 for specific ID, higher for all (e.g., 500 to respect SharePoint limits)
        searchOptions.RowLimit = 500;

        results = await this.sp.search(searchOptions);

        // eslint-disable-line @typescript-eslint/no-explicit-any
        return results.PrimarySearchResults.map((item: any) => {
            return {
                ID: item.Id,
                title: item.Title,
                eventEndDate: item.TIREventEndDate,
                eventStartDate: item.TIREventStartDate,
                location: item.TIRLocation,
                newsImage: listServices.getImageUrlFromPage(item.URL, 200),
                category: item.TIREventCategory,
                // lastModified: item.ModifiedOWSDATE ? moment(item.ModifiedOWSDATE.split(";")[0]).utc().format("DD MMM, yyyy") : "",
                // Description: item.AcronymDetail
            } as any;
        });
    } catch (error) {
        return Promise.reject(error);
    }
   }


}


