import * as React from 'react';
import styles from './TrainingCard.module.scss';

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
          <div className={styles.month}>{startMonth}</div>
          <div className={styles.day}>{startDay}</div>
          <div className={styles.weekday}>{startWeekday}</div>
        </div>

        <div className={styles.dateBox}>
          <div className={styles.month}>{endMonth}</div>
          <div className={styles.day}>{endDay}</div>
          <div className={styles.weekday}>{endWeekday}</div>
        </div>
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
          <svg className={styles.joinIcon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.62 8.45c.3.3.6.68.82 1.13.22.45.33.93.33 1.42 0 .49-.11.97-.33 1.42-.22.45-.52.83-.82 1.13l-3.54 3.54c-.3.3-.68.6-1.13.82-.45.22-.93.33-1.42.33-.49 0-.97-.11-1.42-.33-.45-.22-.83-.52-1.13-.82L9.4 14.6l1.06-1.06 2.59 2.59c.19.19.41.34.65.44.24.1.5.15.76.15.26 0 .52-.05.76-.15.24-.1.46-.25.65-.44l3.54-3.54c.19-.19.34-.41.44-.65.1-.24.15-.5.15-.76 0-.26-.05-.52-.15-.76-.1-.24-.25-.46-.44-.65-.19-.19-.41-.34-.65-.44-.24-.1-.5-.15-.76-.15-.26 0-.52.05-.76.15-.24.1-.46.25-.65.44L14 12.37l-1.06-1.06 3.54-3.54c.3-.3.68-.6 1.13-.82.45-.22.93-.33 1.42-.33.49 0 .97.11 1.42.33.45.22.83.52 1.13.82zM10.6 9.4l-2.59-2.59c-.19-.19-.41-.34-.65-.44-.24-.1-.5-.15-.76-.15-.26 0-.52.05-.76.15-.24.1-.46.25-.65.44L2.65 10.35c-.19.19-.34.41-.44.65-.1.24-.15.5-.15.76 0 .26.05.52.15.76.1.24.25.46.44.65.19.19.41.34.65.44.24.1.5.15.76.15.26 0 .52-.05.76-.15.24-.1.46-.25.65-.44l3.54-3.54 1.06 1.06-3.54 3.54c-.3.3-.68.6-1.13.82-.45.22-.93.33-1.42.33-.49 0-.97-.11-1.42-.33-.45-.22-.83-.52-1.13-.82-.3-.3-.6-.68-.82-1.13C.11 11.97 0 11.49 0 11c0-.49.11-.97.33-1.42.22-.45.52-.83.82-1.13l3.54-3.54c.3-.3.68-.6 1.13-.82.45-.22.93-.33 1.42-.33.49 0 .97.11 1.42.33.45.22.83.52 1.13.82l2.59 2.59-1.06 1.06z"/>
          </svg>
          Join
        </a>
      </div>
    </div>
    </a>
  );
};

export default TrainingCard;