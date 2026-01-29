import * as React from "react";
import styles from "./EventDetail.module.scss";
import cardStyles from "../../Components/Events/Allevents.module.scss"; // reuse outer UI tokens
import EventRegistration from "../../Components/Events/Registration/RegistrationModal";

import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export interface IEventDetailProps {
  eventItem?: any;
  context?: any;
}

export interface IEventDetailState {
  showRegistration: boolean;
  isRegistered: boolean;
  countdown: string;
  refreshKey: number;
  isLive: boolean;
}

export default class EventDetail extends React.Component<IEventDetailProps, IEventDetailState> {
  private _timer?: number;

  constructor(props: IEventDetailProps) {
    super(props);
    this.state = {
      showRegistration: false,
      isRegistered: false,
      countdown: "",
      refreshKey: 0,
      isLive: false,
    };
  }

  public componentDidMount(): void {
    this.checkRegistration();
    this.startCountdownIfNeeded();
  }

  public componentDidUpdate(prevProps: IEventDetailProps, prevState: IEventDetailState): void {
    if (
      prevProps.eventItem !== this.props.eventItem ||
      prevProps.context !== this.props.context ||
      prevState.refreshKey !== this.state.refreshKey
    ) {
      this.checkRegistration();
      this.startCountdownIfNeeded();
    }

    if (prevState.isRegistered !== this.state.isRegistered) {
      this.startCountdownIfNeeded();
    }
  }

  public componentWillUnmount(): void {
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this._timer) {
      window.clearInterval(this._timer);
      this._timer = undefined;
    }
  }

  private extractFirstLine(value: string): string {
    if (!value) return "";
    return value.split("\n")[0]?.trim() || "";
  }

  // ✅ Prefer ISO token if SharePoint provides "display\nISO"
  private pickBestDateText(v: any): string {
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
  }

  // ✅ Same robust parsing as outer cards (handles object/dateTime + ISO without TZ)
  private parseSPDate(value: any): Date | null {
    if (!value) return null;

    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

    // SharePoint/Graph sometimes sends { dateTime: "...", timeZone: "..." }
    if (typeof value === "object" && value?.dateTime) {
      const rawObj = this.pickBestDateText(value.dateTime);

      const hasTz = /Z$|[+-]\d{2}:?\d{2}$/.test(rawObj);
      const looksIso =
        /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(rawObj);

      const normalized =
        looksIso && !hasTz
          ? `${rawObj.includes(" ") ? rawObj.replace(" ", "T") : rawObj}Z`
          : rawObj;

      const d = new Date(normalized);
      return isNaN(d.getTime()) ? null : d;
    }

    const raw = this.pickBestDateText(value);
    if (!raw) return null;

    const hasTz = /Z$|[+-]\d{2}:?\d{2}$/.test(raw);
    const looksIso =
      /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(raw);

    const normalizedRaw =
      looksIso && !hasTz
        ? `${raw.includes(" ") ? raw.replace(" ", "T") : raw}Z`
        : raw;

    const d1 = new Date(normalizedRaw);
    return isNaN(d1.getTime()) ? null : d1;
  }

  private formatTime(value: any): string {
    const d = this.parseSPDate(value);
    if (!d) return "";
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  private formatDate(value: any): string {
    const d = this.parseSPDate(value);
    if (!d) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    return `${day} ${month}`;
  }

  private isPastEvent(endValue: any): boolean {
    const end = this.parseSPDate(endValue);
    if (!end) return true;
    return end.getTime() <= Date.now();
  }

  private isLiveEvent(startValue: any, endValue: any): boolean {
    const start = this.parseSPDate(startValue);
    const end = this.parseSPDate(endValue);
    if (!start || !end) return false;
    const now = Date.now();
    return start.getTime() <= now && now < end.getTime();
  }

  private getEventId(item: any): number {
    const raw =
      item?.ListItemID ??
      item?.ListItemId ??
      item?.ID ??
      item?.Id ??
      item?.id ??
      item?.listItemId ??
      0;

    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }

  private getSP(): SPFI | null {
    try {
      return this.props.context ? spfi().using(SPFx(this.props.context)) : null;
    } catch {
      return null;
    }
  }

  private async getCurrentUserId(sp: SPFI): Promise<number> {
    const legacyId = (this.props?.context?.pageContext as any)?.legacyPageContext?.userId;
    if (legacyId) return Number(legacyId);

    try {
      const me: any = await sp.web.currentUser.select("Id")();
      return Number(me?.Id || 0);
    } catch {
      return 0;
    }
  }

  private parseNumericIdList(raw: any): number[] {
    const text = String(raw || "");
    const tokens = text
      .split(/[,;\n\r]+/g)
      .map((t) => t.trim())
      .filter(Boolean);

    const ids = tokens
      .filter((t) => /^\d+$/.test(t))
      .map((t) => parseInt(t, 10))
      .filter((n) => Number.isFinite(n) && n > 0);

    return Array.from(new Set(ids));
  }

  private async checkRegistration(): Promise<void> {
    const item = this.props.eventItem?.[0];
    if (!item || !this.props.context) return;

    const eventId = this.getEventId(item);
    if (!eventId) {
      this.setState({ isRegistered: false });
      return;
    }

    const sp = this.getSP();
    if (!sp) return;

    try {
      const userId = await this.getCurrentUserId(sp);
      if (!userId) {
        this.setState({ isRegistered: false });
        return;
      }

      const rows: any[] = await sp.web.lists
        .getByTitle("Registered User Event")
        .items.select("Id", "AuthorId", "TIRRegisteredUsers")
        .filter(`AuthorId eq ${userId}`)
        .orderBy("Id", false)
        .top(1)();

      const row = rows?.[0];
      const ids = this.parseNumericIdList(row?.TIRRegisteredUsers);
      const isRegistered = ids.includes(eventId);

      if (this.state.isRegistered !== isRegistered) {
        this.setState({ isRegistered });
      }
    } catch (e) {
      this.setState({ isRegistered: false });
      // eslint-disable-next-line no-console
      console.error("EventDetail registration check failed", e);
    }
  }

  // ✅ Same countdown logic style as outer EventCard (days OR HH:MM:SS)
  private computeCountdown(startValue: any): string {
    const start = this.parseSPDate(startValue);
    if (!start) return "";

    const diff = start.getTime() - Date.now();
    if (diff <= 0) return "";

    const daysRemaining = diff / (1000 * 60 * 60 * 24);
    const days = Math.floor(daysRemaining);
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days} Day${days > 1 ? "s" : ""}`;

    const hh = hours.toString().padStart(2, "0");
    const mm = minutes.toString().padStart(2, "0");
    const ss = seconds.toString().padStart(2, "0");

    if (hours > 0) return `${hh}:${mm}:${ss}`;
    return `${mm}:${ss}`;
  }

  private startCountdownIfNeeded(): void {
    const item = this.props.eventItem?.[0];
    if (!item) return;

    const isPast = this.isPastEvent(item.eventEndDate);
    const isLive = this.isLiveEvent(item.eventStartDate, item.eventEndDate);

    // Only show countdown if registered, not past, and not live.
    if (!this.state.isRegistered || isPast || isLive) {
      this.clearTimer();
      if (this.state.countdown !== "" || this.state.isLive !== isLive) {
        this.setState({ countdown: "", isLive });
      }
      return;
    }

    const update = () => {
      const countdown = this.computeCountdown(item.eventStartDate);
      if (this.state.countdown !== countdown) this.setState({ countdown, isLive: false });
    };

    update();
    this.clearTimer();
    this._timer = window.setInterval(update, 1000);
  }

  private handleRegisterClick = () => {
    this.setState({ showRegistration: true });
  };

  private handleDismissRegistration = () => {
    this.setState({ showRegistration: false }, () => {
      window.setTimeout(() => {
        this.setState((s) => ({ refreshKey: s.refreshKey + 1 }));
      }, 500);
    });
  };

  public render(): React.ReactElement<IEventDetailProps> {
    const { eventItem } = this.props;
    const { showRegistration, isRegistered, countdown, isLive } = this.state;

    const item = eventItem?.[0] || {
      title: "No Event Available",
      eventStartDate: "",
      eventEndDate: "",
      location: "N/A",
      id: 0,
      category: "General",
    };

    const eventId = this.getEventId(item);

    const startTime = this.formatTime(item.eventStartDate);
    const endTime = this.formatTime(item.eventEndDate);
    const dateLabel = this.formatDate(item.eventStartDate);

    const isPast = this.isPastEvent(item.eventEndDate);
    const location = this.extractFirstLine(item.location) || "N/A";

    // ✅ Status pill text (same behavior as outer cards)
    const statusText = isPast ? "Past event" : isRegistered ? "Registered" : "Upcoming";
    const statusClass = isPast
      ? styles.tagPast
      : isRegistered
      ? styles.tagRegistered
      : styles.tagUpcoming;

    return (
      <div className={styles.card}>
        <div className={styles.tagsRow}>
          <span className={`${styles.tagPrimary} ${statusClass}`}>{statusText}</span>
          <span className={styles.tagSecondary}>{item.category || "Information"}</span>
        </div>

        <h2 className={styles.title}>{item.title}</h2>

        <div className={styles.row}>
          <span className={styles.icon}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
          </span>

          <span className={styles.text}>
            {startTime && endTime ? `${startTime} – ${endTime}` : "No Time Available"}
          </span>

          <span className={styles.separator}>|</span>
          <span className={styles.text}>{dateLabel || "No Date"}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.icon}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </span>
          <span className={styles.text}>{location}</span>
        </div>

        {/* ✅ Actions area - reuse outer styles correctly (needs actionSection wrapper) */}
        <div className={cardStyles.actionSection}>
          {isPast ? (
            <div className={styles.pastEventLabel}>Past event</div>
          ) : isRegistered ? (
            isLive ? (
              <div className={styles.liveLabel}>Event is live</div>
            ) : (
              <div className={cardStyles.countdownWrapper}>
                <span className={cardStyles.countdownLabel}>Event starts in</span>
                <span className={cardStyles.countdownTime}>{countdown}</span>
              </div>
            )
          ) : (
            <button
              type="button"
              className={cardStyles.registerButton}
              onClick={this.handleRegisterClick}
              disabled={eventId === 0}
            >
              Register
            </button>
          )}
        </div>

        {showRegistration && eventId !== 0 && (
          <EventRegistration
            isOpen={showRegistration}
            onDismiss={this.handleDismissRegistration}
            context={this.props.context}
            eventId={eventId}
          />
        )}
      </div>
    );
  }
}
