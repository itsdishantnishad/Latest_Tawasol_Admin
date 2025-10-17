import { Version } from "@microsoft/sp-core-library";
import { IPropertyPaneConfiguration } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
export interface IOurPortfolioWebPartProps {
    description: string;
    listTitle?: string;
    brandField?: string;
}
export default class OurPortfolioWebPart extends BaseClientSideWebPart<IOurPortfolioWebPartProps> {
    private _isDarkTheme;
    private _environmentMessage;
    render(): void;
    protected onThemeChanged(currentTheme: any): void;
    protected get dataVersion(): Version;
    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration;
}
//# sourceMappingURL=OurPortfolioWebPart.d.ts.map