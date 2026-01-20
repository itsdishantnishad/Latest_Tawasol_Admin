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
  viewAllUrl?: string;
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

/** ---------- Formatting helpers (date + time) ---------- */
const parseDateInput = (dateInput?: string | Date): Date | null => {
  if (!dateInput) return null;

  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) return dateInput;

  const raw = String(dateInput).trim();
  if (!raw) return null;

  // ISO / SharePoint style
  const isoCandidate = new Date(raw);
  if (!isNaN(isoCandidate.getTime())) return isoCandidate;

  // DD/MM/YYYY (common in India)
  const ddmmyyyy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const day = Number(ddmmyyyy[1]);
    const month = Number(ddmmyyyy[2]);
    const year = Number(ddmmyyyy[3]);
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
};

const formatDisplayDate = (dateInput?: string | Date): string => {
  const parsedDate = parseDateInput(dateInput);
  if (!parsedDate) return (dateInput as any) || "-";

  // "11 July 2024"
  return parsedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

const formatTimeToken = (timeTokenRaw: string): string => {
  const token = timeTokenRaw.trim();
  if (!token) return "";

  // 1) "9:00 AM" / "9 AM" / "9am"
  const ampmMatch = token.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (ampmMatch) {
    const hour = Number(ampmMatch[1]);
    const minutes = ampmMatch[2] ? ampmMatch[2] : "";
    const ampm = ampmMatch[3].toUpperCase();

    const showMinutes = minutes && minutes !== "00";
    return showMinutes ? `${hour}:${minutes} ${ampm}` : `${hour} ${ampm}`;
  }

  // 2) "09:00" / "14:30" (24h)
  const hhmmMatch = token.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmmMatch) {
    const hour24 = Number(hhmmMatch[1]);
    const minutes = hhmmMatch[2];

    const ampm = hour24 >= 12 ? "PM" : "AM";
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;

    const showMinutes = minutes !== "00";
    return showMinutes ? `${hour12}:${minutes} ${ampm}` : `${hour12} ${ampm}`;
  }

  // 3) fallback: keep as-is
  return token;
};

const formatDisplayTimeRange = (timeInput?: string): string => {
  const raw = (timeInput || "").trim();
  if (!raw) return "-";

  // support "-" or "–" or "to"
  const parts =
    raw.indexOf("–") > -1 ? raw.split("–") :
    raw.indexOf("-") > -1 ? raw.split("-") :
    raw.toLowerCase().indexOf(" to ") > -1 ? raw.toLowerCase().split(" to ") :
    [raw];

  const startToken = parts[0]?.trim() || "";
  const endToken = parts[1]?.trim() || "";

  const startFormatted = formatTimeToken(startToken);
  const endFormatted = formatTimeToken(endToken);

  if (startFormatted && endFormatted) return `${startFormatted} - ${endFormatted}`;
  return startFormatted || raw;
};

export default class UpcomingEventsCard extends React.Component<
  IUpcomingEventsCardProps,
  IUpcomingEventsCardState
> {
  constructor(props: IUpcomingEventsCardProps) {
    super(props);
    this.state = {
      tab: (props.currentTab || "events") as TabKey,
      currentEventIndex: 0,
      currentTrainingIndex: 0,
      eventsData: [],
      trainingData: [],
      loading: true,
      error: undefined
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
    const { viewAllUrl } = this.props;

    const effectiveEvents = this.props.eventsData || this.state.eventsData;
    const effectiveTraining = this.props.trainingData || this.state.trainingData;

    const currentEvent = effectiveEvents[currentEventIndex];
    const currentTraining = effectiveTraining[currentTrainingIndex];

    return (
      <section className={styles.card} aria-label="My Events & Trainings">
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <img src={CalendarIcon} className={styles.icon24} alt="" />
            <span className={styles.upcomingText}>My Events & Trainings</span>
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

              <div className={styles.categoryLabel}>{currentEvent.eventCategory}</div>
              <div className={styles.eventTitle}>{currentEvent.eventTitle}</div>

              <div className={styles.locationRow}>
                <img src={LocationIcon} className={styles.icon16} alt="" />
                <span className={styles.locationText}>{currentEvent.eventLocation}</span>
              </div>

              <div className={styles.dateTimeRow}>
                <div className={styles.dateItem}>
                  <img src={DateCalendarIcon} className={styles.icon16} alt="" />
                  <span className={styles.dateText}>
                    {formatDisplayDate(currentEvent.eventDate)}
                  </span>
                </div>
                <div className={styles.timeItem}>
                  <img src={ClockIcon} className={styles.icon16} alt="" />
                  <span className={styles.timeText}>
                    {formatDisplayTimeRange(currentEvent.eventTime)}
                  </span>
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
                  <img
                    className={styles.eventImage}
                    src={currentTraining.eventImage}
                    alt={currentTraining.eventTitle}
                  />
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
                  <span className={styles.dateText}>
                    {formatDisplayDate(currentTraining.eventDate)}
                  </span>
                </div>
                <div className={styles.timeItem}>
                  <img src={ClockIcon} className={styles.icon16} alt="" />
                  <span className={styles.timeText}>
                    {formatDisplayTimeRange(currentTraining.eventTime)}
                  </span>
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

        {/* CTA */}
        <a
          className={styles.cta}
          href={viewAllUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          data-interception="off"
          aria-disabled={!viewAllUrl}
          onClick={(e) => {
            if (!viewAllUrl) e.preventDefault();
          }}
        >
          <span className={styles.ctaText}>View All</span>
        </a>
      </section>
    );
  }
}
