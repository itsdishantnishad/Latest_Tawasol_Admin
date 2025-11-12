
// src/webparts/<yourWebPart>/components/LeaveComponent/ApplyLeave.tsx
import * as React from "react";
import styles from "./ApplyLeave.module.scss";

export interface IApplyLeaveCardProps {
  periodText?: string;
  leaveBalance?: number;
  totalBalance?: number;
  accruals?: number;
  onApply?: () => void;
}

export default class ApplyLeaveCard extends React.Component<IApplyLeaveCardProps> {
  public static defaultProps: Partial<IApplyLeaveCardProps> = {
    periodText: "01 Jan 2024 to 31 Dec 2024",
    leaveBalance: 20,
    totalBalance: 32.567,
    accruals: 20.867,
  };

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
            <div className={styles.kpiNumber}>{totalBalance}</div>
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
