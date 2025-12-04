import * as React from 'react';
import styles from './EventDetail.module.scss';
import EventRegistration from '../../Components/Events/Registration/RegistrationModal';

export interface IEventDetailProps {
  eventItem?: any;
  context?: any;
}

export interface IEventDetailState {
  showRegistration: boolean;
}

export default class EventDetail extends React.Component<IEventDetailProps, IEventDetailState> {
  constructor(props: IEventDetailProps) {
    super(props);
    this.state = {
      showRegistration: false,
    };
  }

  private formatTime(dateStr: string): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    return `${day} ${month}`;
  }

  private isPastEvent(dateStr: string): boolean {
    if (!dateStr) return true; // default to past
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  }

  private handleRegisterClick = () => {
    this.setState({ showRegistration: true });
  };

  public render(): React.ReactElement<IEventDetailProps> {
    const { eventItem } = this.props;
    const { showRegistration } = this.state;

    // Fallback event if no data is available
    const item = eventItem?.[0] || {
      title: "No Event Available",
      eventStartDate: "",
      eventEndDate: "",
      location: "N/A",
      id: 0,
      category: "General"
    };

    const startTime = this.formatTime(item.eventStartDate);
    const endTime = this.formatTime(item.eventEndDate);
    const dateLabel = this.formatDate(item.eventStartDate);
    const isPast = this.isPastEvent(item.eventEndDate);

    return (
      <div className={styles.card}>
        {/* TAGS */}
        <div className={styles.tagsRow}>
          {!isPast && item.id !== 0 && <span className={styles.tagPrimary}>Upcoming</span>}
          <span className={styles.tagSecondary}>
            {item.category || "Information"}
          </span>
        </div>

        {/* TITLE */}
        <h2 className={styles.title}>{item.title}</h2>

        {/* TIME ROW */}
        <div className={styles.row}>
          <span className={styles.icon}>
            <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.6">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
          </span>
          <span className={styles.text}>
            {startTime && endTime ? `${startTime} – ${endTime}` : "No Time Available"}
          </span>
          <span className={styles.separator}>|</span>
          <span className={styles.text}>
            {dateLabel || "No Date"}
          </span>
        </div>

        {/* LOCATION ROW */}
        <div className={styles.row}>
          <span className={styles.icon}>
            <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.6">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </span>
          <span className={styles.text}>{item.location}</span>
        </div>

        {/* BUTTON */}
        {item.id !== 0 && !isPast ? (
          <button className={styles.button} onClick={this.handleRegisterClick}>
            Register
          </button>
        ) : (
          <button className={`${styles.button} ${styles.disabled}`} disabled>
            {item.id === 0 ? "No Registration" : "Past Event"}
          </button>
        )}

        {/* EVENT REGISTRATION COMPONENT */}
        {showRegistration && item.id !== 0 && (
          <EventRegistration
            isOpen={showRegistration}
            onDismiss={() => this.setState({ showRegistration: false })}
            context={this.props.context}
            eventId={item.id}
          />
        )}
      </div>
    );
  }
}
