import * as React from "react";
import styles from "./ApplyLeave.module.scss";
import {
  TahweelService,
  TahweelEmployeeLeaveBalance,
} from "../../../../services/Integration/TahweelService";

export interface IApplyLeaveCardProps {
  periodText?: string;
  applyUrl?: string;
  context: any;
}

export interface IApplyLeaveCardState {
  loading: boolean;
  displayValue: string;
  isMessage: boolean;
  periodText: string;
  error: string;
}

const EMPTY_TEXT = "—";

const monthMap: { [k: string]: number } = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
};

export default class ApplyLeaveCard extends React.Component<
  IApplyLeaveCardProps,
  IApplyLeaveCardState
> {
  private tahweelService: TahweelService;

  constructor(props: IApplyLeaveCardProps) {
    super(props);

    this.state = {
      loading: true,
      displayValue: EMPTY_TEXT,
      isMessage: false,
      periodText: EMPTY_TEXT,
      error: "",
    };

    this.tahweelService = new TahweelService({
      httpClient: this.props.context.httpClient,
    });
  }

  public async componentDidMount(): Promise<void> {
    await this.loadLeaveBalance();
  }

  private getUserEmailFromContext(): string {
    return ((this.props.context?.pageContext?.user?.email || "") + "").trim();
  }

  private ordinal(n: number): string {
    const v = n % 100;
    if (v >= 11 && v <= 13) return n + "th";
    const r = n % 10;
    if (r === 1) return n + "st";
    if (r === 2) return n + "nd";
    if (r === 3) return n + "rd";
    return n + "th";
  }

  private parseTillDate(raw?: string): Date | null {
    const v = (raw || "").trim();
    if (!v) return null;

    // supports "DD-MMM-YYYY" (example: 31-DEC-2025)
    const parts = v.split("-");
    if (parts.length === 3 && parts[1] && parts[1].length === 3) {
      const d = parseInt(parts[0], 10);
      const mon = (parts[1] || "").toUpperCase();
      const y = parseInt(parts[2], 10);
      const m = monthMap[mon];

      if (!isNaN(d) && !isNaN(y) && m !== undefined) {
        return new Date(y, m, d);
      }
    }

    // fallback: Date parser
    const dt = new Date(v);
    return isNaN(dt.getTime()) ? null : dt;
  }

  private formatAsOf(tillDateRaw?: string): string {
    const dt = this.parseTillDate(tillDateRaw);
    if (!dt) return EMPTY_TEXT;

    const day = dt.getDate();
    const month = dt.toLocaleString("en-GB", { month: "short" });
    const year = dt.getFullYear();

    return `as of ${this.ordinal(day)} ${month} ${year}`;
  }

  private async loadLeaveBalance(): Promise<void> {
    this.setState({ loading: true, error: "" });

    try {
      const email = this.getUserEmailFromContext();
      if (!email) {
        this.setState({
          loading: false,
          displayValue: "Employee Number Not Present",
          isMessage: true,
          periodText: EMPTY_TEXT,
          error: "User email not found in context.",
        });
        return;
      }

      const res: TahweelEmployeeLeaveBalance =
        await this.tahweelService.fetchEmployeeLeaveBalanceByEmail(email);

      if (!res.hasPersonNumber) {
        this.setState({
          loading: false,
          displayValue: "Employee Number Not Present",
          isMessage: true,
          periodText: EMPTY_TEXT,
          error: "PERSON_NUMBER missing from API response",
        });
        return;
      }

      if (!res.hasBalance) {
        this.setState({
          loading: false,
          displayValue: "No Balance Found",
          isMessage: true,
          periodText: this.props.periodText || this.formatAsOf(res.tillDate),
          error: "LEAVE_BALANCE missing from API response",
        });
        return;
      }

      this.setState({
        loading: false,
        displayValue: (res.leaveBalance || "").trim() || EMPTY_TEXT,
        isMessage: false,
        periodText: this.props.periodText || this.formatAsOf(res.tillDate),
        error: "",
      });
    } catch (e: any) {
      this.setState({
        loading: false,
        displayValue: "No Balance Found",
        isMessage: true,
        periodText: EMPTY_TEXT,
        error: e?.message || "Failed to load leave balance",
      });
    }
  }

  public render(): React.ReactElement<IApplyLeaveCardProps> {
    const { applyUrl } = this.props;
    const { loading, displayValue, isMessage, periodText } = this.state;

    const isDisabled = loading || !applyUrl;

    return (
      <div className={styles.card}>
        <div className={styles.headTitle}>Apply for Leave</div>

        <p className={styles.subText}>
          Apply for leave in just a few clicks and track your leave balance with ease
        </p>

        <div className={styles.balanceBox} aria-busy={loading}>
          <div
            className={`${styles.balanceNumber} ${
              isMessage ? styles.balanceNumberMessage : ""
            }`}
          >
            {loading ? EMPTY_TEXT : displayValue || EMPTY_TEXT}
          </div>

          <div className={styles.balanceLabel}>Leave Balance</div>

          <div className={styles.balancePeriod}>
            {loading ? EMPTY_TEXT : periodText || EMPTY_TEXT}
          </div>
        </div>

        {/*  CTA opens in new tab */}
        <a
          className={`${styles.cta} ${isDisabled ? styles.isDisabled : ""}`}
          href={applyUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          data-interception="off"
          aria-disabled={isDisabled}
          onClick={(e) => {
            if (isDisabled) e.preventDefault();
          }}
        >
          <span className={styles.ctaText}>Apply Leave</span>
        </a>
      </div>
    );
  }
}
