import { Version } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
export interface INewsPageWebPartProps {
}
export default class NewsPageWebPart extends BaseClientSideWebPart<INewsPageWebPartProps> {
    render(): void;
    protected onDispose(): void;
    protected get dataVersion(): Version;
}
//# sourceMappingURL=NewsPageWebPart.d.ts.map