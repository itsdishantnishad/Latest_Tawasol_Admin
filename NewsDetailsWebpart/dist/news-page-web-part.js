(()=>{ var __RUSHSTACK_CURRENT_SCRIPT__ = document.currentScript; define(["react","react-dom","@microsoft/sp-core-library","@microsoft/sp-webpart-base","@microsoft/sp-http"], (__WEBPACK_EXTERNAL_MODULE__5959__, __WEBPACK_EXTERNAL_MODULE__8398__, __WEBPACK_EXTERNAL_MODULE__9676__, __WEBPACK_EXTERNAL_MODULE__6642__, __WEBPACK_EXTERNAL_MODULE__1909__) => { return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 1573:
/*!**********************************************************!*\
  !*** ./lib/webparts/newsPage/styles/NewsPage.module.css ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_microsoft_sp_css_loader_node_modules_microsoft_load_themed_styles_lib_es6_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../node_modules/@microsoft/sp-css-loader/node_modules/@microsoft/load-themed-styles/lib-es6/index.js */ 6323);
// Imports


_node_modules_microsoft_sp_css_loader_node_modules_microsoft_load_themed_styles_lib_es6_index_js__WEBPACK_IMPORTED_MODULE_0__.loadStyles(".wrapper_bd7a99ed{background:#fff7f0;color:#2b2b2b;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica Neue,Arial;padding:24px 50px;width:100%}.controls_bd7a99ed{align-items:center;display:grid;gap:14px;grid-template-columns:304px 169px 169px 1fr 104px;margin:0 0 24px;width:100%}.segmented_bd7a99ed{background:#fff;border:1px solid #fbbf7f;border-radius:360px;display:grid;gap:4px;grid-template-columns:1fr 1fr;height:39px;padding:4px}.segBtn_bd7a99ed{background:0 0;border:0;border-radius:360px;color:#2b2b2b;cursor:pointer;font-weight:600}.segBtn_bd7a99ed:hover{background:rgba(0,0,0,.04)}.active_bd7a99ed{background:linear-gradient(180deg,#ffdbb4,#dda160);box-shadow:0 2px 8px rgba(243,164,84,.35);color:#222}.dept_bd7a99ed{align-items:center;border:1px solid rgba(0,0,0,.14);border-radius:30px;box-shadow:0 1px 2px rgba(0,0,0,.04);display:flex;height:35px;padding:6px 16px 6px 22px;position:relative}.deptTransparent_bd7a99ed,.dept_bd7a99ed{background:#fff}.dept_bd7a99ed select{appearance:none;background:0 0;border:0;color:#333;font-weight:600;outline:0;width:100%}.chev_bd7a99ed{color:#777;pointer-events:none;position:absolute;right:12px;top:50%;transform:translateY(-50%)}.search_bd7a99ed{align-items:center;background:#fff;border:1px solid #ddd;border-radius:999px;display:flex;gap:8px;min-height:45px;padding:0 12px;width:90%}.icon_bd7a99ed{flex-shrink:0;height:18px;opacity:.6;width:18px}input{background:0 0;border:none;color:#222;flex:1;font-size:14px;outline:0}input:-ms-input-placeholder{color:#9aa0a6}input::placeholder{color:#9aa0a6}.viewToggle_bd7a99ed{background:#fff;border:1px solid rgba(0,0,0,.14);border-radius:58px;display:grid;gap:4px;grid-template-columns:1fr 1fr;height:42px;padding:5px}.viewBtn_bd7a99ed{background:0 0;border:0;border-radius:48px;cursor:pointer;display:grid;place-items:center}.viewBtn_bd7a99ed:hover{background:rgba(0,0,0,.05)}.viewActive_bd7a99ed{background:linear-gradient(180deg,#ffdbb4,#dda160)}.gridDots_bd7a99ed{height:18px;position:relative;width:18px}.gridDots_bd7a99ed:before{background:#222;border-radius:2px;box-shadow:12px 0 0 #222,0 12px 0 #222,12px 12px 0 #222;content:\"\";height:6px;left:0;position:absolute;top:0;width:6px}.gridDots_bd7a99ed:after{content:none}.listLines_bd7a99ed{height:20px;position:relative;width:22px}.listLines_bd7a99ed:before{background:#222;border-radius:3px;box-shadow:0 15px 0 #222;content:\"\";height:3px;left:0;position:absolute;right:0;top:0}.listLines_bd7a99ed:after{content:none}.gridWrap_bd7a99ed{margin:0;width:100%}.gridRow_bd7a99ed{display:grid;gap:14px;height:362px;margin-bottom:14px;width:100%}.row-left_bd7a99ed{grid-template-columns:2fr 1fr 1fr}.row-center_bd7a99ed{grid-template-columns:1fr 2fr 1fr}.row-right_bd7a99ed{grid-template-columns:1fr 1fr 2fr}.TIRCategoryIconGrid_bd7a99ed{background:hsla(0,0%,100%,.95);border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.15);display:grid;font-size:14px;height:33px;left:12px;place-items:center;position:absolute;top:10px;width:33px;z-index:3}.TIRPinnedChip_bd7a99ed{background:hsla(0,0%,100%,.95);border:1px solid rgba(0,0,0,.06);border-radius:18px;color:#222;font-size:12px;font-weight:600;padding:6px 12px;position:absolute;right:12px;top:12px;z-index:3}.big_bd7a99ed{background:#ececec;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,.06);color:#fff;display:flex;flex-direction:column;height:320px;justify-content:flex-end;overflow:hidden;padding:16px;position:relative;text-decoration:none;width:540px}.big_bd7a99ed:after{background:linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.55) 85%);border-radius:16px;content:\"\";inset:0;pointer-events:none;position:absolute}.big_bd7a99ed>:not(.TIRCategoryIconGrid_bd7a99ed):not(.TIRPinnedChip_bd7a99ed){position:relative;z-index:1}.badge_bd7a99ed{backdrop-filter:blur(2px);background:0 0;border-radius:14px;color:#fff;font-size:12px;font-weight:700;padding:6px 12px}.bigTitle_bd7a99ed{font-size:22px;font-weight:700;line-height:1.25;margin:8px 0 6px}.TIRBigMetaRow_bd7a99ed{align-items:center;display:flex;gap:12px;justify-content:space-between}.TIRDeptInline_bd7a99ed{border-radius:12px;color:#fff;font-size:12px;font-weight:700;padding:4px 10px}.TIRMetaInlineRight_bd7a99ed{align-items:center;color:#f3f3f3;display:inline-flex;font-size:12px;gap:14px;opacity:.95;text-shadow:0 1px 2px rgba(0,0,0,.35);white-space:nowrap}.small_bd7a99ed{background:#efefef;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.05);color:#fff;display:flex;flex-direction:column;height:320px;justify-content:flex-end;overflow:hidden;padding:14px;position:relative;text-decoration:none;width:280px}.small_bd7a99ed:after{background:linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.55) 85%);border-radius:12px;content:\"\";inset:0;position:absolute}.small_bd7a99ed>:not(.TIRCategoryIconGrid_bd7a99ed):not(.TIRPinnedChip_bd7a99ed){position:relative;z-index:1}.smallTitle_bd7a99ed{font-size:16px;font-weight:700;line-height:1.3;margin:6px 0}.meta_bd7a99ed{align-items:center;color:#f3f3f3;display:flex;font-size:12px;gap:13px;opacity:.95;text-shadow:0 1px 2px rgba(0,0,0,.35)}.listWrap_bd7a99ed{list-style:none;margin:0;padding:0;width:100%}.listItem_bd7a99ed{align-items:center;background:#fff;border:1px solid rgba(0,0,0,.14);border-radius:12px;display:grid;gap:16px;grid-template-columns:88px 1fr;margin-bottom:12px;padding:12px 16px}.listMedia_bd7a99ed{background:#eee;border-radius:8px;height:64px;overflow:hidden;position:relative;width:88px}.listCatIcon_bd7a99ed{background:hsla(0,0%,100%,.95);border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.15);display:grid;font-size:12px;height:24px;left:6px;place-items:center;position:absolute;top:6px;width:24px}.listBody_bd7a99ed{display:grid;gap:6px}.topRow_bd7a99ed{align-items:center;display:flex;flex-wrap:wrap;gap:12px}.listDept_bd7a99ed{background:0 0;border:0;border-radius:0;color:#6c6c6c;font-size:12px;font-weight:700;padding:0}.hashes_bd7a99ed{display:flex;flex-wrap:wrap;gap:10px}.hash_bd7a99ed{background:0 0;border:0;border-radius:0;color:#d3675b;font-size:12px;font-weight:700;padding:0}.titleRow_bd7a99ed{align-items:center;display:grid;gap:12px;grid-template-columns:1fr auto;min-height:28px}.listTitle_bd7a99ed{color:#1e1e1e;font-weight:700;overflow:hidden;text-decoration:none;text-overflow:ellipsis;white-space:nowrap}.listTitle_bd7a99ed:hover{text-decoration:underline}.metaInline_bd7a99ed{align-items:center;color:#777;display:inline-flex;font-size:12px;gap:10px;white-space:nowrap}.authorRow_bd7a99ed{align-items:center;display:inline-flex;gap:8px;justify-content:flex-end}.authorRow_bd7a99ed img,.authorStub_bd7a99ed{background:#e9e9e9;border-radius:50%;height:20px;width:20px}.authorName_bd7a99ed{color:#444;font-size:12px;font-weight:600}.empty_bd7a99ed{color:#777;margin:24px 0;width:100%}@media (max-width:1100px){.controls_bd7a99ed{grid-auto-rows:min-content;grid-template-columns:1fr 1fr}.controls_bd7a99ed>:nth-child(4){grid-column:1/-1}.controls_bd7a99ed>:last-child{justify-self:end}}@media (max-width:900px){.controls_bd7a99ed{gap:12px;grid-template-columns:1fr}.gridRow_bd7a99ed{grid-template-columns:1fr;height:auto}.big_bd7a99ed,.small_bd7a99ed{height:300px}}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vRTovVlMlMjBDT0RFJTIwMjAyNS90YXdhc29sL05ld3NEZXRhaWxzV2VicGFydC9zcmMvd2VicGFydHMvbmV3c1BhZ2Uvc3R5bGVzL05ld3NQYWdlLm1vZHVsZS5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWVBLGtCQUNFLGtCQUFBLENBS0EsYUFBQSxDQURBLHNGQUFBLENBREEsaUJBQUEsQ0FEQSxVQUdBLENBSUYsbUJBSUUsa0JBQUEsQ0FIQSxZQUFBLENBSUEsUUFBQSxDQUZBLGlEQUFBLENBSUEsZUFBQSxDQURBLFVBQ0EsQ0FJRixvQkFLRSxlQUFBLENBREEsd0JBQUEsQ0FEQSxtQkFBQSxDQUdBLFlBQUEsQ0FHQSxPQUFBLENBRkEsNkJBQUEsQ0FOQSxXQUFBLENBT0EsV0FDQSxDQUVGLGlCQUVFLGNBQUEsQ0FEQSxRQUFBLENBRUEsbUJBQUEsQ0FFQSxhQUFBLENBQ0EsY0FBQSxDQUZBLGVBRUEsQ0FFRix1QkFBZ0IsMEJBQUEsQ0FDaEIsaUJBQ0Usa0RBQUEsQ0FFQSx5Q0FBQSxDQURBLFVBQ0EsQ0FJRixlQU9FLGtCQUFBLENBSkEsZ0NBQUEsQ0FDQSxrQkFBQSxDQUtBLG9DQUFBLENBSEEsWUFBQSxDQUpBLFdBQUEsQ0FNQSx5QkFBQSxDQVBBLGlCQVFBLENBRUYseUNBTkUsZUFNaUIsQ0FFbkIsc0JBQ0UsZUFBQSxDQUVBLGNBQUEsQ0FEQSxRQUFBLENBSUEsVUFBQSxDQURBLGVBQUEsQ0FFQSxTQUFBLENBSEEsVUFHQSxDQUVGLGVBR3dCLFVBQUEsQ0FBdEIsbUJBQUEsQ0FGQSxpQkFBQSxDQUNBLFVBQUEsQ0FBYSxPQUFBLENBQVUsMEJBQ0QsQ0FJeEIsaUJBT0Usa0JBQUEsQ0FGQSxlQUFBLENBRkEscUJBQUEsQ0FDQSxtQkFBQSxDQUVBLFlBQUEsQ0FHQSxPQUFBLENBUEEsZUFBQSxDQU1BLGNBQUEsQ0FQQSxTQVFBLENBR0YsZUFJRSxhQUFBLENBRkEsV0FBQSxDQUNBLFVBQUEsQ0FGQSxVQUdBLENBR0Ys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 */", true);

// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  wrapper_bd7a99ed: "wrapper_bd7a99ed",
  controls_bd7a99ed: "controls_bd7a99ed",
  segmented_bd7a99ed: "segmented_bd7a99ed",
  segBtn_bd7a99ed: "segBtn_bd7a99ed",
  active_bd7a99ed: "active_bd7a99ed",
  dept_bd7a99ed: "dept_bd7a99ed",
  deptTransparent_bd7a99ed: "deptTransparent_bd7a99ed",
  chev_bd7a99ed: "chev_bd7a99ed",
  search_bd7a99ed: "search_bd7a99ed",
  icon_bd7a99ed: "icon_bd7a99ed",
  viewToggle_bd7a99ed: "viewToggle_bd7a99ed",
  viewBtn_bd7a99ed: "viewBtn_bd7a99ed",
  viewActive_bd7a99ed: "viewActive_bd7a99ed",
  gridDots_bd7a99ed: "gridDots_bd7a99ed",
  listLines_bd7a99ed: "listLines_bd7a99ed",
  gridWrap_bd7a99ed: "gridWrap_bd7a99ed",
  gridRow_bd7a99ed: "gridRow_bd7a99ed",
  "row-left_bd7a99ed": "row-left_bd7a99ed",
  "row-center_bd7a99ed": "row-center_bd7a99ed",
  "row-right_bd7a99ed": "row-right_bd7a99ed",
  TIRCategoryIconGrid_bd7a99ed: "TIRCategoryIconGrid_bd7a99ed",
  TIRPinnedChip_bd7a99ed: "TIRPinnedChip_bd7a99ed",
  big_bd7a99ed: "big_bd7a99ed",
  badge_bd7a99ed: "badge_bd7a99ed",
  bigTitle_bd7a99ed: "bigTitle_bd7a99ed",
  TIRBigMetaRow_bd7a99ed: "TIRBigMetaRow_bd7a99ed",
  TIRDeptInline_bd7a99ed: "TIRDeptInline_bd7a99ed",
  TIRMetaInlineRight_bd7a99ed: "TIRMetaInlineRight_bd7a99ed",
  small_bd7a99ed: "small_bd7a99ed",
  smallTitle_bd7a99ed: "smallTitle_bd7a99ed",
  meta_bd7a99ed: "meta_bd7a99ed",
  listWrap_bd7a99ed: "listWrap_bd7a99ed",
  listItem_bd7a99ed: "listItem_bd7a99ed",
  listMedia_bd7a99ed: "listMedia_bd7a99ed",
  listCatIcon_bd7a99ed: "listCatIcon_bd7a99ed",
  listBody_bd7a99ed: "listBody_bd7a99ed",
  topRow_bd7a99ed: "topRow_bd7a99ed",
  listDept_bd7a99ed: "listDept_bd7a99ed",
  hashes_bd7a99ed: "hashes_bd7a99ed",
  hash_bd7a99ed: "hash_bd7a99ed",
  titleRow_bd7a99ed: "titleRow_bd7a99ed",
  listTitle_bd7a99ed: "listTitle_bd7a99ed",
  metaInline_bd7a99ed: "metaInline_bd7a99ed",
  authorRow_bd7a99ed: "authorRow_bd7a99ed",
  authorStub_bd7a99ed: "authorStub_bd7a99ed",
  authorName_bd7a99ed: "authorName_bd7a99ed",
  empty_bd7a99ed: "empty_bd7a99ed"
});


/***/ }),

/***/ 7711:
/*!******************************************************!*\
  !*** ./lib/webparts/newsPage/components/NewsPage.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 5959);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _microsoft_sp_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @microsoft/sp-http */ 1909);
/* harmony import */ var _microsoft_sp_http__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_microsoft_sp_http__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _assets_news_search_normal_svg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../assets/news_search_normal.svg */ 6613);
/* harmony import */ var _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles/NewsPage.module.scss */ 7817);
var __extends = (undefined && undefined.__extends) || (function () {
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
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
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
// src/webparts/newsPage/components/NewsPage.tsx




/* ───────────────── constants ───────────────── */
var CT_NAME = "	TIR News Story";
var DEPT_LABEL_FIELD_INTERNAL = "b6547384e0b841d5a2bf78325d80b47d";
var DEPARTMENTS = [
    { key: "All", label: "Department : All" },
    { key: "Human Capital", label: "Human Capital" },
    // add more departments here if you need
];
/* ───────────────── pure helpers ───────────────── */
var getDeptName = function (it) {
    var _a, _b;
    var raw = (_a = it[DEPT_LABEL_FIELD_INTERNAL]) !== null && _a !== void 0 ? _a : (_b = it.FieldValuesAsText) === null || _b === void 0 ? void 0 : _b.NADepartment;
    if (!raw)
        return undefined;
    var first = (raw.split(/;#|;/)[0] || raw).trim();
    return first.includes("|") ? first.split("|")[0].trim() : first;
};
var pickDateIso = function (it) {
    var c = new Date(it.Created).getTime();
    var m = new Date(it.Modified).getTime();
    return Math.abs(m - c) < 1000 ? it.Created : it.Modified;
};
var fmt = function (iso) { return (iso ? new Date(iso).toLocaleString() : ""); };
var getAuthor = function (v) {
    return Array.isArray(v) ? v[0] : v;
};
var authorPhotoUrl = function (siteUrl, p) {
    if (!p)
        return undefined;
    var acct = p.EMail || p.Name;
    return acct
        ? "".concat(siteUrl, "/_layouts/15/userphoto.aspx?size=S&accountname=").concat(encodeURIComponent(acct))
        : undefined;
};
var formatReadTime = function (mins) {
    if (typeof mins !== "number" || mins <= 0)
        return undefined;
    if (mins >= 60) {
        var h = Math.floor(mins / 60);
        var m = mins % 60;
        return "".concat(h).concat(h === 1 ? "hr" : "hrs", " ").concat(String(m).padStart(2, "0"), "mins");
    }
    return "".concat(mins, " min read");
};
var stripHtml = function (s) { return s.replace(/<[^>]*>/g, ""); };
var decodeHtml = function (s) {
    return s
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
};
var splitToTags = function (raw) {
    if (!raw)
        return [];
    var cleaned = stripHtml(decodeHtml(String(raw)));
    var parts = cleaned
        .split(/[\s,;#]+/g)
        .map(function (t) { return t.trim(); })
        .filter(function (t) { return t.length > 0; });
    var ok = parts
        .map(function (t) { return t.replace(/^#/, ""); })
        .filter(function (t) { return /^[\p{L}\p{N}_-]+$/u.test(t); });
    var seen = new Set();
    var out = [];
    for (var _i = 0, ok_1 = ok; _i < ok_1.length; _i++) {
        var t = ok_1[_i];
        var key = t.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            out.push(t);
        }
    }
    return out;
};
var isAnnouncement = function (it) {
    return (it.NACategory || "").toLowerCase().includes("announce");
};
var catIcon = function (cat) {
    var c = (cat || "").toLowerCase();
    if (c.includes("announce"))
        return "🛎️";
    if (c.includes("around"))
        return "🌍";
    if (c.includes("dhre"))
        return "📰";
    return "✳️";
};
var getJson = function (res) { return __awaiter(void 0, void 0, void 0, function () {
    var body;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!res.ok) return [3 /*break*/, 2];
                return [4 /*yield*/, res.text().catch(function () { return ""; })];
            case 1:
                body = _a.sent();
                throw new Error("HTTP ".concat(res.status, " ").concat(res.statusText, " - ").concat(body));
            case 2: return [2 /*return*/, res.json()];
        }
    });
}); };
var fetchViewsForPathsViaSearch = function (spfx, siteUrl, absoluteUrls) { return __awaiter(void 0, void 0, void 0, function () {
    var chunkSize, map, select, i, chunk, q, url, res, json, rows;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (absoluteUrls.length === 0)
                    return [2 /*return*/, {}];
                chunkSize = 20;
                map = {};
                select = encodeURIComponent("ViewsLifeTime,ViewsRecent,Popularity,Path,Title");
                i = 0;
                _d.label = 1;
            case 1:
                if (!(i < absoluteUrls.length)) return [3 /*break*/, 5];
                chunk = absoluteUrls.slice(i, i + chunkSize);
                q = chunk.map(function (u) { return "path:\"".concat(u.replace(/"/g, '\\"'), "\""); }).join(" OR ");
                url = "".concat(siteUrl, "/_api/search/query?querytext='").concat(encodeURIComponent("(" + q + ")"), "'") +
                    "&selectproperties='".concat(select, "'&rowlimit=").concat(chunk.length);
                return [4 /*yield*/, spfx.spHttpClient.get(url, _microsoft_sp_http__WEBPACK_IMPORTED_MODULE_1__.SPHttpClient.configurations.v1)];
            case 2:
                res = _d.sent();
                if (!res.ok)
                    return [3 /*break*/, 4];
                return [4 /*yield*/, res.json()];
            case 3:
                json = _d.sent();
                rows = ((_c = (_b = (_a = json === null || json === void 0 ? void 0 : json.PrimaryQueryResult) === null || _a === void 0 ? void 0 : _a.RelevantResults) === null || _b === void 0 ? void 0 : _b.Table) === null || _c === void 0 ? void 0 : _c.Rows) || [];
                rows.forEach(function (r) {
                    var cells = r.Cells || [];
                    var c = {};
                    cells.forEach(function (kv) { return (c[kv.Key] = kv.Value); });
                    var path = String(c.Path || "").toLowerCase();
                    var life = c.ViewsLifeTime != null ? Number(c.ViewsLifeTime) : undefined;
                    var recent = c.ViewsRecent != null ? Number(c.ViewsRecent) : undefined;
                    var pop = c.Popularity != null ? Number(c.Popularity) : undefined;
                    var chosen = Number.isFinite(life)
                        ? life
                        : Number.isFinite(recent)
                            ? recent
                            : Number.isFinite(pop)
                                ? pop
                                : undefined;
                    if (typeof chosen === "number")
                        map[path] = Math.round(chosen);
                });
                _d.label = 4;
            case 4:
                i += chunkSize;
                return [3 /*break*/, 1];
            case 5: return [2 /*return*/, map];
        }
    });
}); };
var SegmentedTabs = /** @class */ (function (_super) {
    __extends(SegmentedTabs, _super);
    function SegmentedTabs(props) {
        var _this = _super.call(this, props) || this;
        _this.handleClick = _this.handleClick.bind(_this);
        return _this;
    }
    SegmentedTabs.prototype.handleClick = function (k) {
        this.props.onChange(k);
    };
    SegmentedTabs.prototype.render = function () {
        var _this = this;
        var value = this.props.value;
        return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].segmented }, ["All", "Announcements"].map(function (k) { return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", { key: k, onClick: function () { return _this.handleClick(k); }, className: "".concat(_styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].segBtn, " ").concat(value === k ? _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].active : ""), "aria-pressed": value === k }, k === "All" ? "All News" : "Announcements")); })));
    };
    return SegmentedTabs;
}(react__WEBPACK_IMPORTED_MODULE_0__.Component));
var CategorySelect = /** @class */ (function (_super) {
    __extends(CategorySelect, _super);
    function CategorySelect(props) {
        var _this = _super.call(this, props) || this;
        _this.onChange = _this.onChange.bind(_this);
        return _this;
    }
    CategorySelect.prototype.onChange = function (e) {
        this.props.onChange(e.target.value);
    };
    CategorySelect.prototype.render = function () {
        return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].dept },
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("select", { "aria-label": "Filter by category", value: this.props.value, onChange: this.onChange },
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("option", { value: "All" }, "Category : All"),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("option", { value: "Announcements" }, "Announcements"),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("option", { value: "DHRE Stories" }, "DHRE Stories"),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("option", { value: "Around the World" }, "Around the World")),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].chev, "aria-hidden": true }, "\u25BE")));
    };
    return CategorySelect;
}(react__WEBPACK_IMPORTED_MODULE_0__.Component));
var DeptSelect = /** @class */ (function (_super) {
    __extends(DeptSelect, _super);
    function DeptSelect(props) {
        var _this = _super.call(this, props) || this;
        _this.onChange = _this.onChange.bind(_this);
        return _this;
    }
    DeptSelect.prototype.onChange = function (e) {
        this.props.onChange(e.target.value);
    };
    DeptSelect.prototype.render = function () {
        var _a = this.props, value = _a.value, options = _a.options;
        return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: "".concat(_styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].dept, " ").concat(_styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].deptTransparent) },
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("select", { "aria-label": "Filter by department", value: value, onChange: this.onChange }, options.map(function (d) { return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("option", { key: d.key, value: d.key }, d.label)); })),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].chev, "aria-hidden": true }, "\u25BE")));
    };
    return DeptSelect;
}(react__WEBPACK_IMPORTED_MODULE_0__.Component));
var SearchBoxClassic = /** @class */ (function (_super) {
    __extends(SearchBoxClassic, _super);
    function SearchBoxClassic(props) {
        var _this = _super.call(this, props) || this;
        _this.onChange = _this.onChange.bind(_this);
        return _this;
    }
    SearchBoxClassic.prototype.onChange = function (e) {
        var _this = this;
        this.props.onChange(e.target.value);
        requestAnimationFrame(function () { var _a; return (_a = _this.props.inputRef.current) === null || _a === void 0 ? void 0 : _a.focus(); });
    };
    SearchBoxClassic.prototype.render = function () {
        return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].search },
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("img", { src: _assets_news_search_normal_svg__WEBPACK_IMPORTED_MODULE_2__, alt: "Search", className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].icon }),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("input", { ref: this.props.inputRef, placeholder: "Search News", value: this.props.value, onChange: this.onChange, onKeyDown: function (e) { return e.stopPropagation(); } })));
    };
    return SearchBoxClassic;
}(react__WEBPACK_IMPORTED_MODULE_0__.Component));
var ViewToggleClassic = /** @class */ (function (_super) {
    __extends(ViewToggleClassic, _super);
    function ViewToggleClassic(props) {
        var _this = _super.call(this, props) || this;
        _this.setGrid = _this.setGrid.bind(_this);
        _this.setList = _this.setList.bind(_this);
        return _this;
    }
    ViewToggleClassic.prototype.setGrid = function () { this.props.onChange("grid"); };
    ViewToggleClassic.prototype.setList = function () { this.props.onChange("list"); };
    ViewToggleClassic.prototype.render = function () {
        var value = this.props.value;
        return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].viewToggle, role: "group", "aria-label": "View" },
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", { className: "".concat(_styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].viewBtn, " ").concat(value === "grid" ? _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].viewActive : ""), onMouseDown: function (e) { return e.preventDefault(); }, onClick: this.setGrid, "aria-pressed": value === "grid", title: "Grid view" },
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].gridDots })),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", { className: "".concat(_styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].viewBtn, " ").concat(value === "list" ? _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].viewActive : ""), onMouseDown: function (e) { return e.preventDefault(); }, onClick: this.setList, "aria-pressed": value === "list", title: "List view" },
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].listLines }))));
    };
    return ViewToggleClassic;
}(react__WEBPACK_IMPORTED_MODULE_0__.Component));
var MetaRowGridRight = /** @class */ (function (_super) {
    __extends(MetaRowGridRight, _super);
    function MetaRowGridRight() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MetaRowGridRight.prototype.render = function () {
        var it = this.props.it;
        var readText = formatReadTime(it.NAReadTimeMinutes);
        return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].TIRMetaInlineRight },
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null, fmt(pickDateIso(it))),
            readText ? react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null,
                "\u2022 ",
                readText) : null,
            typeof it.__views === "number" ? react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null,
                "\u2022 ",
                it.__views,
                " Views") : null));
    };
    return MetaRowGridRight;
}(react__WEBPACK_IMPORTED_MODULE_0__.Component));
var TIRCategoryIconGrid = /** @class */ (function (_super) {
    __extends(TIRCategoryIconGrid, _super);
    function TIRCategoryIconGrid() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TIRCategoryIconGrid.prototype.render = function () {
        return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].TIRCategoryIconGrid, title: this.props.it.NACategory || "Category" }, catIcon(this.props.it.NACategory)));
    };
    return TIRCategoryIconGrid;
}(react__WEBPACK_IMPORTED_MODULE_0__.Component));
var DeptChip = /** @class */ (function (_super) {
    __extends(DeptChip, _super);
    function DeptChip() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DeptChip.prototype.render = function () {
        var name = getDeptName(this.props.it);
        if (!name)
            return null;
        return react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].badge }, name);
    };
    return DeptChip;
}(react__WEBPACK_IMPORTED_MODULE_0__.Component));
var TileBig = /** @class */ (function (_super) {
    __extends(TileBig, _super);
    function TileBig() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TileBig.prototype.render = function () {
        var it = this.props.it;
        var deptName = getDeptName(it);
        return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].big, href: it.FileRef },
            react__WEBPACK_IMPORTED_MODULE_0__.createElement(TIRCategoryIconGrid, { it: it }),
            it.NAIsFeatured ? react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].TIRPinnedChip }, "Pinned") : null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].bigTitle }, it.Title),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].TIRBigMetaRow },
                deptName ? react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].TIRDeptInline }, deptName) : react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement(MetaRowGridRight, { it: it }))));
    };
    return TileBig;
}(react__WEBPACK_IMPORTED_MODULE_0__.Component));
var TileSmall = /** @class */ (function (_super) {
    __extends(TileSmall, _super);
    function TileSmall() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TileSmall.prototype.render = function () {
        var it = this.props.it;
        return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].small, href: it.FileRef },
            react__WEBPACK_IMPORTED_MODULE_0__.createElement(TIRCategoryIconGrid, { it: it }),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement(DeptChip, { it: it }),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].smallTitle }, it.Title),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].meta },
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null, fmt(pickDateIso(it))),
                formatReadTime(it.NAReadTimeMinutes) ? (react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null,
                    "\u2022 ",
                    formatReadTime(it.NAReadTimeMinutes))) : null,
                typeof it.__views === "number" ? react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null,
                    "\u2022 ",
                    it.__views,
                    " Views") : null)));
    };
    return TileSmall;
}(react__WEBPACK_IMPORTED_MODULE_0__.Component));
var GridView = /** @class */ (function (_super) {
    __extends(GridView, _super);
    function GridView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GridView.prototype.render = function () {
        var filtered = this.props.items;
        if (filtered.length === 0)
            return react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].empty }, "No results.");
        var rows = [];
        for (var i = 0; i < filtered.length; i += 3)
            rows.push(filtered.slice(i, i + 3));
        var rowClsMap = {
            left: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"]["row-left"],
            center: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"]["row-center"],
            right: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"]["row-right"],
        };
        return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].gridWrap }, rows.map(function (row, idx) {
            var layout = idx % 3 === 0 ? "left" : idx % 3 === 1 ? "center" : "right";
            var cls = "".concat(_styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].gridRow, " ").concat(rowClsMap[layout]);
            var a = row[0], b = row[1], c = row[2];
            var cells;
            if (layout === "left")
                cells = [a && react__WEBPACK_IMPORTED_MODULE_0__.createElement(TileBig, { it: a }), b && react__WEBPACK_IMPORTED_MODULE_0__.createElement(TileSmall, { it: b }), c && react__WEBPACK_IMPORTED_MODULE_0__.createElement(TileSmall, { it: c })];
            else if (layout === "center")
                cells = [a && react__WEBPACK_IMPORTED_MODULE_0__.createElement(TileSmall, { it: a }), b && react__WEBPACK_IMPORTED_MODULE_0__.createElement(TileBig, { it: b }), c && react__WEBPACK_IMPORTED_MODULE_0__.createElement(TileSmall, { it: c })];
            else
                cells = [a && react__WEBPACK_IMPORTED_MODULE_0__.createElement(TileSmall, { it: a }), b && react__WEBPACK_IMPORTED_MODULE_0__.createElement(TileSmall, { it: b }), c && react__WEBPACK_IMPORTED_MODULE_0__.createElement(TileBig, { it: c })];
            return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { key: idx, className: cls }, cells === null || cells === void 0 ? void 0 : cells.map(function (el, i) { return react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, { key: i }, el || react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", null)); })));
        })));
    };
    return GridView;
}(react__WEBPACK_IMPORTED_MODULE_0__.Component));
var ListView = /** @class */ (function (_super) {
    __extends(ListView, _super);
    function ListView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ListView.prototype.render = function () {
        var _a = this.props, items = _a.items, siteUrl = _a.siteUrl;
        return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("ul", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].listWrap }, items.map(function (it) {
            var deptName = getDeptName(it);
            var tags = splitToTags(it.NAHashtags);
            var author = getAuthor(it.NAAuthor);
            var photo = authorPhotoUrl(siteUrl, author);
            var readText = formatReadTime(it.NAReadTimeMinutes);
            var views = it.__views;
            return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", { key: it.Id, className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].listItem },
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].listMedia },
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].listCatIcon }, catIcon(it.NACategory))),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].listBody },
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].topRow },
                        deptName ? react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].listDept }, deptName) : null,
                        tags.length > 0 ? (react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].hashes }, tags.map(function (t) { return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", { key: t, className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].hash },
                            "#",
                            t)); }))) : null),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].titleRow },
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: it.FileRef, className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].listTitle }, it.Title),
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].metaInline },
                            react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null, fmt(pickDateIso(it))),
                            readText ? react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null,
                                "\u2022 ",
                                readText) : null,
                            typeof views === "number" ? react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null,
                                "\u2022 ",
                                views,
                                " Views") : null)),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].authorRow },
                        photo ? react__WEBPACK_IMPORTED_MODULE_0__.createElement("img", { src: photo, alt: "" }) : react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].authorStub }),
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].authorName }, (author === null || author === void 0 ? void 0 : author.Title) || "")))));
        })));
    };
    return ListView;
}(react__WEBPACK_IMPORTED_MODULE_0__.Component));
/* ───────────────── container (smart) component ───────────────── */
var NewsPage = /** @class */ (function (_super) {
    __extends(NewsPage, _super);
    function NewsPage(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            items: [],
            loading: true,
            error: null,
            tab: "All",
            dept: "All",
            category: "All",
            q: "",
            view: "grid",
        };
        _this.searchRef = react__WEBPACK_IMPORTED_MODULE_0__.createRef();
        // bind handlers in ctor (matches your architect’s style)
        _this.handleTabChange = _this.handleTabChange.bind(_this);
        _this.handleCategoryChange = _this.handleCategoryChange.bind(_this);
        _this.handleDeptChange = _this.handleDeptChange.bind(_this);
        _this.handleSearchChange = _this.handleSearchChange.bind(_this);
        _this.handleViewChange = _this.handleViewChange.bind(_this);
        _this.loadItems = _this.loadItems.bind(_this);
        _this.getFilteredItems = _this.getFilteredItems.bind(_this);
        return _this;
    }
    NewsPage.prototype.componentDidMount = function () {
        this.loadItems().catch(function (e) { return console.error(e); });
    };
    NewsPage.prototype.loadItems = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, spfxContext, siteUrl, meta, _c, listId, ctJson, _d, ct, ctId, itemsUrl, itemsJson, _e, rows, absoluteUrls, viewMap_1, withViews, e_1;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _b = this.props, spfxContext = _b.spfxContext, siteUrl = _b.siteUrl;
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 9, 10, 11]);
                        this.setState({ loading: true, error: null });
                        _c = getJson;
                        return [4 /*yield*/, spfxContext.spHttpClient.get("".concat(siteUrl, "/_api/web/lists/getbytitle('Site Pages')?$select=Id"), _microsoft_sp_http__WEBPACK_IMPORTED_MODULE_1__.SPHttpClient.configurations.v1)];
                    case 2: return [4 /*yield*/, _c.apply(void 0, [_f.sent()])];
                    case 3:
                        meta = _f.sent();
                        listId = meta === null || meta === void 0 ? void 0 : meta.Id;
                        if (!listId)
                            throw new Error("Could not resolve Site Pages list Id.");
                        _d = getJson;
                        return [4 /*yield*/, spfxContext.spHttpClient.get("".concat(siteUrl, "/_api/web/lists(guid'").concat(listId, "')/ContentTypes") +
                                "?$select=Name,Id/StringValue&$expand=Id&$filter=Name eq '".concat(CT_NAME.replace(/'/g, "''"), "'"), _microsoft_sp_http__WEBPACK_IMPORTED_MODULE_1__.SPHttpClient.configurations.v1)];
                    case 4: return [4 /*yield*/, _d.apply(void 0, [_f.sent()])];
                    case 5:
                        ctJson = _f.sent();
                        ct = (ctJson.value || [])[0];
                        if (!((_a = ct === null || ct === void 0 ? void 0 : ct.Id) === null || _a === void 0 ? void 0 : _a.StringValue))
                            throw new Error("Content Type '".concat(CT_NAME, "' not found on this Site Pages library."));
                        ctId = ct.Id.StringValue;
                        itemsUrl = "".concat(siteUrl, "/_api/web/lists(guid'").concat(listId, "')/items") +
                            "?$select=Id,Title,FileRef,Created,Modified," +
                            "NACategory,NAHashtags,NAIsFeatured,NAReadTimeMinutes," +
                            "".concat(DEPT_LABEL_FIELD_INTERNAL, ",FieldValuesAsText/NADepartment,") +
                            "NAAuthor/Title,NAAuthor/EMail,NAAuthor/Name" +
                            "&$expand=FieldValuesAsText,NAAuthor" +
                            "&$filter=startswith(ContentTypeId,'".concat(ctId, "')") +
                            "&$orderby=Modified desc" +
                            "&$top=200";
                        _e = getJson;
                        return [4 /*yield*/, spfxContext.spHttpClient.get(itemsUrl, _microsoft_sp_http__WEBPACK_IMPORTED_MODULE_1__.SPHttpClient.configurations.v1)];
                    case 6: return [4 /*yield*/, _e.apply(void 0, [_f.sent()])];
                    case 7:
                        itemsJson = _f.sent();
                        rows = itemsJson.value || [];
                        absoluteUrls = rows.map(function (r) { return new URL(r.FileRef, siteUrl).toString(); });
                        return [4 /*yield*/, fetchViewsForPathsViaSearch(spfxContext, siteUrl, absoluteUrls)];
                    case 8:
                        viewMap_1 = _f.sent();
                        withViews = rows.map(function (r) {
                            var abs = new URL(r.FileRef, siteUrl).toString().toLowerCase();
                            var v = viewMap_1[abs];
                            r.__views = typeof v === "number" ? v : undefined;
                            return r;
                        });
                        this.setState({ items: withViews });
                        return [3 /*break*/, 11];
                    case 9:
                        e_1 = _f.sent();
                        console.error("[NewsPage] Error:", e_1);
                        this.setState({ error: (e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || "Failed to fetch news pages." });
                        return [3 /*break*/, 11];
                    case 10:
                        this.setState({ loading: false });
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /* ───────────────── filters ───────────────── */
    NewsPage.prototype.getFilteredItems = function () {
        var _a = this.state, items = _a.items, tab = _a.tab, dept = _a.dept, category = _a.category, q = _a.q;
        var norm = function (s) { return s.toLowerCase(); };
        var qq = norm(q.trim());
        return items.filter(function (it) {
            if (tab === "Announcements" && !isAnnouncement(it))
                return false;
            if (category !== "All") {
                var cat = (it.NACategory || "").trim();
                if (cat.toLowerCase() !== category.toLowerCase())
                    return false;
            }
            var dn = getDeptName(it) || "";
            if (dept !== "All" && dn.toLowerCase() !== dept.toLowerCase())
                return false;
            if (qq) {
                var t = (it.Title || "").toLowerCase();
                var tags = splitToTags(it.NAHashtags).map(function (x) { return x.toLowerCase(); });
                if (!t.includes(qq) && !tags.some(function (tg) { return tg.includes(qq); }))
                    return false;
            }
            return true;
        });
    };
    /* ───────────────── tiny event handlers ───────────────── */
    NewsPage.prototype.handleTabChange = function (k) {
        this.setState({ tab: k });
    };
    NewsPage.prototype.handleCategoryChange = function (k) {
        this.setState({ category: k });
    };
    NewsPage.prototype.handleDeptChange = function (k) {
        this.setState({ dept: k });
    };
    NewsPage.prototype.handleSearchChange = function (text) {
        this.setState({ q: text });
    };
    NewsPage.prototype.handleViewChange = function (v) {
        this.setState({ view: v });
    };
    /* ───────────────── render ───────────────── */
    NewsPage.prototype.render = function () {
        var _a = this.state, loading = _a.loading, error = _a.error, tab = _a.tab, category = _a.category, dept = _a.dept, q = _a.q, view = _a.view;
        var siteUrl = this.props.siteUrl;
        if (loading)
            return react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", null, "Loading\u2026");
        if (error)
            return react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { style: { color: "crimson" } }, error);
        var filtered = this.getFilteredItems();
        return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].wrapper },
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _styles_NewsPage_module_scss__WEBPACK_IMPORTED_MODULE_3__["default"].controls },
                react__WEBPACK_IMPORTED_MODULE_0__.createElement(SegmentedTabs, { value: tab, onChange: this.handleTabChange }),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement(CategorySelect, { value: category, onChange: this.handleCategoryChange }),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement(DeptSelect, { value: dept, onChange: this.handleDeptChange, options: DEPARTMENTS }),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement(SearchBoxClassic, { value: q, onChange: this.handleSearchChange, inputRef: this.searchRef }),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement(ViewToggleClassic, { value: view, onChange: this.handleViewChange })),
            view === "grid" ? (react__WEBPACK_IMPORTED_MODULE_0__.createElement(GridView, { items: filtered })) : (react__WEBPACK_IMPORTED_MODULE_0__.createElement(ListView, { items: filtered, siteUrl: siteUrl }))));
    };
    return NewsPage;
}(react__WEBPACK_IMPORTED_MODULE_0__.Component));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (NewsPage);


/***/ }),

/***/ 7817:
/*!**************************************************************!*\
  !*** ./lib/webparts/newsPage/styles/NewsPage.module.scss.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
__webpack_require__(/*! ./NewsPage.module.css */ 1573);
var styles = {
    wrapper: 'wrapper_bd7a99ed',
    controls: 'controls_bd7a99ed',
    segmented: 'segmented_bd7a99ed',
    segBtn: 'segBtn_bd7a99ed',
    active: 'active_bd7a99ed',
    dept: 'dept_bd7a99ed',
    deptTransparent: 'deptTransparent_bd7a99ed',
    chev: 'chev_bd7a99ed',
    search: 'search_bd7a99ed',
    icon: 'icon_bd7a99ed',
    viewToggle: 'viewToggle_bd7a99ed',
    viewBtn: 'viewBtn_bd7a99ed',
    viewActive: 'viewActive_bd7a99ed',
    gridDots: 'gridDots_bd7a99ed',
    listLines: 'listLines_bd7a99ed',
    gridWrap: 'gridWrap_bd7a99ed',
    gridRow: 'gridRow_bd7a99ed',
    'row-left': 'row-left_bd7a99ed',
    'row-center': 'row-center_bd7a99ed',
    'row-right': 'row-right_bd7a99ed',
    TIRCategoryIconGrid: 'TIRCategoryIconGrid_bd7a99ed',
    TIRPinnedChip: 'TIRPinnedChip_bd7a99ed',
    big: 'big_bd7a99ed',
    badge: 'badge_bd7a99ed',
    bigTitle: 'bigTitle_bd7a99ed',
    TIRBigMetaRow: 'TIRBigMetaRow_bd7a99ed',
    TIRDeptInline: 'TIRDeptInline_bd7a99ed',
    TIRMetaInlineRight: 'TIRMetaInlineRight_bd7a99ed',
    small: 'small_bd7a99ed',
    smallTitle: 'smallTitle_bd7a99ed',
    meta: 'meta_bd7a99ed',
    listWrap: 'listWrap_bd7a99ed',
    listItem: 'listItem_bd7a99ed',
    listMedia: 'listMedia_bd7a99ed',
    listCatIcon: 'listCatIcon_bd7a99ed',
    listBody: 'listBody_bd7a99ed',
    topRow: 'topRow_bd7a99ed',
    listDept: 'listDept_bd7a99ed',
    hashes: 'hashes_bd7a99ed',
    hash: 'hash_bd7a99ed',
    titleRow: 'titleRow_bd7a99ed',
    listTitle: 'listTitle_bd7a99ed',
    metaInline: 'metaInline_bd7a99ed',
    authorRow: 'authorRow_bd7a99ed',
    authorStub: 'authorStub_bd7a99ed',
    authorName: 'authorName_bd7a99ed',
    empty: 'empty_bd7a99ed'
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (styles);


/***/ }),

/***/ 6323:
/*!***********************************************************************************************************!*\
  !*** ./node_modules/@microsoft/sp-css-loader/node_modules/@microsoft/load-themed-styles/lib-es6/index.js ***!
  \***********************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ClearStyleOptions: () => (/* binding */ ClearStyleOptions),
/* harmony export */   Mode: () => (/* binding */ Mode),
/* harmony export */   clearStyles: () => (/* binding */ clearStyles),
/* harmony export */   configureLoadStyles: () => (/* binding */ configureLoadStyles),
/* harmony export */   configureRunMode: () => (/* binding */ configureRunMode),
/* harmony export */   detokenize: () => (/* binding */ detokenize),
/* harmony export */   flush: () => (/* binding */ flush),
/* harmony export */   loadStyles: () => (/* binding */ loadStyles),
/* harmony export */   loadTheme: () => (/* binding */ loadTheme),
/* harmony export */   splitStyles: () => (/* binding */ splitStyles)
/* harmony export */ });
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
/**
 * In sync mode, styles are registered as style elements synchronously with loadStyles() call.
 * In async mode, styles are buffered and registered as batch in async timer for performance purpose.
 */
var Mode;
(function (Mode) {
    Mode[Mode["sync"] = 0] = "sync";
    Mode[Mode["async"] = 1] = "async";
})(Mode || (Mode = {}));
/**
 * Themable styles and non-themable styles are tracked separately
 * Specify ClearStyleOptions when calling clearStyles API to specify which group of registered styles should be cleared.
 */
var ClearStyleOptions;
(function (ClearStyleOptions) {
    /** only themable styles will be cleared */
    ClearStyleOptions[ClearStyleOptions["onlyThemable"] = 1] = "onlyThemable";
    /** only non-themable styles will be cleared */
    ClearStyleOptions[ClearStyleOptions["onlyNonThemable"] = 2] = "onlyNonThemable";
    /** both themable and non-themable styles will be cleared */
    ClearStyleOptions[ClearStyleOptions["all"] = 3] = "all";
})(ClearStyleOptions || (ClearStyleOptions = {}));
// Store the theming state in __themeState__ global scope for reuse in the case of duplicate
// load-themed-styles hosted on the page.
var _root = typeof window === 'undefined' ? __webpack_require__.g : window; // eslint-disable-line @typescript-eslint/no-explicit-any
// Nonce string to inject into script tag if one provided. This is used in CSP (Content Security Policy).
var _styleNonce = _root && _root.CSPSettings && _root.CSPSettings.nonce;
var _themeState = initializeThemeState();
/**
 * Matches theming tokens. For example, "[theme: themeSlotName, default: #FFF]" (including the quotes).
 */
var _themeTokenRegex = /[\'\"]\[theme:\s*(\w+)\s*(?:\,\s*default:\s*([\\"\']?[\.\,\(\)\#\-\s\w]*[\.\,\(\)\#\-\w][\"\']?))?\s*\][\'\"]/g;
var now = function () {
    return typeof performance !== 'undefined' && !!performance.now ? performance.now() : Date.now();
};
function measure(func) {
    var start = now();
    func();
    var end = now();
    _themeState.perf.duration += end - start;
}
/**
 * initialize global state object
 */
function initializeThemeState() {
    var state = _root.__themeState__ || {
        theme: undefined,
        lastStyleElement: undefined,
        registeredStyles: []
    };
    if (!state.runState) {
        state = __assign(__assign({}, state), { perf: {
                count: 0,
                duration: 0
            }, runState: {
                flushTimer: 0,
                mode: Mode.sync,
                buffer: []
            } });
    }
    if (!state.registeredThemableStyles) {
        state = __assign(__assign({}, state), { registeredThemableStyles: [] });
    }
    _root.__themeState__ = state;
    return state;
}
/**
 * Loads a set of style text. If it is registered too early, we will register it when the window.load
 * event is fired.
 * @param {string | ThemableArray} styles Themable style text to register.
 * @param {boolean} loadAsync When true, always load styles in async mode, irrespective of current sync mode.
 */
function loadStyles(styles, loadAsync) {
    if (loadAsync === void 0) { loadAsync = false; }
    measure(function () {
        var styleParts = Array.isArray(styles) ? styles : splitStyles(styles);
        var _a = _themeState.runState, mode = _a.mode, buffer = _a.buffer, flushTimer = _a.flushTimer;
        if (loadAsync || mode === Mode.async) {
            buffer.push(styleParts);
            if (!flushTimer) {
                _themeState.runState.flushTimer = asyncLoadStyles();
            }
        }
        else {
            applyThemableStyles(styleParts);
        }
    });
}
/**
 * Allows for customizable loadStyles logic. e.g. for server side rendering application
 * @param {(processedStyles: string, rawStyles?: string | ThemableArray) => void}
 * a loadStyles callback that gets called when styles are loaded or reloaded
 */
function configureLoadStyles(loadStylesFn) {
    _themeState.loadStyles = loadStylesFn;
}
/**
 * Configure run mode of load-themable-styles
 * @param mode load-themable-styles run mode, async or sync
 */
function configureRunMode(mode) {
    _themeState.runState.mode = mode;
}
/**
 * external code can call flush to synchronously force processing of currently buffered styles
 */
function flush() {
    measure(function () {
        var styleArrays = _themeState.runState.buffer.slice();
        _themeState.runState.buffer = [];
        var mergedStyleArray = [].concat.apply([], styleArrays);
        if (mergedStyleArray.length > 0) {
            applyThemableStyles(mergedStyleArray);
        }
    });
}
/**
 * register async loadStyles
 */
function asyncLoadStyles() {
    // Use "self" to distinguish conflicting global typings for setTimeout() from lib.dom.d.ts vs Jest's @types/node
    // https://github.com/jestjs/jest/issues/14418
    return self.setTimeout(function () {
        _themeState.runState.flushTimer = 0;
        flush();
    }, 0);
}
/**
 * Loads a set of style text. If it is registered too early, we will register it when the window.load event
 * is fired.
 * @param {string} styleText Style to register.
 * @param {IStyleRecord} styleRecord Existing style record to re-apply.
 */
function applyThemableStyles(stylesArray, styleRecord) {
    if (_themeState.loadStyles) {
        _themeState.loadStyles(resolveThemableArray(stylesArray).styleString, stylesArray);
    }
    else {
        registerStyles(stylesArray);
    }
}
/**
 * Registers a set theme tokens to find and replace. If styles were already registered, they will be
 * replaced.
 * @param {theme} theme JSON object of theme tokens to values.
 */
function loadTheme(theme) {
    _themeState.theme = theme;
    // reload styles.
    reloadStyles();
}
/**
 * Clear already registered style elements and style records in theme_State object
 * @param option - specify which group of registered styles should be cleared.
 * Default to be both themable and non-themable styles will be cleared
 */
function clearStyles(option) {
    if (option === void 0) { option = ClearStyleOptions.all; }
    if (option === ClearStyleOptions.all || option === ClearStyleOptions.onlyNonThemable) {
        clearStylesInternal(_themeState.registeredStyles);
        _themeState.registeredStyles = [];
    }
    if (option === ClearStyleOptions.all || option === ClearStyleOptions.onlyThemable) {
        clearStylesInternal(_themeState.registeredThemableStyles);
        _themeState.registeredThemableStyles = [];
    }
}
function clearStylesInternal(records) {
    records.forEach(function (styleRecord) {
        var styleElement = styleRecord && styleRecord.styleElement;
        if (styleElement && styleElement.parentElement) {
            styleElement.parentElement.removeChild(styleElement);
        }
    });
}
/**
 * Reloads styles.
 */
function reloadStyles() {
    if (_themeState.theme) {
        var themableStyles = [];
        for (var _i = 0, _a = _themeState.registeredThemableStyles; _i < _a.length; _i++) {
            var styleRecord = _a[_i];
            themableStyles.push(styleRecord.themableStyle);
        }
        if (themableStyles.length > 0) {
            clearStyles(ClearStyleOptions.onlyThemable);
            applyThemableStyles([].concat.apply([], themableStyles));
        }
    }
}
/**
 * Find theme tokens and replaces them with provided theme values.
 * @param {string} styles Tokenized styles to fix.
 */
function detokenize(styles) {
    if (styles) {
        styles = resolveThemableArray(splitStyles(styles)).styleString;
    }
    return styles;
}
/**
 * Resolves ThemingInstruction objects in an array and joins the result into a string.
 * @param {ThemableArray} splitStyleArray ThemableArray to resolve and join.
 */
function resolveThemableArray(splitStyleArray) {
    var theme = _themeState.theme;
    var themable = false;
    // Resolve the array of theming instructions to an array of strings.
    // Then join the array to produce the final CSS string.
    var resolvedArray = (splitStyleArray || []).map(function (currentValue) {
        var themeSlot = currentValue.theme;
        if (themeSlot) {
            themable = true;
            // A theming annotation. Resolve it.
            var themedValue = theme ? theme[themeSlot] : undefined;
            var defaultValue = currentValue.defaultValue || 'inherit';
            // Warn to console if we hit an unthemed value even when themes are provided, but only if "DEBUG" is true.
            // Allow the themedValue to be undefined to explicitly request the default value.
            if (theme &&
                !themedValue &&
                console &&
                !(themeSlot in theme) &&
                "boolean" !== 'undefined' &&
                true) {
                // eslint-disable-next-line no-console
                console.warn("Theming value not provided for \"".concat(themeSlot, "\". Falling back to \"").concat(defaultValue, "\"."));
            }
            return themedValue || defaultValue;
        }
        else {
            // A non-themable string. Preserve it.
            return currentValue.rawString;
        }
    });
    return {
        styleString: resolvedArray.join(''),
        themable: themable
    };
}
/**
 * Split tokenized CSS into an array of strings and theme specification objects
 * @param {string} styles Tokenized styles to split.
 */
function splitStyles(styles) {
    var result = [];
    if (styles) {
        var pos = 0; // Current position in styles.
        var tokenMatch = void 0;
        while ((tokenMatch = _themeTokenRegex.exec(styles))) {
            var matchIndex = tokenMatch.index;
            if (matchIndex > pos) {
                result.push({
                    rawString: styles.substring(pos, matchIndex)
                });
            }
            result.push({
                theme: tokenMatch[1],
                defaultValue: tokenMatch[2] // May be undefined
            });
            // index of the first character after the current match
            pos = _themeTokenRegex.lastIndex;
        }
        // Push the rest of the string after the last match.
        result.push({
            rawString: styles.substring(pos)
        });
    }
    return result;
}
/**
 * Registers a set of style text. If it is registered too early, we will register it when the
 * window.load event is fired.
 * @param {ThemableArray} styleArray Array of IThemingInstruction objects to register.
 * @param {IStyleRecord} styleRecord May specify a style Element to update.
 */
function registerStyles(styleArray) {
    if (typeof document === 'undefined') {
        return;
    }
    var head = document.getElementsByTagName('head')[0];
    var styleElement = document.createElement('style');
    var _a = resolveThemableArray(styleArray), styleString = _a.styleString, themable = _a.themable;
    styleElement.setAttribute('data-load-themed-styles', 'true');
    if (_styleNonce) {
        styleElement.setAttribute('nonce', _styleNonce);
    }
    styleElement.appendChild(document.createTextNode(styleString));
    _themeState.perf.count++;
    head.appendChild(styleElement);
    var ev = document.createEvent('HTMLEvents');
    ev.initEvent('styleinsert', true /* bubbleEvent */, false /* cancelable */);
    ev.args = {
        newStyle: styleElement
    };
    document.dispatchEvent(ev);
    var record = {
        styleElement: styleElement,
        themableStyle: styleArray
    };
    if (themable) {
        _themeState.registeredThemableStyles.push(record);
    }
    else {
        _themeState.registeredStyles.push(record);
    }
}


/***/ }),

/***/ 6613:
/*!*************************************************************!*\
  !*** ./lib/webparts/newsPage/assets/news_search_normal.svg ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "news_search_normal_c31a7ad1dca3c1c4e503.svg";

/***/ }),

/***/ 9676:
/*!*********************************************!*\
  !*** external "@microsoft/sp-core-library" ***!
  \*********************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__9676__;

/***/ }),

/***/ 1909:
/*!*************************************!*\
  !*** external "@microsoft/sp-http" ***!
  \*************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__1909__;

/***/ }),

/***/ 6642:
/*!*********************************************!*\
  !*** external "@microsoft/sp-webpart-base" ***!
  \*********************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__6642__;

/***/ }),

/***/ 5959:
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__5959__;

/***/ }),

/***/ 8398:
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__8398__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var _publicPath = __RUSHSTACK_CURRENT_SCRIPT__ ? __RUSHSTACK_CURRENT_SCRIPT__.src : '';
/******/ 		__webpack_require__.p = _publicPath.slice(0, _publicPath.lastIndexOf('/') + 1);
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**************************************************!*\
  !*** ./lib/webparts/newsPage/NewsPageWebPart.js ***!
  \**************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 5959);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ 8398);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _microsoft_sp_core_library__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @microsoft/sp-core-library */ 9676);
/* harmony import */ var _microsoft_sp_core_library__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_microsoft_sp_core_library__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _microsoft_sp_webpart_base__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @microsoft/sp-webpart-base */ 6642);
/* harmony import */ var _microsoft_sp_webpart_base__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_microsoft_sp_webpart_base__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _components_NewsPage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/NewsPage */ 7711);
var __extends = (undefined && undefined.__extends) || (function () {
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





var NewsPageWebPart = /** @class */ (function (_super) {
    __extends(NewsPageWebPart, _super);
    function NewsPageWebPart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NewsPageWebPart.prototype.render = function () {
        var element = react__WEBPACK_IMPORTED_MODULE_0__.createElement(_components_NewsPage__WEBPACK_IMPORTED_MODULE_4__["default"], {
            siteUrl: this.context.pageContext.web.absoluteUrl,
            spfxContext: this.context
        });
        react_dom__WEBPACK_IMPORTED_MODULE_1__.render(element, this.domElement);
    };
    NewsPageWebPart.prototype.onDispose = function () {
        react_dom__WEBPACK_IMPORTED_MODULE_1__.unmountComponentAtNode(this.domElement);
    };
    Object.defineProperty(NewsPageWebPart.prototype, "dataVersion", {
        get: function () {
            return _microsoft_sp_core_library__WEBPACK_IMPORTED_MODULE_2__.Version.parse("1.0");
        },
        enumerable: false,
        configurable: true
    });
    return NewsPageWebPart;
}(_microsoft_sp_webpart_base__WEBPACK_IMPORTED_MODULE_3__.BaseClientSideWebPart));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (NewsPageWebPart);

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});})();;
//# sourceMappingURL=news-page-web-part.js.map