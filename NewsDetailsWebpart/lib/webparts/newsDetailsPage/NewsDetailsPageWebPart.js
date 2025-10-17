// import * as React from "react";
// import * as ReactDom from "react-dom";
// import {
//   BaseClientSideWebPart,
//   IPropertyPaneConfiguration,
//   PropertyPaneTextField,
//   PropertyPaneSlider,
//   PropertyPaneDropdown,
//   PropertyPaneToggle
// } from "@microsoft/sp-webpart-base";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// import {
//   PropertyFieldDateTimePicker,
//   IDateTimeFieldValue
// } from "@pnp/spfx-property-controls/lib/PropertyFieldDateTimePicker";
// import {
//   PropertyFieldTermPicker,
//   IPickerTerms
// } from "@pnp/spfx-property-controls/lib/PropertyFieldTermPicker";
// import {
//   PropertyFieldPeoplePicker,
//   PrincipalType,
//   IPropertyFieldGroupOrPerson
// } from "@pnp/spfx-property-controls/lib/PropertyFieldPeoplePicker";
// import { spfi, SPFI } from "@pnp/sp";
// import { SPFx as spSPFx } from "@pnp/sp/behaviors/spfx";
// import "@pnp/sp/items";
// import "@pnp/sp/webs";
// import "@pnp/sp/lists";
// import NewsDetails from "./components/NewsDetailsPage";
// import { INewsDetailsPageProps } from "./components/INewsDetailsPageProps";
// export interface INewsDetailsWebPartProps {
//   title: string;
//   category: string;
//   department: IPickerTerms;
//   hashtags: string;
//   readTime: number;
//   publishedOn: IDateTimeFieldValue;
//   useAutoPublishedOn: boolean;
//   // People picker selection (single person)
//   author?: IPropertyFieldGroupOrPerson[];
// }
// export default class NewsDetailsWebPart extends BaseClientSideWebPart<INewsDetailsWebPartProps> {
//   protected async onInit(): Promise<void> {
//     if (!Array.isArray(this.properties.department)) this.properties.department = [];
//     if (typeof this.properties.useAutoPublishedOn !== "boolean") this.properties.useAutoPublishedOn = true;
//     if (this.properties.author && !Array.isArray(this.properties.author)) this.properties.author = [];
//     return super.onInit();
//   }
//   protected onAfterDeserialize(deserialized: any): any {
//     if (!Array.isArray(deserialized?.department)) deserialized.department = [];
//     if (typeof deserialized.useAutoPublishedOn !== "boolean") deserialized.useAutoPublishedOn = true;
//     if (deserialized.author && !Array.isArray(deserialized.author)) deserialized.author = [];
//     return deserialized;
//   }
//   public render(): void {
//     const depArray = Array.isArray(this.properties.department) ? this.properties.department : [];
//     const departmentLabel = depArray.length > 0 ? (depArray[0].name || depArray[0].key || "") : "";
//     const publishedDate =
//       typeof this.properties.publishedOn === "object" &&
//       this.properties.publishedOn?.value instanceof Date
//         ? this.properties.publishedOn.value.toISOString()
//         : this.properties.publishedOn
//         ? String(this.properties.publishedOn)
//         : "";
//     const picked = this.properties.author?.[0];
//     const authorNameOverride = picked?.fullName || "";
//     const authorEmailOverride = picked?.email || picked?.login || "";
//     const element: React.ReactElement<INewsDetailsPageProps> = React.createElement(NewsDetails, {
//       context: this.context,
//       title: this.properties.title,
//       category: this.properties.category,
//       department: departmentLabel,
//       hashtags: this.properties.hashtags,
//       readTime: this.properties.readTime,
//       publishedOn: publishedDate,
//       useAutoPublishedOn: this.properties.useAutoPublishedOn,
//       authorNameOverride,
//       authorEmailOverride
//     });
//     ReactDom.render(element, this.domElement);
//   }
//   /** Update Site Pages item: set CT people field NAAuthor (lookup id) */
//   private async _updatePageAuthorField(userId: number | undefined): Promise<void> {
//     try {
//       if (!userId && userId !== 0) return;
//       const itemId = this.context.pageContext.listItem?.id;
//       if (!itemId) return;
//       const sp: SPFI = spfi().using(spSPFx(this.context));
//       await sp.web.lists.getByTitle("Site Pages").items.getById(itemId).update({
//         NAAuthorId: userId
//       });
//     } catch (e) {
//       console.warn("Failed to update NAAuthor on page item:", e);
//     }
//   }
//   protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
//     const initialDate: IDateTimeFieldValue = this.properties.publishedOn
//       ? {
//           value:
//             this.properties.publishedOn.value instanceof Date
//               ? this.properties.publishedOn.value
//               : new Date((this.properties.publishedOn as any).value ?? (this.properties.publishedOn as any)),
//           displayValue:
//             this.properties.publishedOn.displayValue ||
//             (this.properties.publishedOn.value instanceof Date
//               ? this.properties.publishedOn.value.toDateString()
//               : new Date().toDateString())
//         }
//       : { value: new Date(), displayValue: new Date().toDateString() };
//     return {
//       pages: [
//         {
//           header: { description: "📝 News Article Details (from CT)" },
//           groups: [
//             {
//               groupName: "Article Settings",
//               groupFields: [
//                 PropertyPaneTextField("title", {
//                   label: "Article Title (optional override)",
//                   description: "Leave blank to use the page Title"
//                 }),
//                 PropertyPaneDropdown("category", {
//                   label: "Category (from CT)",
//                   options: [
//                     { key: "DHRE Stories", text: "DHRE Stories" },
//                     { key: "Announcement", text: "Announcement" },
//                     { key: "Around the World", text: "Around the World" }
//                   ],
//                   selectedKey: this.properties.category
//                 }),
//                 PropertyFieldTermPicker("department", {
//                   key: "department",
//                   label: "Department (Managed Metadata)",
//                   panelTitle: "Select Department",
//                   allowMultipleSelections: false,
//                   initialValues: Array.isArray(this.properties.department) ? this.properties.department : [],
//                   onPropertyChange: (propPath, oldVal, newVal) => {
//                     const fixed = Array.isArray(newVal) ? newVal : [];
//                     this.properties.department = fixed;
//                     this.onPropertyPaneFieldChanged(propPath, oldVal, fixed);
//                   },
//                   properties: this.properties,
//                   context: this.context as any,
//                   limitByTermsetNameOrID: "NADepartment",
//                   deferredValidationTime: 0
//                 }),
//                 PropertyPaneTextField("hashtags", {
//                   label: "Hashtags (#tag1 #tag2)",
//                   description: "Separate with space or comma"
//                 }),
//                 PropertyPaneSlider("readTime", {
//                   label: "Read Time (minutes)",
//                   min: 1,
//                   max: 300,
//                   step: 1
//                 }),
//                 // People picker that also writes to Site Pages -> NAAuthor
//                 PropertyFieldPeoplePicker("author", {
//                 key: "author",
//                 label: "Author (writes to CT field NAAuthor)",
//                 initialData: this.properties.author || [],
//                 allowDuplicate: false,
//                 principalType: [PrincipalType.Users],   // ✅ correct prop + enum
//                 multiSelect: false,
//                 properties: this.properties,            // ✅ include properties for the control
//                 context: this.context as any,
//                 onPropertyChange: async (_prop, oldVal, newVal) => {
//                   this.properties.author = Array.isArray(newVal) ? newVal : [];
//                   this.onPropertyPaneFieldChanged("author", oldVal, this.properties.author);
//                   const picked = this.properties.author?.[0];
//                   // id can be string; convert to number for NAAuthorId
//                   const idNum =
//                     picked?.id !== undefined ? Number.parseInt(picked.id as any, 10) : undefined;
//                   if (idNum !== undefined && !Number.isNaN(idNum)) {
//                     await this._updatePageAuthorField(idNum);
//                   } else {
//                     console.warn("PeoplePicker returned non-numeric id; skipping NAAuthor update.", picked);
//                   }
//                   this.render();
//                 }
//               }),
//                 PropertyPaneToggle("useAutoPublishedOn", {
//                   label: "Use page Modified date/time (Auto)",
//                   onText: "Auto",
//                   offText: "Manual",
//                   checked: this.properties.useAutoPublishedOn === true
//                 }),
//                 PropertyFieldDateTimePicker("publishedOn", {
//                   key: "publishedOn",
//                   label: "Published On (manual date)",
//                   dateConvention: 1,
//                   showLabels: false,
//                   initialDate,
//                   properties: this.properties,
//                   onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
//                   disabled: this.properties.useAutoPublishedOn === true,
//                   deferredValidationTime: 0
//                 })
//               ]
//             }
//           ]
//         }
//       ]
//     };
//   }
// }
import * as React from "react";
import * as ReactDom from "react-dom";
import { BaseClientSideWebPart,
// PropertyPaneTextField,
// PropertyPaneSlider,
// PropertyPaneDropdown,
// PropertyPaneToggle
 } from "@microsoft/sp-webpart-base";
// --- Property Controls (kept for later use, but disabled now) ---
// import {
//   PropertyFieldDateTimePicker,
//   IDateTimeFieldValue
// } from "@pnp/spfx-property-controls/lib/PropertyFieldDateTimePicker";
// import {
//   PropertyFieldTermPicker,
//   IPickerTerms
// } from "@pnp/spfx-property-controls/lib/PropertyFieldTermPicker";
// import {
//   PropertyFieldPeoplePicker,
//   PrincipalType,
//   IPropertyFieldGroupOrPerson
// } from "@pnp/spfx-property-controls/lib/PropertyFieldPeoplePicker";
// =================================================================================================================
// Commented Property Pane
// import { spfi, SPFI } from "@pnp/sp";
// import { SPFx as spSPFx } from "@pnp/sp/behaviors/spfx";
import "@pnp/sp/items";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import NewsDetails from "./components/NewsDetailsPage";
var NewsDetailsWebPart = /** @class */ (function (_super) {
    __extends(NewsDetailsWebPart, _super);
    function NewsDetailsWebPart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NewsDetailsWebPart.prototype.onInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Safe defaults (still fine even though pane is blank)
                if (!Array.isArray(this.properties.department))
                    this.properties.department = [];
                if (typeof this.properties.useAutoPublishedOn !== "boolean")
                    this.properties.useAutoPublishedOn = true;
                if (this.properties.author && !Array.isArray(this.properties.author))
                    this.properties.author = [];
                return [2 /*return*/, _super.prototype.onInit.call(this)];
            });
        });
    };
    NewsDetailsWebPart.prototype.onAfterDeserialize = function (deserialized) {
        if (!Array.isArray(deserialized === null || deserialized === void 0 ? void 0 : deserialized.department))
            deserialized.department = [];
        if (typeof deserialized.useAutoPublishedOn !== "boolean")
            deserialized.useAutoPublishedOn = true;
        if (deserialized.author && !Array.isArray(deserialized.author))
            deserialized.author = [];
        return deserialized;
    };
    NewsDetailsWebPart.prototype.render = function () {
        var _a, _b;
        // With a blank property pane, these will usually be undefined/empty,
        // and your component already falls back to Site Pages values 👍
        var depArray = Array.isArray(this.properties.department) ? this.properties.department : [];
        var departmentLabel = depArray.length > 0 ? (depArray[0].name || depArray[0].key || "") : "";
        var publishedDate = typeof this.properties.publishedOn === "object" &&
            ((_a = this.properties.publishedOn) === null || _a === void 0 ? void 0 : _a.value) instanceof Date
            ? this.properties.publishedOn.value.toISOString()
            : this.properties.publishedOn
                ? String(this.properties.publishedOn)
                : "";
        var picked = (_b = this.properties.author) === null || _b === void 0 ? void 0 : _b[0];
        var authorNameOverride = (picked === null || picked === void 0 ? void 0 : picked.fullName) || "";
        var authorEmailOverride = (picked === null || picked === void 0 ? void 0 : picked.email) || (picked === null || picked === void 0 ? void 0 : picked.login) || "";
        var element = React.createElement(NewsDetails, {
            context: this.context,
            title: this.properties.title,
            category: this.properties.category,
            department: departmentLabel,
            hashtags: this.properties.hashtags,
            readTime: this.properties.readTime,
            publishedOn: publishedDate,
            useAutoPublishedOn: this.properties.useAutoPublishedOn,
            authorNameOverride: authorNameOverride,
            authorEmailOverride: authorEmailOverride
        });
        ReactDom.render(element, this.domElement);
    };
    // ───────────────────────────────────────────────────────────────
    // EDIT PROPERTIES (DISABLED / BLANK)
    // We intentionally return no pages so the pane shows nothing.
    // The full original pane is kept below, commented out.
    // ───────────────────────────────────────────────────────────────
    NewsDetailsWebPart.prototype.getPropertyPaneConfiguration = function () {
        return { pages: [] };
    };
    return NewsDetailsWebPart;
}(BaseClientSideWebPart));
export default NewsDetailsWebPart;
//# sourceMappingURL=NewsDetailsPageWebPart.js.map