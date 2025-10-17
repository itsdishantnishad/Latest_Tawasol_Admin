import { BaseClientSideWebPart, IPropertyPaneConfiguration } from "@microsoft/sp-webpart-base";
export interface IMoreForYouWebPartProps {
    take: number;
    randomizeAcrossDepartment: boolean;
}
export default class MoreForYouWebPart extends BaseClientSideWebPart<IMoreForYouWebPartProps> {
    render(): void;
    protected onInit(): Promise<void>;
    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration;
}
//# sourceMappingURL=MoreForYouWebPart.d.ts.map