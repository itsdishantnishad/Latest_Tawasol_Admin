// import * as React from 'react';
// import styles from './Meeting.module.scss';
// // import leftHeadingLine from "../images/leftArrow.svg"
// // import rightHeadingLine from "../images/rightArrow.svg"
// const leftHeadingLine: string = require("../images/leftArrow.svg");
// const rightHeadingLine: string = require("../images/rightArrow.svg");

// export interface IMeeting {
//   id: string;
//   title: string;
//   date: string;
//   time: string;
//   location: string;
//   isFeatured?: boolean;
// }

// export interface IMeetingProps {
//   meetings?: IMeeting[];
//   onViewAll?: () => void;
//   seeAllURL?: string;
//   // If you want strict typing, you can use WebPartContext from '@microsoft/sp-webpart-base'
//   // context: WebPartContext;
//   context: any;
// }

// const defaultMeetings: IMeeting[] = [
//   {
//     id: '1',
//     title: 'Weekly project update',
//     date: 'Today, 03:00 PM',
//     time: '03:00 PM',
//     location: '11th Floor, Vision Tower'
//   },
//   {
//     id: '2',
//     title: 'Daily Stand-up meeting',
//     date: '23 Aug, 01:00 PM',
//     time: '01:00 PM',
//     location: '11th Floor, Vision Tower'
//   },
//   {
//     id: '3',
//     title: 'All hands meeting',
//     date: '24 Aug, 03:00 PM',
//     time: '03:00 PM',
//     location: '11th Floor, Vision Tower',
//     isFeatured: true
//   },
//   {
//     id: '4',
//     title: 'Daily Stand-up meeting',
//     date: '23 Aug, 01:00 PM',
//     time: '01:00 PM',
//     location: '11th Floor, Vision Tower'
//   },
//   {
//     id: '5',
//     title: 'Weekly project update',
//     date: 'Today, 03:00 PM',
//     time: '03:00 PM',
//     location: '11th Floor, Vision Tower'
//   },
// ];

// export const Meeting: React.FC<IMeetingProps> = (props) => {
//   const meetings = props.meetings || defaultMeetings;

//   // --- DYNAMIC VIEW-ALL URL WITH DEFAULT ---
//   const webUrl: string = props.context.pageContext.web.absoluteUrl.replace(/\/$/, "");
//   const origin: string = new URL(webUrl).origin;

//   const viewAllHref = React.useMemo(() => {
//     const configured = (props.seeAllURL || "").trim();

//     // If nothing configured, default to a page in the current site:
//     //   /sites/ThisSite/SitePages/Meetings.aspx
//     // change the file name if your actual meetings page is different
//     const raw = configured || "SitePages/Events-And-Trainings.aspx";

//     // Absolute URL from anywhere -> keep its path but move to current tenant
//     if (/^https?:\/\//i.test(raw)) {
//       try {
//         const parsed = new URL(raw);
//         return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
//       } catch {
//         return raw;
//       }
//     }

//     // Root-relative (/sites/YourSite/SitePages/Page.aspx)
//     if (raw.startsWith("/")) {
//       return `${origin}${raw}`;
//     }

//     // Web-relative (SitePages/Page.aspx)
//     return `${webUrl}/${raw}`;
//   }, [props.seeAllURL, webUrl, origin]);
//   // --- END ---

//   return (
//     <div className={styles.meetingContainer}>
//       {/* Carousel */}
//       <div className={styles.carouselContainer}>
//         <div className={styles.carousel}>
//           {meetings.map((meeting, index) => {
//             // const [currentIndex] = React.useState(2);
//             // const offset = index - currentIndex;
//             const offset = index - 0;
//             const isActive = true;

//             return (
//               <div
//                 key={meeting.id}
//                 className={`${styles.meetingCard} ${isActive ? styles.active : ''}`}
//                 style={{
//                   transform: `translateX(${offset * 320}px) scale(${isActive ? 1 : 0.85})`,
//                   opacity: Math.abs(offset) > 2 ? 0 : isActive ? 1 : 0.5,
//                   zIndex: isActive ? 10 : 5 - Math.abs(offset),
//                 }}
//               >
//                 <div className={styles.cardHeader}>
//                   <div className={styles.dateTime}>
//                     <div className={styles.date}>{meeting.date.split(',')[0]}</div>
//                     <div className={styles.time}>{meeting.time}</div>
//                   </div>
//                   <div className={styles.location}>{meeting.location}</div>
//                 </div>
//                 <div className={styles.cardBody}>
//                   <h3 className={styles.meetingTitle}>{meeting.title}</h3>
//                   <button className={styles.joinButton}>Join</button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* View All Button */}
//       <div className={styles.buttonContainer}>
//         {/* <button className={styles.viewAllButton} onClick={props.onViewAll}>
//           View All
//         </button> */}
//         <a href={viewAllHref} className={styles.viewAllButton}>
//           View All
//         </a>
//       </div>
//     </div>
//   );
// };

// export default Meeting;














import * as React from 'react';
import styles from './Meeting.module.scss';

export interface IMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  isFeatured?: boolean;
}

export interface IMeetingProps {
  meetings?: IMeeting[]; // still kept so parent props won't break
  onViewAll?: () => void;
  seeAllURL?: string;
  
  context: any; // (ideally WebPartContext)
}

// SVGs are in: src/webparts/Components/FeatureContent/assets
const meetingImg30: string = require('../assets/30.svg');
const meetingImg31: string = require('../assets/31.svg');
const meetingImg32: string = require('../assets/32.svg');
const meetingImg33: string = require('../assets/33.svg');

export const Meeting: React.FC<IMeetingProps> = (props) => {
  const images: string[] = [meetingImg30, meetingImg31, meetingImg32, meetingImg33];

  // ===== VIEW ALL FUNCTIONALITY (same as tumhara purana logic) =====
  const webUrl: string = props.context.pageContext.web.absoluteUrl.replace(/\/$/, "");
  const origin: string = new URL(webUrl).origin;

  const viewAllHref = React.useMemo(() => {
    const configured = (props.seeAllURL || "").trim();

    const raw = configured || "SitePages/Events-And-Trainings.aspx";

 
    if (/^https?:\/\//i.test(raw)) {
      try {
        const parsed = new URL(raw);
        return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        return raw;
      }
    }

    
    if (raw.startsWith("/")) {
      return `${origin}${raw}`;
    }

    // Web-relative (SitePages/Page.aspx)
    return `${webUrl}/${raw}`;
  }, [props.seeAllURL, webUrl, origin]);
  // ================================================================

  return (
    <div className={styles.meetingContainer}>
      {/* Just show 4 SVG images */}
      <div className={styles.imageGrid}>
        {images.map((src, index) => (
          <div key={index} className={styles.imageWrapper}>
            <img
              src={src}
              alt={`Meeting illustration ${index + 1}`}
              className={styles.meetingImage}
            />
          </div>
        ))}
      </div>

      {/* View All Button (uses dynamic viewAllHref) */}
      <div className={styles.buttonContainer}>
        <a href={viewAllHref} className={styles.viewAllButton}>
          View All
        </a>
      </div>
    </div>
  );
};

export default Meeting;
