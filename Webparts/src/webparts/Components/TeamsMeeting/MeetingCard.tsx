import React from 'react';
import styles from "./TeamsComponent.module.scss";
import { Meeting } from '../../services/meetingServices/IMeetingProvider';
const outlookIcon: string = require("../../assets/outlook-icon.svg");
// const TeamsIcon: string = require("../../assets/TeamsIcon.png");
const teamsImage: string = require("../../assets/microsoft-teams-image.svg");
const teamsIcon: string = require("../../assets/TeamsIcon.svg")
const getOrganizerAvatar = (event: any): string => {
  return event.avatarUrl || event.organizer?.avatarUrl || "https://i.pravatar.cc/150?img=1";
};

const toFullDayName = (day?: string): string => {
  if (!day) return "";
  const map: Record<string, string> = {
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday",
  };
  return map[day] || day; // if already full or different format, return as-is
};



const fmtTime = (v: any): string => {
  if (!v) return "";

  // If Graph style object { dateTime, timeZone }
  const raw = v?.dateTime ?? v;

  // If already "5:00 pm" type string
  if (typeof raw === "string" && !raw.includes("T")) return raw;

  const d = new Date(raw);
  if (isNaN(d.getTime())) return String(raw);

  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};


export const mapToCardItems = (rows: Meeting[]) =>
  rows.map(m => {
    const startText = fmtTime(m.start);
    const endText = fmtTime(m.end);
    
    console.log('Meeting:', m.subject);
    console.log('Raw start:', m.start, 'Formatted:', startText);
    console.log('Raw end:', m.end, 'Formatted:', endText);

    return {
      id: m.id,
      title: m.subject,
      start: m.start,
      end: m.end,
      location: m.location,
      organizerName: m.organizer,
      description: m.description,
      joinUrl: m.joinUrl,
      avatarUrl: m.avatarUrl,
      time: startText, 
      endTime: endText,
      timeRange: endText ? `${startText} - ${endText}` : startText
    };
  });


// MeetingCard Component
const MeetingCard = ({ event, onJoinClick }: any) => {
   console.log('MeetingCard received event:', event);
  console.log('timeRange:', event.timeRange);
  console.log('time:', event.time);
  console.log('endTime:', event.endTime);
  return (
    <div className={styles.meetingCard}>
      <div className={styles.dateSection}>
        {/* <div className={styles.month}>{event.date?.month}</div> */}
         <div className={styles.day}>{toFullDayName(event.date?.day)}</div>
        <div className={styles.date}>{event.date?.date} {event.date?.month}</div>
      </div>
      {/* <div className={styles.dateSection}>
        <div className={styles.day}>{event.day}</div>
        <div className={styles.date}>{event.date} {event.month}</div>
      </div> */}

      <div className={styles.imageSection}>
        {/* <svg
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
        </svg> */}
        <img src={teamsImage} alt="" />
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.detailsSection}>
          <div className={styles.category}>{event.meetingType}</div>
          <h3 className={styles.title}>{event.title}</h3>
        </div>

        <div className={styles.locationSection}>
          <div className={styles.infoRow}>
              <svg className={styles.icon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.0001 1.66602C5.40841 1.66602 1.66675 5.40768 1.66675 9.99935C1.66675 14.591 5.40841 18.3327 10.0001 18.3327C14.5917 18.3327 18.3334 14.591 18.3334 9.99935C18.3334 5.40768 14.5917 1.66602 10.0001 1.66602ZM13.6251 12.9743C13.5084 13.1743 13.3001 13.2827 13.0834 13.2827C12.9751 13.2827 12.8667 13.2577 12.7667 13.191L10.1834 11.6493C9.54175 11.266 9.06675 10.4243 9.06675 9.68268V6.26602C9.06675 5.92435 9.35008 5.64102 9.69175 5.64102C10.0334 5.64102 10.3167 5.92435 10.3167 6.26602V9.68268C10.3167 9.98268 10.5667 10.4243 10.8251 10.5743L13.4084 12.116C13.7084 12.291 13.8084 12.6743 13.6251 12.9743Z" fill="#DA291C"/>
              </svg>
            <span className={styles.infoText}>{event.timeRange || event.time}</span>
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
            <img src={teamsIcon} alt="TeamsIcon" />
            Join
          </button>
        </div>
      </div>
    </div>
  );
};
export default MeetingCard;