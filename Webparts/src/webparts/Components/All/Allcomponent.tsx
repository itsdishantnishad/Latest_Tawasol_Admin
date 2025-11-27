import * as React from "react";
import EventCard from "../Events/EventCard";
import Trainingcard from "../Trainings/TrainingCard";
import MeetingCard from "../TeamsMeeting/MeetingCard";
import CalendarViewComponent from "../Events/Calendarview/CalendarView";
import styles from "../Events/Allevents.module.scss";
import PreviousEventCard from "../Events/PreviousCard/PreviousEvents";
interface Props {
  filteredEvents: any[];
  filteredTrainings: any[];
  filteredMeetings: any[];
  context: any;
  viewMode: string;
}

const AllComponents: React.FC<Props> = ({
  filteredEvents,
  filteredTrainings,
  filteredMeetings,
  context,
  viewMode,
}) => {
  const now = new Date();
  const [activeTab, setActiveTab] = React.useState<"all" | "my">("all");
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

    return (filteredEvents || []).map((item: any) => {
      const startDateStr = item.eventStartDate?.split("\n\n")[1]?.trim();
      const endDateStr = item.eventEndDate?.split("\n\n")[1]?.trim();

      const eventStart = startDateStr ? new Date(startDateStr) : null;
      const eventEnd = endDateStr ? new Date(endDateStr) : null;

      let time = "Not specified";
      if (eventStart && eventEnd) {
        const formatTime = (date: Date) =>
          date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });
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
        context: context,
        Eventtype: "Events",
        ...item,
      };
    });
  }, [filteredEvents]);
  const mapSharePointTrainingsForAll = (data: any[]) => {
    return data.map((item, index) => {
      const startDateStr = item.eventStartDate?.split("\n\n")[1] || "";
      const endDateStr = item.eventEndDate?.split("\n\n")[1] || "";

      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      // Month label for AllTrainingCard accordion
      const monthLabel = `${startDate.toLocaleString("default", {
        month: "long",
      })} ${startDate.getFullYear()}`;

      // Date range for AllTrainingCard
      const dateRange = `${startDate.getDate()}-${endDate.getDate()} ${startDate.toLocaleString(
        "default",
        { month: "short" }
      )} ${startDate.getFullYear()}`;

      // Time for TrainingCard
      const timeRange = `${startDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${endDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;

      return {
        id: index + 1,
        // AllTrainingCard props
        imageUrl:
          item.newsImage || "https://via.placeholder.com/400x200?text=No+Image",
        category: "Online",
        title: item.title || "Untitled Training",
        date: dateRange,
        duration: `${Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )} days`,
        instructorName: item?.instructor?.name,
        instructorTitle: item?.instructor?.role,
        instructorImageUrl: `https://i.pravatar.cc/150?img=${(index % 6) + 1}`,
        month: monthLabel,
        isRegistered: !!item.joiningURL,
        isMyTraining: !!item.joiningURL,
        location: item.location?.split("\n\n")[0] || "TBD",
        joinUrl: item.joiningURL || "#",
        Eventtype: "Trainings",
        // TrainingCard props
        startDate: startDateStr,
        endDate: endDateStr,
        subtitle: "",
        time: timeRange,
        ...item,
      };
    });
  };
  const mappedTrainings = mapSharePointTrainingsForAll(filteredTrainings);
  const Alldata = [...parsedEvents, ...mappedTrainings, ...filteredMeetings];
  const myEvents = parsedEvents.filter((e: any) => e.isregistered);
  const myTrainings = mappedTrainings.filter((t: any) => t.isMyTraining);
  const myAlldata = [...myEvents, ...myTrainings, ...filteredMeetings];
  const previousEvents = parsedEvents.filter(
    (e: any) => e.eventDateTime && e.eventDateTime < now
  );

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
            All Events & Trainings
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "my" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("my")}
          >
            My Events & Trainings
          </button>
        </div>
      </div>
      {activeTab === "all" ? (
        // ------------ ALL DATA ------------
        viewMode === "list" ? (
          <>
            <h5>Events</h5>
            {parsedEvents.map((event: any, index: any) => (
              <EventCard key={index} {...event} context={context} />
            ))}

            <h5>Trainings</h5>
            {mappedTrainings.map((event: any) => (
              <Trainingcard key={event.id} {...event} />
            ))}

            <h5>Meetings</h5>
            {filteredMeetings.map((event: any) => (
              <MeetingCard
                key={event.id}
                event={event}
                onJoinClick={() => alert("Joining Meeting...")}
              />
            ))}
            <div className={styles.previousEventsContainer}>
              <h2 className={styles.heading}>Previous Events</h2>
              <div className={styles.gridLayout}>
                {previousEvents.length > 0 ? (
                  previousEvents.map((event: any, index: any) => (
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
          </>
        ) : (
          <>
            <CalendarViewComponent events={Alldata} context={context} />
            <div className={styles.previousEventsContainer}>
              <h2 className={styles.heading}>Previous Events</h2>
              <div className={styles.gridLayout}>
                {previousEvents.length > 0 ? (
                  previousEvents.map((event: any, index: any) => (
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
          </>
        )
      ) : activeTab === "my" ? (
        // ------------ MY DATA ------------
        viewMode === "list" ? (
          <>
            <h5>My Events</h5>
            {myEvents.map((event: any) => (
              <EventCard key={event.id} {...event} context={context} />
            ))}

            <h5>My Trainings</h5>
            {myTrainings.map((training: any) => (
              <Trainingcard key={training.id} {...training} />
            ))}

            <h5>My Meetings</h5>
            {filteredMeetings.map((meeting: any) => (
              <MeetingCard key={meeting.id} event={meeting} />
            ))}
            <div className={styles.previousEventsContainer}>
              <h2 className={styles.heading}>Previous Events</h2>
              <div className={styles.gridLayout}>
                {previousEvents.length > 0 ? (
                  previousEvents.map((event: any, index: any) => (
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
          </>
        ) : (
          <>
            <CalendarViewComponent events={myAlldata} context={context} />
            <div className={styles.previousEventsContainer}>
              <h2 className={styles.heading}>Previous Events</h2>
              <div className={styles.gridLayout}>
                {previousEvents.length > 0 ? (
                  previousEvents.map((event: any, index: any) => (
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
          </>
        )
      ) : null}
    </>
  );
};

export default AllComponents;
