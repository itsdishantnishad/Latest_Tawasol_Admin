(()=>{ var __RUSHSTACK_CURRENT_SCRIPT__ = document.currentScript; define(["react","react-dom","@microsoft/sp-core-library","@microsoft/sp-property-pane","@microsoft/sp-webpart-base","TeamOrganisationStructureWebPartStrings","@microsoft/sp-lodash-subset"], (__WEBPACK_EXTERNAL_MODULE__959__, __WEBPACK_EXTERNAL_MODULE__398__, __WEBPACK_EXTERNAL_MODULE__676__, __WEBPACK_EXTERNAL_MODULE__877__, __WEBPACK_EXTERNAL_MODULE__642__, __WEBPACK_EXTERNAL_MODULE__103__, __WEBPACK_EXTERNAL_MODULE__529__) => { return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 239:
/*!************************************************************************************************!*\
  !*** ./lib/webparts/teamOrganisationStructure/components/TeamOrganisationStructure.module.css ***!
  \************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_microsoft_sp_css_loader_node_modules_microsoft_load_themed_styles_lib_es6_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../node_modules/@microsoft/sp-css-loader/node_modules/@microsoft/load-themed-styles/lib-es6/index.js */ 323);
// Imports


_node_modules_microsoft_sp_css_loader_node_modules_microsoft_load_themed_styles_lib_es6_index_js__WEBPACK_IMPORTED_MODULE_0__.loadStyles(".teamOrganisationStructure_c3782a0c{color:\"[theme:bodyText, default: #323130]\";color:var(--bodyText);overflow:hidden;padding:1em}.teamOrganisationStructure_c3782a0c.teams_c3782a0c{font-family:Segoe UI,-apple-system,BlinkMacSystemFont,Roboto,Helvetica Neue,sans-serif}.welcome_c3782a0c{text-align:center}.welcomeImage_c3782a0c{max-width:420px;width:100%}.links_c3782a0c a{color:\"[theme:link, default:#03787c]\";color:var(--link);text-decoration:none}.links_c3782a0c a:hover{color:\"[theme:linkHovered, default: #014446]\";color:var(--linkHovered);text-decoration:underline}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vRTovVlMlMjBDT0RFJTIwMjAyNS90YXdhc29sL0Fib3V0REhSRVdlYlBhcnQvc3JjL3dlYnBhcnRzL3RlYW1PcmdhbmlzYXRpb25TdHJ1Y3R1cmUvY29tcG9uZW50cy9UZWFtT3JnYW5pc2F0aW9uU3RydWN0dXJlLm1vZHVsZS5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLG9DQUdFLDBDQUFBLENBQ0EscUJBQUEsQ0FIQSxlQUFBLENBQ0EsV0FFQSxDQUNBLG1EQUNFLHNGQUFBLENBSUosa0JBQ0UsaUJBQUEsQ0FHRix1QkFFRSxlQUFBLENBREEsVUFDQSxDQUlBLGtCQUVFLHFDQUFBLENBQ0EsaUJBQUEsQ0FGQSxvQkFFQSxDQUVBLHdCQUVFLDZDQUFBLENBQ0Esd0JBQUEsQ0FGQSx5QkFFQSIsImZpbGUiOiJUZWFtT3JnYW5pc2F0aW9uU3RydWN0dXJlLm1vZHVsZS5jc3MifQ== */", true);

// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  teamOrganisationStructure_c3782a0c: "teamOrganisationStructure_c3782a0c",
  teams_c3782a0c: "teams_c3782a0c",
  welcome_c3782a0c: "welcome_c3782a0c",
  welcomeImage_c3782a0c: "welcomeImage_c3782a0c",
  links_c3782a0c: "links_c3782a0c"
});


/***/ }),

/***/ 535:
/*!****************************************************************************************!*\
  !*** ./lib/webparts/teamOrganisationStructure/components/TeamOrganisationStructure.js ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 959);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _TeamOrganisationStructure_module_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./TeamOrganisationStructure.module.scss */ 763);
/* harmony import */ var _microsoft_sp_lodash_subset__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @microsoft/sp-lodash-subset */ 529);
/* harmony import */ var _microsoft_sp_lodash_subset__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_microsoft_sp_lodash_subset__WEBPACK_IMPORTED_MODULE_2__);
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



var TeamOrganisationStructure = /** @class */ (function (_super) {
    __extends(TeamOrganisationStructure, _super);
    function TeamOrganisationStructure() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TeamOrganisationStructure.prototype.render = function () {
        var _a = this.props, description = _a.description, isDarkTheme = _a.isDarkTheme, environmentMessage = _a.environmentMessage, hasTeamsContext = _a.hasTeamsContext, userDisplayName = _a.userDisplayName;
        return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("section", { className: "".concat(_TeamOrganisationStructure_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].teamOrganisationStructure, " ").concat(hasTeamsContext ? _TeamOrganisationStructure_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].teams : '') },
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _TeamOrganisationStructure_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].welcome },
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("img", { alt: "", src: isDarkTheme ? __webpack_require__(/*! ../assets/welcome-dark.png */ 177) : __webpack_require__(/*! ../assets/welcome-light.png */ 401), className: _TeamOrganisationStructure_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].welcomeImage }),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("h2", null,
                    "Well done, ",
                    (0,_microsoft_sp_lodash_subset__WEBPACK_IMPORTED_MODULE_2__.escape)(userDisplayName),
                    "!"),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", null, environmentMessage),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", null,
                    "Web part property value: ",
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, (0,_microsoft_sp_lodash_subset__WEBPACK_IMPORTED_MODULE_2__.escape)(description)))),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("h3", null, "Welcome to SharePoint Framework!"),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "The SharePoint Framework (SPFx) is a extensibility model for Microsoft Viva, Microsoft Teams and SharePoint. It's the easiest way to extend Microsoft 365 with automatic Single Sign On, automatic hosting and industry standard tooling."),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("h4", null, "Learn more about SPFx development:"),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("ul", { className: _TeamOrganisationStructure_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].links },
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "https://aka.ms/spfx", target: "_blank", rel: "noreferrer" }, "SharePoint Framework Overview")),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "https://aka.ms/spfx-yeoman-graph", target: "_blank", rel: "noreferrer" }, "Use Microsoft Graph in your solution")),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "https://aka.ms/spfx-yeoman-teams", target: "_blank", rel: "noreferrer" }, "Build for Microsoft Teams using SharePoint Framework")),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "https://aka.ms/spfx-yeoman-viva", target: "_blank", rel: "noreferrer" }, "Build for Microsoft Viva Connections using SharePoint Framework")),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "https://aka.ms/spfx-yeoman-store", target: "_blank", rel: "noreferrer" }, "Publish SharePoint Framework applications to the marketplace")),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "https://aka.ms/spfx-yeoman-api", target: "_blank", rel: "noreferrer" }, "SharePoint Framework API reference")),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "https://aka.ms/m365pnp", target: "_blank", rel: "noreferrer" }, "Microsoft 365 Developer Community"))))));
    };
    return TeamOrganisationStructure;
}(react__WEBPACK_IMPORTED_MODULE_0__.Component));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TeamOrganisationStructure);


/***/ }),

/***/ 763:
/*!****************************************************************************************************!*\
  !*** ./lib/webparts/teamOrganisationStructure/components/TeamOrganisationStructure.module.scss.js ***!
  \****************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
__webpack_require__(/*! ./TeamOrganisationStructure.module.css */ 239);
var styles = {
    teamOrganisationStructure: 'teamOrganisationStructure_c3782a0c',
    teams: 'teams_c3782a0c',
    welcome: 'welcome_c3782a0c',
    welcomeImage: 'welcomeImage_c3782a0c',
    links: 'links_c3782a0c'
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

/***/ 177:
/*!************************************************************************!*\
  !*** ./lib/webparts/teamOrganisationStructure/assets/welcome-dark.png ***!
  \************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "welcome-dark_bc81978d2f17e05985ee.png";

/***/ }),

/***/ 401:
/*!*************************************************************************!*\
  !*** ./lib/webparts/teamOrganisationStructure/assets/welcome-light.png ***!
  \*************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "welcome-light_a2dcb0d64c8d6e80cf49.png";

/***/ }),

/***/ 676:
/*!*********************************************!*\
  !*** external "@microsoft/sp-core-library" ***!
  \*********************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__676__;

/***/ }),

/***/ 529:
/*!**********************************************!*\
  !*** external "@microsoft/sp-lodash-subset" ***!
  \**********************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__529__;

/***/ }),

/***/ 877:
/*!**********************************************!*\
  !*** external "@microsoft/sp-property-pane" ***!
  \**********************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__877__;

/***/ }),

/***/ 642:
/*!*********************************************!*\
  !*** external "@microsoft/sp-webpart-base" ***!
  \*********************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__642__;

/***/ }),

/***/ 103:
/*!**********************************************************!*\
  !*** external "TeamOrganisationStructureWebPartStrings" ***!
  \**********************************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__103__;

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
/*!************************************************************************************!*\
  !*** ./lib/webparts/teamOrganisationStructure/TeamOrganisationStructureWebPart.js ***!
  \************************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 959);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ 398);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _microsoft_sp_core_library__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @microsoft/sp-core-library */ 676);
/* harmony import */ var _microsoft_sp_core_library__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_microsoft_sp_core_library__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _microsoft_sp_property_pane__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @microsoft/sp-property-pane */ 877);
/* harmony import */ var _microsoft_sp_property_pane__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_microsoft_sp_property_pane__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _microsoft_sp_webpart_base__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @microsoft/sp-webpart-base */ 642);
/* harmony import */ var _microsoft_sp_webpart_base__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_microsoft_sp_webpart_base__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var TeamOrganisationStructureWebPartStrings__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! TeamOrganisationStructureWebPartStrings */ 103);
/* harmony import */ var TeamOrganisationStructureWebPartStrings__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(TeamOrganisationStructureWebPartStrings__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _components_TeamOrganisationStructure__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/TeamOrganisationStructure */ 535);
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







var TeamOrganisationStructureWebPart = /** @class */ (function (_super) {
    __extends(TeamOrganisationStructureWebPart, _super);
    function TeamOrganisationStructureWebPart() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._isDarkTheme = false;
        _this._environmentMessage = '';
        return _this;
    }
    TeamOrganisationStructureWebPart.prototype.render = function () {
        var element = react__WEBPACK_IMPORTED_MODULE_0__.createElement(_components_TeamOrganisationStructure__WEBPACK_IMPORTED_MODULE_6__["default"], {
            description: this.properties.description,
            isDarkTheme: this._isDarkTheme,
            environmentMessage: this._environmentMessage,
            hasTeamsContext: !!this.context.sdks.microsoftTeams,
            userDisplayName: this.context.pageContext.user.displayName
        });
        react_dom__WEBPACK_IMPORTED_MODULE_1__.render(element, this.domElement);
    };
    TeamOrganisationStructureWebPart.prototype.onInit = function () {
        var _this = this;
        return this._getEnvironmentMessage().then(function (message) {
            _this._environmentMessage = message;
        });
    };
    TeamOrganisationStructureWebPart.prototype._getEnvironmentMessage = function () {
        var _this = this;
        if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
            return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
                .then(function (context) {
                var environmentMessage = '';
                switch (context.app.host.name) {
                    case 'Office': // running in Office
                        environmentMessage = _this.context.isServedFromLocalhost ? TeamOrganisationStructureWebPartStrings__WEBPACK_IMPORTED_MODULE_5__.AppLocalEnvironmentOffice : TeamOrganisationStructureWebPartStrings__WEBPACK_IMPORTED_MODULE_5__.AppOfficeEnvironment;
                        break;
                    case 'Outlook': // running in Outlook
                        environmentMessage = _this.context.isServedFromLocalhost ? TeamOrganisationStructureWebPartStrings__WEBPACK_IMPORTED_MODULE_5__.AppLocalEnvironmentOutlook : TeamOrganisationStructureWebPartStrings__WEBPACK_IMPORTED_MODULE_5__.AppOutlookEnvironment;
                        break;
                    case 'Teams': // running in Teams
                    case 'TeamsModern':
                        environmentMessage = _this.context.isServedFromLocalhost ? TeamOrganisationStructureWebPartStrings__WEBPACK_IMPORTED_MODULE_5__.AppLocalEnvironmentTeams : TeamOrganisationStructureWebPartStrings__WEBPACK_IMPORTED_MODULE_5__.AppTeamsTabEnvironment;
                        break;
                    default:
                        environmentMessage = TeamOrganisationStructureWebPartStrings__WEBPACK_IMPORTED_MODULE_5__.UnknownEnvironment;
                }
                return environmentMessage;
            });
        }
        return Promise.resolve(this.context.isServedFromLocalhost ? TeamOrganisationStructureWebPartStrings__WEBPACK_IMPORTED_MODULE_5__.AppLocalEnvironmentSharePoint : TeamOrganisationStructureWebPartStrings__WEBPACK_IMPORTED_MODULE_5__.AppSharePointEnvironment);
    };
    TeamOrganisationStructureWebPart.prototype.onThemeChanged = function (currentTheme) {
        if (!currentTheme) {
            return;
        }
        this._isDarkTheme = !!currentTheme.isInverted;
        var semanticColors = currentTheme.semanticColors;
        if (semanticColors) {
            this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
            this.domElement.style.setProperty('--link', semanticColors.link || null);
            this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
        }
    };
    TeamOrganisationStructureWebPart.prototype.onDispose = function () {
        react_dom__WEBPACK_IMPORTED_MODULE_1__.unmountComponentAtNode(this.domElement);
    };
    Object.defineProperty(TeamOrganisationStructureWebPart.prototype, "dataVersion", {
        get: function () {
            return _microsoft_sp_core_library__WEBPACK_IMPORTED_MODULE_2__.Version.parse('1.0');
        },
        enumerable: false,
        configurable: true
    });
    TeamOrganisationStructureWebPart.prototype.getPropertyPaneConfiguration = function () {
        return {
            pages: [
                {
                    header: {
                        description: TeamOrganisationStructureWebPartStrings__WEBPACK_IMPORTED_MODULE_5__.PropertyPaneDescription
                    },
                    groups: [
                        {
                            groupName: TeamOrganisationStructureWebPartStrings__WEBPACK_IMPORTED_MODULE_5__.BasicGroupName,
                            groupFields: [
                                (0,_microsoft_sp_property_pane__WEBPACK_IMPORTED_MODULE_3__.PropertyPaneTextField)('description', {
                                    label: TeamOrganisationStructureWebPartStrings__WEBPACK_IMPORTED_MODULE_5__.DescriptionFieldLabel
                                })
                            ]
                        }
                    ]
                }
            ]
        };
    };
    return TeamOrganisationStructureWebPart;
}(_microsoft_sp_webpart_base__WEBPACK_IMPORTED_MODULE_4__.BaseClientSideWebPart));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TeamOrganisationStructureWebPart);

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});})();;
//# sourceMappingURL=team-organisation-structure-web-part.js.map