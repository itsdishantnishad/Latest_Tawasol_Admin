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
import { useEffect, useMemo, useState } from "react";
import { SPHttpClient } from "@microsoft/sp-http";
import styles from "../styles/OurPortfolio.module.scss";
/** Normalize Image/Hyperlink column to src URL */
var imgSrc = function (img) {
    if (!img)
        return null;
    if (typeof img === "string")
        return img;
    return img.Url || img.serverRelativeUrl || null;
};
var OurPortfolio = function (props) {
    var listTitle = props.listTitle || "AboutDHREOurPortfolio";
    var brandField = props.brandField || "ABoutDHRECategory"; // Choice column internal name
    var _a = useState([]), items = _a[0], setItems = _a[1];
    var _b = useState(true), loading = _b[0], setLoading = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    /** fetch once */
    useEffect(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var url, res, json, data, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, 4, 5]);
                        setLoading(true);
                        url = "".concat(props.siteUrl, "/_api/web/lists/getbytitle('").concat(encodeURIComponent(listTitle), "')/items") +
                            "?$select=Id,Title,SortOrder,IconUrl,SubCols,".concat(brandField);
                        return [4 /*yield*/, props.spfxContext.spHttpClient.get(url, SPHttpClient.configurations.v1)];
                    case 1:
                        res = _a.sent();
                        if (!res.ok)
                            throw new Error("HTTP ".concat(res.status));
                        return [4 /*yield*/, res.json()];
                    case 2:
                        json = _a.sent();
                        data = ((json === null || json === void 0 ? void 0 : json.value) || []).map(function (r) {
                            var _a, _b;
                            return ({
                                Id: r.Id,
                                Title: r.Title,
                                SortOrder: (_b = (_a = r.SortOrder) !== null && _a !== void 0 ? _a : r.Sortorder) !== null && _b !== void 0 ? _b : r.sortOrder,
                                IconUrl: r.IconUrl,
                                SubCols: (typeof r.SubCols === "number" ? r.SubCols : undefined),
                                BrandChoice: (typeof r[brandField] === "string" ? r[brandField] : null)
                            });
                        });
                        setItems(data);
                        return [3 /*break*/, 5];
                    case 3:
                        e_1 = _a.sent();
                        setError((e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || "Failed to load items");
                        return [3 /*break*/, 5];
                    case 4:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); })();
    }, [props.siteUrl, props.spfxContext, listTitle, brandField]);
    /** main brands = rows with NO BrandChoice */
    var mainBrands = useMemo(function () {
        var base = items.filter(function (i) { return !i.BrandChoice; });
        return base
            .sort(function (a, b) { var _a, _b; return ((_a = a.SortOrder) !== null && _a !== void 0 ? _a : 99999) - ((_b = b.SortOrder) !== null && _b !== void 0 ? _b : 99999) || a.Title.localeCompare(b.Title); })
            .slice(0, 4);
    }, [items]);
    /** group sub-brands by BrandChoice */
    var subByBrand = useMemo(function () {
        var map = new Map();
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var it = items_1[_i];
            if (it.BrandChoice) {
                var key = it.BrandChoice.trim();
                var arr = map.get(key) || [];
                arr.push(it);
                map.set(key, arr);
            }
        }
        map.forEach(function (arr, key) {
            arr.sort(function (a, b) {
                return a.Title.localeCompare(b.Title) || a.Id - b.Id;
            });
            map.set(key, arr);
        });
        return map;
    }, [items]);
    if (loading)
        return React.createElement("section", { className: styles.wrapper }, "Loading\u2026");
    if (error)
        return React.createElement("section", { className: styles.wrapper },
            "Error: ",
            error);
    if (!mainBrands.length)
        return React.createElement("section", { className: styles.wrapper }, "No brands configured.");
    return (React.createElement("section", { className: styles.wrapper, "aria-labelledby": "portfolioHeading" },
        React.createElement("h2", { id: "portfolioHeading", className: styles.heading },
            React.createElement("span", { className: styles.our }, "Our"),
            " ",
            React.createElement("span", { className: styles.portfolio }, "Portfolio")),
        React.createElement("div", { className: styles.brandsColumns }, mainBrands.map(function (brand) {
            var brandName = brand.Title.trim();
            var logo = imgSrc(brand.IconUrl);
            var cols = brand.SubCols === 3 ? 3 : 2; // Nakheel=3, others=2 by list
            return (React.createElement("div", { className: styles.brandColumn, key: brand.Id },
                React.createElement("div", { className: styles.brandCard, title: brandName }, logo ? (React.createElement("img", { className: styles.brandLogo, src: logo, alt: brandName })) : (React.createElement("span", { className: styles.brandFallback }, brandName))),
                React.createElement("div", { className: cols === 3 ? styles.subGridCols3 : styles.subGridCols2 }, (subByBrand.get(brandName) || []).map(function (sb) {
                    var subName = sb.Title.trim();
                    var sbLogo = imgSrc(sb.IconUrl);
                    return (React.createElement("div", { className: styles.subCell, key: sb.Id, title: subName }, sbLogo ? (React.createElement("img", { className: styles.subLogo, src: sbLogo, alt: subName })) : (React.createElement("span", { className: styles.subFallback }, subName))));
                }))));
        }))));
};
export default OurPortfolio;
//# sourceMappingURL=OurPortfolio.js.map