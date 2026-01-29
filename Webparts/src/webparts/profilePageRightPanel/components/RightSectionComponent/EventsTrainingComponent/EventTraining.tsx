import * as React from "react";
import moment from "moment";
import styles from "./EventTraining.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";

import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/search";
import type { ISearchQuery } from "@pnp/sp/search";

// Reuse ContentType IDs already used by the main Events & Trainings webpart
import { ContentTypeId } from "../../../../services/listServices";

const CalendarIcon = require("../../../assets/calendarIcon.svg");
const ClockIcon = require("../../../assets/clockIcon.svg");
const LocationIcon = require("../../../assets/locationIcon.svg");
const DateCalendarIcon = require("../../../assets/calendarDateIcon.svg");

type TabKey = "events" | "training";

// Local shape used by this card (kept compatible with the old service contract)
export interface IEventData {
  eventTitle: string;
  eventCategory: string;
  eventDate?: string | Date;
  eventEndDate?: string | Date;
  eventTime?: string;
  eventLocation?: string;
  eventImage?: string;
  pageUrl?: string;
  isRegistered?: boolean;
}

/** ---------- Formatting helpers (date + time) ---------- */

/** Prefer ISO token if SharePoint/Search provides "display\nISO" */
const pickBestDateText = (v: any): string => {
  const s = String(v ?? "").trim();
  if (!s) return "";

  const parts = s
    .split(/\n+/g)
    .map((x) => x.trim())
    .filter(Boolean);

  const iso =
    parts.find((p) => /^\d{4}-\d{2}-\d{2}T/.test(p)) ||
    parts.find((p) => /\d{4}-\d{2}-\d{2}T/.test(p));

  return iso || parts[0] || "";
};

/** Robust date parser (ISO-prefer + UTC-safe + supports "M/D/YYYY h:mm A") */
const parseDateInput = (dateInput?: any): Date | null => {
  if (!dateInput) return null;

  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;

  // Sometimes Graph/search returns { dateTime: "..." }
  if (typeof dateInput === "object") {
    const dt = (dateInput as any)?.dateTime || (dateInput as any)?.DateTime;
    if (dt) {
      const rawObj = pickBestDateText(dt);
      const hasTz = /Z$|[+-]\d{2}:?\d{2}$/.test(rawObj);
      const looksIso =
        /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(rawObj);

      const normalized =
        looksIso && !hasTz
          ? `${rawObj.includes(" ") ? rawObj.replace(" ", "T") : rawObj}Z`
          : rawObj;

      const dObj = new Date(normalized);
      return isNaN(dObj.getTime()) ? null : dObj;
    }
  }

  const raw = pickBestDateText(dateInput);
  if (!raw) return null;

  const hasTz = /Z$|[+-]\d{2}:?\d{2}$/.test(raw);
  const looksIso =
    /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(raw);

  const normalized =
    looksIso && !hasTz
      ? `${raw.includes(" ") ? raw.replace(" ", "T") : raw}Z`
      : raw;

  const d1 = new Date(normalized);
  if (!isNaN(d1.getTime())) return d1;

  const m = moment(
    normalized,
    [
      moment.ISO_8601,
      "M/D/YYYY h:mm A",
      "M/D/YYYY h:mm:ss A",
      "M/D/YYYY H:mm",
      "M/D/YYYY",
      "DD/MM/YYYY",
      "DD/MM/YYYY HH:mm",
    ],
    true
  );

  return m.isValid() ? m.toDate() : null;
};

const toTimeText = (d: Date): string =>
  d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

const buildTimeRange = (start?: string | Date, end?: string | Date): string => {
  const s = parseDateInput(start);
  const e = parseDateInput(end);
  if (!s && !e) return "";
  if (s && !e) return toTimeText(s);
  if (!s && e) return toTimeText(e);
  return `${toTimeText(s as Date)} - ${toTimeText(e as Date)}`;
};

const isUpcomingByDates = (start?: string | Date, end?: string | Date): boolean => {
  const now = new Date();
  const s = parseDateInput(start);
  const e = parseDateInput(end);

  // If we have end -> keep it until it ends
  if (e) return e.getTime() >= now.getTime();
  if (s) return s.getTime() >= now.getTime();
  return false;
};

const getPagePreviewUrl = (pageUrl?: string): string => {
  const url = (pageUrl || "").trim();
  if (!url) return "";

  try {
    const u = new URL(url);
    const sitePath = u.pathname.split("/").slice(0, 3).join("/"); // /sites/<site>

    if (u.pathname.toLowerCase().indexOf(".aspx") === -1) return "";

    const lastIndex = u.pathname.lastIndexOf("/") + 1;
    const fileName = u.pathname.substring(lastIndex);
    const fileFinalURL = u.pathname.replace(fileName, encodeURIComponent(fileName));

    return `${sitePath}/_layouts/15/getpreview.ashx?resolution=6&path=${fileFinalURL}&clientType=modernWebPart`;
  } catch {
    return "";
  }
};

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

const formatDisplayDate = (dateInput?: string | Date): string => {
  const parsedDate = parseDateInput(dateInput);
  if (!parsedDate) return (dateInput as any) || "-";

  return parsedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

const formatTimeToken = (timeTokenRaw: string): string => {
  const token = timeTokenRaw.trim();
  if (!token) return "";

  const ampmMatch = token.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (ampmMatch) {
    const hour = Number(ampmMatch[1]);
    const minutes = ampmMatch[2] ? ampmMatch[2] : "";
    const ampm = ampmMatch[3].toUpperCase();

    const showMinutes = minutes && minutes !== "00";
    return showMinutes ? `${hour}:${minutes} ${ampm}` : `${hour} ${ampm}`;
  }

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

  return token;
};

const formatDisplayTimeRange = (timeInput?: string): string => {
  const raw = (timeInput || "").trim();
  if (!raw) return "-";

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
  private sp: SPFI;

  constructor(props: IUpcomingEventsCardProps) {
    super(props);

    this.sp = spfi().using(SPFx(props.context));

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
      if (this.props.eventsData || this.props.trainingData) {
        this.setState({ loading: false, error: undefined });
        return;
      }

      const { eventsData, trainingData } = await this.fetchUpcomingEventsAndTraining();
      this.setState({ eventsData, trainingData, loading: false, error: undefined });
    } catch {
      this.setState({ loading: false, error: "Failed to load data" });
    }
  }

  private async searchPagesByContentType(
    contentTypeId: string,
    selectProperties: string[],
    rowLimit: number = 200
  ): Promise<any[]> {
    const constraints = `AND ContentTypeId:(${contentTypeId}*)`;

    const q: ISearchQuery = {
      Querytext: "*",
      TrimDuplicates: false,
      SelectProperties: selectProperties,
      QueryTemplate: `{searchTerms}`,
      HiddenConstraints: `-SitePageFlags:Template ${constraints}`,
      EnableInterleaving: true,
      RowLimit: rowLimit,
    };

    const res: any = await this.sp.search(q);
    return (res?.PrimarySearchResults || []) as any[];
  }

  private pickImageFromSearchHit(hit: any): string {
    let img = "";

    if (hit?.PictureThumbnailURL) {
      img = String(hit.PictureThumbnailURL);
    }

    if (!img && hit?.BannerImageUrlOWSURLH) {
      const raw = String(hit.BannerImageUrlOWSURLH);
      img = raw.split(",")[0].trim();
    }

    if (!img && hit?.PublishingImage) {
      const m = String(hit.PublishingImage).match(/src="([^"]+)"/i);
      if (m && m[1]) img = m[1];
    }

    if (!img && hit?.URL) {
      img = getPagePreviewUrl(String(hit.URL));
    }

    return img;
  }

  private async fetchUpcomingEventsAndTraining(): Promise<{ eventsData: IEventData[]; trainingData: IEventData[] }> {
    const commonSelect = [
      "Title",
      "TIREventStartDate",
      "TIREventEndDate",
      "TIRLocation",
      "URL",
      "PictureThumbnailURL",
      "BannerImageUrlOWSURLH",
      "PublishingImage",
    ];

    const eventHits = await this.searchPagesByContentType(
      ContentTypeId.EVENT,
      [...commonSelect, "TIREventCategory"],
      300
    );

    const trainingHits = await this.searchPagesByContentType(
      ContentTypeId.TRAINING,
      [...commonSelect],
      300
    );

    const eventsData: IEventData[] = (eventHits || [])
      .map((hit: any) => {
        const start = hit?.TIREventStartDate;
        const end = hit?.TIREventEndDate;
        return {
          eventTitle: String(hit?.Title || "").trim(),
          eventCategory: String(hit?.TIREventCategory || "Event").trim() || "Event",
          eventDate: start,
          eventEndDate: end,
          eventTime: buildTimeRange(start, end),
          eventLocation: String(hit?.TIRLocation || "").trim(),
          eventImage: this.pickImageFromSearchHit(hit),
          pageUrl: String(hit?.URL || "").trim(),
          isRegistered: false,
        } as IEventData;
      })
      .filter((x: IEventData) => !!x.eventTitle)
      .filter((x: IEventData) => isUpcomingByDates(x.eventDate, x.eventEndDate));

    const trainingData: IEventData[] = (trainingHits || [])
      .map((hit: any) => {
        const start = hit?.TIREventStartDate;
        const end = hit?.TIREventEndDate;
        return {
          eventTitle: String(hit?.Title || "").trim(),
          eventCategory: "Training",
          eventDate: start,
          eventEndDate: end,
          eventTime: buildTimeRange(start, end),
          eventLocation: String(hit?.TIRLocation || "").trim(),
          eventImage: this.pickImageFromSearchHit(hit),
          pageUrl: String(hit?.URL || "").trim(),
          isRegistered: false,
        } as IEventData;
      })
      .filter((x: IEventData) => !!x.eventTitle)
      .filter((x: IEventData) => isUpcomingByDates(x.eventDate, x.eventEndDate));

    const sortByStart = (a: IEventData, b: IEventData): number => {
      const da = parseDateInput(a.eventDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const db = parseDateInput(b.eventDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return da - db;
    };

    eventsData.sort(sortByStart);
    trainingData.sort(sortByStart);

    return {
      eventsData: eventsData.slice(0, 20),
      trainingData: trainingData.slice(0, 20),
    };
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
                <div className={styles.registerPill}>
                  <span className={styles.registerText}>Upcoming</span>
                </div>
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
                  <div className={styles.registerPill}>
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
