import React from 'react';
import styles from "./TeamsComponent.module.scss";

const outlookIcon: string = require("../../assets/outlook-icon.svg");
const TeamsIcon: string = require("../../assets/TeamsIcon.png");

const getOrganizerAvatar = (event: any): string => {
  return event.avatarUrl || event.organizer?.avatarUrl || "https://i.pravatar.cc/150?img=1";
};

// MeetingCard Component
const MeetingCard = ({ event, onJoinClick }: any) => {
  return (
    <div className={styles.meetingCard}>
      <div className={styles.dateSection}>
        {/* <div className={styles.month}>{event.date?.month}</div> */}
        <div className={styles.day}>{event.date?.day}</div>
        <div className={styles.date}>{event.date?.date} {event.date?.month}</div>
      </div>
      {/* <div className={styles.dateSection}>
        <div className={styles.day}>{event.day}</div>
        <div className={styles.date}>{event.date} {event.month}</div>
      </div> */}

      <div className={styles.imageSection}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          width="250"
          height="125"
          viewBox="0 0 250 125"
          fill="none"
        >
          <rect width="250" height="125" rx="8" fill="#EEF8FD" />
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
              xlinkHref={TeamsIcon} />
          </defs>
        </svg>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.detailsSection}>
          <div className={styles.category}>{event.meetingType}</div>
          <h3 className={styles.title}>{event.title}</h3>
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
            <span className={styles.infoText}>{event.time}</span>
          </div>

          <div className={styles.infoRow}>
            <img
              src={getOrganizerAvatar(event)}
              alt={event.organizer?.name || 'Organizer'}
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
    </div>
  );
};
export default MeetingCard;