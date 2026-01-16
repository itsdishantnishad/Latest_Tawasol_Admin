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
  instructorName?: string;
  instructorTitle?: string;
  instructorImageUrl?: string;
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
      pageUrl,
      instructorName,
      instructorTitle,
      instructorImageUrl,
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
                <svg className={styles.icon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.0001 1.66602C5.40841 1.66602 1.66675 5.40768 1.66675 9.99935C1.66675 14.591 5.40841 18.3327 10.0001 18.3327C14.5917 18.3327 18.3334 14.591 18.3334 9.99935C18.3334 5.40768 14.5917 1.66602 10.0001 1.66602ZM13.6251 12.9743C13.5084 13.1743 13.3001 13.2827 13.0834 13.2827C12.9751 13.2827 12.8667 13.2577 12.7667 13.191L10.1834 11.6493C9.54175 11.266 9.06675 10.4243 9.06675 9.68268V6.26602C9.06675 5.92435 9.35008 5.64102 9.69175 5.64102C10.0334 5.64102 10.3167 5.92435 10.3167 6.26602V9.68268C10.3167 9.98268 10.5667 10.4243 10.8251 10.5743L13.4084 12.116C13.7084 12.291 13.8084 12.6743 13.6251 12.9743Z" fill="#DA291C" />
                </svg>
                <span>{time} | {duration}</span>
              </div>
              <div className={styles.metaItem}>
                <svg className={styles.icon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_25344_30036)">
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
                  <img
                    src={instructorImageUrl}
                    alt={instructorName}
                    className={styles.instructorAvatar}
                  />
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