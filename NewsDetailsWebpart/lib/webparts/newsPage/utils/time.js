export var timeAgo = function (d) {
    var now = new Date().getTime();
    var ms = now - d.getTime();
    var hrs = Math.floor(ms / 36e5);
    var days = Math.floor(hrs / 24);
    if (hrs < 1)
        return "Just now";
    if (hrs < 24)
        return "".concat(hrs, " hour").concat(hrs === 1 ? "" : "s", " ago");
    if (days === 1)
        return "1 day ago";
    if (days < 7)
        return "".concat(days, " days ago");
    if (days < 30)
        return "".concat(Math.floor(days / 7), " weeks ago");
    return d.toLocaleDateString();
};
//# sourceMappingURL=time.js.map