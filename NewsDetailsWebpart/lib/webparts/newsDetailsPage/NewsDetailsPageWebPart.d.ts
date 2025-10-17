import { BaseClientSideWebPart, IPropertyPaneConfiguration } from "@microsoft/sp-webpart-base";
import "@pnp/sp/items";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
export interface INewsDetailsWebPartProps {
    title: string;
    category: string;
    department: any;
    hashtags: string;
    publishedOn: any;
    readTime: number;
    useAutoPublishedOn: boolean;
    author?: any[];
}
export default class NewsDetailsWebPart extends BaseClientSideWebPart<INewsDetailsWebPartProps> {
    protected onInit(): Promise<void>;
    protected onAfterDeserialize(deserialized: any): any;
    render(): void;
    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration;
}
//# sourceMappingURL=NewsDetailsPageWebPart.d.ts.map