// import * as React from 'react';
// import styles from './Meeting.module.scss';
// import { MSGraphClientV3 } from '@microsoft/sp-http';

// import { GraphMeetingsProvider } from '../../../services/meetingServices/GraphMeetingsProvider';
// import MeetingCards from '../../../meeting/components/Meeting';

// export interface IMeetingProps {
//   context: any;
//   seeAllURL?: string;
// }

// const mapToMeetingItems = (rows: any[]) =>
//   rows.map((m) => ({
//     id: m.id,
//     title: m.subject,
//     start: m.start,
//     end: m.end,
//     location: m.location,
//     organizerName: m.organizer,
//     description: m.description,
//     joinUrl: m.joinUrl,
//     avatarUrl: m.avatarUrl
//   }));

// const Meeting: React.FC<IMeetingProps> = ({ context, seeAllURL }) => {
//   const [items, setItems] = React.useState<any[]>([]);
//   const [loading, setLoading] = React.useState(true);

//   React.useEffect(() => {
//     let cancelled = false;

//     const load = async () => {
//       try {
//         const graph = (await context.msGraphClientFactory.getClient('3')) as MSGraphClientV3;
//         const provider = new GraphMeetingsProvider(graph);

//         const rows = await provider.getUpcoming(7, 4); 

//         if (!cancelled) {
//           setItems(mapToMeetingItems(rows || [])); 
//         }
//       } catch (e) {
//         console.error('Meeting load failed', e);
//         if (!cancelled) setItems([]);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, [context]);

//   if (loading) {
//     return <div className={styles.meetingContainer}>Loading meetings…</div>;
//   }

//   if (!items.length) {
//     return <div className={styles.meetingContainer}>No upcoming meetings</div>;
//   }

//   return (
//     <div className={styles.meetingContainer}>
//       <MeetingCards
//         items={items}
//         context={context}
//         seeAllURL={seeAllURL}
//       />
//     </div>
//   );
// };

// export default Meeting;


import * as React from 'react';
import styles from './Meeting.module.scss';
import { MSGraphClientV3 } from '@microsoft/sp-http';

import { GraphMeetingsProvider } from '../../../services/meetingServices/GraphMeetingsProvider';
import MeetingCards from '../../../meeting/components/Meeting';

export interface IMeetingProps {
  context: any;
  seeAllURL?: string;
}

// Updated time formatting function
const fmtTime = (v: any): string => {
  if (!v) return "";

  // v is already a string from GraphMeetingsProvider
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);

  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const mapToMeetingItems = (rows: any[]) =>
  rows.map((m) => {
    const startText = fmtTime(m.start);
    const endText = fmtTime(m.end);
    
    console.log('Mapping meeting:', m.subject);
    console.log('Start:', m.start, '→', startText);
    console.log('End:', m.end, '→', endText);
    
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

const Meeting: React.FC<IMeetingProps> = ({ context, seeAllURL }) => {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const graph = (await context.msGraphClientFactory.getClient('3')) as MSGraphClientV3;
        const provider = new GraphMeetingsProvider(graph);

        const rows = await provider.getUpcoming(7, 4); 

        if (!cancelled) {
          setItems(mapToMeetingItems(rows || [])); 
        }
      } catch (e) {
        console.error('Meeting load failed', e);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [context]);

  if (loading) {
    return <div className={styles.meetingContainerErr}>Loading meetings…</div>;
  }

  if (!items.length) {
    return <div className={styles.meetingContainerErr}>No upcoming meetings</div>;
  }

  return (
    <div className={styles.meetingContainer}>
      <MeetingCards
        items={items}
        context={context}
        seeAllURL={seeAllURL}
      />
    </div>
  );
};

export default Meeting;