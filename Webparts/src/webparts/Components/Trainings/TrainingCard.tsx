import * as React from 'react';
import styles from './TrainingCard.module.scss';
const outlookIcon: string = require("../../assets/outlook-icon.svg");
export interface TrainingCardProps {
  startDate: string;
  endDate: string;
  category: string;
  title: string;
  subtitle: string;
  time: string;
  duration: string;
  location: string;
  imageUrl: string;
  isRegistered: boolean;
  joinUrl: string;
  pageUrl: string;
}

const TrainingCard: React.FC<TrainingCardProps> = ({
  startDate,
  endDate,
  category,
  title,
  subtitle,
  time,
  duration,
  location,
  imageUrl,
  isRegistered,
  joinUrl,
  pageUrl
}) => {
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  const startMonth = startDateObj.toLocaleDateString('en-US', { month: 'short' });
  const startDay = startDateObj.getDate().toString().padStart(2, '0');
  const startWeekday = startDateObj.toLocaleDateString('en-US', { weekday: 'long' });

  const endMonth = endDateObj.toLocaleDateString('en-US', { month: 'short' });
  const endDay = endDateObj.getDate().toString().padStart(2, '0');
  const endWeekday = endDateObj.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <a href={pageUrl} className={styles.cardLinkWrapper}>
    <div className={styles.cardContainer}>
      <div className={styles.dateSection}>
        <div className={styles.dateBox}>
          <div className={styles.month}>{startWeekday} - {endWeekday}</div>
          <div className={styles.day}>{startDay} - {endDay} {startMonth}</div>
          {/* <div className={styles.weekday}>{startWeekday}</div> */}
        </div>

        {/* <div className={styles.dateBox}>
          <div className={styles.month}>{endMonth}</div>
          <div className={styles.day}>{endDay}</div>
          <div className={styles.weekday}>{endWeekday}</div>
        </div> */}
      </div>

      <div className={styles.imageSection}>
        <img
          src={imageUrl}
          alt={title}
          className={styles.image}
        />
        {isRegistered && (
          <div className={styles.registeredTag}>
            Registered
          </div>
        )}
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.detailsSection}>
          <div className={styles.category}>{category}</div>
          <h3 className={styles.title}>{title}</h3>
          {/* <p className={styles.subtitle}>{subtitle}</p> */}
        </div>

        <div className={styles.metaSection}>
          <div className={styles.metaItem}>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
            <span>{time} | {duration}</span>
          </div>
          <div className={styles.metaItem}>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>{location}</span>
          </div>
        </div>

        <a
          href={joinUrl}
          className={styles.joinButton}
        >
          <img src={outlookIcon} alt="Outlook" />
          Join
        </a>
      </div>
    </div>
    </a>
  );
};

export default TrainingCard;