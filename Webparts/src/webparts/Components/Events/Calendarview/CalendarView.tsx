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

const CalendarViewComponent: React.FC<Props> = ({ events, context , from }) => {
  const [selectedEvent, setSelectedEvent] = React.useState<any>(null);
const calendarEvents = events.map((e: any) => {
    const startDateStr = e.eventStartDate?.split("\n\n")[1]?.trim();
    const endDateStr = e.eventEndDate?.split("\n\n")[1]?.trim();
    
    // Parse as UTC but convert to local date without timezone shift
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    // Create dates in local timezone with the same values
    const localStart = new Date(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate(),
      startDate.getUTCHours(),
      startDate.getUTCMinutes()
    );
    
    const localEnd = new Date(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth(),
      endDate.getUTCDate(),
      endDate.getUTCHours(),
      endDate.getUTCMinutes()
    );
    
    return {
      ...e,
      title: e.title,
      start: localStart,
      end: localEnd,
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