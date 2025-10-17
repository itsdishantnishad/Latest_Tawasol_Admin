import * as React from "react";
import styles from "../../styles/NewsDetails.module.scss";
// ✅ Import icons
import DHREIcon from "../../assets/DHREStoriesCheck.svg";
import AnnoucIcon from "../../assets/Announcement.svg";
import ArrTHEWorldIcon from "../../assets/ArroundTheWorld.svg";
import HumanCapitalIcon from "../../assets/HumanCapital.svg";
export var HeaderChips = function (_a) {
    var _b = _a.category, category = _b === void 0 ? "" : _b, _c = _a.department, department = _c === void 0 ? "" : _c, _d = _a.hashtags, hashtags = _d === void 0 ? [] : _d, onTagClick = _a.onTagClick;
    /** 🧩 Normalize category text (handles string | object | array) */
    var getCategoryText = function () {
        var _a;
        if (!category)
            return "";
        if (typeof category === "string")
            return category;
        if (Array.isArray(category))
            return ((_a = category[0]) === null || _a === void 0 ? void 0 : _a.Label) || category[0] || "";
        if (typeof category === "object" && "Label" in category)
            return category.Label;
        return String(category);
    };
    /** 🧩 Normalize department text with guards (avoid showing plain numbers like "1") */
    var getDepartmentText = function () {
        var _a;
        if (!department)
            return "";
        if (typeof department === "number")
            return "";
        if (typeof department === "string") {
            var s = department.trim();
            if (/^\d+$/.test(s))
                return ""; // don’t render bare numeric
            return s;
        }
        if (Array.isArray(department))
            return ((_a = department[0]) === null || _a === void 0 ? void 0 : _a.Label) || department[0] || "";
        if (typeof department === "object" && "Label" in department)
            return department.Label;
        return String(department);
    };
    var categoryText = getCategoryText();
    var departmentText = getDepartmentText();
    // ✅ Category icon resolver
    var getCategoryIcon = function () {
        var c = categoryText.toLowerCase();
        if (c.includes("dhre"))
            return DHREIcon;
        if (c.includes("announcement"))
            return AnnoucIcon;
        if (c.includes("around the world"))
            return ArrTHEWorldIcon;
        return null;
    };
    // ✅ Department icon resolver
    var getDepartmentIcon = function () {
        var d = departmentText.toLowerCase();
        if (d.includes("human capital"))
            return HumanCapitalIcon;
        if (d.includes("finance"))
            return "💰";
        if (d.includes("it"))
            return "💻";
        if (d.includes("marketing"))
            return "📣";
        if (d.includes("operations"))
            return "⚙️";
        if (d.includes("administration"))
            return "🧾";
        return "🏢";
    };
    // ✅ Render SVG or emoji gracefully
    var renderIcon = function (icon) {
        if (!icon)
            return null;
        return icon.endsWith(".svg") ? (React.createElement("img", { src: icon, alt: "", className: styles.categoryIcon })) : (React.createElement("span", { className: styles.emoji }, icon));
    };
    return (React.createElement("div", { className: styles.headerChips },
        categoryText && (React.createElement("div", { className: styles.categoryChip },
            renderIcon(getCategoryIcon()),
            React.createElement("span", { className: styles.categoryText }, categoryText))),
        categoryText && departmentText && React.createElement("div", { className: styles.divider }),
        departmentText && (React.createElement("div", { className: styles.departmentChip },
            renderIcon(getDepartmentIcon()),
            React.createElement("span", { className: styles.departmentText }, departmentText))),
        (categoryText || departmentText) && hashtags.length > 0 && (React.createElement("div", { className: styles.divider })),
        hashtags.length > 0 && (React.createElement("div", { className: styles.hashtagContainer }, hashtags.map(function (tag, i) { return (React.createElement("span", { key: i, className: styles.hashtagLink, onClick: function () { return onTagClick && onTagClick(tag); } }, tag)); })))));
};
//# sourceMappingURL=HeaderChips.js.map