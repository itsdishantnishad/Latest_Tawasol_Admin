import * as React from "react";
import styles from "./TrainingPageDetail.module.scss";
import type { ITrainingPageDetailProps } from "./ITrainingPageDetailProps";
import { SPFI, spfi, SPFx } from "@pnp/sp";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

interface ITrainingPageDetailState {
  isSubmitting: boolean;
  errorMessage: string;
  approvalStatus: "none" | "pending" | "approved" | "rejected";
  isEventCompleted: boolean;
  registeredItemId: number | null;
  isLoading: boolean;
}

export default class TrainingPageDetail extends React.Component<
  ITrainingPageDetailProps,
  ITrainingPageDetailState
> {
  private sp: SPFI;

  constructor(props: ITrainingPageDetailProps) {
    super(props);

    this.sp = spfi().using(SPFx(this.props.context));

    this.state = {
      isSubmitting: false,
      errorMessage: "",
      approvalStatus: "none",
      isEventCompleted: false,
      registeredItemId: null,
      isLoading: true,
    };
  }

  public componentDidMount(): void {
    this.checkExistingRequest();
  }

  // -----------------------------------------
  // Utils
  // -----------------------------------------
  private extractISODate = (value: string): string => {
    if (!value) return "";
    return value.split("\n").pop()?.trim() || "";
  };

  private isEventCompleted = (endDateStr: string): boolean => {
    if (!endDateStr) return false;
    return new Date().getTime() > new Date(endDateStr).getTime();
  };

  private formatDateRange = (start: string, end: string): string => {
    if (!start || !end) return "";

    const s = new Date(start);
    const e = new Date(end);

    const startDay = s.getDate();
    const endDay = e.getDate();

    const monthYear = e.toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
    });

    return `${startDay}–${endDay} ${monthYear}`;
  };

  private calculateDaysDiff = (start: string, end: string): number => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  // -----------------------------------------
  // Check existing registration
  // -----------------------------------------
  private checkExistingRequest = async (): Promise<void> => {
    const { trainingItem, context } = this.props;

    if (!trainingItem?.length) {
      this.setState({ isLoading: false });
      return;
    }

    const item = trainingItem[0];
    const currentUserId = context.pageContext.legacyPageContext.userId;

    try {
      const existingItems = await this.sp.web.lists
        .getByTitle("Registered Training")
        .items.filter(
          `TIRTrainingID eq ${item.Id || item.ID} and AuthorId eq ${currentUserId}`
        )
        .orderBy("Created", false)
        .top(1)();

      const rawEndDate = item.eventEndDate || item.EndDate || item.endDate;
      const cleanEndDate = this.extractISODate(rawEndDate);
      const completed = this.isEventCompleted(cleanEndDate);

      if (existingItems.length > 0) {
        const registeredItem = existingItems[0];
        
        // Get approval status from the field (could be TIRApproval or TIRApprovalChoice)
        const approvalValue = registeredItem.TIRApproval || registeredItem.TIRApprovalChoice || "Pending";
        const status = approvalValue.toLowerCase();

        this.setState({
          approvalStatus: status,
          registeredItemId: registeredItem.Id,
          isEventCompleted: completed,
          isLoading: false,
        });
      } else {
        this.setState({
          isEventCompleted: completed,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Check existing request error:", error);
      this.setState({
        isLoading: false,
        errorMessage: "Failed to check registration status",
      });
    }
  };

  // -----------------------------------------
  // Request approval
  // -----------------------------------------
  private handleRequestApproval = async (): Promise<void> => {
    const { trainingItem, context } = this.props;

    if (!trainingItem?.length) {
      this.setState({ errorMessage: "No training data available" });
      return;
    }

    const item = trainingItem[0];
    const currentUserId = context.pageContext.legacyPageContext.userId;

    this.setState({ isSubmitting: true, errorMessage: "" });

    try {
      // CHECK AGAIN for existing registration before submitting
      const existingItems = await this.sp.web.lists
        .getByTitle("Registered Training")
        .items.filter(
          `TIRTrainingID eq ${item.Id || item.ID} and AuthorId eq ${currentUserId}`
        )
        .top(1)();

      // If registration already exists, update state and prevent duplicate
      if (existingItems.length > 0) {
        const existingItem = existingItems[0];
        const approvalValue = existingItem.TIRApproval || existingItem.TIRApprovalChoice || "Pending";
        const status = approvalValue.toLowerCase();
        
        this.setState({
          isSubmitting: false,
          approvalStatus: status,
          registeredItemId: existingItem.Id,
          errorMessage: "",
        });
        return;
      }

      // No existing registration found, proceed with new submission
      const newItem = await this.sp.web.lists
        .getByTitle("Registered Training")
        .items.add({
          TIRApproval: "Pending",
          TIRTrainingID: item.Id || item.ID,
          Title: item.Title || item.title,
        });

      this.setState({
        isSubmitting: false,
        approvalStatus: "pending",
        registeredItemId: newItem.data.Id,
        errorMessage: "",
      });
    } catch (error) {
      console.error("Request approval error:", error);
      this.setState({
        isSubmitting: false,
        errorMessage: "Failed to submit approval request",
      });
    }
  };

  private handleJoinTraining = (): void => {
    const link = this.props.trainingItem?.[0]?.MeetingLink;
    link ? window.open(link, "_blank") : alert("Link will be shared later.");
  };

  private handleGiveFeedback = (): void => {
    const { registeredItemId } = this.state;
    const { context } = this.props;

    window.location.href = `${context.pageContext.web.absoluteUrl}/SitePages/TrainingFeedback.aspx?registrationId=${registeredItemId}`;
  };

  // -----------------------------------------
  // Button logic
  // -----------------------------------------
  private getButtonConfig = () => {
    const { approvalStatus, isEventCompleted, isSubmitting, isLoading } =
      this.state;

    if (isLoading) return { text: "Loading...", disabled: true };
    
    if (isEventCompleted && approvalStatus === "none") {
      return {
        text: "Past Training",
        disabled: true,
        className: styles.pastTrainingButton,
      };
    }
    
    if (isEventCompleted && approvalStatus === "approved") {
      return {
        text: "Give Feedback",
        onClick: this.handleGiveFeedback,
        className: styles.feedbackButton,
      };
    }

    if (approvalStatus === "approved") {
      return {
        text: "Join Training",
        onClick: this.handleJoinTraining,
        className: styles.joinButton,
      };
    }

    if (approvalStatus === "pending") {
      return {
        text: "Request Pending",
        disabled: true,
        className: styles.pendingButton,
      };
    }

    if (approvalStatus === "rejected") {
      return {
        text: "Request Rejected",
        disabled: true,
        className: styles.rejectedButton,
      };
    }

    return {
      text: isSubmitting ? "Submitting..." : "Request for Approval",
      onClick: this.handleRequestApproval,
      disabled: isSubmitting,
    };
  };

  // -----------------------------------------
  // Render
  // -----------------------------------------
  public render(): React.ReactElement<ITrainingPageDetailProps> | null {
    const { trainingItem } = this.props;
    const { errorMessage } = this.state;

    if (!trainingItem?.length) return null;

    const item = trainingItem[0];
    const btn = this.getButtonConfig();

    const startISO = this.extractISODate(item.eventStartDate);
    const endISO = this.extractISODate(item.eventEndDate);
    const locationISO = this.extractISODate(item.location);

    const dateRange = this.formatDateRange(startISO, endISO);
    const totalDays = this.calculateDaysDiff(startISO, endISO);

    return (
      <div className={styles.card}>
        <div className={styles.tag}>Class Room</div>

        <h2 className={styles.title}>{item.title}</h2>

        <div className={styles.details}>
          <p>
            <span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.0001 1.66602C5.40841 1.66602 1.66675 5.40768 1.66675 9.99935C1.66675 14.591 5.40841 18.3327 10.0001 18.3327C14.5917 18.3327 18.3334 14.591 18.3334 9.99935C18.3334 5.40768 14.5917 1.66602 10.0001 1.66602ZM13.6251 12.9743C13.5084 13.1743 13.3001 13.2827 13.0834 13.2827C12.9751 13.2827 12.8667 13.2577 12.7667 13.191L10.1834 11.6493C9.54175 11.266 9.06675 10.4243 9.06675 9.68268V6.26602C9.06675 5.92435 9.35008 5.64102 9.69175 5.64102C10.0334 5.64102 10.3167 5.92435 10.3167 6.26602V9.68268C10.3167 9.98268 10.5667 10.4243 10.8251 10.5743L13.4084 12.116C13.7084 12.291 13.8084 12.6743 13.6251 12.9743Z" fill="#DA291C" />
                </svg>
            </span>
            {dateRange} • {totalDays} {totalDays === 1 ? "day" : "days"}
          </p>
          <p>
            <span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_25344_30036)">
                    <path d="M17.1834 7.04232C16.3084 3.19232 12.9501 1.45898 10.0001 1.45898C10.0001 1.45898 10.0001 1.45898 9.99175 1.45898C7.05008 1.45898 3.68341 3.18398 2.80841 7.03398C1.83341 11.334 4.46675 14.9757 6.85008 17.2673C7.73341 18.1173 8.86675 18.5423 10.0001 18.5423C11.1334 18.5423 12.2667 18.1173 13.1417 17.2673C15.5251 14.9757 18.1584 11.3423 17.1834 7.04232ZM10.0001 11.2173C8.55008 11.2173 7.37508 10.0423 7.37508 8.59232C7.37508 7.14232 8.55008 5.96732 10.0001 5.96732C11.4501 5.96732 12.6251 7.14232 12.6251 8.59232C12.6251 10.0423 11.4501 11.2173 10.0001 11.2173Z" fill="#DA291C" />
                  </g>
                  <defs>
                    <clipPath id="clip0_25344_30036">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
            </span>
            {locationISO}
          </p>
          <div className={styles.organizerRow}>
            <img src="https://i.pravatar.cc/150?img=1" alt="Mohit Khandelwal" className={styles.organizerAvatar} />
            <div className={styles.organizerText}>
              <div className={styles.organizerName}>Mohit Khandelwal</div>
              <div className={styles.organizerDesignation}>Co-founder at Sqing Solutions</div>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}

        <button
          className={`${styles.button} ${btn.className || ""}`}
          onClick={btn.onClick}
          disabled={btn.disabled}
        >
          {btn.text}
        </button>
      </div>
    );
  }
}