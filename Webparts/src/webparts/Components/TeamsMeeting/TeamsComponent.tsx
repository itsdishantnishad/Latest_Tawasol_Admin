import * as React from "react";
import styles from "./TeamsComponent.module.scss";
import CalendarViewComponent from "../Events/Calendarview/CalendarView";
import MeetingCard from "./MeetingCard";

export interface IAllmeetingsProps {
  meetingsData: any;
  context?: any;
  viewtype?: string;
}

const AllMeetings: React.FC<IAllmeetingsProps> = (props) => {
  const now = new Date();
  return (
    <>
      {/* Tabs */}
      {/* <div className={styles.tabContainer}>
        <div className={styles.tabContainerInner}>Teams Meetings</div>
      </div> */}

      {props.viewtype === "list" ? (
        <div className={styles.eventsContainer}>
          <div className={styles.eventsWrapper}>
            <h5>Teams Meetings</h5>
            {props.meetingsData.map((event: any) => (
              <MeetingCard
                key={event.id}
                event={event}
                onJoinClick={(event:any) => {
                  if (event.joinUrl) {
                    window.open(event.joinUrl, "_blank", "noopener,noreferrer");
                  } else {
                    alert("Join link not available for this meeting");
                  }
                }}
              />
            ))}

          </div>
        </div>
      ) : (
        <CalendarViewComponent events={props.meetingsData} context={props.context} />
      )}
    </>
  );
};

export default AllMeetings;
