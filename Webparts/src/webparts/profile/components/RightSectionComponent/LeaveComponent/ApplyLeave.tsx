import * as React from "react";
import styles from "./ApplyLeave.module.scss";
import { TahweelService } from "../../../../services/Integration/TahweelService";

export interface IApplyLeaveCardProps {
  context: any;
  onApply?: () => void;
  periodText?: string;
}

export interface IApplyLeaveCardState {
  loading: boolean;
  leaveBalanceText: string; // number or message
  periodText: string;       // as of ...
  error: string;
}

export default class ApplyLeaveCard extends React.Component<IApplyLeaveCardProps, IApplyLeaveCardState> {
  private readonly tahweelService: TahweelService;

  constructor(props: IApplyLeaveCardProps) {
    super(props);

    this.state = {
      loading: true,
      leaveBalanceText: "—",
      periodText: "—",
      error: "",
    };

    this.tahweelService = new TahweelService({
      httpClient: this.props.context.httpClient,
    });
  }

  public async componentDidMount(): Promise<void> {
    await this.loadLeaveBalance();
  }

  private isNumericText(val: string): boolean {
    return /^-?\d+(\.\d+)?$/.test((val || "").trim());
  }

  private formatAsOfFromTillDate(tillDate: string): string {
    // Expected: "31-DEC-2025"
    const raw = (tillDate || "").trim();
    if (!raw) return "—";

    const parts = raw.split("-");
    if (parts.length < 2) return "—";

    const dayNum = parseInt(parts[0], 10);
    const monAbbr = (parts[1] || "").toUpperCase();

    const monthMap: Record<string, string> = {
      JAN: "January",
      FEB: "February",
      MAR: "March",
      APR: "April",
      MAY: "May",
      JUN: "June",
      JUL: "July",
      AUG: "August",
      SEP: "September",
      OCT: "October",
      NOV: "November",
      DEC: "December",
    };

    const month = monthMap[monAbbr] || monAbbr;

    if (!dayNum || dayNum < 1) return `as of ${month}`;

    const suffix =
      dayNum % 100 >= 11 && dayNum % 100 <= 13
        ? "th"
        : dayNum % 10 === 1
        ? "st"
        : dayNum % 10 === 2
        ? "nd"
        : dayNum % 10 === 3
        ? "rd"
        : "th";

    return `as of ${dayNum}${suffix} ${month}`;
  }

  private async loadLeaveBalance(): Promise<void> {
    const userEmail: string = (this.props.context?.pageContext?.user?.email || "").trim();

    if (!userEmail) {
      this.setState({
        loading: false,
        leaveBalanceText: "Employee Number Not Present",
        periodText: "—",
        error: "User email not available.",
      });
      return;
    }

    this.setState({ loading: true, error: "" });

    try {
      const res = await this.tahweelService.fetchEmployeeLeaveBalanceByEmail(userEmail);

      if (!res.hasPersonNumber) {
        this.setState({
          loading: false,
          leaveBalanceText: "Employee Number Not Present",
          periodText: "—",
          error: "",
        });
        return;
      }

      if (!res.hasBalance) {
        this.setState({
          loading: false,
          leaveBalanceText: "No Balance Found",
          periodText: res.tillDate ? this.formatAsOfFromTillDate(res.tillDate) : "—",
          error: "",
        });
        return;
      }

      this.setState({
        loading: false,
        leaveBalanceText: res.leaveBalance,
        periodText: res.tillDate ? this.formatAsOfFromTillDate(res.tillDate) : "—",
        error: "",
      });
    } catch (e: any) {
      this.setState({
        loading: false,
        leaveBalanceText: "No Balance Found",
        periodText: "—",
        error: e?.message || "Failed to fetch leave balance.",
      });
    }
  }

  public render(): React.ReactElement<IApplyLeaveCardProps> {
    const { onApply } = this.props;
    const { loading, leaveBalanceText, periodText } = this.state;

    const displayText = loading ? "—" : leaveBalanceText;
    const isNumeric = this.isNumericText(displayText);

    return (
      <section className={styles.card} aria-label="Apply for Leave">
        <div className={styles.headTitle}>Apply for Leave</div>

        <p className={styles.subText}>
          Apply for leave in just a few clicks and track your leave balance with ease
        </p>

        <div className={styles.balanceBox}>
          <div className={[styles.balanceNumber, !isNumeric ? styles.balanceNumberText : ""].join(" ")}>
            {displayText}
          </div>

          <div className={styles.balanceLabel}>Leave Balance</div>

          <div className={styles.balancePeriod}>
            {loading ? "—" : (periodText || "—")}
          </div>
        </div>

        <button type="button" className={styles.cta} onClick={onApply} disabled={loading}>
          <span className={styles.ctaText}>Apply Leave</span>
        </button>
      </section>
    );
  }
}
