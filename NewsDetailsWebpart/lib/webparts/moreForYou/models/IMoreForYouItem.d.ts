export interface IMoreForYouItem {
    Id: number;
    Title: string;
    FileRef: string;
    BannerImageUrl?: string;
    CanvasContent1?: string;
    NAReadTimeMinutes?: number;
    NACategory?: string | {
        Label: string;
    } | {
        Label: string;
    }[];
    NAHashtags?: string;
    FirstPublishedDate?: string;
    Modified?: string;
    Created?: string;
    NADepartment?: string | {
        Label?: string;
        TermGuid?: string;
        WssId?: number;
    } | null;
    [key: string]: any;
}
//# sourceMappingURL=IMoreForYouItem.d.ts.map