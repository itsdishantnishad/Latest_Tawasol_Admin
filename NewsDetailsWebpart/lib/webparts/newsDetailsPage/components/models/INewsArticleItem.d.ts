export interface INewsArticleItem {
    Id: number;
    Title: string;
    Created?: string;
    Modified?: string;
    NAAuthor?: {
        Title: string;
        EMail: string;
    };
    Author?: {
        Title: string;
        EMail: string;
    };
    NACategory?: string | {
        Label: string;
    } | {
        Label: string;
    }[];
    NAHashtags?: string;
    NAReadTimeMinutes?: number;
    ReadDatetimeMin?: number;
    NAViews?: number;
    FirstPublishedDate?: string;
    NADepartment?: any;
    b6547384e0b841d5a2bf78325d80b47d?: string;
    [key: string]: any;
}
//# sourceMappingURL=INewsArticleItem.d.ts.map