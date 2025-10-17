// import * as React from "react";
// import * as ReactDom from "react-dom";
// import { Version } from "@microsoft/sp-core-library";
// import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// import NewsPage from "./components/NewsPage";
// export interface INewsPageWebPartProps {}
// export default class NewsPageWebPart extends BaseClientSideWebPart<INewsPageWebPartProps> {
//   public render(): void {
//     const element = React.createElement(NewsPage, {
//       siteUrl: this.context.pageContext.web.absoluteUrl,
//       spfxContext: this.context
//     });
//     ReactDom.render(element, this.domElement);
//   }
//   protected onDispose(): void {
//     ReactDom.unmountComponentAtNode(this.domElement);
//   }
//   protected get dataVersion(): Version {
//     return Version.parse("1.0");
//   }
// }
import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import NewsPage from "./components/NewsPage";
var NewsPageWebPart = /** @class */ (function (_super) {
    __extends(NewsPageWebPart, _super);
    function NewsPageWebPart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NewsPageWebPart.prototype.render = function () {
        var element = React.createElement(NewsPage, {
            siteUrl: this.context.pageContext.web.absoluteUrl,
            spfxContext: this.context
        });
        ReactDom.render(element, this.domElement);
    };
    NewsPageWebPart.prototype.onDispose = function () {
        ReactDom.unmountComponentAtNode(this.domElement);
    };
    Object.defineProperty(NewsPageWebPart.prototype, "dataVersion", {
        get: function () {
            return Version.parse("1.0");
        },
        enumerable: false,
        configurable: true
    });
    return NewsPageWebPart;
}(BaseClientSideWebPart));
export default NewsPageWebPart;
//# sourceMappingURL=NewsPageWebPart.js.map