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
import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { PropertyPaneTextField, } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import OurPortfolio from "./components/OurPortfolio";
var OurPortfolioWebPart = /** @class */ (function (_super) {
    __extends(OurPortfolioWebPart, _super);
    function OurPortfolioWebPart() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._isDarkTheme = false;
        _this._environmentMessage = "";
        return _this;
    }
    OurPortfolioWebPart.prototype.render = function () {
        var _a;
        var element = React.createElement(OurPortfolio, {
            spfxContext: this.context,
            siteUrl: this.context.pageContext.web.absoluteUrl,
            listTitle: this.properties.listTitle || "AboutDHREOurPortfolio",
            brandField: this.properties.brandField || "ABoutDHRECategory",
            description: this.properties.description,
            isDarkTheme: this._isDarkTheme,
            environmentMessage: this._environmentMessage,
            hasTeamsContext: !!((_a = this.context.sdks) === null || _a === void 0 ? void 0 : _a.microsoftTeams),
            userDisplayName: this.context.pageContext.user.displayName,
        });
        ReactDom.render(element, this.domElement);
    };
    OurPortfolioWebPart.prototype.onThemeChanged = function (currentTheme) {
        if (!currentTheme)
            return;
        this._isDarkTheme = !!currentTheme.isInverted;
    };
    Object.defineProperty(OurPortfolioWebPart.prototype, "dataVersion", {
        get: function () {
            return Version.parse("1.0");
        },
        enumerable: false,
        configurable: true
    });
    OurPortfolioWebPart.prototype.getPropertyPaneConfiguration = function () {
        return {
            pages: [
                {
                    header: { description: "Our Portfolio Settings" },
                    groups: [
                        {
                            groupName: "Data",
                            groupFields: [
                                PropertyPaneTextField("listTitle", {
                                    label: "CMS List Title",
                                    placeholder: "AboutDHREOurPortfolio",
                                }),
                                PropertyPaneTextField("brandField", {
                                    label: "Brand Choice Column (internal name)",
                                    placeholder: "ABoutDHRECategory",
                                }),
                                PropertyPaneTextField("description", {
                                    label: "Description (optional)",
                                }),
                            ],
                        },
                    ],
                },
            ],
        };
    };
    return OurPortfolioWebPart;
}(BaseClientSideWebPart));
export default OurPortfolioWebPart;
//# sourceMappingURL=OurPortfolioWebPart.js.map