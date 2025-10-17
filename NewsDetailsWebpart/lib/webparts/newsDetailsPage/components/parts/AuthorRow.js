// import * as React from "react";
// import styles from "../../styles/NewsDetails.module.scss";
// export const AuthorRow: React.FC<{
//   authorName: string;
//   authorEmail: string;
//   readTime: number;
//   views: number;
//   publishedOn: string; // already "05 Oct 2025 11:23 AM"
// }> = ({ authorName, authorEmail, readTime, views, publishedOn }) => {
//   const formatReadTime = (mins: number): string => {
//     if (!mins || mins <= 0) return "1 min read";
//     if (mins < 60) return `${mins} min read`;
//     const hours = Math.floor(mins / 60);
//     const minutes = mins % 60;
//     if (minutes === 0) return `${hours} hr${hours > 1 ? "s" : ""} read`;
//     return `${hours} hr${hours > 1 ? "s" : ""} ${minutes} min read`;
//   };
//   return (
//     <div className={styles.authorRow}>
//       {/* LEFT: Author Section */}
//       <div className={styles.leftSection}>
//         <img
//           className={styles.avatar}
//           src={`/_layouts/15/userphoto.aspx?size=S&accountname=${encodeURIComponent(authorEmail || authorName)}`}
//           alt={authorName}
//           loading="lazy"
//         />
//         <span className={styles.author}>{authorName}</span>
//       </div>
//       {/* RIGHT: Meta Section */}
//       <div className={styles.rightSection}>
//         <span className={styles.metaText}>{formatReadTime(readTime)}</span>
//         <span className={styles.dot}>•</span>
//         <span className={styles.metaText}>{views} Views</span>
//         <span className={styles.dot}>•</span>
//         <span className={styles.metaText}>{publishedOn}</span>
//       </div>
//     </div>
//   );
// };
// ====================================================================================================================================
import * as React from "react";
import styles from "../../styles/NewsDetails.module.scss";
export var AuthorRow = function (_a) {
    var authorName = _a.authorName, authorEmail = _a.authorEmail, readTime = _a.readTime, views = _a.views, publishedOn = _a.publishedOn;
    var formatReadTime = function (mins) {
        var m = Math.max(1, Math.trunc(Number(mins) || 0)); // coerce & clamp
        if (m < 60)
            return "".concat(m, " min read");
        var hours = Math.floor(m / 60);
        var minutes = m % 60;
        if (minutes === 0)
            return "".concat(hours, " hr").concat(hours > 1 ? "s" : "", " read");
        return "".concat(hours, " hr").concat(hours > 1 ? "s" : "", " ").concat(minutes, " min read");
    };
    return (React.createElement("div", { className: styles.authorRow },
        React.createElement("div", { className: styles.leftSection },
            React.createElement("img", { className: styles.avatar, src: "/_layouts/15/userphoto.aspx?size=S&accountname=".concat(encodeURIComponent(authorEmail || authorName)), alt: authorName, loading: "lazy" }),
            React.createElement("span", { className: styles.author }, authorName)),
        React.createElement("div", { className: styles.rightSection },
            React.createElement("span", { className: styles.metaText }, formatReadTime(readTime)),
            React.createElement("span", { className: styles.dot }, "\u2022"),
            React.createElement("span", { className: styles.metaText },
                views,
                " Views"),
            React.createElement("span", { className: styles.dot }, "\u2022"),
            React.createElement("span", { className: styles.metaText }, publishedOn))));
};
//# sourceMappingURL=AuthorRow.js.map