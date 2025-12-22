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
              <svg
                className="icon_81daac18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
            </span>
            {dateRange} • {totalDays} {totalDays === 1 ? "day" : "days"}
          </p>
          <p>
            <span>
              <svg
                className="icon_81daac18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </span>
            {locationISO}
          </p>
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