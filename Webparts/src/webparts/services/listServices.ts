
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

    // eslint-disable-line @typescript-eslint/no-explicit-any
    public async getNewsStory(listName: string): Promise<any[]> {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        let results: any[] = [];
        try {
            results = await this.sp.web.lists.getByTitle(listName)
                .items
                .select("Title").orderBy("Title", true)();
            // eslint-disable-line @typescript-eslint/no-explicit-any
            return results.map((item: any) => {
                return {
                    Title: item.Title,
                  //  Description: item.AcronymDetail
                } as any;
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }

}


