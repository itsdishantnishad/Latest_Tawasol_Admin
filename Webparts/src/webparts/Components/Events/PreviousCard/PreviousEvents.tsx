import * as React from 'react';
import styles from './PreviousEvents.module.scss';

interface PreviousEventCardProps {
  title: string;
  imageCount: number;
  date: string;
  imageUrl: string;
  sitepageurl?: string;
}

const PreviousEventCard: React.FC<PreviousEventCardProps> = ({
  title,
  imageCount,
  date,
  imageUrl,
  sitepageurl
}) => {

  // Replace spaces with hyphens
  const formattedTitle = title.replace(/\s+/g, '-');

  const finalUrl = sitepageurl ? `${sitepageurl}${formattedTitle}.aspx` : "#";

  return (
    <a 
      href={finalUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={styles.previousEventCard}>
        <div className={styles.imageWrapper}>
          <img src={imageUrl} alt={title} className={styles.eventImage} />
          <div className={styles.overlay}>
            <h3 className={styles.eventTitle}>
              {title}
              <svg className={styles.arrowIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </h3>
            <div className={styles.eventFooter}>
              <span className={styles.imageCount}>{imageCount} images</span>
              <span className={styles.eventDate}>{date}</span>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
};

export default PreviousEventCard;
