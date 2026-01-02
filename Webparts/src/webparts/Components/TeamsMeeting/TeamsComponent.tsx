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
            {props.meetingsData.length > 0 ? (
              props.meetingsData.map((event: any, index: any) => (
                <MeetingCard
                  key={event.id}
                  event={event}
                  onJoinClick={() => alert("Joining Meeting...")}
                  styles={styles}
                />
              ))
            ) : (
              <p>No Meetings found.</p>
            )}
          </div>
        </div>
      ) : (
        <CalendarViewComponent events={props.meetingsData} context={props.context} />
      )}
    </>
  );
};

export default AllMeetings;
