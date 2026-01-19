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
            <div className={styles.day}>{day}</div>
            <div className={styles.date}>{date} {month}</div>
            {/* <div className={styles.month}></div> */}
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

            <div className={styles.locationSection}>
              <div className={styles.infoRow}>
                <svg className={styles.icon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.0001 1.66602C5.40841 1.66602 1.66675 5.40768 1.66675 9.99935C1.66675 14.591 5.40841 18.3327 10.0001 18.3327C14.5917 18.3327 18.3334 14.591 18.3334 9.99935C18.3334 5.40768 14.5917 1.66602 10.0001 1.66602ZM13.6251 12.9743C13.5084 13.1743 13.3001 13.2827 13.0834 13.2827C12.9751 13.2827 12.8667 13.2577 12.7667 13.191L10.1834 11.6493C9.54175 11.266 9.06675 10.4243 9.06675 9.68268V6.26602C9.06675 5.92435 9.35008 5.64102 9.69175 5.64102C10.0334 5.64102 10.3167 5.92435 10.3167 6.26602V9.68268C10.3167 9.98268 10.5667 10.4243 10.8251 10.5743L13.4084 12.116C13.7084 12.291 13.8084 12.6743 13.6251 12.9743Z" fill="#DA291C"/>
                </svg>

                <span className={styles.infoText}>{time}</span>
              </div>

              <div className={styles.infoRow}>
                <svg className={styles.icon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_25344_30036)">
                  <path d="M17.1834 7.04232C16.3084 3.19232 12.9501 1.45898 10.0001 1.45898C10.0001 1.45898 10.0001 1.45898 9.99175 1.45898C7.05008 1.45898 3.68341 3.18398 2.80841 7.03398C1.83341 11.334 4.46675 14.9757 6.85008 17.2673C7.73341 18.1173 8.86675 18.5423 10.0001 18.5423C11.1334 18.5423 12.2667 18.1173 13.1417 17.2673C15.5251 14.9757 18.1584 11.3423 17.1834 7.04232ZM10.0001 11.2173C8.55008 11.2173 7.37508 10.0423 7.37508 8.59232C7.37508 7.14232 8.55008 5.96732 10.0001 5.96732C11.4501 5.96732 12.6251 7.14232 12.6251 8.59232C12.6251 10.0423 11.4501 11.2173 10.0001 11.2173Z" fill="#DA291C"/>
                  </g>
                  <defs>
                  <clipPath id="clip0_25344_30036">
                  <rect width="20" height="20" fill="white"/>
                  </clipPath>
                  </defs>
                </svg>

                {/* <svg
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
                </svg> */}
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
                  View Details
                </button>
              )}
            </div>
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
