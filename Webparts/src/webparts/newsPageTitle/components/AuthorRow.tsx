import * as React from "react";
import styles from './NewsPageTitle.module.scss';

export interface IAuthorRowProps {
  authorName: string;
  authorEmail: string;
  readTime: number;
  views: number;
  publishedOn: string; // e.g., "2025-10-06T17:31:03.0000000Z"
}

export default class AuthorRow extends React.Component<IAuthorRowProps> {

  private formatReadTime = (mins: number): string => {
    const m = Math.max(1, Math.trunc(Number(mins) || 0));
    if (m < 60) return `${m} min read`;
    const hours = Math.floor(m / 60);
    const minutes = m % 60;
    if (minutes === 0) return `${hours} hr${hours > 1 ? "s" : ""} read`;
    return `${hours} hr${hours > 1 ? "s" : ""} ${minutes} min read`;
    };

  // Formats the ISO/Zulu string into a readable local datetime, e.g. "06 Oct 2025, 11:01 AM"
  private formatPublished = (dateStr: string): string => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr; // fallback if SharePoint sends something odd
    return new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).format(d);
  };

  public render(): React.ReactElement<IAuthorRowProps> {
    const { authorName, authorEmail, readTime, views, publishedOn } = this.props;

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
          <span className={styles.metaText}>{this.formatReadTime(readTime)}</span>
          <span className={styles.dot} aria-hidden="true">•</span>
          <span className={styles.metaText}>{views} Views</span>
          <span className={styles.dot} aria-hidden="true">•</span>
          <span className={styles.metaText}>{this.formatPublished(publishedOn)}</span>
        </div>
      </div>
    );
  }
}
