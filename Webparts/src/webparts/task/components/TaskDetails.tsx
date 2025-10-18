

import * as React from "react";
import styles from "./TaskDetails.module.scss";

const externalIcon = require("../assets/arrow-right-icon.svg");

const LeftArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.5 15L7.5 10L12.5 5" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RightArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 12L10 8L6 4" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export type TaskDetailsData = {
  workitemId: string;
  workflowNumber: string;
  taskTitle: string;
  taskType?: string | null;
  priority?: "" | "High" | "Medium" | "Low";
  originSystem?: string;
  status: "Pending" | "Approved" | "Rejected" | string;
  createdOn?: string;
  dueDate?: string;
  assignedTo?: string;

  // ⬇️ New: enriched fields to show avatar + name
  assignedToName?: string;
  assignedToAvatarUrl?: string | null;

  requestorName?: string;
  requestorDepartment?: string | null;
};

export interface TaskDetailsProps {
  data: TaskDetailsData;
  onBack?: () => void;
  onApprove?: () => void;
  /** Optional: full Salesforce URL for this record/work item */
  salesforceUrl?: string;
}

const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const TaskDetails: React.FC<TaskDetailsProps> = ({ data, onBack, onApprove, salesforceUrl }) => {
  return (
    <div className={styles.wrapper}>
      {/* Breadcrumb outside card */}
      <div className={styles.breadcrumb}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          <LeftArrowIcon />
          <span>Back</span>
        </button>

        <div className={styles.divider} />

        <span className={styles.taskText}>Task</span>

        <RightArrowIcon />

        <span className={styles.detailsText}>Task Details</span>
      </div>

      {/* Card */}
      <section className={styles.card}>
        <div className={styles.inner}>
          {/* Header block */}
          <div className={styles.headerBlock}>
            {/* Top row inside header: Workflow no. on left, View button on right */}
            <div className={styles.headerBar}>
              <div className={styles.workflowMeta}>
                <span className={styles.workflowLabel}>Workflow No.</span>
                <span className={styles.workflowValue}>{data.workflowNumber || "—"}</span>
              </div>

              {salesforceUrl ? (
                <a href={salesforceUrl} target="_blank" rel="noopener noreferrer" className={styles.viewBtn}>
                  <span className={styles.viewBtnText}>View Details in Salesforce</span>
                  <img src={externalIcon} alt="" aria-hidden="true" className={styles.viewBtnIcon} />
                </a>
              ) : (
                // same look even when URL missing (no disabled styling)
                <span className={styles.viewBtn}>
                  <span className={styles.viewBtnText}>View Details in Salesforce</span>
                  <img src={externalIcon} alt="" aria-hidden="true" className={styles.viewBtnIcon} />
                </span>
              )}
            </div>

            <h1 className={styles.title}>Salary Certificate breakdown</h1>

            <p className={styles.subtitle}>
              Salary Certificate breakdown Informations Salary Certificate breakdown Informations
            </p>
          </div>
          <div className={styles.rule} role="separator" aria-hidden="true" />

          <div className={styles.rows}>
           
            <div className={styles.row}>
              <div className={styles.col}>
                <div className={styles.label}>Priority</div>
                <div className={styles.value}>
                  {data.priority ? (
                    <span className={`${styles.chip} ${styles[`chip${data.priority}`]}`}>{data.priority}</span>
                  ) : (
                    "—"
                  )}
                </div>
              </div>

              <div className={styles.col}>
                <div className={styles.label}>Task Type</div>
                <div className={styles.value}>{data.taskType || "—"}</div>
              </div>

              <div className={styles.col}>
                <div className={styles.label}>Origin system</div>
                <div className={styles.value}>{data.originSystem || "—"}</div>
              </div>

              <div className={styles.col}>
                <div className={styles.label}>Status</div>
                <div className={styles.value}>
                  <span
                    className={`${styles.statusPill} ${
                      data.status === "Approved"
                        ? styles.stApproved
                        : data.status === "Rejected"
                        ? styles.stRejected
                        : styles.stPending
                    }`}
                  >
                    <span className={styles.statusText}>{data.status}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 2) Rule after row 1 */}
            <div className={styles.rule} role="separator" aria-hidden="true" />

            {/* Row 2: Created, Due, Assigned */}
            <div className={styles.row}>
              <div className={styles.col}>
                <div className={styles.label}>Created On</div>
                <div className={styles.value}>{fmtDate(data.createdOn)}</div>
              </div>

              <div className={styles.col}>
                <div className={styles.label}>Due Date</div>
                <div className={styles.value}>{fmtDate(data.dueDate)}</div>
              </div>

              <div className={styles.col}>
                <div className={styles.label}>Assigned to</div>
                <div className={styles.value}>
                  {data.assignedToName || data.assignedTo ? (
                    <div className={styles.assignee}>
                      <div
                        className={styles.assigneeAvatar}
                        style={
                          data.assignedToAvatarUrl
                            ? { backgroundImage: `url(${data.assignedToAvatarUrl})` }
                            : undefined
                        }
                        aria-hidden="true"
                      />
                      <span className={styles.assigneeName}>
                        {data.assignedToName ?? data.assignedTo}
                      </span>
                    </div>
                  ) : (
                    "—"
                  )}
                </div>
              </div>

              <div className={styles.col} />
            </div>

            {/* 3) Rule after row 2 */}
            <div className={styles.rule} role="separator" aria-hidden="true" />

            {/* Row 3: Requester name, dept */}
            <div className={styles.row}>
              <div className={styles.col}>
                <div className={styles.label}>Requester name</div>
                <div className={styles.value}>{data.requestorName || "—"}</div>
              </div>

              <div className={styles.col}>
                <div className={styles.label}>Requester Department</div>
                <div className={styles.value}>{data.requestorDepartment || "—"}</div>
              </div>

              <div className={styles.col} />
              <div className={styles.col} />
            </div>
          </div>

          {/* 4) Rule before CTA */}
          <div className={styles.rule} role="separator" aria-hidden="true" />

          {/* CTA */}
          <div className={styles.ctaRow}>
            <button type="button" className={styles.approveBtn} onClick={onApprove}>
              Approve
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TaskDetails;

