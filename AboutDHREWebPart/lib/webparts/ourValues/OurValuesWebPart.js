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
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import OurValues from './components/OurValues';
var OurValuesWebPart = /** @class */ (function (_super) {
    __extends(OurValuesWebPart, _super);
    function OurValuesWebPart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OurValuesWebPart.prototype.render = function () {
        var element = React.createElement(OurValues, {
            context: this.context
        });
        ReactDom.render(element, this.domElement);
    };
    OurValuesWebPart.prototype.onDispose = function () {
        ReactDom.unmountComponentAtNode(this.domElement);
    };
    Object.defineProperty(OurValuesWebPart.prototype, "dataVersion", {
        get: function () {
            return Version.parse('1.0');
        },
        enumerable: false,
        configurable: true
    });
    return OurValuesWebPart;
}(BaseClientSideWebPart));
export default OurValuesWebPart;
//# sourceMappingURL=OurValuesWebPart.js.map