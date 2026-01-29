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

  const isRegistered = Boolean(
    props.isRegistered ?? props.isregistered ?? status === "Registered"
  );

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

      const daysRemaining = diff / (1000 * 60 * 60 * 24);
      const days = Math.floor(daysRemaining);
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
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
          `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
      }
    };

    calculate();
    const i = window.setInterval(calculate, 1000);
    return () => window.clearInterval(i);
  }, [eventDateTime]);

  const openDetails = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (pageUrl) window.open(pageUrl, "_self");
  };

  return (
    <a href={pageUrl} className={styles.cardLinkWrapper}>
      <div
        className={`${styles.eventCard} ${
          isPastEvent ? styles.pastEvent : ""
        }`}
      >
        <div className={styles.dateSection}>
          <div className={styles.day}>{day}</div>
          <div className={styles.date}>
            {date} {month}
          </div>
        </div>

        <div className={styles.imageSection}>
          <img src={imageUrl} alt={title} className={styles.eventImage} />

          {!isPastEvent && (
            <span
              className={`${styles.statusBadge} ${
                isRegistered ? styles.registered : styles.upcoming
              }`}
            >
              {isRegistered ? "Registered" : "Upcoming"}
            </span>
          )}
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.detailsSection}>
            <div className={styles.category}>{category}</div>
            <h3 className={styles.title}>{title}</h3>
          </div>

          {/* ✅ ADDED: same red icons as Training cards */}
          <div className={styles.locationSection}>
            <div className={styles.infoRow}>
              {/* Clock icon */}
              <svg
                className={styles.icon}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M10.0001 1.66602C5.40841 1.66602 1.66675 5.40768 1.66675 9.99935C1.66675 14.591 5.40841 18.3327 10.0001 18.3327C14.5917 18.3327 18.3334 14.591 18.3334 9.99935C18.3334 5.40768 14.5917 1.66602 10.0001 1.66602ZM13.6251 12.9743C13.5084 13.1743 13.3001 13.2827 13.0834 13.2827C12.9751 13.2827 12.8667 13.2577 12.7667 13.191L10.1834 11.6493C9.54175 11.266 9.06675 10.4243 9.06675 9.68268V6.26602C9.06675 5.92435 9.35008 5.64102 9.69175 5.64102C10.0334 5.64102 10.3167 5.92435 10.3167 6.26602V9.68268C10.3167 9.98268 10.5667 10.4243 10.8251 10.5743L13.4084 12.116C13.7084 12.291 13.8084 12.6743 13.6251 12.9743Z"
                  fill="#DA291C"
                />
              </svg>

              <span className={styles.infoText}>{time}</span>
            </div>

            <div className={styles.infoRow}>
              {/* Location icon */}
              <svg
                className={styles.icon}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                <g clipPath="url(#clip0_loc)">
                  <path
                    d="M17.1834 7.04232C16.3084 3.19232 12.9501 1.45898 10.0001 1.45898C10.0001 1.45898 10.0001 1.45898 9.99175 1.45898C7.05008 1.45898 3.68341 3.18398 2.80841 7.03398C1.83341 11.334 4.46675 14.9757 6.85008 17.2673C7.73341 18.1173 8.86675 18.5423 10.0001 18.5423C11.1334 18.5423 12.2667 18.1173 13.1417 17.2673C15.5251 14.9757 18.1584 11.3423 17.1834 7.04232ZM10.0001 11.2173C8.55008 11.2173 7.37508 10.0423 7.37508 8.59232C7.37508 7.14232 8.55008 5.96732 10.0001 5.96732C11.4501 5.96732 12.6251 7.14232 12.6251 8.59232C12.6251 10.0423 11.4501 11.2173 10.0001 11.2173Z"
                    fill="#DA291C"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_loc">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>

              <span className={styles.infoText}>{location}</span>
            </div>
          </div>

          <div className={styles.actionSection}>
            {isPastEvent ? (
              <div className={styles.pastEventLabel}>Past event</div>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.registerButton}
                  onClick={openDetails}
                >
                  View Details
                </button>

                {countdown ? (
                  <div className={styles.countdownWrapper}>
                    <span className={styles.countdownLabel}>
                      Event starts in
                    </span>
                    <span className={styles.countdownTime}>{countdown}</span>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </a>
  );
};

export default EventCard;
