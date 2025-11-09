import * as React from "react";
import styles from "./Allevents.module.scss";
import EventCard from "./EventCard";
import PreviousEventCard from "./PreviousCard/PreviousEvents";
import CalendarViewComponent from "./Calendarview/CalendarView";

export interface IAlleventsProps {
  AllEventItems:any;
  context?: any;
}

const AllEvents: React.FC<IAlleventsProps> = (props) => {
  const now = new Date();
  const [activeTab, setActiveTab] = React.useState<"all" | "my">("all");
  const [viewType, setViewType] = React.useState<"list" | "calendar">("list");

  const parsedEvents = React.useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    return (props.AllEventItems || []).map((item: any) => {
      const startDateStr = item.eventStartDate?.split("\n\n")[1]?.trim();
      const endDateStr = item.eventEndDate?.split("\n\n")[1]?.trim();

      const eventStart = startDateStr ? new Date(startDateStr) : null;
      const eventEnd = endDateStr ? new Date(endDateStr) : null;

      let time = "Not specified";
      if (eventStart && eventEnd) {
        const formatTime = (date: Date) => date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        time = `${formatTime(eventStart)} - ${formatTime(eventEnd)}`;
      }

      return {
        date: eventStart ? String(eventStart.getDate()).padStart(2, "0") : "",
        month: eventStart ? months[eventStart.getMonth()] : "",
        day: eventStart ? days[eventStart.getDay()] : "",
        title: item.title || "Untitled Event",
        time,
        imageUrl: item.newsImage || "",
        eventDateTime: eventStart,
        isregistered: !!item.isRegistered,
        ID: item.ID,
        context: props.context,
        ...item
      };
    });
  }, [props.AllEventItems]);

  const upcomingEvents = parsedEvents.filter((e:any) => e.eventDateTime && e.eventDateTime > now);
  const previousEvents = parsedEvents.filter((e:any) => e.eventDateTime && e.eventDateTime < now);
  const myEvents = parsedEvents.filter((e:any) => e.isregistered);

  return (
    <>
      {/* Tabs */}
      <div className={styles.tabContainer}>
        <div className={styles.tabContainerInner}>
          <button className={`${styles.tabButton} ${activeTab === "all" ? styles.activeTab : ""}`} onClick={() => setActiveTab("all")}>
            All Events
          </button>
          <button className={`${styles.tabButton} ${activeTab === "my" ? styles.activeTab : ""}`} onClick={() => setActiveTab("my")}>
            My Events
          </button>
        </div>
      </div>

      {activeTab === "all" && (
        <div className={styles.viewSwitchContainer} style={{margin:"20px 0"}}>
          <button className={`${styles.tabButton} ${viewType === "list" ? styles.activeTab : ""}`} onClick={() => setViewType("list")}>
            List View
          </button>

          <button className={`${styles.tabButton} ${viewType === "calendar" ? styles.activeTab : ""}`} onClick={() => setViewType("calendar")}>
            Calendar
          </button>
        </div>
      )}

      {activeTab === "all" ? (
        viewType === "list" ? (
          <div className={styles.eventsContainer}>
            <div className={styles.eventsWrapper}>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event:any, index:any) => (
                  <EventCard key={index} {...event} context={props.context} />
                ))
              ) : (
                <p>No upcoming events found.</p>
              )}
            </div>

            <div className={styles.previousEventsContainer}>
              <h2 className={styles.heading}>Previous Events</h2>
              <div className={styles.gridLayout}>
                {previousEvents.length > 0 ? (
                  previousEvents.map((event:any, index:any) => (
                    <PreviousEventCard key={index} title={event.title} date={`${event.day}, ${event.date} ${event.month}`} imageUrl={event.imageUrl} imageCount={0}/>
                  ))
                ) : (
                  <p>No previous events found.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <CalendarViewComponent events={parsedEvents} context={props.context}/>
        )
      ) : (
        <div className={styles.eventsContainer}>
          <div className={styles.eventsWrapper}>
            {myEvents.length > 0 ? (
              myEvents.map((event:any, index:any) => (
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
