import * as React from "react";
import styles from "./Allevents.module.scss";
import EventRegistration from "./Registration/RegistrationModal";
import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

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
  ID: number;
  pageUrl: string;
  context?: any;
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
  eventDateTime,
  ID,
  pageUrl,
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
      // countdown text
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
    const i = setInterval(calculate, 1000);
    return () => clearInterval(i);
  }, [eventDateTime, isRegistered]);

  const handleRegisterClick = () => {
    setnewregister(true);
  };
  return (
    <>
      <a href={pageUrl} className={styles.cardLinkWrapper}>
        <div
          className={`${styles.eventCard} ${
            isPastEvent ? styles.pastEvent : ""
          }`}
        >
          <div className={styles.dateSection}>
            <div className={styles.month}>{month}</div>
            <div className={styles.date}>{date}</div>
            <div className={styles.day}>{day}</div>
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

          <div className={styles.detailsSection}>
            <div className={styles.category}>{category}</div>
            <h3 className={styles.title}>{title}</h3>
          </div>

          <div className={styles.locationSection}>
            <div className={styles.infoRow}>
              <svg
                className={styles.icon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="1" />
                <path strokeWidth="1" d="M12 6v6l4 2" />
              </svg>
              <span className={styles.infoText}>{time}</span>
            </div>

            <div className={styles.infoRow}>
              <svg
                className={styles.icon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth="1"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path strokeWidth="1" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className={styles.infoText}>{location}</span>
            </div>
          </div>

          <div className={styles.actionSection}>
            {isPastEvent ? (
              <div className={styles.pastEventLabel}>Past event</div>
            ) : isRegistered ? (
              countdown && (
                <div className={styles.countdownWrapper}>
                  <div className={styles.countdownLabel}>Event starts in</div>
                  <div className={styles.countdownTime}>{countdown}</div>
                </div>
              )
            ) : (
              <button
                type="button"
                className={styles.registerButton}
                onClick={(e) => {
                  e.preventDefault(); // prevent navigating when clicking button
                  handleRegisterClick();
                }}
              >
                Register
              </button>
            )}
          </div>
        </div>
      </a>

      {newregister && (
        <EventRegistration
          isOpen={newregister}
          onDismiss={() => setnewregister(false)}
          context={context}
          eventId={ID}
        />
      )}
    </>
  );
};

export default EventCard;
