// src/webparts/<yourWebPart>/components/LeaveComponent/ApplyLeave.tsx
import * as React from "react";
import styles from "./ApplyLeave.module.scss";
import { TahweelService } from "../../../../services/Integration/TahweelService";

export interface IApplyLeaveCardProps {
  context: any;
  onApply?: () => void;

  // UI text (optional)
  periodText?: string;
}

export interface IApplyLeaveCardState {
  loading: boolean;
  leaveBalanceText: string; // "20" or "No balance found"
  periodText: string;       // "as of 20th November"
  error: string;
}

export default class ApplyLeaveCard extends React.Component<IApplyLeaveCardProps, IApplyLeaveCardState> {
  private readonly tahweelService: TahweelService;

  constructor(props: IApplyLeaveCardProps) {
    super(props);

    this.state = {
      loading: true,
      leaveBalanceText: "—",
      periodText: props.periodText || this.formatAsOfText(new Date()),
      error: "",
    };

    this.tahweelService = new TahweelService({
      httpClient: this.props.context.httpClient,
    });
  }

  public async componentDidMount(): Promise<void> {
    await this.loadLeaveBalance();
  }

  private formatAsOfText(d: Date): string {
    const day = d.getDate();
    const month = d.toLocaleString("en-GB", { month: "long" });

    const suffix =
      day % 100 >= 11 && day % 100 <= 13
        ? "th"
        : day % 10 === 1
        ? "st"
        : day % 10 === 2
        ? "nd"
        : day % 10 === 3
        ? "rd"
        : "th";

    return `as of ${day}${suffix} ${month}`;
  }

  private async loadLeaveBalance(): Promise<void> {
    const userEmail: string = (this.props.context?.pageContext?.user?.email || "").trim();

    if (!userEmail) {
      this.setState({
        loading: false,
        leaveBalanceText: "No Balance Found",
        error: "User email not available.",
      });
      return;
    }

    this.setState({ loading: true, error: "" });

    try {
      // 1) Email -> person number
      const personRes = await this.tahweelService.fetchPersonNumberByEmail(userEmail);

      // 2) person number -> leave balance
      const leaveRes = await this.tahweelService.fetchLeaveBalanceByPersonNumber(personRes.personNumber);

      this.setState({
        loading: false,
        leaveBalanceText: leaveRes.hasBalance ? leaveRes.balance : "No Balance Found",
        periodText: this.props.periodText || this.formatAsOfText(new Date()),
        error: leaveRes.hasBalance ? "" : "No Balance Found", // you can hide this if you don’t want text
      });
    } catch (e: any) {
      this.setState({
        loading: false,
        leaveBalanceText: "No Balance Found",
        error: e?.message || "Failed to fetch leave balance.",
      });
    }
  }

  public render(): React.ReactElement<IApplyLeaveCardProps> {
    const { onApply } = this.props;
    const { loading, leaveBalanceText, periodText } = this.state;

    return (
      <section className={styles.card} aria-label="Apply for Leave">
        <div className={styles.headTitle}>Apply for Leave</div>

        <p className={styles.subText}>
          Apply for leave in just a few clicks and track your leave balance with ease
        </p>

        <div className={styles.balanceBox}>
          <div className={styles.balanceNumber}>{loading ? "—" : leaveBalanceText}</div>
          <div className={styles.balanceLabel}>Leave Balance</div>
          <div className={styles.balancePeriod}>{periodText}</div>
        </div>

        <button type="button" className={styles.cta} onClick={onApply} disabled={loading}>
          <span className={styles.ctaText}>Apply Leave</span>
        </button>
      </section>
    );
  }
}
