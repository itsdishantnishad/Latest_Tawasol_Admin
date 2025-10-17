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
import * as React from "react";
import { getArticleById, getOotbViews } from "./utils/fetchHelper";
import { HeaderChips } from "./parts/HeaderChips";
import { TitleSection } from "./parts/TitleSection";
import { AuthorRow } from "./parts/AuthorRow";
import { DEPT_HIDDEN_TEXT_INTERNAL } from "./constants";
import { decodeTwice, stripHtml, normalizeSpaces, splitToTags } from "./utils/sanitize";
import { formatDate, formatTime } from "./utils/formatters";
import styles from "../styles/NewsDetails.module.scss";
var NewsDetails = /** @class */ (function (_super) {
    __extends(NewsDetails, _super);
    function NewsDetails(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { loading: true, item: null };
        return _this;
    }
    NewsDetails.prototype.componentDidMount = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, fileUrl, article, searchViews, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        id = (_a = this.props.context.pageContext.listItem) === null || _a === void 0 ? void 0 : _a.id;
                        fileUrl = this.props.context.pageContext.site.serverRequestPath;
                        if (!id) {
                            this.setState({ loading: false, item: null });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, getArticleById(this.props.context, id)];
                    case 1:
                        article = (_b.sent());
                        return [4 /*yield*/, getOotbViews(this.props.context, id, fileUrl)];
                    case 2:
                        searchViews = _b.sent();
                        article.NAViews = typeof searchViews === "number" ? searchViews : 0;
                        this.setState({ loading: false, item: article });
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _b.sent();
                        console.error("❌ Error loading article:", err_1);
                        this.setState({ loading: false, item: null });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    NewsDetails.prototype.render = function () {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var _j = this.state, loading = _j.loading, item = _j.item;
        if (loading)
            return React.createElement("div", null, "Loading\u2026");
        if (!item)
            return React.createElement("div", null, "\u26A0\uFE0F Article not found or failed to load.");
        // 🔖 Hashtags cleanup (same as before)
        var rawTags = item.NAHashtags || "";
        var decodedTags = decodeTwice(rawTags);
        var plainTags = stripHtml(decodedTags);
        var normalized = normalizeSpaces(plainTags);
        // 🗂 Category normalization
        var category = "";
        var cat = item === null || item === void 0 ? void 0 : item.NACategory;
        if (typeof cat === "string")
            category = cat;
        else if (Array.isArray(cat))
            category = cat.map(function (c) { return (c === null || c === void 0 ? void 0 : c.Label) || c; }).join(", ");
        else if (cat && typeof cat === "object" && "Label" in cat)
            category = cat.Label;
        // 🏢 Department — prefer hidden text internal name (mirror of your ref)
        var department = "";
        var hiddenVal = item[DEPT_HIDDEN_TEXT_INTERNAL];
        if (typeof hiddenVal === "string" && hiddenVal) {
            department = hiddenVal;
        }
        else {
            var d = item === null || item === void 0 ? void 0 : item.NADepartment;
            if (typeof d === "string")
                department = d;
            else if (Array.isArray(d))
                department = ((_a = d[0]) === null || _a === void 0 ? void 0 : _a.Label) || d[0] || "";
            else if (d && typeof d === "object" && "Label" in d)
                department = d.Label;
        }
        if (department.includes("|"))
            department = department.split("|")[0];
        // 🧩 Merge property pane overrides for display-only fields
        var title = (((_b = this.props.title) === null || _b === void 0 ? void 0 : _b.trim()) || item.Title || "");
        var categoryFinal = this.props.category || category;
        var departmentFinal = this.props.department || department;
        var hashtagsFinal = splitToTags(this.props.hashtags || normalized);
        // ⏱ read time
        var rawRead = item.NAReadTimeMinutes;
        var readMins = Number.isFinite(Number(rawRead)) && Number(rawRead) > 0
            ? Math.trunc(Number(rawRead))
            : 1;
        console.debug("[ReadTime] item.NAReadTimeMinutes:", rawRead, "→ used:", readMins);
        // 📅 Published: prefer FirstPublishedDate; fallback to Modified → Created
        var fpd = (item === null || item === void 0 ? void 0 : item.FirstPublishedDate) ? new Date(item.FirstPublishedDate) : undefined;
        var modified = (item === null || item === void 0 ? void 0 : item.Modified) ? new Date(item.Modified) : undefined;
        var created = (item === null || item === void 0 ? void 0 : item.Created) ? new Date(item.Created) : undefined;
        var publishedDisplay = "";
        if (this.props.useAutoPublishedOn) {
            var base = fpd || modified || created;
            if (base)
                publishedDisplay = "".concat(formatDate(base), " ").concat(formatTime(base));
        }
        else if (this.props.publishedOn) {
            var manualDate = new Date(this.props.publishedOn);
            var timePart = (fpd || modified || created) ? " ".concat(formatTime(fpd || modified || created)) : "";
            publishedDisplay = "".concat(formatDate(manualDate)).concat(timePart);
        }
        // 🔗 Hashtag navigation (unchanged)
        var navigateToTag = function (tag) {
            var cleanTag = tag.replace("#", "");
            window.location.href = "/sites/".concat(_this.props.context.pageContext.web.title, "/SitePages/AllNews.aspx?tag=").concat(cleanTag);
        };
        // 👤 Author display
        var authorName = this.props.authorNameOverride ||
            ((_d = (_c = item.NAAuthor) === null || _c === void 0 ? void 0 : _c.Title) !== null && _d !== void 0 ? _d : (_e = item.Author) === null || _e === void 0 ? void 0 : _e.Title) ||
            "";
        var authorEmail = this.props.authorEmailOverride ||
            ((_g = (_f = item.NAAuthor) === null || _f === void 0 ? void 0 : _f.EMail) !== null && _g !== void 0 ? _g : (_h = item.Author) === null || _h === void 0 ? void 0 : _h.EMail) ||
            "";
        return (React.createElement("div", { className: styles.newsDetails },
            React.createElement(HeaderChips, { category: categoryFinal, department: departmentFinal, hashtags: hashtagsFinal, onTagClick: navigateToTag }),
            React.createElement(TitleSection, { title: title }),
            React.createElement(AuthorRow, { authorName: authorName, authorEmail: authorEmail, readTime: readMins, views: item.NAViews || 0, publishedOn: publishedDisplay })));
    };
    return NewsDetails;
}(React.Component));
export default NewsDetails;
//# sourceMappingURL=NewsDetailsPage.js.map