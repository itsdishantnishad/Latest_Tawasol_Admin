import * as React from "react";
import styles from "./Allevents.module.scss";

interface EventCardProps {
  date: string;
  day: string;
  month: string;
  category: string;
  status: "Upcoming" | "Registered";
  title: string;
  time: string;
  location: string;
  imageUrl: string;
  eventDateTime: Date | string | null;
  ID: number | string;
  pageUrl: string;

  // Optional flags passed by parent (recommended)
  isRegistered?: boolean;
  isregistered?: boolean;
}

const EventCard: React.FC<EventCardProps> = (props) => {
  const {
    date,
    day,
    month,
    category,
    status,
    title,
    time,
    location,
    imageUrl,
    eventDateTime,
    pageUrl,
  } = props;

  const isRegistered = Boolean(props.isRegistered ?? props.isregistered ?? status === "Registered");

  const [countdown, setCountdown] = React.useState<string>("");
  const [isPastEvent, setIsPastEvent] = React.useState(false);

  React.useEffect(() => {
    const calculate = () => {
      if (!eventDateTime) {
        setIsPastEvent(true);
        setCountdown("");
        return;
      }

      const now = new Date();
      const ev = new Date(eventDateTime);

      if (isNaN(ev.getTime())) {
        setIsPastEvent(true);
        setCountdown("");
        return;
      }

      const diff = ev.getTime() - now.getTime();

      if (diff <= 0) {
        setIsPastEvent(true);
        setCountdown("");
        return;
      }

      setIsPastEvent(false);

      // countdown only needed for registered users
      if (!isRegistered) {
        setCountdown("");
        return;
      }

      const daysRemaining = diff / (1000 * 60 * 60 * 24);
      const days = Math.floor(daysRemaining);
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setCountdown(`${days} Day${days > 1 ? "s" : ""}`);
      } else if (hours > 0) {
        setCountdown(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      } else {
        setCountdown(
          `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }
    };

    calculate();
    const i = window.setInterval(calculate, 1000);
    return () => window.clearInterval(i);
  }, [eventDateTime, isRegistered]);

  const openDetails = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (pageUrl) window.open(pageUrl, "_self");
  };

  return (
    <a href={pageUrl} className={styles.cardLinkWrapper}>
      <div className={`${styles.eventCard} ${isPastEvent ? styles.pastEvent : ""}`}>
        <div className={styles.dateSection}>
          <div className={styles.day}>{day}</div>
          <div className={styles.date}>
            {date} {month}
          </div>
        </div>

        <div className={styles.imageSection}>
          <img src={imageUrl} alt={title} className={styles.eventImage} />

          {!isPastEvent && (
            <span className={`${styles.statusBadge} ${isRegistered ? styles.registered : styles.upcoming}`}>
              {isRegistered ? "Registered" : "Upcoming"}
            </span>
          )}
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.detailsSection}>
            <div className={styles.category}>{category}</div>
            <h3 className={styles.title}>{title}</h3>
          </div>

          <div className={styles.locationSection}>
            <div className={styles.infoRow}>
              <span className={styles.infoText}>{time}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoText}>{location}</span>
            </div>
          </div>

          <div className={styles.actionSection}>
            {isPastEvent ? (
              <div className={styles.pastEventLabel}>Past event</div>
            ) : isRegistered ? (
              <div className={styles.countdownWrapper}>
                <div className={styles.countdownLabel}>Event starts in</div>
                <div className={styles.countdownTime}>{countdown}</div>
              </div>
            ) : (
              <button type="button" className={styles.registerButton} onClick={openDetails}>
                View Details
              </button>
            )}
          </div>
        </div>
      </div>
    </a>
  );
};

export default EventCard;
