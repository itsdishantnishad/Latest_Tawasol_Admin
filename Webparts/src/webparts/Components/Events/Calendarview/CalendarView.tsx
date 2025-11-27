import * as React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Modal } from "@fluentui/react/lib/Modal";
import { PrimaryButton, DefaultButton } from "@fluentui/react";
import styles from './CalendarView.module.scss';
import MeetingCard from "../../TeamsMeeting/MeetingCard";
import TrainingCard from "../../Trainings/TrainingCard";
import EventPopup from "../Eventpopup/Eventpopup";

const localizer = momentLocalizer(moment);

interface Props {
  events: any[];
  context?: any;
}

const CalendarViewComponent: React.FC<Props> = ({ events, context }) => {
  const [selectedEvent, setSelectedEvent] = React.useState<any>(null);

  const calendarEvents = events.map((e: any) => {
    const startDateStr = e.eventStartDate?.split("\n\n")[1]?.trim();
    const endDateStr = e.eventEndDate?.split("\n\n")[1]?.trim();
    return {
      ...e,
      title: e.title,
      start: new Date(startDateStr),
      end: new Date(endDateStr),
    };
  });

  // Function to determine event color based on type
  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#0E6187'; // Default color for Events
    
    if (event.Eventtype === "Teams") {
      backgroundColor = '#4C8AE0';
    } else if (event.Eventtype === "Trainings") {
      backgroundColor = '#4BB86C';
    }
    
    return {
      style: {
        backgroundColor: backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
        fontWeight: '500'
      }
    };
  };

  return (
    <>
      <div style={{ height: "600px", padding: "20px" }}>
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={(event: any) => 
            setSelectedEvent(events.find((ev: any) => 
              ev.ID === event.ID && ev.Eventtype === event.Eventtype
            ))
          }
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
        />
      </div>
      
      <Modal
        isOpen={!!selectedEvent}
        onDismiss={() => setSelectedEvent(null)}
        containerClassName={styles.eventModalContainer}
      >
        {selectedEvent && (
          <div className={`eventModalBody ${styles.eventModalBody}`}>
            <h2 style={{ marginBottom: 10 }}>{selectedEvent.title}</h2>
            {selectedEvent.Eventtype === "Teams" ? (
              <MeetingCard
                event={selectedEvent}
                onJoinClick={() => alert("Joining Meeting...")}
              />
            ) : selectedEvent.Eventtype === "Trainings" ? (
              <TrainingCard {...selectedEvent} context={context} />
            ) : (
              <EventPopup {...selectedEvent} context={context} />
            )}
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <DefaultButton text="Close" onClick={() => setSelectedEvent(null)} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default CalendarViewComponent;