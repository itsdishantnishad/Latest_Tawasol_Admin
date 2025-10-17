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
import { BaseClientSideWebPart, PropertyPaneToggle, PropertyPaneSlider } from "@microsoft/sp-webpart-base";
import MoreForYou from "./components/MoreForYou";
var MoreForYouWebPart = /** @class */ (function (_super) {
    __extends(MoreForYouWebPart, _super);
    function MoreForYouWebPart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MoreForYouWebPart.prototype.render = function () {
        var _a, _b;
        var element = React.createElement(MoreForYou, {
            context: this.context,
            take: (_a = this.properties.take) !== null && _a !== void 0 ? _a : 4,
            randomizeAcrossDepartment: (_b = this.properties.randomizeAcrossDepartment) !== null && _b !== void 0 ? _b : true
        });
        ReactDom.render(element, this.domElement);
    };
    MoreForYouWebPart.prototype.onInit = function () {
        if (typeof this.properties.take !== "number")
            this.properties.take = 4;
        if (typeof this.properties.randomizeAcrossDepartment !== "boolean")
            this.properties.randomizeAcrossDepartment = true;
        return Promise.resolve();
    };
    MoreForYouWebPart.prototype.getPropertyPaneConfiguration = function () {
        return {
            pages: [
                {
                    header: { description: "More For You settings" },
                    groups: [
                        {
                            groupName: "Display",
                            groupFields: [
                                PropertyPaneSlider("take", { label: "Number of tiles", min: 2, max: 12, step: 1 }),
                                PropertyPaneToggle("randomizeAcrossDepartment", { label: "Only from current page's department" })
                            ]
                        }
                    ]
                }
            ]
        };
    };
    return MoreForYouWebPart;
}(BaseClientSideWebPart));
export default MoreForYouWebPart;
//# sourceMappingURL=MoreForYouWebPart.js.map