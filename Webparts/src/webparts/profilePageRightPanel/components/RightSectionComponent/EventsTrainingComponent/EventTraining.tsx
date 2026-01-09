import * as React from "react";
import styles from "./EventTraining.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";

import {
  fetchUpcomingEventsAndTraining,
  IEventData
} from "../../../../services/Profile/upcomingEventsTrainingService";

const CalendarIcon = require("../../../assets/calendarIcon.svg");
const ClockIcon = require("../../../assets/clockIcon.svg");
const LocationIcon = require("../../../assets/locationIcon.svg");
const DateCalendarIcon = require("../../../assets/calendarDateIcon.svg");

type TabKey = "events" | "training";

export interface IUpcomingEventsCardProps {
  eventsData?: IEventData[];
  trainingData?: IEventData[];
  currentTab?: TabKey;
  context: WebPartContext;
}

interface IUpcomingEventsCardState {
  tab: TabKey;
  currentEventIndex: number;
  currentTrainingIndex: number;
  eventsData: IEventData[];
  trainingData: IEventData[];
  loading: boolean;
  error?: string;
}

export default class UpcomingEventsCard extends React.Component<IUpcomingEventsCardProps, IUpcomingEventsCardState> {
  constructor(props: IUpcomingEventsCardProps) {
    super(props);
    this.state = {
      tab: (props.currentTab || "events") as TabKey,
      currentEventIndex: 0,
      currentTrainingIndex: 0,
      eventsData: [],
      trainingData: [],
      loading: true,
      error: undefined,
    };
  }

  public componentDidMount(): void {
    void this.loadData();
  }

  public componentDidUpdate(prevProps: IUpcomingEventsCardProps): void {
    if (
      this.props.currentTab &&
      this.props.currentTab !== prevProps.currentTab &&
      this.props.currentTab !== this.state.tab
    ) {
      this.setState({ tab: this.props.currentTab });
    }
  }

  private async loadData(): Promise<void> {
    try {
      const { eventsData, trainingData } = await fetchUpcomingEventsAndTraining(this.props.context);
      this.setState({ eventsData, trainingData, loading: false, error: undefined });
    } catch {
      this.setState({ loading: false, error: "Failed to load data" });
    }
  }

  public render(): React.ReactElement<IUpcomingEventsCardProps> {
    const { tab, currentEventIndex, currentTrainingIndex, loading, error } = this.state;

    const effectiveEvents = this.props.eventsData || this.state.eventsData;
    const effectiveTraining = this.props.trainingData || this.state.trainingData;

    const currentEvent = effectiveEvents[currentEventIndex];
    const currentTraining = effectiveTraining[currentTrainingIndex];

    return (
      <section className={styles.card} aria-label="Upcoming Events and Training">
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <img src={CalendarIcon} className={styles.icon24} alt="" />
            <span className={styles.upcomingText}>Upcoming Events & Trainings</span>
          </div>
        </div>

        {loading && <div style={{ fontSize: 12, marginTop: 8 }}>Loading...</div>}
        {error && !loading && (
          <div style={{ fontSize: 12, marginTop: 8, color: "#DA291C" }}>{error}</div>
        )}

        <div className={styles.segmentWrap}>
          <div className={styles.segmentInner}>
            <button
              className={`${styles.segBtn} ${tab === "events" ? styles.segActive : ""}`}
              onClick={() => this.setState({ tab: "events" })}
              type="button"
            >
              Events
            </button>
            <button
              className={`${styles.segBtn} ${tab === "training" ? styles.segActive : ""}`}
              onClick={() => this.setState({ tab: "training" })}
              type="button"
            >
              Training
            </button>
          </div>
        </div>

        {tab === "events" && currentEvent && (
          <div className={styles.eventCard}>
            <div className={styles.eventContent}>
              <div className={styles.imageRow}>
                {currentEvent.eventImage && (
                  <img className={styles.eventImage} src={currentEvent.eventImage} alt={currentEvent.eventTitle} />
                )}
                {currentEvent.isRegistered && (
                  <div className={styles.registerPill}>
                    <span className={styles.registerText}>Upcoming</span>
                  </div>
                )}
              </div>

              <div className={styles.categoryLabel}>{currentEvent.eventCategory}</div>
              <div className={styles.eventTitle}>{currentEvent.eventTitle}</div>

              <div className={styles.locationRow}>
                <img src={LocationIcon} className={styles.icon16} alt="" />
                <span className={styles.locationText}>{currentEvent.eventLocation}</span>
              </div>

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

        {tab === "training" && currentTraining && (
          <div className={styles.eventCard}>
            <div className={styles.eventContent}>
              <div className={styles.imageRow}>
                {currentTraining.eventImage ? (
                  <img className={styles.eventImage} src={currentTraining.eventImage} alt={currentTraining.eventTitle} />
                ) : (
                  <div className={styles.imagePlaceholder} />
                )}
                {!currentTraining.isRegistered && (
                  <div className={styles.registerPillMuted}>
                    <span className={styles.registerText}>Upcoming</span>
                  </div>
                )}
              </div>

              <div className={styles.categoryLabel}>{currentTraining.eventCategory}</div>
              <div className={styles.eventTitle}>{currentTraining.eventTitle}</div>

              <div className={styles.locationRow}>
                <img src={LocationIcon} className={styles.icon16} alt="" />
                <span className={styles.locationText}>{currentTraining.eventLocation}</span>
              </div>

              <div className={styles.dateTimeRow}>
                <div className={styles.dateItem}>
                  <img src={DateCalendarIcon} className={styles.icon16} alt="" />
                  <span className={styles.dateText}>{currentTraining.eventDate}</span>
                </div>
                <div className={styles.timeItem}>
                  <img src={ClockIcon} className={styles.icon16} alt="" />
                  <span className={styles.timeText}>{currentTraining.eventTime}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && tab === "events" && (!effectiveEvents || effectiveEvents.length === 0) && (
          <div className={styles.noEvent}>No upcoming events.</div>
        )}

        {!loading && !error && tab === "training" && (!effectiveTraining || effectiveTraining.length === 0) && (
          <div className={styles.noEvent}>No upcoming trainings.</div>
        )}
      </section>
    );
  }
}
