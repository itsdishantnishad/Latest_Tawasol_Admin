import * as React from 'react';
import styles from './Allevents.module.scss';

interface EventCardProps {
  date: string;
  day: string;
  month: string;
  status: 'Upcoming' | 'Registered';
  category: string;
  title: string;
  time: string;
  location: string;
  imageUrl: string;
  eventDateTime: Date; // Full date/time for calculations
}

const EventCard: React.FC<EventCardProps> = ({
  date,
  day,
  month,
  status,
  category,
  title,
  time,
  location,
  imageUrl,
  eventDateTime
}) => {
  const [countdown, setCountdown] = React.useState<string>('');
  const [isPastEvent, setIsPastEvent] = React.useState<boolean>(false);
  const [showRegisterButton, setShowRegisterButton] = React.useState<boolean>(false);

  React.useEffect(() => {
    const calculateStatus = () => {
      const now = new Date();
      const eventTime = new Date(eventDateTime);
      const timeDiff = eventTime.getTime() - now.getTime();

      // Check if event is in the past
      if (timeDiff < 0) {
        setIsPastEvent(true);
        setShowRegisterButton(false);
        return;
      }

      // If event is more than 7 days away, show Register button
      const daysUntilEvent = timeDiff / (1000 * 60 * 60 * 24);
      if (daysUntilEvent > 7) {
        setShowRegisterButton(true);
        setIsPastEvent(false);
        return;
      }

      // Otherwise, show countdown
      setShowRegisterButton(false);
      setIsPastEvent(false);

      // Calculate countdown
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      if (days > 0) {
        setCountdown(`${days} Day${days > 1 ? 's' : ''}`);
      } else if (hours > 0) {
        setCountdown(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      } else {
        setCountdown(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }
    };

    // Calculate immediately
    calculateStatus();

    // Update every second
    const interval = setInterval(calculateStatus, 1000);

    return () => clearInterval(interval);
  }, [eventDateTime]);

  return (
    <div className={`${styles.eventCard} ${isPastEvent ? styles.pastEvent : ''}`}>
      {/* Date Section */}
      <div className={styles.dateSection}>
        <div className={styles.month}>{month}</div>
        <div className={styles.date}>{date}</div>
        <div className={styles.day}>{day}</div>
      </div>

      {/* Image Section */}
      <div className={styles.imageSection}>
        <img 
          src={imageUrl} 
          alt={title}
          className={styles.eventImage}
        />
        {!isPastEvent && (
          <span className={`${styles.statusBadge} ${status === 'Upcoming' ? styles.upcoming : status === 'Registered' ? styles.registered : ''}`}>
            {status}
          </span>
        )}
      </div>

      {/* Event Details Section */}
      <div className={styles.detailsSection}>
        <div className={styles.category}>{category}</div>
        <h3 className={styles.title}>{title}</h3>
        
        <div className={styles.infoRow}>
          <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
            <path strokeWidth="2" d="M12 6v6l4 2"/>
          </svg>
          <span className={styles.infoText}>{time}</span>
        </div>
        
        <div className={styles.infoRow}>
          <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span className={styles.infoText}>{location}</span>
        </div>
      </div>

      {/* Action Section */}
      <div className={styles.actionSection}>
        {isPastEvent ? (
          <div className={styles.pastEventLabel}>Past event</div>
        ) : showRegisterButton ? (
          <button className={styles.registerButton}>
            Register
          </button>
        ) : countdown && (
          <div className={styles.countdownWrapper}>
            <div className={styles.countdownLabel}>Event starts in</div>
            <div className={styles.countdownTime}>{countdown}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;