import * as React from 'react';
import styles from './Task.module.scss';
import type { ITaskProps } from './ITaskProps';
import {
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableHeader,
  TableHeaderCell,
  TableCellLayout,
} from "@fluentui/react-components";

import sfListingMock from './dummyData';
import TaskDetails, { TaskDetailsData } from './TaskDetails';
import NavSegment from './taskNavBtnComp';
import { ACTION_RED_CROSS_REJECT_SVG, ACTION_GREEN_CHECK_APPROVE_SVG } from '../../assets/constants';

// === Salesforce service (listing + actions) ===
import { SfApprovalService, TaskListApiResponse } from '../../services/Task/SalesforceApprovalService';
// If you want to pass HttpClient at cutover, import WebPartContext in your WebPart and send it via props.

export interface ITaskState {
  selectedTab: string;
  selectedTask: TaskDetailsData | null;
  loading: boolean;
  error?: string;
  dataOracle: any[];
  dataSalesforce: any[];
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

export default class Task extends React.Component<ITaskProps, ITaskState> {
  private _svc: SfApprovalService;

  constructor(props: ITaskProps) {
    super(props);
    this.state = {
      selectedTab: "All",
      selectedTask: null,
      loading: true,
      dataOracle: [],
      dataSalesforce: [],
    };

    // NOTE: not passing HttpClient now; we’re in MOCK mode until cutover.
    this._svc = new SfApprovalService({
      // httpClient: this.props.httpClient, // <-- supply at cutover if you want direct calls
      salesforceBaseUrl: "https://dubaiproperties--dev.sandbox.my.salesforce.com",
      // accessToken: "<JWT if calling SF directly>",
    });
  }

  public async componentDidMount(): Promise<void> {
    try {
      // Try API listing; in MOCK mode service throws "MOCK_MODE".
      const email = this.props.userDisplayName || "someone@example.com";
      const res: TaskListApiResponse = await this._svc.fetchApprovals(email);

      // Split by origin system (future-proofing)
      const salesforce = (res.approvals || []).filter(a => (a.originSystem || "").toLowerCase() === "salesforce");
      const oracle = (res.approvals || []).filter(a => (a.originSystem || "").toLowerCase() === "oracle");

      this.setState({
        dataOracle: oracle,
        dataSalesforce: salesforce,
        loading: false,
      });
    } catch (e: any) {
      // MOCK mode or API failure: load your dummy data
      this.setState({
        dataOracle: sfListingMock.oracle,
        dataSalesforce: sfListingMock.salesForce,
        loading: false,
        error: (e?.message && e.message !== "MOCK_MODE") ? e.message : undefined,
      });
    }
  }

  private normalizeOrigin(originSystem?: string): string {
    const v = (originSystem || "").toLowerCase();
    if (v === "oracle") return "Oracle";
    if (v === "salesforce") return "Salesforce";
    return originSystem || "—";
  }

  private buildDetails = (rowData: any): TaskDetailsData => {
    return {
      workitemId: rowData.workitemId,
      workflowNumber: rowData.workflowNumber,
      taskTitle: rowData.taskTitle,
      taskType: rowData.taskType,
      priority: rowData.priority,
      originSystem: this.normalizeOrigin(rowData.originSystem),
      status: rowData.status,
      createdOn: rowData.createdOn,
      dueDate: rowData.dueDate,
      assignedTo: rowData.assignedTo,
      requestorName: rowData.requestorName,
      requestorDepartment: rowData.requestorDepartment,
    };
  };

  private handleRowClick = (rowData: any) => {
    const taskDetails = this.buildDetails(rowData);
    this.setState({ selectedTask: taskDetails });
  };

  private handleBack = () => {
    this.setState({ selectedTask: null });
  };

  private handleTabChange = (value: string) => {
    this.setState({ selectedTab: value, selectedTask: null });
  };

  private handleApprove = async (details: TaskDetailsData) => {
    try {
      const res = await this._svc.takeAction({
        actionType: "Approve",
        contextId: details.workitemId,
      });

      if (res.success) {
        alert(`Approved! Status: ${res.instanceStatus || "Approved"}`);
        // update selected task state
        this.setState({ selectedTask: { ...details, status: "Approved" } });
      } else {
        alert("Approve failed");
      }
    } catch {
      alert("Approve failed");
    }
  };

  public render(): React.ReactElement<ITaskProps> {
    const { selectedTask, selectedTab, loading, dataOracle, dataSalesforce } = this.state;

    if (selectedTask) {
      return (
        <div className={styles.main}>
          <div className={styles.pageContainer}>
            <TaskDetails
              data={selectedTask}
              onBack={this.handleBack}
              onApprove={() => this.handleApprove(selectedTask)}
            />
          </div>
        </div>
      );
    }

    const columns = [
      { columnKey: "workflowNumber", label: "Workflow No." },
      { columnKey: "taskTitle", label: "Task Title" },
      { columnKey: "priority", label: "Priority" },
      { columnKey: "dueDate", label: "Due Date" },
      { columnKey: "action", label: "Action" },
      { columnKey: "status", label: "Status" },
    ];

    const tableRow = (item: any): JSX.Element => (
      <TableRow key={item.workitemId} onClick={() => this.handleRowClick(item)}>
        <TableCell><TableCellLayout>{item.workflowNumber}</TableCellLayout></TableCell>
        <TableCell><TableCellLayout>{item.taskTitle}</TableCellLayout></TableCell>
        <TableCell>
          <TableCellLayout>
            <span
              className={`${styles.chip} 
                ${item.priority === "High"
                  ? styles.chipHigh
                  : item.priority === "Medium"
                    ? styles.chipMedium
                    : styles.chipLow
                }`}
            >
              {item.priority || "—"}
            </span>
          </TableCellLayout>
        </TableCell>
        <TableCell>{fmtDate(item.dueDate)}</TableCell>

        <TableCell>
          <div className={styles.actionCell}>
            <span className={styles.actionItem}>
              <span
                className={styles.actionIcon}
                dangerouslySetInnerHTML={{ __html: ACTION_RED_CROSS_REJECT_SVG }}
              />
              Reject
            </span>
            <span className={styles.actionItem}>
              <span
                className={styles.actionIcon}
                dangerouslySetInnerHTML={{ __html: ACTION_GREEN_CHECK_APPROVE_SVG }}
              />
              Approve
            </span>
          </div>
        </TableCell>

        <TableCell>
          <TableCellLayout>
            <span
              className={`${styles.statusPill} ${
                item.status === "Approved"
                  ? styles.stApproved
                  : item.status === "Rejected"
                    ? styles.stRejected
                    : styles.stPending
              }`}
            >
              <span className={styles.statusText}>{item.status}</span>
            </span>
          </TableCellLayout>
        </TableCell>
      </TableRow>
    );

    const listOracle = dataOracle;
    const listSalesforce = dataSalesforce;

    return (
      <div className={styles.main}>
        <div className={styles.pageContainer}>
          <div className={`${styles.taskHeader} ${styles.taskHeaderAbsolute}`}>
            <span className={styles.taskText}>Task</span>
            <span className={styles.approvalsText}> Approvals</span>
          </div>

          <NavSegment
            absolute={false}
            defaultValue={selectedTab as any}
            onChange={this.handleTabChange}
            labels={["All", "Oracle", "Salesforce"]}
          />

          <div className={styles.tableWrapper}>
            <Table aria-label="Task table">
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHeaderCell key={col.columnKey}>{col.label}</TableHeaderCell>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? null : (
                  <>
                    {(selectedTab === "Oracle" || selectedTab === "All") &&
                      listOracle.map((item: any) => tableRow(item))}
                    {(selectedTab === "Salesforce" || selectedTab === "All") &&
                      listSalesforce.map((item: any) => tableRow(item))}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }
}
