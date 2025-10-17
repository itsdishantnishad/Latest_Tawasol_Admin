define(["@microsoft/sp-core-library","@microsoft/sp-webpart-base","react","react-dom","@microsoft/sp-http"], (__WEBPACK_EXTERNAL_MODULE__676__, __WEBPACK_EXTERNAL_MODULE__642__, __WEBPACK_EXTERNAL_MODULE__959__, __WEBPACK_EXTERNAL_MODULE__398__, __WEBPACK_EXTERNAL_MODULE__909__) => { return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 99:
/*!****************************************************************!*\
  !*** ./lib/webparts/ourValues/components/OurValues.module.css ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_microsoft_sp_css_loader_node_modules_microsoft_load_themed_styles_lib_es6_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../node_modules/@microsoft/sp-css-loader/node_modules/@microsoft/load-themed-styles/lib-es6/index.js */ 323);
// Imports


_node_modules_microsoft_sp_css_loader_node_modules_microsoft_load_themed_styles_lib_es6_index_js__WEBPACK_IMPORTED_MODULE_0__.loadStyles(":root{--ov-border:#e6e0da;--ov-title:#3a3b43;--ov-accent:#da291c;--ov-text:#3a3b43}.fullBleed_f4fd40e8{isolation:isolate;position:relative}.fullBleed_f4fd40e8:before{background:#fff4ea;content:\"\";inset:0;left:50%;margin-left:-50vw;margin-right:-50vw;position:absolute;right:50%;width:100vw;z-index:-1}.ourValues_f4fd40e8{padding:48px 24px}.container_f4fd40e8{margin:0 auto;max-width:1200px}.heading_f4fd40e8{align-items:baseline;display:flex;gap:8px;justify-content:center;letter-spacing:1px;line-height:1;margin-bottom:32px;text-align:center}.headingOur_f4fd40e8{color:var(--ov-accent);font-style:italic}.headingOur_f4fd40e8,.headingValues_f4fd40e8{font-family:\"Instrument Serif\",serif;font-size:42px;font-weight:400}.headingValues_f4fd40e8{color:var(--ov-title);font-style:normal}.grid_f4fd40e8{display:grid;gap:24px;grid-template-columns:repeat(4,minmax(0,1fr))}@media (max-width:1100px){.grid_f4fd40e8{grid-template-columns:repeat(2,1fr)}}@media (max-width:640px){.grid_f4fd40e8{grid-template-columns:1fr}}.card_f4fd40e8{border:1px solid var(--ov-border);border-radius:10px;display:flex;flex-direction:column;gap:16px;height:212px;padding:24px 16px}.iconWrap_f4fd40e8{display:grid;height:60px;place-items:center;width:60px}.icon_f4fd40e8{display:block;max-height:60px;max-width:60px}.cardTitle_f4fd40e8{color:#111;font-size:18px;font-weight:600}.cardDesc_f4fd40e8,.cardTitle_f4fd40e8{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:24px}.cardDesc_f4fd40e8{color:var(--ov-text);font-size:16px;font-weight:400;margin-top:-4px}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vRTovVlMlMjBDT0RFJTIwMjAyNS90YXdhc29sL0Fib3V0REhSRVdlYlBhcnQvc3JjL3dlYnBhcnRzL291clZhbHVlcy9jb21wb25lbnRzL091clZhbHVlcy5tb2R1bGUuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUNFLG1CQUFBLENBQ0Esa0JBQUEsQ0FDQSxtQkFBQSxDQUNBLGlCQUFBLENBSUYsb0JBQWlDLGlCQUFBLENBQXBCLGlCQUFvQixDQUNqQywyQkFJRSxrQkFBQSxDQUhBLFVBQUEsQ0FDb0IsT0FBQSxDQUNwQixRQUFBLENBQXVCLGlCQUFBLENBQW9CLGtCQUFBLENBRDNDLGlCQUFBLENBQ1csU0FBQSxDQUFxRCxXQUFBLENBRWhFLFVBQUEsQ0FHRixvQkFBYSxpQkFBQSxDQUNiLG9CQUFpQyxhQUFBLENBQW5CLGdCQUFtQixDQUdqQyxrQkFDMEMsb0JBQUEsQ0FBeEMsWUFBQSxDQUErRCxPQUFBLENBQWhELHNCQUFBLENBQ3NCLGtCQUFBLENBQWhCLGFBQUEsQ0FBckIsa0JBQUEsQ0FBMEQsaUJBQUEsQ0FFNUQscUJBRW1CLHNCQUFBLENBRHlDLGlCQUN6QyxDQUVuQiw2Q0FIRSxvQ0FBQSxDQUNBLGNBQUEsQ0FEd0MsZUFLdkIsQ0FGbkIsd0JBRW1CLHFCQUFBLENBRHlDLGlCQUN6QyxDQUluQixlQUFRLFlBQUEsQ0FBaUUsUUFBQSxDQUFsRCw2Q0FBa0QsQ0FDekUsMEJBQTJCLGVBQU8sbUNBQUEsQ0FBQSxDQUNsQyx5QkFBMEIsZUFBTyx5QkFBQSxDQUFBLENBR2pDLGVBQ2lCLGlDQUFBLENBQW9DLGtCQUFBLENBQy9CLFlBQUEsQ0FBYyxxQkFBQSxDQUF1QixRQUFBLENBRHpELFlBQUEsQ0FDQSxpQkFBeUQsQ0FFM0QsbUJBQXFDLFlBQUEsQ0FBYixXQUFBLENBQTJCLGtCQUFBLENBQXZDLFVBQXVDLENBQ25ELGVBQXlDLGFBQUEsQ0FBakIsZUFBQSxDQUFoQixjQUFpQyxDQUN6QyxvQkFDcUQsVUFBQSxDQUFsQyxjQUFBLENBQWpCLGVBQW1ELENBQ3JELHVDQUZhLCtEQUFBLENBQ3NCLGdCQUVrQixDQURyRCxtQkFDcUQsb0JBQUEsQ0FBbEMsY0FBQSxDQUFqQixlQUFBLENBRFUsZUFDeUMiLCJmaWxlIjoiT3VyVmFsdWVzLm1vZHVsZS5jc3MifQ== */", true);

// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  fullBleed_f4fd40e8: "fullBleed_f4fd40e8",
  ourValues_f4fd40e8: "ourValues_f4fd40e8",
  container_f4fd40e8: "container_f4fd40e8",
  heading_f4fd40e8: "heading_f4fd40e8",
  headingOur_f4fd40e8: "headingOur_f4fd40e8",
  headingValues_f4fd40e8: "headingValues_f4fd40e8",
  grid_f4fd40e8: "grid_f4fd40e8",
  card_f4fd40e8: "card_f4fd40e8",
  iconWrap_f4fd40e8: "iconWrap_f4fd40e8",
  icon_f4fd40e8: "icon_f4fd40e8",
  cardTitle_f4fd40e8: "cardTitle_f4fd40e8",
  cardDesc_f4fd40e8: "cardDesc_f4fd40e8"
});


/***/ }),

/***/ 923:
/*!********************************************************!*\
  !*** ./lib/webparts/ourValues/components/OurValues.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 959);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _OurValues_module_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OurValues.module.scss */ 511);
/* harmony import */ var _microsoft_sp_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @microsoft/sp-http */ 909);
/* harmony import */ var _microsoft_sp_http__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_microsoft_sp_http__WEBPACK_IMPORTED_MODULE_2__);
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



var OurValues = /** @class */ (function (_super) {
    __extends(OurValues, _super);
    function OurValues() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { items: [], loading: true };
        return _this;
    }
    OurValues.prototype.componentDidMount = function () { this.loadItems(); };
    /** Fetch items from the list and map to cards */
    OurValues.prototype.loadItems = function () {
        return __awaiter(this, void 0, void 0, function () {
            var webUrl, listName, url, res, text, json, items, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        webUrl = this.props.context.pageContext.web.absoluteUrl;
                        listName = 'AboutDHREOurValues';
                        url = "".concat(webUrl, "/_api/web/lists/getbytitle('").concat(encodeURIComponent(listName), "')/items") +
                            "?$select=Id,Title,OVDescription,OVIcon,OVSortOrder" +
                            "&$orderby=OVSortOrder asc, Id asc";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, this.props.context.spHttpClient.get(url, _microsoft_sp_http__WEBPACK_IMPORTED_MODULE_2__.SPHttpClient.configurations.v1)];
                    case 2:
                        res = _a.sent();
                        if (!!res.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, res.text()];
                    case 3:
                        text = _a.sent();
                        throw new Error("REST ".concat(res.status, ": ").concat(text));
                    case 4: return [4 /*yield*/, res.json()];
                    case 5:
                        json = _a.sent();
                        items = (json.value || []).map(function (it) {
                            var raw = it === null || it === void 0 ? void 0 : it.OVIcon;
                            var icon = '';
                            if (raw) {
                                if (typeof raw === 'string')
                                    icon = raw; // Hyperlink/Picture column
                                else if (raw.Url)
                                    icon = raw.Url; // Image column (modern)
                            }
                            return { icon: icon, title: (it === null || it === void 0 ? void 0 : it.Title) || '', desc: (it === null || it === void 0 ? void 0 : it.OVDescription) || '' };
                        });
                        this.setState({ items: items, loading: false, error: undefined });
                        return [3 /*break*/, 7];
                    case 6:
                        e_1 = _a.sent();
                        this.setState({ loading: false, error: (e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || 'Failed to load items.' });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    OurValues.prototype.render = function () {
        var _a = this.state, items = _a.items, loading = _a.loading, error = _a.error;
        return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("section", { className: "".concat(_OurValues_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].ourValues, " ").concat(_OurValues_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].fullBleed) },
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _OurValues_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].container },
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _OurValues_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].heading },
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", { className: _OurValues_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].headingOur }, "Our"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", { className: _OurValues_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].headingValues }, "Values")),
                loading && react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", null, "Loading\u2026"),
                error && !loading && react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { style: { color: '#c00' } }, error),
                !loading && !error && (react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _OurValues_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].grid }, items.map(function (c, i) { return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("article", { key: i, className: _OurValues_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].card },
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _OurValues_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].iconWrap }, c.icon ? react__WEBPACK_IMPORTED_MODULE_0__.createElement("img", { src: c.icon, alt: "", className: _OurValues_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].icon }) : null),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("h3", { className: _OurValues_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].cardTitle }, c.title),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", { className: _OurValues_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].cardDesc }, c.desc))); }))))));
    };
    return OurValues;
}(react__WEBPACK_IMPORTED_MODULE_0__.Component));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (OurValues);


/***/ }),

/***/ 511:
/*!********************************************************************!*\
  !*** ./lib/webparts/ourValues/components/OurValues.module.scss.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
__webpack_require__(/*! ./OurValues.module.css */ 99);
var styles = {
    fullBleed: 'fullBleed_f4fd40e8',
    ourValues: 'ourValues_f4fd40e8',
    container: 'container_f4fd40e8',
    heading: 'heading_f4fd40e8',
    headingOur: 'headingOur_f4fd40e8',
    headingValues: 'headingValues_f4fd40e8',
    grid: 'grid_f4fd40e8',
    card: 'card_f4fd40e8',
    iconWrap: 'iconWrap_f4fd40e8',
    icon: 'icon_f4fd40e8',
    cardTitle: 'cardTitle_f4fd40e8',
    cardDesc: 'cardDesc_f4fd40e8'
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (styles);


/***/ }),

/***/ 323:
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

/***/ 676:
/*!*********************************************!*\
  !*** external "@microsoft/sp-core-library" ***!
  \*********************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__676__;

/***/ }),

/***/ 909:
/*!*************************************!*\
  !*** external "@microsoft/sp-http" ***!
  \*************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__909__;

/***/ }),

/***/ 642:
/*!*********************************************!*\
  !*** external "@microsoft/sp-webpart-base" ***!
  \*********************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__642__;

/***/ }),

/***/ 959:
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__959__;

/***/ }),

/***/ 398:
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__398__;

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
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!****************************************************!*\
  !*** ./lib/webparts/ourValues/OurValuesWebPart.js ***!
  \****************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _microsoft_sp_core_library__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @microsoft/sp-core-library */ 676);
/* harmony import */ var _microsoft_sp_core_library__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_microsoft_sp_core_library__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _microsoft_sp_webpart_base__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @microsoft/sp-webpart-base */ 642);
/* harmony import */ var _microsoft_sp_webpart_base__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_microsoft_sp_webpart_base__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ 959);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-dom */ 398);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _components_OurValues__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/OurValues */ 923);
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





var OurValuesWebPart = /** @class */ (function (_super) {
    __extends(OurValuesWebPart, _super);
    function OurValuesWebPart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OurValuesWebPart.prototype.render = function () {
        var element = react__WEBPACK_IMPORTED_MODULE_2__.createElement(_components_OurValues__WEBPACK_IMPORTED_MODULE_4__["default"], {
            context: this.context
        });
        react_dom__WEBPACK_IMPORTED_MODULE_3__.render(element, this.domElement);
    };
    OurValuesWebPart.prototype.onDispose = function () {
        react_dom__WEBPACK_IMPORTED_MODULE_3__.unmountComponentAtNode(this.domElement);
    };
    Object.defineProperty(OurValuesWebPart.prototype, "dataVersion", {
        get: function () {
            return _microsoft_sp_core_library__WEBPACK_IMPORTED_MODULE_0__.Version.parse('1.0');
        },
        enumerable: false,
        configurable: true
    });
    return OurValuesWebPart;
}(_microsoft_sp_webpart_base__WEBPACK_IMPORTED_MODULE_1__.BaseClientSideWebPart));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (OurValuesWebPart);

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});;
//# sourceMappingURL=our-values-web-part.js.map