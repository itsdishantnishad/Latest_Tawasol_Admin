import * as React from 'react';
import styles from './Training.module.scss';
import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

const outlookIcon: string = require("../../assets/outlook-icon.svg");

export interface IAllTrainingCardProps {
  imageUrl: string;
  category: string;
  title: string;
  date: string;
  duration: string;
  instructorName: string;
  instructorTitle: string;
  instructorImageUrl: string;
  pageUrl: string;
  trainingId: number;
  meetingLink: string;
  endDate: string;
  context: any; // WebPartContext
}

interface IAllTrainingCardState {
  isSubmitting: boolean;
  errorMessage: string;
  approvalStatus: "none" | "pending" | "approved" | "rejected";
  isEventCompleted: boolean;
  registeredItemId: number | null;
  isLoading: boolean;
}

export class AllTrainingCard extends React.Component<
  IAllTrainingCardProps,
  IAllTrainingCardState
> {
  private sp: SPFI;

  constructor(props: IAllTrainingCardProps) {
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
  private formatDate = (rawDate: string): string => {
    return rawDate; // Customize if needed
  };

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
        const approvalValue =
          registeredItem.TIRApproval ||
          registeredItem.TIRApprovalChoice ||
          "Pending";
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
  private handleRequestApproval = async (
    e: React.MouseEvent
  ): Promise<void> => {
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
        const approvalValue =
          existingItem.TIRApproval ||
          existingItem.TIRApprovalChoice ||
          "Pending";
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
    const { approvalStatus, isEventCompleted, isSubmitting, isLoading } =
      this.state;

    if (isLoading) {
      return {
        text: "Loading...",
        disabled: true,
        className: styles.loadingButton,
        onClick: undefined,
        showIcon: false,
      };
    }

    if (isEventCompleted && approvalStatus === "none") {
      return {
        text: "Past Training",
        disabled: true,
        className: styles.pastTrainingButton,
        onClick: undefined,
        showIcon: false,
      };
    }

    if (isEventCompleted && approvalStatus === "approved") {
      return {
        text: "Give Feedback",
        onClick: this.handleGiveFeedback,
        className: styles.feedbackButton,
        disabled: false,
        showIcon: false,
      };
    }

    if (approvalStatus === "approved") {
      return {
        text: "Join",
        onClick: this.handleJoinTraining,
        className: styles.joinButton,
        disabled: false,
        showIcon: true,
      };
    }

    if (approvalStatus === "pending") {
      return {
        text: "Request Pending",
        disabled: true,
        className: styles.pendingButton,
        onClick: undefined,
        showIcon: false,
      };
    }

    if (approvalStatus === "rejected") {
      return {
        text: "Request Rejected",
        disabled: true,
        className: styles.rejectedButton,
        onClick: undefined,
        showIcon: false,
      };
    }

    return {
      text: isSubmitting ? "Submitting..." : "Join",
      onClick: this.handleRequestApproval,
      disabled: isSubmitting,
      className: styles.requestButton,
      showIcon: false,
    };
  };

  // -----------------------------------------
  // Render
  // -----------------------------------------
  public render(): React.ReactElement<IAllTrainingCardProps> {
    const {
      imageUrl,
      category,
      title,
      date,
      duration,
      instructorName,
      instructorTitle,
      instructorImageUrl,
      pageUrl,
    } = this.props;

    const { errorMessage, approvalStatus } = this.state;

    const btn = this.getButtonConfig();
    const isRegistered =
      approvalStatus === "approved" || approvalStatus === "pending";

    return (
      <a href={pageUrl} className={styles.cardLinkWrapper}>
        <div className={styles.courseCard}>
          {/* Header Image */}
          <div className={styles.imageContainer}>
            <img src={imageUrl} alt={title} className={styles.headerImage} />
            {/* Category Label (top-left on image) */}
            <div className={styles.categoryLabel}>{category}</div>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {/* Title */}
            <h3 className={styles.title}>{title}</h3>

            {/* Date and Duration */}
            <div className={styles.metadata}>
              <span className={styles.date}>{this.formatDate(date)}</span>
              <span className={styles.duration}>{duration}</span>
            </div>

            {/* Instructor Info */}
            <div className={styles.instructor}>
              <img
                src={instructorImageUrl}
                alt={instructorName}
                className={styles.instructorImage}
              />
              <div className={styles.instructorInfo}>
                <span className={styles.instructorName}>{instructorName},</span>
                <span className={styles.instructorTitle}>{instructorTitle}</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className={styles.errorMessage}>{errorMessage}</div>
            )}

            {/* Join/Action Button */}
            <button
              className={`${styles.actionButton} ${btn.className || ""}`}
              onClick={btn.onClick}
              disabled={btn.disabled}
            >
              {btn.showIcon && (
                <div className={styles.outlookIcon}>
                  <img src={outlookIcon} alt="Outlook" />
                </div>
              )}
              {btn.text}
            </button>

            {/* Info Notice (only if not registered and status is none) */}
            {!isRegistered && approvalStatus === "none" && (
              <div className={styles.infoNotice}>
                <span className={styles.infoIcon}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M7.9987 14.6693C11.6806 14.6693 14.6654 11.6845 14.6654 8.0026C14.6654 4.32071 11.6806 1.33594 7.9987 1.33594C4.3168 1.33594 1.33203 4.32071 1.33203 8.0026C1.33203 11.6845 4.3168 14.6693 7.9987 14.6693Z"
                      fill="#2B5FAC"
                    />
                    <path
                      d="M8 10.6667V8"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 5.33594H8.00667"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className={styles.infoText}>
                  You will be redirected to Outlook for approval once
                </span>
              </div>
            )}
          </div>
        </div>
      </a>
    );
  }
}