import React from 'react';
import styles from "./TeamsComponent.module.scss";

const outlookIcon: string = require("../../assets/outlook-icon.svg");
const TeamsIcon: string = require("../../assets/TeamsIcon.png");
// MeetingCard Component
const MeetingCard = ({ event, onJoinClick }:any) => {
  return (
    <div className={styles.meetingCard}>
      {/* <div className={styles.dateSection}>
        <div className={styles.month}>{event.date?.month}</div>
        <div className={styles.date}>{event.date?.date}</div>
        <div className={styles.day}>{event.date?.day}</div>
      </div> */}
      <div className={styles.dateSection}>
            <div className={styles.day}>{event.day}</div>
            <div className={styles.date}>{event.date} {event.month}</div>
            {/* <div className={styles.month}></div> */}
          </div>

      <div className={styles.imageSection}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          width="190"
          height="108"
          viewBox="0 0 190 108"
          fill="none"
        >
          <rect width="190" height="108" rx="8" fill="#EEF8FD" />
          <rect
            x="65"
            y="24"
            width="60"
            height="60"
            fill="url(#pattern0_25878_43849)"
          />
          <defs>
            <pattern
              id="pattern0_25878_43849"
              patternContentUnits="objectBoundingBox"
              width="1"
              height="1"
            >
              <use
                xlinkHref="#image0_25878_43849"
                transform="scale(0.0025)"
              />
            </pattern>

            <image
              id="image0_25878_43849"
              width="400"
              height="400"
              preserveAspectRatio="none"
              xlinkHref={TeamsIcon}  />
          </defs>
        </svg>
      </div>

      <div className={styles.detailsSection}>
        <div className={styles.category}>{event.meetingType}</div>
        <h3 className={styles.title}>{event.title}</h3>
      </div>

      <div className={styles.locationSection}>
        <div className={styles.infoRow}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M9.99935 1.66797C5.40768 1.66797 1.66602 5.40964 1.66602 10.0013C1.66602 14.593 5.40768 18.3346 9.99935 18.3346C14.591 18.3346 18.3327 14.593 18.3327 10.0013C18.3327 5.40964 14.591 1.66797 9.99935 1.66797ZM13.6243 12.9763C13.5077 13.1763 13.2993 13.2846 13.0827 13.2846C12.9743 13.2846 12.866 13.2596 12.766 13.193L10.1827 11.6513C9.54102 11.268 9.06602 10.4263 9.06602 9.68464V6.26797C9.06602 5.9263 9.34935 5.64297 9.69102 5.64297C10.0327 5.64297 10.316 5.9263 10.316 6.26797V9.68464C10.316 9.98464 10.566 10.4263 10.8243 10.5763L13.4077 12.118C13.7077 12.293 13.8077 12.6763 13.6243 12.9763Z"
              fill="#DA291C"
            />
          </svg>
          <span className={styles.infoText}>{event.time}</span>
        </div>

        <div className={styles.infoRow}>
         <img 
            src={"https://i.pravatar.cc/150?img=1"} 
            alt={event.organizer.name} 
            className={styles.instructorImage}
          />
          <span className={styles.infoText}>
            {event.organizer.name}
          </span>
        </div>
      </div>

      <div className={styles.actionSection}>
        <button
          type="button"
          className={styles.registerButton}
          onClick={() => onJoinClick(event)}
        >
          <img src={outlookIcon} alt="Outlook" />
          Join
        </button>
      </div>
    </div>
  );
};
export default MeetingCard;