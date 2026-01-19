import * as React from "react";
import styles from "./Allevents.module.scss";
import EventCard from "./EventCard";
import PreviousEventCard from "./PreviousCard/PreviousEvents";
import CalendarViewComponent from "./Calendarview/CalendarView";

export interface IAlleventsProps {
  AllEventItems: any;
  context?: any;
  viewtype?: string;
}

const AllEvents: React.FC<IAlleventsProps> = (props) => {
  const now = new Date();
  const sitepageurl = `${props?.context?.pageContext?.web?.absoluteUrl}/SitePages/`;
  const [activeTab, setActiveTab] = React.useState<"all" | "my">("all");
  const [showAllPrevious, setShowAllPrevious] = React.useState(false);

  const parsedEvents = React.useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return (props.AllEventItems || []).map((item: any) => {
      const startDateStr = item.eventStartDate?.split("\n")[0]?.trim();
      const endDateStr = item.eventEndDate?.split("\n")[0]?.trim();

      const eventStart: Date | null = startDateStr ? new Date(startDateStr) : null;
      const eventEnd: Date | null = endDateStr ? new Date(endDateStr) : null;

      const location = item.location?.split("\n")[0]?.trim() || "";

      let time = "Not specified";
      if (eventStart && eventEnd) {
        const formatTime = (date: Date) =>
          date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

        time = `${formatTime(eventStart)} - ${formatTime(eventEnd)}`;
      }
      const cardDate =
        eventStart
          ? eventStart.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "";

      return {
        ...item,
        date: eventStart ? String(eventStart.getDate()).padStart(2, "0") : "",
        month: eventStart ? months[eventStart.getMonth()] : "",
        day: eventStart ? days[eventStart.getDay()] : "",
        title: item.title || "Untitled Event",
        time,
        location,
        eventDateTime: eventStart,
        cardDate,
        category: item.category,
        imageUrl: item.newsImage || "",
        isregistered: !!item.isRegistered,
      };
    });
  }, [props.AllEventItems]);

  const upcomingEvents = parsedEvents.filter((e: any) => e.eventDateTime && e.eventDateTime > now);

  const previousEvents = parsedEvents.filter((e: any) => e.eventDateTime && e.eventDateTime < now);
  const previousEventsSorted = React.useMemo(() => {
    return [...previousEvents].sort(
      (a: any, b: any) => (b.eventDateTime?.getTime?.() || 0) - (a.eventDateTime?.getTime?.() || 0)
    );
  }, [previousEvents]);

  const previousEventsToRender = showAllPrevious ? previousEventsSorted : previousEventsSorted.slice(0, 3);

  const myEvents = parsedEvents.filter((e: any) => e.isregistered);

  return (
    <>
      <div className={styles.tabContainer}>
        <div className={styles.tabContainerInner}>
          <button
            className={`${styles.tabButton} ${activeTab === "all" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Events
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "my" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("my")}
          >
            My Events
          </button>
        </div>
      </div>

      {activeTab === "all" ? (
        props.viewtype === "list" ? (
          <div className={styles.eventsContainer}>
            <div className={styles.eventsWrapper}>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event: any, index: any) => (
                  <EventCard key={index} {...event} context={props.context} />
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
        ) : (
          <CalendarViewComponent events={parsedEvents} context={props.context} />
        )
      ) : (
        <div className={styles.eventsContainer}>
          <div className={styles.eventsWrapper}>
            {myEvents.length > 0 ? (
              myEvents.map((event: any, index: any) => <EventCard key={index} {...event} />)
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
