export function calcReadMins(html) {
    var text = (html || "").replace(/<[^>]+>/g, " ");
    var words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200)); // ~200 words/min
}
export function timeAgo(dt) {
    var diff = (Date.now() - dt.getTime()) / 1000;
    if (diff < 3600)
        return "".concat(Math.max(1, Math.floor(diff / 60)), " min ago");
    if (diff < 86400)
        return "".concat(Math.floor(diff / 3600), " hours ago");
    return "".concat(Math.floor(diff / 86400), " days ago");
}
/** Date-only display like "05 Oct 2025" (locale-aware) */
export function formatDate(d) {
    return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
}
/** Time-only display like "11:23 AM" (locale-aware) */
export function formatTime(d) {
    return d.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
    });
}
//# sourceMappingURL=formatters.js.map