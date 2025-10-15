
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
// import {moment} from "moment"; 

export enum ListName {
    MEET_OUR_TEAM = "Meet Our Team",
    IMAGE_CAROUSEL = "Image Carousel",
    IMAGE_NAVIGATION = "Image Navigation",
    IMAGE_SUB_NAVIGATION = "Image Sub Navigation",
    USER_SUBSCRIPTIONS = "User Subscriptions",
    VIDEO_PLAYER = "Video Gallery"
}

export enum siteColumn {
    ImageURL = "MKImageURL",
    URL = "MKURL",
    Level = "MKLevel",
    OpenInNewTab = "MKOpenInNewTab",
    SortOrder = "MKSortOrder"

}

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
    public async getNewsStory(): Promise<any[]> {
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
                QueryTemplate: `{searchTerms}`,
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
    public async getTraining(ID?: number): Promise<any[]> {
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
                    "TIRLocation"
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
    public async getOurPortfolio(listName: string): Promise<any[]> {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        let results: any[] = [];
        try {
            results = await this.sp.web.lists.getByTitle(listName)
                .items
                .select("Title", "TIRSortOrder", "TIRIconURL", "TIRPortfolioCategory").orderBy("TIRSortOrder", true)();
            // eslint-disable-line @typescript-eslint/no-explicit-any
            return results.map((item: any) => {
                return {
                    Title: item.Title,
                    SortOrder: item.TIRSortOrder,
                    IconURL: item.TIRIconURL ? item.TIRIconURL.Url : "#",
                    PortfolioCategory: item.TIRPortfolioCategory ? item.TIRPortfolioCategory : ""
                } as any;
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }
}


