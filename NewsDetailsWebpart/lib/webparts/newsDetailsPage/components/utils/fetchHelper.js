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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// src/webparts/newsDetailsPage/utils/fetchHelper.ts
import { spfi } from "@pnp/sp";
import { SPFx } from "@pnp/sp/presets/all";
import { DEPT_HIDDEN_TEXT_INTERNAL } from "../constants";
import "@pnp/sp/webs";
import "@pnp/sp/items";
import "@pnp/sp/lists";
/** Fetch article by ID (from Site Pages) — NOTE: NAViews REMOVED from select */
export function getArticleById(context, id) {
    return __awaiter(this, void 0, void 0, function () {
        var sp, list, base, withFPD, item, _a, item;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    sp = spfi().using(SPFx(context));
                    list = sp.web.lists.getByTitle("Site Pages");
                    base = [
                        "Id", "Title", "Created", "Modified",
                        "NACategory", "NAHashtags",
                        "NAReadTimeMinutes",
                        "Author/Title", "Author/EMail", "NAAuthor/Title", "NAAuthor/EMail",
                        "NADepartment",
                        "ContentTypeId", "ContentType/Name",
                        DEPT_HIDDEN_TEXT_INTERNAL
                    ];
                    withFPD = __spreadArray(__spreadArray([], base, true), ["FirstPublishedDate"], false);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 5]);
                    return [4 /*yield*/, list.items.getById(id)
                            .select(withFPD.join(","))
                            .expand("Author,NAAuthor,ContentType")()];
                case 2:
                    item = _b.sent();
                    return [2 /*return*/, item];
                case 3:
                    _a = _b.sent();
                    return [4 /*yield*/, list.items.getById(id)
                            .select(base.join(","))
                            .expand("Author,NAAuthor,ContentType")()];
                case 4:
                    item = _b.sent();
                    return [2 /*return*/, item];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get views via the Search API using the page absolute URL (Path).
 * Picks ViewsLifeTime → ViewsRecent → Popularity. Returns a number or undefined.
 */
export function getOotbViews(context, _id, fileUrl) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function () {
        var siteUrl, absoluteUrl, select, qtext, url, res, json, rows, cells, map_1, life, recent, pop, picked, views, e_1;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    siteUrl = context.pageContext.web.absoluteUrl;
                    absoluteUrl = fileUrl.startsWith("http")
                        ? fileUrl
                        : new URL(fileUrl, siteUrl).toString();
                    select = encodeURIComponent("ViewsLifeTime,ViewsRecent,Popularity,Path,Title");
                    qtext = encodeURIComponent("path:\"".concat(absoluteUrl.replace(/"/g, '\\"'), "\""));
                    url = "".concat(siteUrl, "/_api/search/query?querytext='").concat(qtext, "'&selectproperties='").concat(select, "'&rowlimit=1");
                    console.log("[Details][Views:Search] GET:", url);
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(url, { headers: { accept: "application/json;odata=nometadata" } })];
                case 2:
                    res = _f.sent();
                    if (!res.ok) {
                        console.warn("[Details][Views:Search] HTTP", res.status, res.statusText, "for", absoluteUrl);
                        return [2 /*return*/, undefined];
                    }
                    return [4 /*yield*/, res.json()];
                case 3:
                    json = _f.sent();
                    rows = ((_c = (_b = (_a = json === null || json === void 0 ? void 0 : json.PrimaryQueryResult) === null || _a === void 0 ? void 0 : _a.RelevantResults) === null || _b === void 0 ? void 0 : _b.Table) === null || _c === void 0 ? void 0 : _c.Rows) || [];
                    if (!rows.length) {
                        console.log("[Details][Views:Search] No result for", absoluteUrl);
                        return [2 /*return*/, undefined];
                    }
                    cells = rows[0].Cells || [];
                    map_1 = {};
                    cells.forEach(function (c) { return (map_1[c.Key] = c.Value); });
                    life = map_1["ViewsLifeTime"];
                    recent = map_1["ViewsRecent"];
                    pop = map_1["Popularity"];
                    picked = (_e = (_d = (life != null ? Number(life) : undefined)) !== null && _d !== void 0 ? _d : (recent != null ? Number(recent) : undefined)) !== null && _e !== void 0 ? _e : (pop != null ? Number(pop) : undefined);
                    views = Number.isFinite(picked) ? Math.round(Number(picked)) : undefined;
                    console.log("[Details][Views:Search] for", absoluteUrl, { life: life, recent: recent, pop: pop, chosen: views });
                    return [2 /*return*/, views];
                case 4:
                    e_1 = _f.sent();
                    console.warn("[Details][Views:Search] Failed:", e_1);
                    return [2 /*return*/, undefined];
                case 5: return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=fetchHelper.js.map