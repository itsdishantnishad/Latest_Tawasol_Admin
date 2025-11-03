import * as React from "react";
import styles from "./TaskDetails.module.scss";
import { SMALL_ARROW_RIGHT_ICON } from "../../assets/constants";
import Breadcrumb from "../../Components/Breadcrumb/Breadcrumb";
import Tag from "../../Components/Tag/Tag";
import PrimaryButton from "../../Components/PrimaryButton/PrimaryButton";

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
  assignedToName?: string;
  assignedToAvatarUrl?: string | null;
  requestorName?: string;
  requestorDepartment?: string | null;
};

export interface TaskDetailsProps {
  data: TaskDetailsData;
  onBack: () => void;
  onApprove?: () => void;
  salesforceUrl?: string;
}

const formatIsoDateToDisplay = (isoString?: string) =>
  isoString
    ? new Date(isoString).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "—";

const TaskDetails: React.FC<TaskDetailsProps> = ({ data, onBack, onApprove, salesforceUrl }) => {
  const resolvedTitle = data.taskTitle || data.taskType || "Task details";

  const handleApproveClick = () => {
    onApprove?.();
  };

  const statusTagBgColor = {
    'Approved': '#0e8732',
    'Rejected': '#da291c',
    'Pending': '#c3a500',
  }

  const priorityTagBgColor = {
    'High': '#fdede8',
    'Medium': '#feefd4',
    'Low': '#e2edfe',
  }

  const priorityTagTextColor = {
    'High': '#ff3a00',
    'Medium': '#dda338',
    'Low': '#2b77d6',
  }

  return (
    <>
      <Breadcrumb
        onBack={onBack}
        links={[
          { text: "Task", url: "/task" },
          { text: "Task Details" },
        ]}
      />
      <section className={styles.card}>
        <div className={styles.inner}>
          <div className={styles.headerBar}>
            <div className={styles.workflowMeta}>
              <span className={styles.workflowLabel}>Workflow No.</span>
              <span className={styles.workflowValue}>{data.workflowNumber || "—"}</span>
            </div>

            {salesforceUrl ? (
              <a href={salesforceUrl} target="_blank" rel="noopener noreferrer" className={styles.viewBtn}>
                <span className={styles.viewBtnText}>View Details in Salesforce</span>
                <span className={styles.viewBtnIcon} dangerouslySetInnerHTML={{ __html: SMALL_ARROW_RIGHT_ICON }} />
              </a>
            ) : (
              <span className={styles.viewBtn}>
                <span className={styles.viewBtnText}>View Details in Salesforce</span>
                <span className={styles.viewBtnIcon} dangerouslySetInnerHTML={{ __html: SMALL_ARROW_RIGHT_ICON }} />
              </span>
            )}
          </div>

          <h1 className={styles.title}>{resolvedTitle}</h1>
          <p className={styles.subtitle}>
            Salary Certificate breakdown Informations Salary Certificate breakdown Informations
          </p>

          <div className={styles.rule} role="separator" aria-hidden="true" />

          <div className={styles.rows}>
            <div className={styles.row}>
              <div className={styles.col}>
                <div className={styles.label}>Priority</div>
                {data.priority && <Tag
                  label={data.priority}
                  backgroundColor={priorityTagBgColor[data.priority as keyof typeof priorityTagBgColor]}
                  textColor={priorityTagTextColor[data.priority as keyof typeof priorityTagTextColor]}
                />}
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
                  <Tag label={data.status} backgroundColor={statusTagBgColor[data.status as keyof typeof statusTagBgColor]} />
                </div>
              </div>
            </div>

            <div className={styles.rule} role="separator" aria-hidden="true" />

            <div className={styles.row}>
              <div className={styles.col}>
                <div className={styles.label}>Created On</div>
                <div className={styles.value}>{formatIsoDateToDisplay(data.createdOn)}</div>
              </div>

              <div className={styles.col}>
                <div className={styles.label}>Due Date</div>
                <div className={styles.value}>{formatIsoDateToDisplay(data.dueDate)}</div>
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

            <div className={styles.rule} role="separator" aria-hidden="true" />

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

          <div className={styles.rule} role="separator" aria-hidden="true" />

          <div className={styles.ctaRow}>
            <PrimaryButton
              label="Approve"
              onClick={handleApproveClick}
              size="large"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default TaskDetails;
