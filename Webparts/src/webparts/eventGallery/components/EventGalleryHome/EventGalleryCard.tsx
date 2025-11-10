import * as React from 'react';
import styles from '../EventGallery.module.scss';

interface IEventItem {
  id: number;
  title: string;
  imageUrl: string;
  imageCount: number;
  date: string;
}

interface IEventCardProps {
  event: IEventItem;
  onClick: (event: IEventItem) => void;
}

const EventCard: React.FC<IEventCardProps> = ({ event, onClick }) => {
  return (
    <div 
      className={styles.eventCard}
      onClick={() => onClick(event)}
    >
      <div className={styles.imageContainer}>
        <img src={event?.imageUrl} alt={event.title} />
        <div className={styles.overlay}>
          <div className={styles.cardContent}>
            <h3 className={styles.eventTitle}>
              {event.title}
              <span className={styles.arrow}>›</span>
            </h3>
            <div className={styles.cardFooter}>
              <span className={styles.imageCount}>{event.imageCount} images</span>
              <span className={styles.eventDate}>{event.date}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
