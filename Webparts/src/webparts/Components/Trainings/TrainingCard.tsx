import * as React from "react";
import styles from "./TrainingCard.module.scss";
import { SPFI, spfi, SPFx } from "@pnp/sp";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

const outlookIcon: string = require("../../assets/outlook-icon.svg");

function normalizeApprovalStatus(v: any): "none" | "pending" | "approved" | "rejected" {
  const raw = String(v ?? "").trim().toLowerCase();
  if (!raw) return "none";
  if (raw.includes("approve")) return "approved";
  if (raw.includes("reject")) return "rejected";
  if (raw.includes("pend")) return "pending";
  return "pending";
}

const safeStr = (v: any): string => String(v ?? "").trim();

const extractISODate = (value: any): string => {
  const s = String(value ?? "").trim();
  if (!s) return "";
  return s.split("\n").pop()?.trim() || "";
};

const addDays = (d: Date, days: number): Date => {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + days);
  return x;
};

const safeUrlFromHyperlinkField = (v: any): string => {
  if (!v) return "";
  if (typeof v === "string") return v;
  return String(v?.Url ?? v?.url ?? "").trim();
};

const extractTermGuid = (raw?: any): string => {
  const s = String(raw ?? "");
  const m = s.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return m ? m[0] : "";
};

const parseTaxonomyLabel = (raw?: any): string => {
  if (!raw) return "";
  if (typeof raw === "string") {
    const s = raw.trim();
    // e.g. "-1;#Human Capital|GUID" or "Human Capital|GUID" or "Human Capital"
    const after = s.includes(";#") ? s.split(";#").pop() || "" : s;
    const label = after.includes("|") ? after.split("|")[0] : after;
    return label.trim();
  }

  return safeStr(raw?.Label ?? raw?.label ?? raw?.TermLabel ?? raw?.termLabel);
};

export interface TrainingCardProps {
  startDate: string;
  endDate: string;
  category: string;
  title: string;
  subtitle: string;
  time: string;
  duration: string;
  location: string;
  imageUrl: string;
  pageUrl: string;
  trainingId: number; // Site Pages item ID
  meetingLink: string; // usually Site Pages Field: TIRJoiningURL
  context: any; // WebPartContext
  instructorName?: string;
  instructorTitle?: string;
  instructorImageUrl?: string;

  // Optional: if the parent already has Department from Search/RLDAS,
  // pass it so we don't need an extra Site Pages fetch.
  departmentName?: string;
  departmentTaxId?: string;
  department?: string;
}

interface TrainingCardState {
  isSubmitting: boolean;
  errorMessage: string;
  approvalStatus: "none" | "pending" | "approved" | "rejected";
  registeredItemId: number | null;
  isLoading: boolean;
  joinUrl: string;
  countdown: string;
}

class TrainingCard extends React.Component<TrainingCardProps, TrainingCardState> {
  private sp: SPFI;
  private countdownTimer: number | undefined;
  constructor(props: TrainingCardProps) {
    super(props);

    this.sp = spfi().using(SPFx(this.props.context));

    this.state = {
      isSubmitting: false,
      errorMessage: "",
      approvalStatus: "none",
      registeredItemId: null,
      isLoading: true,
      joinUrl: String(props.meetingLink || "").trim(),
      countdown: "",
    };
  }

  public componentDidMount(): void {
    this.startCountdown();
    void this.initialize();
  }

  public componentDidUpdate(prevProps: TrainingCardProps): void {
    if (
      prevProps.trainingId !== this.props.trainingId ||
      prevProps.meetingLink !== this.props.meetingLink
    ) {
      void this.initialize();
    }

    // ✅ NEW: restart countdown if dates changed
    if (
      prevProps.startDate !== this.props.startDate ||
      prevProps.endDate !== this.props.endDate
    ) {
      this.startCountdown();
    }
  }

  public componentWillUnmount(): void {
    this.stopCountdown(); // ✅ NEW
  }

  // -----------------------------------------
  // Utils
  // -----------------------------------------
  private getStartEndDates = (): { start: Date | null; end: Date | null } => {
    const startISO = extractISODate(this.props.startDate);
    const endISO = extractISODate(this.props.endDate);

    const s = startISO ? new Date(startISO) : null;
    const e = endISO ? new Date(endISO) : null;

    return {
      start: s && !isNaN(s.getTime()) ? s : null,
      end: e && !isNaN(e.getTime()) ? e : null,
    };
  };

  private isEventCompleted = (): boolean => {
    const { end } = this.getStartEndDates();
    return !!end && new Date().getTime() > end.getTime();
  };

  private getCurrentUserId = async (): Promise<number> => {
    let currentUserId: number = (this.props.context?.pageContext as any)?.legacyPageContext?.userId || 0;

    if (!currentUserId) {
      try {
        const me: any = await this.sp.web.currentUser.select("Id")();
        currentUserId = Number(me?.Id || 0);
      } catch {
        // ignore
      }
    }

    return Number(currentUserId || 0);
  };

  // -----------------------------------------
  // Department: Site Pages -> Registered Training (TIRDepartment)
  // NOTE: Uses ONLY internal name: TIRDepartment
  // -----------------------------------------
  private setDepartmentOnRegisteredTraining = async (
    registrationId: number,
    trainingPageId: number
  ): Promise<void> => {
    try {
      // 0) Prefer Department coming from parent (Search/RLDAS) when available
      let label = safeStr(this.props.departmentName || this.props.department);
      let guid = extractTermGuid(this.props.departmentTaxId);

      // 1) If still missing, read taxonomy from Site Pages item
      // NOTE:
      // "owstaxIdTIRDepartment" is NOT a real list field on the Items (OData) endpoint.
      // That key only appears in some responses like RenderListDataAsStream / Search.
      // Selecting it causes 400: "The field or property 'owstaxIdTIRDepartment' does not exist." (your console screenshot)
      let page: any = null;
      if (!label || !guid) {
        page = await this.sp.web.lists
          .getByTitle("Site Pages")
          .items.getById(trainingPageId)
          .select("TIRDepartment")();

        // TIRDepartment usually comes back as "Label|GUID" (or "-1;#Label|GUID").
        // Sometimes it can be an object with { Label, TermGuid } depending on how it was fetched.
        if (!label) label = parseTaxonomyLabel(page?.TIRDepartment);
        if (!guid) {
          guid =
            extractTermGuid(page?.TIRDepartment?.TermGuid) ||
            extractTermGuid(page?.TIRDepartment) ||
            extractTermGuid(page?.TIRDepartment?.termGuid);
        }
      }

      // 2) Text fallback for label (FieldValuesAsText gives label nicely)
      if (!label) {
        try {
          const text: any = await this.sp.web.lists
            .getByTitle("Site Pages")
            .items.getById(trainingPageId)
            .fieldValuesAsText();

          label = safeStr(text?.TIRDepartment);
        } catch {
          // ignore
        }
      }

      if (!label || !guid) {
        console.warn("[TrainingCard] Department not available on Site Pages item.", {
          trainingPageId,
          label,
          guid,
          keys: Object.keys(page || {}),
        });
        return;
      }

      const regItem = this.sp.web.lists.getByTitle("Registered Training").items.getById(registrationId);

      // Same robust approach as TrainingPageDetail:
      //  - Try multiple possible internal names
      //  - Try multiple value formats (taxonomy single vs text fallback)
      const fieldCandidates = ["TIRDepartment", "Department_x0020_Name", "DepartmentName", "Department"];
      const valueCandidates = [`-1;#${label}|${guid}`, `${label}|${guid}`, label];

      for (const fieldName of fieldCandidates) {
        for (const fieldValue of valueCandidates) {
          try {
            const res: any = await regItem.validateUpdateListItem([
              { FieldName: fieldName, FieldValue: fieldValue },
            ]);

            const hasException = Array.isArray(res) && res.some((r) => r?.HasException);
            if (!hasException) return; // success
          } catch {
            // keep trying
          }
        }
      }

      console.warn("[TrainingCard] Failed to set TIRDepartment on Registered Training item.", {
        registrationId,
        trainingPageId,
        label,
        guid,
      });
    } catch (e) {
      console.warn("[TrainingCard] Department update failed.", e);
    }
  };

  // -----------------------------------------
  // Init: joinUrl + existing request
  // -----------------------------------------
  private initialize = async (): Promise<void> => {
    const { trainingId, meetingLink } = this.props;

    if (!trainingId) {
      this.setState({ isLoading: false });
      return;
    }

    this.setState({ isLoading: true, errorMessage: "" });

    // Prefer join URL from props, else fetch from Site Pages (Field: TIRJoiningURL)
    let joinUrl = String(meetingLink || "").trim();
    if (!joinUrl) {
      try {
        const page: any = await this.sp.web.lists
          .getByTitle("Site Pages")
          .items.getById(trainingId)
          .select("TIRJoiningURL")();

        joinUrl = safeUrlFromHyperlinkField(page?.TIRJoiningURL);
      } catch {
        // ignore
      }
    }

    this.setState({ joinUrl });

    await this.checkExistingRequest();
  };

  // -----------------------------------------
  // Check existing registration
  // -----------------------------------------
  private checkExistingRequest = async (): Promise<void> => {
    const { trainingId } = this.props;
    if (!trainingId) {
      this.setState({ isLoading: false });
      return;
    }

    const currentUserId = await this.getCurrentUserId();

    try {
      const existingItems = await this.sp.web.lists
        .getByTitle("Registered Training")
        .items.select("Id", "TIRApproval", "Created")
        .filter(`TIRTrainingID eq ${trainingId} and AuthorId eq ${currentUserId}`)
        .orderBy("Created", false)
        .top(1)();

      if (existingItems.length > 0) {
        const registeredItem = existingItems[0];
        const status = normalizeApprovalStatus(registeredItem?.TIRApproval);

        this.setState({
          approvalStatus: status,
          registeredItemId: registeredItem?.Id ?? null,
          isLoading: false,
        });
      } else {
        this.setState({
          approvalStatus: "none",
          registeredItemId: null,
          isLoading: false,
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Check existing request error:", error);
      this.setState({
        isLoading: false,
        errorMessage: "Failed to check registration status",
      });
    }
  };

  // -----------------------------------------
  // Request approval (+ Department + Stage)
  // -----------------------------------------
  private handleRequestApproval = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    const { trainingId, title } = this.props;

    if (!trainingId) {
      this.setState({ errorMessage: "Training ID not found." });
      return;
    }

    const currentUserId = await this.getCurrentUserId();

    this.setState({ isSubmitting: true, errorMessage: "" });

    try {
      // Check again for existing registration before submitting
      const existingItems = await this.sp.web.lists
        .getByTitle("Registered Training")
        .items.select("Id", "TIRApproval", "Created")
        .filter(`TIRTrainingID eq ${trainingId} and AuthorId eq ${currentUserId}`)
        .orderBy("Created", false)
        .top(1)();

      if (existingItems.length > 0) {
        const existingItem = existingItems[0];
        const status = normalizeApprovalStatus(existingItem?.TIRApproval);

        this.setState({
          isSubmitting: false,
          approvalStatus: status,
          registeredItemId: existingItem?.Id ?? null,
          errorMessage: "",
        });
        return;
      }

      const addRes = await this.sp.web.lists
        .getByTitle("Registered Training")
        .items.add({
          TIRApproval: "Pending",
          TIRStage: "Pending",
          TIRTrainingID: trainingId,
          Title: title,
        });

      // PnP can return Id differently depending on version
      let createdId: number | null =
        addRes?.data?.Id ?? addRes?.data?.ID ?? addRes?.item?.Id ?? addRes?.item?.ID ?? null;

      if (!createdId) {
        const latest = await this.sp.web.lists
          .getByTitle("Registered Training")
          .items.select("Id")
          .filter(`TIRTrainingID eq ${trainingId} and AuthorId eq ${currentUserId}`)
          .orderBy("Created", false)
          .top(1)();

        createdId = latest?.[0]?.Id ?? null;
      }

      // Set Department (TIRDepartment) from Site Pages item
      if (createdId) {
        await this.setDepartmentOnRegisteredTraining(createdId, trainingId);
      }

      this.setState({
        isSubmitting: false,
        approvalStatus: "pending",
        registeredItemId: createdId,
        errorMessage: "",
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Request approval error:", error);
      this.setState({
        isSubmitting: false,
        errorMessage: "Failed to submit approval request",
      });
    }
  };

  private handleJoinTraining = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    const link = String(this.state.joinUrl || "").trim();
    if (link) {
      window.open(link, "_blank");
    } else {
      alert("Link will be shared later.");
    }
  };

  private handleGiveFeedback = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    const { registeredItemId } = this.state;
    const { context } = this.props;

    window.location.href = `${context.pageContext.web.absoluteUrl}/SitePages/TrainingFeedback.aspx?registrationId=${registeredItemId}`;
  };

  // -----------------------------------------
  // Button logic
  // Rule (B): 1 day before Start Date => "Registered Training"
  // During Start..End => "Join Training"
  // -----------------------------------------
  private getButtonConfig = () => {
    const { approvalStatus, isSubmitting, isLoading } = this.state;

    if (isLoading) {
      return {
        text: "Loading...",
        disabled: true,
        className: styles.loadingButton,
        onClick: undefined as any,
      };
    }

    const now = new Date();
    const { start, end } = this.getStartEndDates();

    const isPast = this.isEventCompleted();
    const isJoinWindow = !!start && !!end && now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
    const isRegisteredWindow = !!start && now.getTime() >= addDays(start, -1).getTime() && now.getTime() < start.getTime();

    if (isPast) {
      if (approvalStatus === "approved") {
        return {
          text: "Give Feedback",
          onClick: this.handleGiveFeedback,
          className: styles.feedbackButton,
          disabled: false,
        };
      }

      return {
        text: "Past Training",
        disabled: true,
        className: styles.pastTrainingButton,
        onClick: undefined as any,
      };
    }

    if (approvalStatus === "pending") {
      return {
        text: "Request Pending",
        disabled: true,
        className: styles.pendingButton,
        onClick: undefined as any,
      };
    }

    if (approvalStatus === "rejected") {
      return {
        text: "Request Rejected",
        disabled: true,
        className: styles.rejectedButton,
        onClick: undefined as any,
      };
    }

    if (approvalStatus === "approved") {
      if (isJoinWindow) {
        return {
          text: "Join Training",
          onClick: this.handleJoinTraining,
          className: styles.joinButton,
          disabled: false,
        };
      }

      if (isRegisteredWindow) {
        return {
          text: "Registered Training",
          disabled: true,
          className: styles.pendingButton,
          onClick: undefined as any,
        };
      }

      return {
        text: "Approved",
        disabled: true,
        className: styles.pendingButton,
        onClick: undefined as any,
      };
    }

    return {
      text: isSubmitting ? "Submitting..." : "Request for Approval",
      onClick: this.handleRequestApproval,
      disabled: isSubmitting,
      className: styles.requestButton,
    };
  };

  // -----------------------------------------
  // Countdown: "Training starts in ..."
  // Same logic as Events (days, else HH:MM:SS, else MM:SS)
  // -----------------------------------------
  private startCountdown = (): void => {
    this.stopCountdown();
    this.updateCountdown();
    this.countdownTimer = window.setInterval(this.updateCountdown, 1000);
  };

  private stopCountdown = (): void => {
    if (this.countdownTimer) {
      window.clearInterval(this.countdownTimer);
      this.countdownTimer = undefined;
    }
  };

  private updateCountdown = (): void => {
    const { start } = this.getStartEndDates();

    // no start date => nothing to show
    if (!start) {
      if (this.state.countdown) this.setState({ countdown: "" });
      this.stopCountdown();
      return;
    }

    const now = new Date();
    const diff = start.getTime() - now.getTime();

    // started already => hide countdown
    if (diff <= 0) {
      if (this.state.countdown) this.setState({ countdown: "" });
      this.stopCountdown();
      return;
    }

    const pad = (n: number) => n.toString().padStart(2, "0");

    const daysRemaining = diff / (1000 * 60 * 60 * 24);
    const days = Math.floor(daysRemaining);
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let next = "";
    if (days > 0) {
      next = `${days} Day${days > 1 ? "s" : ""}`;
    } else if (hours > 0) {
      next = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    } else {
      next = `${pad(minutes)}:${pad(seconds)}`;
    }

    if (next !== this.state.countdown) {
      this.setState({ countdown: next });
    }
  };

  // -----------------------------------------
  // Render
  // -----------------------------------------
  public render(): React.ReactElement<TrainingCardProps> {
    const {
      startDate,
      category,
      title,
      time,
      duration,
      location,
      imageUrl,
      pageUrl,
      instructorName,
      instructorTitle,
      instructorImageUrl,
    } = this.props;

    const { errorMessage, approvalStatus, countdown } = this.state;

    const startDateObj = new Date(extractISODate(startDate));
    const startMonth = startDateObj.toLocaleDateString("en-US", { month: "short" });
    const startDay = startDateObj.getDate().toString().padStart(2, "0");
    const startWeekday = startDateObj.toLocaleDateString("en-US", { weekday: "long" });

    const endDateObj = new Date(extractISODate(this.props.endDate));
    const endDay = endDateObj.getDate().toString().padStart(2, "0");
    const endWeekday = endDateObj.toLocaleDateString("en-US", { weekday: "long" });

    const btn = this.getButtonConfig();

    // Tag: Registered only when approved and (registered window OR join window)
    const now = new Date();
    const { start, end } = this.getStartEndDates();
    const isRegisteredWindow = !!start && now.getTime() >= addDays(start, -1).getTime() && now.getTime() < start.getTime();
    const isJoinWindow = !!start && !!end && now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
    const showRegisteredTag = approvalStatus === "approved" && (isRegisteredWindow || isJoinWindow);

    return (
      <a href={pageUrl} className={styles.cardLinkWrapper}>
        <div className={styles.cardContainer}>
          <div className={styles.dateSection}>
            <div className={styles.dateBox}>
              <div className={styles.month}>
                {startWeekday} - {endWeekday}
              </div>
              <div className={styles.day}>
                {startDay} - {endDay} {startMonth}
              </div>
            </div>
          </div>

          <div className={styles.imageSection}>
            <img src={imageUrl} alt={title} className={styles.image} />
            {showRegisteredTag && <div className={styles.registeredTag}>Registered</div>}
          </div>

          <div className={styles.contentWrapper}>
            <div className={styles.detailsSection}>
              <div className={styles.category}>{category}</div>
              <h3 className={styles.title}>{title}</h3>
            </div>

            <div className={styles.metaSection}>
              <div className={styles.metaItem}>
                <svg className={styles.icon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.0001 1.66602C5.40841 1.66602 1.66675 5.40768 1.66675 9.99935C1.66675 14.591 5.40841 18.3327 10.0001 18.3327C14.5917 18.3327 18.3334 14.591 18.3334 9.99935C18.3334 5.40768 14.5917 1.66602 10.0001 1.66602ZM13.6251 12.9743C13.5084 13.1743 13.3001 13.2827 13.0834 13.2827C12.9751 13.2827 12.8667 13.2577 12.7667 13.191L10.1834 11.6493C9.54175 11.266 9.06675 10.4243 9.06675 9.68268V6.26602C9.06675 5.92435 9.35008 5.64102 9.69175 5.64102C10.0334 5.64102 10.3167 5.92435 10.3167 6.26602V9.68268C10.3167 9.98268 10.5667 10.4243 10.8251 10.5743L13.4084 12.116C13.7084 12.291 13.8084 12.6743 13.6251 12.9743Z" fill="#DA291C" />
                </svg>
                <span>{time} | {duration}</span>
              </div>
              <div className={styles.metaItem}>
                <svg className={styles.icon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_25344_30036)">
                    <path d="M17.1834 7.04232C16.3084 3.19232 12.9501 1.45898 10.0001 1.45898C10.0001 1.45898 10.0001 1.45898 9.99175 1.45898C7.05008 1.45898 3.68341 3.18398 2.80841 7.03398C1.83341 11.334 4.46675 14.9757 6.85008 17.2673C7.73341 18.1173 8.86675 18.5423 10.0001 18.5423C11.1334 18.5423 12.2667 18.1173 13.1417 17.2673C15.5251 14.9757 18.1584 11.3423 17.1834 7.04232ZM10.0001 11.2173C8.55008 11.2173 7.37508 10.0423 7.37508 8.59232C7.37508 7.14232 8.55008 5.96732 10.0001 5.96732C11.4501 5.96732 12.6251 7.14232 12.6251 8.59232C12.6251 10.0423 11.4501 11.2173 10.0001 11.2173Z" fill="#DA291C" />
                  </g>
                  <defs>
                    <clipPath id="clip0_25344_30036">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span>{location}</span>
              </div>
              {instructorName && (
                <div className={styles.instructorRow}>
                  {instructorImageUrl ? (
                    <img src={instructorImageUrl} alt={instructorName} className={styles.instructorAvatar} />
                  ) : (
                    <div className={styles.instructorAvatarFallback}>
                      {(instructorName?.trim()?.[0] || "?").toUpperCase()}
                    </div>
                  )}

                  <div className={styles.instructorText}>
                    <div className={styles.instructorName}>{instructorName}</div>
                    {instructorTitle && <div className={styles.instructorTitle}>{instructorTitle}</div>}
                  </div>
                </div>
              )}
            </div>

            {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}

            <div className={styles.actionSection}>
              <button className={styles.actionButton} onClick={btn.onClick} disabled={btn.disabled}>
                {btn.onClick === this.handleJoinTraining && <img src={outlookIcon} alt="Outlook" />}
                {btn.text}
              </button>

              {countdown ? (
                <div className={styles.countdownWrapper}>
                  <span className={styles.countdownLabel}>Training starts in</span>
                  <span className={styles.countdownTime}>{countdown}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </a>
    );
  }
}

export default TrainingCard;
