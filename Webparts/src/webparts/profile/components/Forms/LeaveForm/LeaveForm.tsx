import * as React from "react";
import styles from "./LeaveForm.module.scss";

/* Fluent UI */
import {
  Dropdown,
  IDropdownOption,
  DatePicker,
  TextField,
  PrimaryButton,
  DefaultButton,
} from "@fluentui/react";

const UploadIcon = require("../../../assets/uploadIcon.svg")
const DownArrowIcon = require("../../../assets/VectorIcon.svg")

const leaveOptions: IDropdownOption[] = [
  { key: "Sick Leave", text: "Sick Leave" },
  { key: "Casual Leave", text: "Casual Leave" },
  { key: "Annual Leave", text: "Annual Leave" },
  { key: "Loss of Pay", text: "Loss of Pay" }
];

const reasonOptions: IDropdownOption[] = [
  { key: "Select a reason", text: "Select a reason" },
  { key: "Medical", text: "Medical" },
  { key: "Family", text: "Family" },
  { key: "Personal", text: "Personal" }
];

export interface ILeaveFormState {
  leaveType?: string;
  reason?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  comment?: string;
}

export default class LeaveFormComponent
  extends React.Component<{}, ILeaveFormState> {

  public state: ILeaveFormState = {
    leaveType: "Sick Leave",
    reason: "Select a reason",
    startDate: null,
    endDate: null,
    comment: ""
  };

  private onSubmit = (): void => {
    console.log("Apply New Leave → ", this.state);
  };

  private getCalendarDays(): string {
    const { startDate, endDate } = this.state;
    if (!startDate || !endDate) return "0 Calendar Days";
    const d1 = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 12, 0, 0, 0);
    const d2 = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 12, 0, 0, 0);
    const ms = d2.getTime() - d1.getTime();
    const days = Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? `${days} Calendar Days` : "0 Calendar Days";
  }

  public render(): React.ReactElement<{}> {
    return (
      <div className={styles.container}>
        {/* ===== Leave Summary ===== */}
        <section className={styles.cardSummary}>
          <div className={styles.cardHeader}>
            <span className={styles.summaryTitle}>Leave Summary</span>
          </div>

          <div className={styles.summaryGrid}>
            {/* Plan Term */}
            <div className={styles.summaryCol}>
              <div className={styles.summaryLabel}>Plan Term</div>
              <div className={styles.summaryValuePlanTerm}>
                01 Jan 2024 to 31 Dec 2024
              </div>
            </div>

            {/* Accruals */}
            <div className={styles.summaryCol}>
              <div className={styles.summaryLabel}>Accruals</div>
              <div className={styles.summaryValue}>30.867 Days</div>
            </div>

            {/* Total Balance (inline, single row) */}
            <div className={styles.summaryColInline}>
              <span className={styles.inlineLabel}>Total Balance</span>
              <span className={styles.inlineValue}>30.867 Days</span>
            </div>
          </div>
        </section>

        {/* ===== Type ===== */}
        <section className={styles.cardType}>
          <div className={styles.cardHeader}>
            <div className={styles.fieldBlock70}>
              <label className={styles.fieldLabel}>Type</label>
              <div className={styles.selectShell}>
                <Dropdown
                  className={styles.fuiInput}
                  options={leaveOptions}
                  selectedKey={this.state.leaveType}
                  onChange={(_, o) => this.setState({ leaveType: o?.key as string })}
                  onRenderCaretDown={() => <img src={DownArrowIcon} style={{ width: 24, height: 24 }} />}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===== When ===== */}
        <section className={styles.cardWhen}>
          <div className={styles.cardWhenRow}>
            <span className={styles.cardWhenTitle}>When</span>
          </div>

          <div className={styles.whenRow}>
            <div className={styles.fieldBlock70} style={{ width: 395 }}>
              <label className={styles.fieldLabel}>Start Date</label>
              <div className={styles.inputShell}>
                <DatePicker
                  className={styles.fuiInput}
                  placeholder="dd-mmm-yyyy"
                  value={this.state.startDate ?? undefined}
                  onSelectDate={(d) => this.setState({ startDate: d })}
                />
              </div>
            </div>

            <div className={styles.fieldBlock70} style={{ width: 395 }}>
              <label className={styles.fieldLabel}>End Date</label>
              <div className={styles.inputShell}>
                <DatePicker
                  className={styles.fuiInput}
                  placeholder="dd-mmm-yyyy"
                  value={this.state.endDate ?? undefined}
                  onSelectDate={(d) => this.setState({ endDate: d })}
                />
              </div>
            </div>
          </div>

          <div className={styles.absenceRow}>
            <div className={styles.absenceCol}>
              <div className={styles.absenceLabel}>Absence Duration</div>
              <div className={styles.absenceValue}>{this.getCalendarDays()}</div>
            </div>
          </div>
        </section>

        {/* ===== Details ===== */}
        <section className={styles.cardDetails}>
          <div className={styles.cardDetailsRow}>
            <span className={styles.cardDetailsTitle}>Details</span>
          </div>

          <div className={styles.detailsInner}>
            <div className={styles.reasonWrap}>
              <label className={styles.reasonLabel}>Reason</label>
              <div className={styles.reasonShell}>
                <Dropdown
                  className={styles.fuiInput}
                  options={reasonOptions}
                  selectedKey={this.state.reason}
                  onChange={(_, o) => this.setState({ reason: o?.key as string })}
                  onRenderCaretDown={() => <img src={DownArrowIcon} style={{ width: 24, height: 24 }} />}
                />
              </div>
            </div>

            <div className={styles.commentsWrap}>
              <label className={styles.commentLabel}>Comment</label>
              <div className={styles.commentBox}>
                <TextField
                  multiline
                  resizable={false}
                  className={styles.commentAreaFUI}
                  placeholder="Write comments here..."
                  value={this.state.comment}
                  onChange={(_, v) => this.setState({ comment: v || "" })}
                />
              </div>
            </div>

            {/* Upload (placeholder) */}
            <div className={styles.uploadWrap}>
              <div className={styles.uploadIcon} aria-hidden><img src={UploadIcon}></img></div>
              <div className={styles.uploadTextBlock}>
                <div className={styles.uploadTitle}>Upload files</div>
                <div className={styles.uploadHint}>
                  Drop files directly here or <a>browse</a> from your device
                </div>
                <div className={styles.uploadActionRow}>
                  <DefaultButton
                    className={styles.uploadBtn}
                    text="Upload"
                    onClick={() => console.log("Upload clicked")}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className={styles.ctaBar}>
          <PrimaryButton
            className={styles.applyBtn}
            text="Apply New Leave"
            onClick={this.onSubmit}
          />
        </div>
      </div>
    );
  }
}