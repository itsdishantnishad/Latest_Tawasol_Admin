import * as React from "react";
import styles from "./Allevents.module.scss";
import EventCard from "./EventCard";
import PreviousEventCard from "./PreviousCard/PreviousEvents";


export interface IAlleventsProps {
  AllEventItems:any;
  context?: any;
}


const AllEvents: React.FC<IAlleventsProps> = (props) => {
  const now = new Date();
  const [activeTab, setActiveTab] = React.useState<"all" | "my">("all");

  console.log("AllEventItems from event page:", props.AllEventItems);

  const parsedEvents = React.useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    return (props.AllEventItems || []).map((item: any) => {
      const startDateStr = item.eventStartDate?.split("\n\n")[1]?.trim();
      const endDateStr = item.eventEndDate?.split("\n\n")[1]?.trim();

      const eventStart = startDateStr ? new Date(startDateStr) : null;
      const eventEnd = endDateStr ? new Date(endDateStr) : null;

      const dateParts = eventStart
        ? {
            date: String(eventStart.getDate()).padStart(2, "0"),
            month: months[eventStart.getMonth()],
            day: days[eventStart.getDay()],
          }
        : { date: "", month: "", day: "" };

      let time = "Not specified";
      if (eventStart && eventEnd) {
        const formatTime = (date: Date) =>
          date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });
        time = `${formatTime(eventStart)} - ${formatTime(eventEnd)}`;
      }

      const status: "Upcoming" | "Registered" =
        eventStart && eventStart > now ? "Upcoming" : "Registered";

      const isRegistered = !!item.isRegistered;

      return {
        ...dateParts,
        status, 
        category: item.category || "General",
        title: item.title || "Untitled Event",
        time,
        location: item.location?.split("\n\n")[0] || "Not specified",
        imageUrl: item.newsImage || "",
        eventDateTime: eventStart,
        isregistered: isRegistered,
        ID: item.ID,
      };
    });
  }, [props.AllEventItems]);

  const upcomingEvents = parsedEvents.filter(
    (e:any) => e.eventDateTime && e.eventDateTime > now
  );
  const previousEvents = parsedEvents.filter(
    (e:any) => e.eventDateTime && e.eventDateTime < now
  );
  const myEvents = parsedEvents.filter((e:any) => e.isregistered);

  return (
    <>
      {/* Tabs Section */}
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

      {/* All Events */}
      {activeTab === "all" ? (
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

          {/* Previous Events Section */}
          <div className={styles.previousEventsContainer}>
            <h2 className={styles.heading}>Previous Events</h2>
            <div className={styles.gridLayout}>
              {previousEvents.length > 0 ? (
                previousEvents.map((event:any, index:any) => (
                  <PreviousEventCard
                    key={index}
                    title={event.title}
                    date={`${event.day}, ${event.date} ${event.month}`}
                    imageUrl={event.imageUrl}
                    imageCount={0}
                  />
                ))
              ) : (
                <p>No previous events found.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        // My Events
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
