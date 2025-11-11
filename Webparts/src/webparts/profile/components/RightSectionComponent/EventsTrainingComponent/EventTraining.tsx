import * as React from "react";
import styles from "./EventTraining.module.scss";

const CalendarIcon = require("../../../assets/calendarIcon.svg");
const ClockIcon = require("../../../assets/clockIcon.svg");
const LocationIcon = require("../../../assets/locationIcon.svg");
const DateCalendarIcon = require("../../../assets/calendarDateIcon.svg");

export interface IEventData {
  id: string;
  eventImage?: string;
  eventTitle: string;
  eventCategory: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  isRegistered: boolean;
}

export interface IUpcomingEventsCardProps {
  eventsData?: IEventData[];
  trainingData?: IEventData[];
}

type TabKey = "events" | "training";

const defaultEventsData: IEventData[] = [
  {
    id: "event-1",
    eventImage:
      "https://thumbs.dreamstime.com/b/people-meeting-team-building-concepts-44447396.jpg",
    eventTitle: "Team Building Events",
    eventCategory: "Entertainment",
    eventDate: "11 July 2024",
    eventTime: "9 AM - 12 PM",
    eventLocation: "11th Floor, Vision Tower, Dubai",
    isRegistered: true,
  },
];

const defaultTrainingData: IEventData[] = [
  {
    id: "training-1",
    eventTitle: "Foundations of Accessibility",
    eventCategory: "Professional Development",
    eventDate: "03 Aug 2024",
    eventTime: "2 PM - 5 PM",
    eventLocation: "Online (Teams)",
    isRegistered: false,
  },
];

export default class UpcomingEventsCard extends React.Component<
  IUpcomingEventsCardProps,
  { tab: TabKey; currentEventIndex: number; currentTrainingIndex: number }
> {
  public static defaultProps: Partial<IUpcomingEventsCardProps> = {
    eventsData: defaultEventsData,
    trainingData: defaultTrainingData,
  };

  public state = {
    tab: "events" as TabKey,
    currentEventIndex: 0,
    currentTrainingIndex: 0,
  };

  public render(): React.ReactElement<IUpcomingEventsCardProps> {
    const { tab, currentEventIndex, currentTrainingIndex } = this.state;
    const { eventsData = defaultEventsData, trainingData = defaultTrainingData } =
      this.props;

    const currentEvent = eventsData[currentEventIndex];
    const currentTraining = trainingData[currentTrainingIndex];

    return (
      <section
        className={styles.card}
        aria-label="Upcoming Events and Training"
      >
        {/* Header */}
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <img src={CalendarIcon} className={styles.icon24} alt="" />
            <span className={styles.upcomingText}>
              Upcoming Events & Trainings
            </span>
          </div>
        </div>

        {/* Segmented control */}
        <div className={styles.segmentWrap}>
          <div className={styles.segmentInner}>
            <button
              className={`${styles.segBtn} ${
                tab === "events" ? styles.segActive : ""
              }`}
              onClick={() => this.setState({ tab: "events" })}
              type="button"
            >
              Events
            </button>
            <button
              className={`${styles.segBtn} ${
                tab === "training" ? styles.segActive : ""
              }`}
              onClick={() => this.setState({ tab: "training" })}
              type="button"
            >
              Training
            </button>
          </div>
        </div>

        {/* Events tab */}
        {tab === "events" && currentEvent && (
          <div className={styles.eventCard}>
            <div className={styles.eventContent}>
              {/* Image with registered pill */}
              <div className={styles.imageRow}>
                {currentEvent.eventImage && (
                  <img
                    className={styles.eventImage}
                    src={currentEvent.eventImage}
                    alt={currentEvent.eventTitle}
                  />
                )}
                {currentEvent.isRegistered && (
                  <div className={styles.registerPill}>
                    <span className={styles.registerText}>Upcoming</span>
                  </div>
                )}
              </div>

              {/* Event category */}
              <div className={styles.categoryLabel}>
                {currentEvent.eventCategory}
              </div>

              {/* Title */}
              <div className={styles.eventTitle}>{currentEvent.eventTitle}</div>

              {/* Location */}
              <div className={styles.locationRow}>
                <img src={LocationIcon} className={styles.icon16} alt="" />
                <span className={styles.locationText}>
                  {currentEvent.eventLocation}
                </span>
              </div>

              {/* Date and Time */}
              <div className={styles.dateTimeRow}>
                <div className={styles.dateItem}>
                  <img src={DateCalendarIcon} className={styles.icon16} alt="" />
                  <span className={styles.dateText}>{currentEvent.eventDate}</span>
                </div>
                <div className={styles.timeItem}>
                  <img src={ClockIcon} className={styles.icon16} alt="" />
                  <span className={styles.timeText}>{currentEvent.eventTime}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Training tab */}
        {tab === "training" && currentTraining && (
          <div className={styles.eventCard}>
            <div className={styles.eventContent}>
              {/* Image placeholder */}
              <div className={styles.imageRow}>
                <div className={styles.imagePlaceholder} />
                {!currentTraining.isRegistered && (
                  <div className={styles.registerPillMuted}>
                    <span className={styles.registerText}>Open</span>
                  </div>
                )}
              </div>

              {/* Training category */}
              <div className={styles.categoryLabel}>
                {currentTraining.eventCategory}
              </div>

              {/* Title */}
              <div className={styles.eventTitle}>
                {currentTraining.eventTitle}
              </div>

              {/* Location */}
              <div className={styles.locationRow}>
                <img src={LocationIcon} className={styles.icon16} alt="" />
                <span className={styles.locationText}>
                  {currentTraining.eventLocation}
                </span>
              </div>

              {/* Date and Time */}
              <div className={styles.dateTimeRow}>
                <div className={styles.dateItem}>
                  <img src={DateCalendarIcon} className={styles.icon16} alt="" />
                  <span className={styles.dateText}>
                    {currentTraining.eventDate}
                  </span>
                </div>
                <div className={styles.timeItem}>
                  <img src={ClockIcon} className={styles.icon16} alt="" />
                  <span className={styles.timeText}>
                    {currentTraining.eventTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }
}