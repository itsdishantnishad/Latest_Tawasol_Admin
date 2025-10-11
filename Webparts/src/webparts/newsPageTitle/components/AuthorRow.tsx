import * as React from "react";
import styles from './NewsPageTitle.module.scss';

export const AuthorRow: React.FC<{
  authorName: string;
  authorEmail: string;
  readTime: number;
  views: number;
  publishedOn: string; // already "05 Oct 2025 11:23 AM"
}> = ({ authorName, authorEmail, readTime, views, publishedOn }) => {
  const formatReadTime = (mins: number): string => {
    const m = Math.max(1, Math.trunc(Number(mins) || 0)); // coerce & clamp
    if (m < 60) return `${m} min read`;
    const hours = Math.floor(m / 60);
    const minutes = m % 60;
    if (minutes === 0) return `${hours} hr${hours > 1 ? "s" : ""} read`;
    return `${hours} hr${hours > 1 ? "s" : ""} ${minutes} min read`;
  };

  return (
    <div className={styles.authorRow}>
      {/* LEFT: Author Section */}
      <div className={styles.leftSection}>
        <img
          className={styles.avatar}
          src={`/_layouts/15/userphoto.aspx?size=S&accountname=${encodeURIComponent(authorEmail || authorName)}`}
          alt={authorName}
          loading="lazy"
        />
        <span className={styles.author}>{authorName}</span>
      </div>

      {/* RIGHT: Meta Section */}
      <div className={styles.rightSection}>
        <span className={styles.metaText}>{formatReadTime(readTime)}</span>
        <span className={styles.dot}>•</span>
        <span className={styles.metaText}>{views} Views</span>
        <span className={styles.dot}>•</span>
        <span className={styles.metaText}>{publishedOn}</span>
      </div>
    </div>
  );
};
