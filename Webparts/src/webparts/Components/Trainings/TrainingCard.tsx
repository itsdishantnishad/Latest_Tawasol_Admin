import * as React from 'react';
import styles from './TrainingCard.module.scss';
import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

const outlookIcon: string = require("../../assets/outlook-icon.svg");

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
  trainingId: number;
  meetingLink: string;
  context: any; // WebPartContext
}

interface TrainingCardState {
  isSubmitting: boolean;
  errorMessage: string;
  approvalStatus: "none" | "pending" | "approved" | "rejected";
  isEventCompleted: boolean;
  registeredItemId: number | null;
  isLoading: boolean;
}

class TrainingCard extends React.Component<TrainingCardProps, TrainingCardState> {
  private sp: SPFI;

  constructor(props: TrainingCardProps) {
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
  private isEventCompleted = (endDateStr: string): boolean => {
    if (!endDateStr) return false;
    return new Date().getTime() > new Date(endDateStr).getTime();
  };

  // -----------------------------------------
  // Check existing registration
  // -----------------------------------------
  private checkExistingRequest = async (): Promise<void> => {
    const { trainingId, endDate, context } = this.props;

    if (!trainingId) {
      this.setState({ isLoading: false });
      return;
    }

    const currentUserId = context.pageContext.legacyPageContext.userId;

    try {
      const existingItems = await this.sp.web.lists
        .getByTitle("Registered Training")
        .items.filter(
          `TIRTrainingID eq ${trainingId} and AuthorId eq ${currentUserId}`
        )
        .orderBy("Created", false)
        .top(1)();

      const completed = this.isEventCompleted(endDate);

      if (existingItems.length > 0) {
        const registeredItem = existingItems[0];
        
        // Get approval status from the field
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
          approvalStatus: "none",
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
  private handleRequestApproval = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    const { trainingId, title, context } = this.props;

    if (!trainingId) {
      this.setState({ errorMessage: "No training data available" });
      return;
    }

    const currentUserId = context.pageContext.legacyPageContext.userId;

    this.setState({ isSubmitting: true, errorMessage: "" });

    try {
      // Check again for existing registration before submitting
      const existingItems = await this.sp.web.lists
        .getByTitle("Registered Training")
        .items.filter(
          `TIRTrainingID eq ${trainingId} and AuthorId eq ${currentUserId}`
        )
        .top(1)();

      // If registration already exists, prevent duplicate
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
          TIRTrainingID: trainingId,
          Title: title,
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

  private handleJoinTraining = (e: React.MouseEvent): void => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    const { meetingLink } = this.props;
    if (meetingLink) {
      window.open(meetingLink, "_blank");
    } else {
      alert("Link will be shared later.");
    }
  };

  private handleGiveFeedback = (e: React.MouseEvent): void => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    const { registeredItemId } = this.state;
    const { context } = this.props;

    window.location.href = `${context.pageContext.web.absoluteUrl}/SitePages/TrainingFeedback.aspx?registrationId=${registeredItemId}`;
  };

  // -----------------------------------------
  // Button logic
  // -----------------------------------------
  private getButtonConfig = () => {
    const { approvalStatus, isEventCompleted, isSubmitting, isLoading } = this.state;

    if (isLoading) {
      return { 
        text: "Loading...", 
        disabled: true,
        className: styles.loadingButton,
        onClick: undefined
      };
    }

    if (isEventCompleted && approvalStatus === "none") {
      return {
        text: "Past Training",
        disabled: true,
        className: styles.pastTrainingButton,
        onClick: undefined
      };
    }

    if (isEventCompleted && approvalStatus === "approved") {
      return {
        text: "Give Feedback",
        onClick: this.handleGiveFeedback,
        className: styles.feedbackButton,
        disabled: false
      };
    }

    if (approvalStatus === "approved") {
      return {
        text: "Join Training",
        onClick: this.handleJoinTraining,
        className: styles.joinButton,
        disabled: false
      };
    }

    if (approvalStatus === "pending") {
      return {
        text: "Request Pending",
        disabled: true,
        className: styles.pendingButton,
        onClick: undefined
      };
    }

    if (approvalStatus === "rejected") {
      return {
        text: "Request Rejected",
        disabled: true,
        className: styles.rejectedButton,
        onClick: undefined
      };
    }

    return {
      text: isSubmitting ? "Submitting..." : "Request for Approval",
      onClick: this.handleRequestApproval,
      disabled: isSubmitting,
      className: styles.requestButton
    };
  };

  // -----------------------------------------
  // Render
  // -----------------------------------------
  public render(): React.ReactElement<TrainingCardProps> {
    const {
      startDate,
      endDate,
      category,
      title,
      time,
      duration,
      location,
      imageUrl,
      pageUrl
    } = this.props;

    const { errorMessage, approvalStatus } = this.state;

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    const startMonth = startDateObj.toLocaleDateString('en-US', { month: 'short' });
    const startDay = startDateObj.getDate().toString().padStart(2, '0');
    const startWeekday = startDateObj.toLocaleDateString('en-US', { weekday: 'long' });

    const endMonth = endDateObj.toLocaleDateString('en-US', { month: 'short' });
    const endDay = endDateObj.getDate().toString().padStart(2, '0');
    const endWeekday = endDateObj.toLocaleDateString('en-US', { weekday: 'long' });

    const btn = this.getButtonConfig();
    const isRegistered = approvalStatus === "approved" || approvalStatus === "pending";

    return (
      <a href={pageUrl} className={styles.cardLinkWrapper}>
        <div className={styles.cardContainer}>
          <div className={styles.dateSection}>
            <div className={styles.dateBox}>
              <div className={styles.month}>{startWeekday} - {endWeekday}</div>
              <div className={styles.day}>{startDay} - {endDay} {startMonth}</div>
            </div>
          </div>

          <div className={styles.imageSection}>
            <img
              src={imageUrl}
              alt={title}
              className={styles.image}
            />
            {isRegistered && (
              <div className={styles.registeredTag}>
                Registered
              </div>
            )}
          </div>

          <div className={styles.contentWrapper}>
            <div className={styles.detailsSection}>
              <div className={styles.category}>{category}</div>
              <h3 className={styles.title}>{title}</h3>
            </div>

            <div className={styles.metaSection}>
              <div className={styles.metaItem}>
                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
                <span>{time} | {duration}</span>
              </div>
              <div className={styles.metaItem}>
                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{location}</span>
              </div>
            </div>

            {errorMessage && (
              <div className={styles.errorMessage}>{errorMessage}</div>
            )}

            <button
              className={`${styles.actionButton} ${btn.className || ""}`}
              onClick={btn.onClick}
              disabled={btn.disabled}
            >
              {btn.onClick === this.handleJoinTraining && (
                <img src={outlookIcon} alt="Outlook" />
              )}
              {btn.text}
            </button>
          </div>
        </div>
      </a>
    );
  }
}

export default TrainingCard;