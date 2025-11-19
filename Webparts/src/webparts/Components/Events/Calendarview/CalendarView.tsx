import * as React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Modal } from "@fluentui/react/lib/Modal";
import { PrimaryButton, DefaultButton } from "@fluentui/react";
import EventCard from "../EventCard";
import styles from './CalendarView.module.scss';

const localizer = momentLocalizer(moment);

interface Props {
  events: any[];
  context?: any;
}

const CalendarViewComponent: React.FC<Props> = ({ events, context }) => {
  const [selectedEvent, setSelectedEvent] = React.useState<any>(null);

  const calendarEvents = events.map((e: any) => ({
    ...e,
    title: e.title,
    start: new Date(e.eventDateTime),
    end: new Date(e.eventDateTime),
  }));

  return (
    <>
      <div style={{ height: "600px", padding: "20px" }}>
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={(event:any) => setSelectedEvent(events.find((ev: any) => ev.ID === event.ID))}
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
            <EventCard  {...selectedEvent} context={context} />
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
