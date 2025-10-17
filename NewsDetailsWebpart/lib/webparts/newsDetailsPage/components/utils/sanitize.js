export var decodeTwice = function (input) {
    if (!input)
        return "";
    var once = new DOMParser().parseFromString(input, "text/html").documentElement.textContent || "";
    var twice = new DOMParser().parseFromString(once, "text/html").documentElement.textContent || "";
    return twice;
};
export var stripHtml = function (html) {
    return html.replace(/<[^>]*>/g, "");
};
export var normalizeSpaces = function (s) {
    return s.replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
};
export var splitToTags = function (s) {
    return s
        .replace(/[;|]/g, ",") // support ; or | as separators if any
        .split(/[,\s]+/) // split by comma OR whitespace
        .map(function (t) { return t.trim().replace(/^#+/, ""); }) // remove extra # if repeated
        .filter(Boolean)
        .map(function (t) { return "#".concat(t); });
}; // always show with '#'
//# sourceMappingURL=sanitize.js.map