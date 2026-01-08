import * as React from "react";
import styles from "./HolidayList.module.scss";

export interface IHolidayListCardProps {
  title?: string;
  subtitle?: string;
  heroUrl?: string;
  month?: string;
  day?: string;
  weekday?: string;
  statusText?: string;
  holidayTitle?: string;
  onViewList?: () => void;
}

export default class HolidayListCard extends React.Component<IHolidayListCardProps> {
  public static defaultProps: Partial<IHolidayListCardProps> = {
    title: "2024 Holiday List",
    subtitle: "View detailed list of upcoming holidays",
    heroUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&fit=crop",
    month: "Aug",
    day: "07",
    weekday: "Monday",
    statusText: "Upcoming",
    holidayTitle: "Prophet Muhammad's Birthday",
  };

  public render(): React.ReactElement<IHolidayListCardProps> {
    const {
      title,
      subtitle,
      heroUrl,
      month,
      day,
      weekday,
      statusText,
      holidayTitle,
      onViewList,
    } = this.props;

    return (
      <section className={styles.card} aria-label="Holiday list">
        <div className={styles.headerBlock}>
          <div className={styles.headerTitle}>{title}</div>
          <div className={styles.headerSub}>{subtitle}</div>
        </div>

        <div className={styles.heroWrap}>
          {heroUrl ? (
            <img className={styles.heroImg} src={heroUrl} alt="" />
          ) : (
            <div className={styles.heroPlaceholder} />
          )}
        </div>

        <div className={styles.row}>
          <div className={styles.dateCard} aria-label={`${month} ${day}, ${weekday}`}>
            <div className={styles.dateMonth}>{month}</div>
            <div className={styles.dateDay}>{day}</div>
            <div className={styles.dateWeek}>{weekday}</div>
          </div>
          <div className={styles.rightCol}>
            <div className={styles.status}>{statusText}</div>
            <div className={styles.holidayTitle}>{holidayTitle}</div>
          </div>
        </div>

        <button type="button" className={styles.cta} onClick={onViewList}>
          <span className={styles.ctaText}>View Holiday List</span>
        </button>
      </section>
    );
  }
}