
// src/webparts/<yourWebPart>/components/LeaveComponent/ApplyLeave.tsx
import * as React from "react";
import styles from "./ApplyLeave.module.scss";
import { TahweelService, TahweelReportResponse, TahweelReportRequest } from "../../../../services/Integration/TahweelService";

export interface IApplyLeaveCardProps {
  periodText?: string;
  leaveBalance?: number;
  totalBalance?: number;
  accruals?: number;
  onApply?: () => void;
  context: any;
}

export interface IApplyLeaveCardState {
  loading: boolean;
  result: string;
  error: string;
  personNumber: string;
}

export default class ApplyLeaveCard extends React.Component<IApplyLeaveCardProps> {
  private tahweelService: TahweelService;
  constructor(props: IApplyLeaveCardProps) {
    super(props);
    this.state = {
      loading: true,
      result: "",
      error: "",
      personNumber: ""
    };

    this.tahweelService = new TahweelService({
      httpClient: this.props.context.httpClient,
    });
  }

  public static defaultProps: Partial<IApplyLeaveCardProps> = {
    periodText: "01 Jan 2024 to 31 Dec 2024",
    leaveBalance: 20,
    totalBalance: 32.567,
    accruals: 20.867,
  };

  public async componentDidMount(): Promise<void> {

  }

  private decodeBase64(base64String: string): any {
    try {
      // Decode base64 to string
      const decoded = atob(base64String);
      return decoded;
    } catch (e) {
      throw new Error("Failed to decode person number from base64.");
    }
  }


  private async handleGetLeaveBalance() {
    this.setState({ loading: true, result: "", error: "", personNumber: "" });
    const userEmail = this.props.context?.pageContext?.user?.email;
    try {
      // 1. Get person number by email
      const personResp = await this.tahweelService.fetchPersonNumberByEmail(
        userEmail
      );

      // Extract base64 string and decode
      const base64String =
        personResp.response?.Body?.runReportResponse?.runReportReturn
          ?.reportBytes;
      let personNumber = "";
      if (base64String) {
        const decoded = this.decodeBase64(base64String);
        const match = decoded.match(/<USERNAME>(.*?)<\/USERNAME>/i);
        if (match && match[1]) {
          personNumber = match[1].trim();
        }
      }
      if (!personNumber)
        throw new Error("Person number not found for this email.");
      this.setState({ personNumber });
      console.log("personNumber:", personNumber);

      // 2. Use person number to get leave balance
      const leaveReq: TahweelReportRequest = {
        email: userEmail,
        person_number: "",
        reportPath:
          "/Custom/DH Integrations/HCM/OneApp/DHH/DH Get Leave Balance Report.xdo",
        parameters: {
          params: [
            {
              name: "person_number",
              value: "150286", //150286 is test data
            },
          ],
        },
      };
      const leaveResp: TahweelReportResponse =
        await this.tahweelService.fetchLeaveBalance(leaveReq);

      const leaveBase64String =
        personResp.response?.Body?.runReportResponse?.runReportReturn
          ?.reportBytes;
      let leaveBalance = null;
      if (leaveBase64String) {
        const decoded = this.decodeBase64(leaveBase64String);
        const match = decoded.match(/<USERNAME>(.*?)<\/USERNAME>/i);
        if (match && match[1]) {
          leaveBalance = match[1].trim();
        }
      }
      this.setState({
        result: JSON.stringify(leaveResp, null, 2),
        loading: false,
      });
    } catch (err: any) {
      this.setState({
        error: err.message || "API call failed",
        loading: false,
      });
    }
  }

  public render(): React.ReactElement<IApplyLeaveCardProps> {
    const { periodText, leaveBalance, totalBalance, accruals, onApply } = this.props;

    return (
      <section className={styles.card} aria-label="Apply for Leave">
        <div className={styles.headTitle}>Apply for Leave</div>
        <p className={styles.subText}>
          Apply for leave in just a few clicks and track your leave balance with ease
        </p>

        <div className={styles.balanceBox}>
          <div className={styles.balanceNumber}>{leaveBalance}</div>
          <div className={styles.balanceLabel}>Leave Balance</div>
          <div className={styles.balancePeriod}>{periodText}</div>
        </div>

        <div className={styles.kpisRow}>
          <div className={styles.kpi}>
            <div className={styles.kpiNumber}>{this.handleGetLeaveBalance()}</div>
            <div className={styles.kpiLabel}>Total Balance</div>
          </div>
          <div className={styles.verticalDivider} aria-hidden="true" />
          <div className={styles.kpi}>
            <div className={styles.kpiNumber}>{accruals}</div>
            <div className={styles.kpiLabel}>Accruals</div>
          </div>
        </div>

        <button type="button" className={styles.cta} onClick={onApply}>
          <span className={styles.ctaText}>Apply Leave</span>
        </button>
      </section>
    );
  }
}
