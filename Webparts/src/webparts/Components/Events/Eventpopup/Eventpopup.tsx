import * as React from "react";
import styles from "./EventPopup.module.scss";
import EventRegistration from "../Registration/RegistrationModal";
import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

interface EventPopupProps {
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
  ID: number;
  context?: any;
}

const EventPopup: React.FC<EventPopupProps> = ({
  date,
  day,
  month,
  status,
  category,
  title,
  time,
  location,
  imageUrl,
  eventDateTime,
  ID,
  context,
}) => {
  const [countdown, setCountdown] = React.useState<string>("");
  const [isPastEvent, setIsPastEvent] = React.useState(false);
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [newregister, setnewregister] = React.useState(false);

  const sp: SPFI = React.useMemo(() => spfi().using(SPFx(context)), [context]);

  const userEmail = context?.pageContext?.user?.loginName;

  // fetch & check if user registered this event
  React.useEffect(() => {
    const callCheck = async () => {
      try {
        const regItems: any[] = await sp.web.lists
          .getByTitle("Registered User Event")
          .items.select("*", "Author/EMail")
          .expand("Author")();

        const userRow = regItems.find(
          (r) => r.Author?.EMail?.toLowerCase() === userEmail.toLowerCase()
        );

        if (userRow?.TIRRegisteredUsers) {
          const arr = userRow.TIRRegisteredUsers.split(",").map((x: any) =>
            x.trim()
          );
          setIsRegistered(arr.some((v: any) => v.includes(String(ID))));
        } else {
          setIsRegistered(false);
        }
      } catch (err) {
        console.error("register check error", err);
        setIsRegistered(false);
      }
    };

    if (userEmail && ID) callCheck();
  }, [userEmail, ID]);

  // time status logic
  React.useEffect(() => {
    const calculate = () => {
      if (!eventDateTime) {
        setIsPastEvent(true);
        return;
      }

      const now = new Date();
      const ev = new Date(eventDateTime);
      const diff = ev.getTime() - now.getTime();

      if (diff <= 0) {
        setIsPastEvent(true);
        return;
      }

      setIsPastEvent(false);

      const daysRemaining = diff / (1000 * 60 * 60 * 24);
      const days = Math.floor(daysRemaining);
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setCountdown(`${days} Day${days > 1 ? "s" : ""}`);
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m`);
      } else {
        setCountdown(`${minutes}m`);
      }
    };

    calculate();
    const i = setInterval(calculate, 1000);
    return () => clearInterval(i);
  }, [eventDateTime, isRegistered]);

  const handleRegisterClick = () => {
    setnewregister(true);
  };

  return (
    <div className={`${styles.eventCardNew} ${isPastEvent ? styles.pastEvent : ""}`}>
      {/* Image Section with rounded top corners */}
      <div className={styles.imageContainer}>
        <img src={imageUrl} alt={title} className={styles.eventImage} />
        
        {/* Status Badge */}
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

      {/* Content Section */}
      <div className={styles.cardContent}>
        {/* Category */}
        <div className={styles.categoryTag}>{category}</div>

        {/* Title */}
        <h3 className={styles.eventTitle}>{title}</h3>

        {/* Time Info */}
        <div className={styles.infoRow}>
          <svg
            className={styles.icon}
            fill="currentColor"
            viewBox="0 0 24 24"
            width="16"
            height="16"
          >
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          <span className={styles.infoText}>{time}</span>
          <span className={styles.dateBadge}>
            {date} {month.substring(0, 3).toUpperCase()}
          </span>
        </div>

        {/* Location Info */}
        <div className={styles.infoRow}>
          <svg
            className={styles.icon}
            fill="currentColor"
            viewBox="0 0 24 24"
            width="16"
            height="16"
          >
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
              fill="currentColor"
            />
          </svg>
          <span className={styles.infoText}>{location}</span>
        </div>

        {/* Action Button */}
        <div className={styles.actionSection}>
          {isPastEvent ? (
            <div className={styles.pastEventLabel}>Past event</div>
          ) : isRegistered ? (
            <div className={styles.countdownSection}>
              <div className={styles.countdownText}>
                Event starts in <span className={styles.countdownHighlight}>{countdown}</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className={styles.viewDetailsButton}
              onClick={handleRegisterClick}
            >
              View Details
            </button>
          )}
        </div>
      </div>

      {newregister && (
        <EventRegistration
          isOpen={newregister}
          onDismiss={() => setnewregister(false)}
          context={context}
          eventId={ID}
        />
      )}
    </div>
  );
};

export default EventPopup;