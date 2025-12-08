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
          {/* <div className={styles.cardContent}></div> */}
          <h3 className={styles.eventTitle}>
            {event.title}
            <svg className={styles.arrow} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </h3>
          <div className={styles.cardFooter}>
            <span className={styles.imageCount}>{event.imageCount} images</span>
            <span className={styles.eventDate}>{event.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
