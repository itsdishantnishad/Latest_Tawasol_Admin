import * as React from "react";
import styles from "./EventDetail.module.scss";
import cardStyles from "../../Components/Events/Allevents.module.scss"; // ✅ reuse EventCard styles
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

  private safeDate(dateStr: string): Date | null {
    const clean = this.extractFirstLine(dateStr);
    if (!clean) return null;
    const d = new Date(clean);
    if (isNaN(d.getTime())) return null;
    return d;
  }

  private formatTime(dateStr: string): string {
    const d = this.safeDate(dateStr);
    if (!d) return "";
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  private formatDate(dateStr: string): string {
    const d = this.safeDate(dateStr);
    if (!d) return "";
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    return `${day} ${month}`;
  }

  private isPastEvent(endDateStr: string): boolean {
    const end = this.safeDate(endDateStr);
    if (!end) return true;
    return end.getTime() <= Date.now();
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
    const re = new RegExp("[,;\\n\\r]+");
    const tokens = text
      .split(re)
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
      // if ID not resolved, keep UI in "not registered" state (but don't disable)
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

  private computeCountdown(eventStartDateStr: string): string {
    const start = this.safeDate(eventStartDateStr);
    if (!start) return "";

    const diff = start.getTime() - Date.now();
    if (diff <= 0) return "";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} Day${days > 1 ? "s" : ""}`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  private startCountdownIfNeeded(): void {
    const item = this.props.eventItem?.[0];
    if (!item) return;

    const isPast = this.isPastEvent(item.eventEndDate);

    // Only show countdown if registered and not past.
    if (!this.state.isRegistered || isPast) {
      this.clearTimer();
      if (this.state.countdown !== "") this.setState({ countdown: "" });
      return;
    }

    const update = () => {
      const countdown = this.computeCountdown(item.eventStartDate);
      if (this.state.countdown !== countdown) this.setState({ countdown });
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
    const { showRegistration, isRegistered, countdown } = this.state;

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

    return (
      <div className={styles.card}>
        <div className={styles.tagsRow}>
          {!isPast && eventId !== 0 && <span className={styles.tagPrimary}>Upcoming</span>}
          <span className={styles.tagSecondary}>{item.category || "Information"}</span>
        </div>

        <h2 className={styles.title}>{item.title}</h2>

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
          <span className={styles.text}>{dateLabel || "No Date"}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.icon}>
            <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.6">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </span>
          <span className={styles.text}>{location}</span>
        </div>

        {/* ✅ Use same UI styles as EventCard */}
        <div>
          {isPast ? (
            <div className={cardStyles.pastEventLabel}>Past event</div>
          ) : isRegistered ? (
            <div className={cardStyles.countdownWrapper}>
              <div className={cardStyles.countdownLabel}>Event starts in</div>
              <div className={cardStyles.countdownTime}>{countdown}</div>
            </div>
          ) : (
            <button type="button" className={cardStyles.registerButton} onClick={this.handleRegisterClick}>
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
