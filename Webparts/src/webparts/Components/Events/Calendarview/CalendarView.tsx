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
  from?: string;
}

const CalendarViewComponent: React.FC<Props> = ({ events, context, from }) => {
  console.log(events)
  const [selectedEvent, setSelectedEvent] = React.useState<any>(null);

  // ========== CHANGE #1: Update date parsing logic ==========
  const calendarEvents = events
    .filter((e: any) => e.date)
    .map((e: any) => {
      let startDate;

      // Handle date object {day, date, month}
      if (typeof e.date === 'object' && e.date.date && e.date.month) {
        const dateStr = `${e.date.date} ${e.date.month} 2026`;
        startDate = new Date(dateStr);
      } else {
        startDate = new Date(e.date);
      }

      const endDate = e.endDate ? new Date(e.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000);

      if (isNaN(startDate.getTime())) {
        console.warn('Invalid date format:', e.date);
        return null;
      }

      return {
        ...e,
        title: e.title,
        start: startDate,
        end: endDate,
        ID: e.id,
        Eventtype: "Teams"
      };
    })
    .filter((e: any) => e !== null);

  // ========== CHANGE #2: Add Custom Event Component ==========
  const EventComponent = ({ event }: any) => (
    <div className={styles.eventTitle}>
      {event.title}
    </div>
  );

  // ========== CHANGE #3: Update eventStyleGetter ==========
  const eventStyleGetter = (event: any) => {
    return {
      style: {
        backgroundColor: 'transparent',
        border: 'none',
        display: 'block',
        padding: '0px'
      }
    };
  };

  return (
    <>
      <div style={{ padding: "20px" }}>
        {/* Legend */}
        {from === "All" && <div style={{
          display: 'flex',
          gap: '24px',
          marginBottom: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'flex-end'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#0E6187',
              borderRadius: '3px'
            }} />
            <span style={{ fontSize: '14px', color: '#333' }}>Events</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#4BB86C',
              borderRadius: '3px'
            }} />
            <span style={{ fontSize: '14px', color: '#333' }}>Trainings</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#4C8AE0',
              borderRadius: '3px'
            }} />
            <span style={{ fontSize: '14px', color: '#333' }}>Teams Meeting</span>
          </div>
        </div>}

        {/* Calendar */}
        <div style={{ height: "600px" }}>
          {/* ========== CHANGE #4: Add components prop with EventComponent ========== */}
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={(event: any) =>
              setSelectedEvent(events.find((ev: any) => ev.id === event.ID))
            }
            eventPropGetter={eventStyleGetter}
            components={{ event: EventComponent }}
            views={['month', 'week', 'day', 'agenda']}
            defaultView="month"
          />
        </div>
      </div>

      <Modal
        isOpen={!!selectedEvent}
        onDismiss={() => setSelectedEvent(null)}
        containerClassName={styles.eventModalContainer}
      >
        {selectedEvent && (
          <div className={`eventModalBody ${styles.eventModalBody}`}>
            <h2 style={{ marginBottom: 10 }}>{selectedEvent.title}</h2>
            {selectedEvent.meetingType === "Microsoft Teams Meeting" ? (
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