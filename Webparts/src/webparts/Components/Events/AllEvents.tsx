import * as React from "react";
import moment from "moment";
import styles from "./Allevents.module.scss";
import EventCard from "./EventCard";
import PreviousEventCard from "./PreviousCard/PreviousEvents";
import CalendarViewComponent from "./Calendarview/CalendarView";

import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export interface IAlleventsProps {
  AllEventItems: any;
  context?: any;
  viewtype?: string; // "list" or "calendar"
}

const uniqNums = (arr: number[]) =>
  Array.from(new Set(arr.filter((n) => Number.isFinite(n) && n > 0)));

const parseNumericIdList = (raw: any): number[] => {
  const text = String(raw || "");
  const tokens = text
    .split(/[,;\n\r]+/g)
    .map((t) => t.trim())
    .filter(Boolean);

  const ids = tokens
    .filter((t) => /^\d+$/.test(t))
    .map((t) => parseInt(t, 10));

  return uniqNums(ids);
};

// ✅ MAIN parsing formats (SharePoint Search can return different date strings)
const parseSPDate = (value: any): Date | null => {
  if (!value) return null;

  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  // Graph style { dateTime, timeZone } (safe if ever passed here)
  if (typeof value === "object" && value?.dateTime) {
    const d = new Date(String(value.dateTime));
    return isNaN(d.getTime()) ? null : d;
  }

  const raw = String(value || "").split("\n")[0].trim();
  if (!raw) return null;

  // try native Date first (handles ISO)
  const d1 = new Date(raw);
  if (!isNaN(d1.getTime())) return d1;

  // then moment (non-strict to support SP search formats)
  const m = moment(
    raw,
    [
      moment.ISO_8601,
      "DD/MM/YYYY",
      "DD/MM/YYYY HH:mm",
      "DD/MM/YYYY HH:mm:ss",
      "DD/MM/YYYY hh:mm A",
      "MM/DD/YYYY",
      "MM/DD/YYYY HH:mm",
      "MM/DD/YYYY hh:mm A",
      "YYYY-MM-DD HH:mm:ss",
    ],
    false
  );

  return m.isValid() ? m.toDate() : null;
};

const AllEvents: React.FC<IAlleventsProps> = (props) => {
  const now = new Date();
  const [activeTab, setActiveTab] = React.useState<"all" | "my">("all");
  const [showAllPrevious, setShowAllPrevious] = React.useState(false);

  const sp: SPFI | null = React.useMemo(() => {
    try {
      return props.context ? spfi().using(SPFx(props.context)) : null;
    } catch {
      return null;
    }
  }, [props.context]);

  const [myRegisteredIds, setMyRegisteredIds] = React.useState<number[]>([]);

  const getCurrentUserId = React.useCallback(async (): Promise<number> => {
    const legacyId = (props.context?.pageContext as any)?.legacyPageContext
      ?.userId;
    if (legacyId) return Number(legacyId);

    if (sp) {
      const me: any = await sp.web.currentUser.select("Id")();
      return Number(me?.Id || 0);
    }
    return 0;
  }, [props.context, sp]);

  const loadMyRegisteredIds = React.useCallback(async () => {
    if (!sp || !props.context) return;

    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        setMyRegisteredIds([]);
        return;
      }

      const rows: any[] = await sp.web.lists
        .getByTitle("Registered User Event")
        .items.select("Id", "AuthorId", "TIRRegisteredUsers")
        .filter(`AuthorId eq ${userId}`)
        .top(1)();

      const row = rows?.[0];
      const ids = parseNumericIdList(row?.TIRRegisteredUsers);
      setMyRegisteredIds(ids);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("loadMyRegisteredIds failed", e);
      setMyRegisteredIds([]);
    }
  }, [sp, props.context, getCurrentUserId]);

  React.useEffect(() => {
    loadMyRegisteredIds();
  }, [loadMyRegisteredIds]);

  const parsedEvents = React.useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    return (props.AllEventItems || [])
      .map((item: any) => {
        const startStr = String(item?.eventStartDate ?? "").split("\n")[0].trim();
        const endStr = String(item?.eventEndDate ?? "").split("\n")[0].trim();

        const start = parseSPDate(startStr);
        const end = parseSPDate(endStr);

        // MAIN: if no valid dates, skip
        if (!start || !end) return null;

        const location = String(item?.location ?? "").split("\n")[0].trim();

        const eventId =
          Number(
            item?.ID ??
              item?.Id ??
              item?.id ??
              item?.ListItemID ??
              item?.ListItemId ??
              0
          ) || 0;

        const isReg = eventId ? myRegisteredIds.includes(eventId) : false;

        const fmt = (d: Date) =>
          d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

        const time = `${fmt(start)} - ${fmt(end)}`;

        const cardDate = start.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        // Events module => always Events (this component is only for Events tab)
        const eventType = "Events";

        return {
          ...item,

          // calendar uses these
          start,
          end,

          Eventtype: eventType,
          ID: eventId,

          date: String(start.getDate()).padStart(2, "0"),
          month: months[start.getMonth()],
          day: days[start.getDay()],

          title: item?.title || "Untitled",
          time,
          location,
          eventDateTime: start,

          cardDate,
          category: item?.category,
          imageUrl: item?.newsImage || "",

          isregistered: isReg,
          isRegistered: isReg,
          status: isReg ? "Registered" : "Upcoming",
        };
      })
      .filter(Boolean);
  }, [props.AllEventItems, myRegisteredIds]);

  const upcomingEvents = parsedEvents.filter(
    (e: any) => e.eventDateTime && e.eventDateTime > now
  );
  const previousEvents = parsedEvents.filter(
    (e: any) => e.eventDateTime && e.eventDateTime < now
  );

  const previousEventsSorted = React.useMemo(() => {
    return [...previousEvents].sort(
      (a: any, b: any) =>
        (b.eventDateTime?.getTime?.() || 0) - (a.eventDateTime?.getTime?.() || 0)
    );
  }, [previousEvents]);

  const previousEventsToRender = showAllPrevious
    ? previousEventsSorted
    : previousEventsSorted.slice(0, 3);

  const myEvents = parsedEvents.filter((e: any) => e.isregistered);

  const showCalendar = props.viewtype !== "list";

  return (
    <>
      <div className={styles.tabContainer}>
        <div className={styles.tabContainerInner}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "all" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Events
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "my" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("my")}
          >
            My Events
          </button>
        </div>
      </div>

      {activeTab === "all" ? (
        showCalendar ? (
          <CalendarViewComponent
            events={parsedEvents}
            context={props.context}
            from="All"
          />
        ) : (
          <div className={styles.eventsContainer}>
            <div className={styles.eventsWrapper}>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event: any, index: any) => (
                  <EventCard key={index} {...event} />
                ))
              ) : (
                <p>No upcoming events found.</p>
              )}
            </div>

            <div className={styles.previousEventsContainer}>
              <div className={styles.previousHeaderRow}>
                <h2 className={styles.heading}>Previous Events</h2>

                {!showAllPrevious && previousEventsSorted.length > 3 && (
                  <button
                    type="button"
                    className={styles.viewAllButton}
                    onClick={() => setShowAllPrevious(true)}
                    aria-label="View all previous events"
                  >
                    View All
                  </button>
                )}
              </div>

              <div className={styles.gridLayout}>
                {previousEventsToRender.length > 0 ? (
                  previousEventsToRender.map((event: any, index: any) => (
                    <PreviousEventCard
                      key={index}
                      title={event.title}
                      date={event.cardDate}
                      imageUrl={event.imageUrl}
                      imageCount={0}
                      pageUrl={event?.pageUrl}
                    />
                  ))
                ) : (
                  <p>No previous events found.</p>
                )}
              </div>
            </div>
          </div>
        )
      ) : showCalendar ? (
        <CalendarViewComponent
          events={myEvents}
          context={props.context}
          from="All"
        />
      ) : (
        <div className={styles.eventsContainer}>
          <div className={styles.eventsWrapper}>
            {myEvents.length > 0 ? (
              myEvents.map((event: any, index: any) => (
                <EventCard key={index} {...event} />
              ))
            ) : (
              <p>You haven’t registered for any events yet.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AllEvents;

















































// import * as React from "react";
// import moment from "moment";
// import styles from "./Allevents.module.scss";
// import EventCard from "./EventCard";
// import PreviousEventCard from "./PreviousCard/PreviousEvents";
// import CalendarViewComponent from "./Calendarview/CalendarView";

// import { SPFI, spfi, SPFx } from "@pnp/sp";
// import "@pnp/sp/webs";
// import "@pnp/sp/lists";
// import "@pnp/sp/items";

// import { MSGraphClientV3 } from "@microsoft/sp-http";
// import { GraphMeetingsProvider } from "../../services/meetingServices/GraphMeetingsProvider";
// import { mapGraphMeetingToUI } from "../../services/meetingServices/mapGraphMeetingToUI";

// export interface IAlleventsProps {
//   AllEventItems: any[];
//   context?: any;
//   viewtype?: string;
// }

// const uniqNums = (arr: number[]) =>
//   Array.from(new Set(arr.filter((n) => Number.isFinite(n) && n > 0)));

// const parseNumericIdList = (raw: any): number[] => {
//   const text = String(raw || "");
//   const tokens = text
//     .split(/[,;\n\r]+/g)
//     .map((t) => t.trim())
//     .filter(Boolean);

//   const ids = tokens
//     .filter((t) => /^\d+$/.test(t))
//     .map((t) => parseInt(t, 10));

//   return uniqNums(ids);
// };

// const parseSPDate = (value: any): Date | null => {
//   if (!value) return null;

//   if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

//   if (typeof value === "object" && value?.dateTime) {
//     const d = new Date(String(value.dateTime));
//     return isNaN(d.getTime()) ? null : d;
//   }

//   const raw = String(value || "").split("\n")[0].trim();
//   if (!raw) return null;

//   const d1 = new Date(raw);
//   if (!isNaN(d1.getTime())) return d1;

//   const m = moment(
//     raw,
//     [
//       moment.ISO_8601,
//       "DD/MM/YYYY",
//       "DD/MM/YYYY HH:mm",
//       "DD/MM/YYYY HH:mm:ss",
//       "DD/MM/YYYY hh:mm A",
//       "MM/DD/YYYY",
//       "MM/DD/YYYY HH:mm",
//       "MM/DD/YYYY hh:mm A",
//       "YYYY-MM-DD HH:mm:ss",
//     ],
//     false
//   );

//   return m.isValid() ? m.toDate() : null;
// };

// const AllEvents: React.FC<IAlleventsProps> = (props) => {
//   const now = new Date();
//   const nowMs = now.getTime();
//   const [activeTab, setActiveTab] = React.useState<"all" | "my">("all");
//   const [showAllPrevious, setShowAllPrevious] = React.useState(false);
//   const [registeredEventIds, setRegisteredEventIds] = React.useState<number[]>([]);
//   const [meetings, setMeetings] = React.useState<any[]>([]);
//   const [showCalendar, setShowCalendar] = React.useState(props.viewtype === "calendar");

//   const sp: SPFI | null = React.useMemo(() => {
//     try {
//       return props.context ? spfi().using(SPFx(props.context)) : null;
//     } catch {
//       return null;
//     }
//   }, [props.context]);

//   React.useEffect(() => {
//     const fetchRegistered = async () => {
//       if (!sp || !props.context) return;

//       const currentUserEmail = props.context.pageContext.user.email;

//       try {
//         const registrationList = sp.web.lists.getByTitle("Event Registration");
//         const registeredItems = await registrationList.items
//           .select("Id", "EventID", "Email", "ApprovalStatus")
//           .filter(`Email eq '${currentUserEmail}' and ApprovalStatus eq 'Approved'`)
//           .get();

//         const ids = registeredItems.map((item: any) => Number(item.EventID));

//         setRegisteredEventIds(uniqNums(ids));
//       } catch (error) {
//         console.error("Error fetching registered events:", error);
//       }
//     };

//     fetchRegistered();
//   }, [sp, props.context]);

//   React.useEffect(() => {
//     if (!props.context) return;

//     const fetchMeetings = async () => {
//       try {
//         const client: MSGraphClientV3 = await props.context.msGraphClientFactory.getClient("3");
//         const provider = new GraphMeetingsProvider(client);
//         const msMeetings = await provider.getUpcoming(365, 100);

//         const mappedMeetings = msMeetings.map((m) => {
//           const ui = mapGraphMeetingToUI(m);
//           const startD = new Date(m.start);
//           const endD = new Date(m.end);

//           return {
//             ...ui,
//             day: ui.date.day,
//             date: ui.date.date,
//             month: ui.date.month,
//             category: "Teams Meeting",
//             status: "Registered",
//             title: m.subject,
//             time: ui.time,
//             location: m.location || "Online",
//             imageUrl: m.avatarUrl,
//             eventDateTime: startD,
//             cardDate: moment(startD).format("DD MMM YYYY"),
//             pageUrl: m.joinUrl,
//             ID: m.id,
//             isRegistered: true,
//             isregistered: true,
//             startDate: m.start,
//             endDate: m.end,
//           };
//         });

//         setMeetings(mappedMeetings);
//       } catch (error) {
//         console.error("Error fetching meetings:", error);
//       }
//     };

//     fetchMeetings();
//   }, [props.context]);

//   const spMappedEvents = (props.AllEventItems || []).map((item: any) => {
//     const startD = parseSPDate(item.TIREventStartDate);
//     const endD = parseSPDate(item.TIREventEndDate);

//     return {
//       ...item,
//       startDate: item.TIREventStartDate,
//       endDate: item.TIREventEndDate,
//       eventDateTime: startD,
//       cardDate: startD ? moment(startD).format("DD MMM YYYY") : "No Date",
//       day: startD ? moment(startD).format("ddd") : "",
//       date: startD ? moment(startD).format("DD") : "",
//       month: startD ? moment(startD).format("MMM") : "",
//       time: item.time || (startD && endD ? `${startD.toLocaleTimeString('en-US', { hour: "2-digit", minute: "2-digit" })} – ${endD.toLocaleTimeString('en-US', { hour: "2-digit", minute: "2-digit" })}` : "No Time"),
//       location: item.location || "No Location",
//       category: item.category || "Information",
//       status: item.status || "Upcoming",
//       isRegistered: registeredEventIds.includes(Number(item.ID || item.Id || 0)),
//       isregistered: registeredEventIds.includes(Number(item.ID || item.Id || 0)),
//       pageUrl: item.pageUrl,
//     };
//   });

//   const allMappedEvents = spMappedEvents.concat(meetings);

//   const upcomingEvents = allMappedEvents.filter((e) => new Date(e.eventDateTime).getTime() >= nowMs);

//   const previousEventsSorted = allMappedEvents
//     .filter((e) => new Date(e.eventDateTime).getTime() < nowMs)
//     .sort((a, b) => new Date(b.eventDateTime).getTime() - new Date(a.eventDateTime).getTime());

//   const myEvents = allMappedEvents.filter((e) => e.isRegistered || e.isregistered);

//   const previousEventsToRender = showAllPrevious ? previousEventsSorted : previousEventsSorted.slice(0, 3);

//   return (
//     <>
//       <div className={styles.tabContainer}>
//         <div className={styles.tabContainerInner}>
//           <button
//             className={`${styles.tabButton} ${activeTab === "all" ? styles.activeTab : ""}`}
//             onClick={() => setActiveTab("all")}
//           >
//             All Events
//           </button>
//           <button
//             className={`${styles.tabButton} ${activeTab === "my" ? styles.activeTab : ""}`}
//             onClick={() => setActiveTab("my")}
//           >
//             My Events
//           </button>
//         </div>
//       </div>

//       <div className={styles.viewSwitchContainer}>
//         <button
//           className={`${styles.tabButton} ${!showCalendar ? styles.activeTab : ""}`}
//           onClick={() => setShowCalendar(false)}
//         >
//           List View
//         </button>
//         <button
//           className={`${styles.tabButton} ${showCalendar ? styles.activeTab : ""}`}
//           onClick={() => setShowCalendar(true)}
//         >
//           Calendar View
//         </button>
//       </div>

//       {activeTab === "all" ? (
//         showCalendar ? (
//           <CalendarViewComponent
//             events={upcomingEvents.concat(previousEventsSorted) as any}
//             context={props.context}
//             from="All"
//           />
//         ) : (
//           <div className={styles.eventsContainer}>
//             <div className={styles.eventsWrapper}>
//               {upcomingEvents.length > 0 ? (
//                 upcomingEvents.map((event: any, index: any) => (
//                   <EventCard key={index} {...event} />
//                 ))
//               ) : (
//                 <p>No upcoming events found.</p>
//               )}
//             </div>

//             <div className={styles.previousEventsContainer}>
//               <div className={styles.previousHeaderRow}>
//                 <h2 className={styles.heading}>Previous Events</h2>

//                 {!showAllPrevious && previousEventsSorted.length > 3 && (
//                   <button
//                     type="button"
//                     className={styles.viewAllButton}
//                     onClick={() => setShowAllPrevious(true)}
//                     aria-label="View all previous events"
//                   >
//                     View All
//                   </button>
//                 )}
//               </div>

//               <div className={styles.gridLayout}>
//                 {previousEventsToRender.length > 0 ? (
//                   previousEventsToRender.map((event: any, index: any) => (
//                     <PreviousEventCard
//                       key={index}
//                       title={event.title}
//                       date={event.cardDate}
//                       imageUrl={event.imageUrl}
//                       imageCount={0}
//                       pageUrl={event?.pageUrl}
//                     />
//                   ))
//                 ) : (
//                   <p>No previous events found.</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         )
//       ) : (
//         showCalendar ? (
//           <CalendarViewComponent
//             events={myEvents}
//             context={props.context}
//             from="All"
//           />
//         ) : (
//           <div className={styles.eventsContainer}>
//             <div className={styles.eventsWrapper}>
//               {myEvents.length > 0 ? (
//                 myEvents.map((event: any, index: any) => (
//                   <EventCard key={index} {...event} />
//                 ))
//               ) : (
//                 <p>You haven’t registered for any events yet.</p>
//               )}
//             </div>
//           </div>
//         )
//       )}
//     </>
//   );
// };

// export default AllEvents;