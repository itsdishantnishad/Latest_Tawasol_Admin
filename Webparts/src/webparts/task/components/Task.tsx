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

import { SfApprovalService, TaskListApiResponse } from '../../services/Task/SalesforceApprovalService';

export interface ITaskState {
  selectedTabValue: string;
  selectedTaskDetails: TaskDetailsData | null;
  isLoading: boolean;
  errorMessage?: string;
  oracleItems: any[];
  salesforceItems: any[];
}

const formatIsoDateToDisplay = (isoString: string) =>
  new Date(isoString).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

export default class Task extends React.Component<ITaskProps, ITaskState> {
  private readonly salesforceService: SfApprovalService;

  constructor(props: ITaskProps) {
    super(props);
    this.state = {
      selectedTabValue: "All",
      selectedTaskDetails: null,
      isLoading: true,
      oracleItems: [],
      salesforceItems: [],
    };

    // Not passing HttpClient in dev; service is in MOCK mode until cutover.
    this.salesforceService = new SfApprovalService({
      // httpClient: this.props.httpClient, // provide at cutover for direct calls
      salesforceBaseUrl: "https://dubaiproperties--dev.sandbox.my.salesforce.com",
      // accessToken: "<Bearer token if calling SF directly>",
    });
  }

  public async componentDidMount(): Promise<void> {
    try {
      // In mock mode the service throws "MOCK_MODE"
      const currentUserEmail = this.props.userDisplayName || "someone@example.com";
      const listResponse: TaskListApiResponse = await this.salesforceService.fetchApprovalsByEmail(currentUserEmail);

      const salesforceList = (listResponse.approvals || []).filter(
        (task) => (task.originSystem || "").toLowerCase() === "salesforce"
      );
      const oracleList = (listResponse.approvals || []).filter(
        (task) => (task.originSystem || "").toLowerCase() === "oracle"
      );

      this.setState({
        oracleItems: oracleList,
        salesforceItems: salesforceList,
        isLoading: false,
      });
    } catch (error: any) {
      // Fallback to mocks
      this.setState({
        oracleItems: sfListingMock.oracle,
        salesforceItems: sfListingMock.salesForce,
        isLoading: false,
        errorMessage: (error?.message && error.message !== "MOCK_MODE") ? error.message : undefined,
      });
    }
  }

  private normalizeOriginSystem(originSystem?: string): string {
    const lower = (originSystem || "").toLowerCase();
    if (lower === "oracle") return "Oracle";
    if (lower === "salesforce") return "Salesforce";
    return originSystem || "—";
  }

  private buildTaskDetailsPayload(taskRowData: any): TaskDetailsData {
    return {
      workitemId: taskRowData.workitemId,
      workflowNumber: taskRowData.workflowNumber,
      taskTitle: taskRowData.taskTitle,
      taskType: taskRowData.taskType,
      priority: taskRowData.priority,
      originSystem: this.normalizeOriginSystem(taskRowData.originSystem),
      status: taskRowData.status,
      createdOn: taskRowData.createdOn,
      dueDate: taskRowData.dueDate,
      assignedTo: taskRowData.assignedTo,
      requestorName: taskRowData.requestorName,
      requestorDepartment: taskRowData.requestorDepartment,
    };
  }

  private handleRowClick = (taskRowData: any) => {
    const taskDetails: TaskDetailsData = this.buildTaskDetailsPayload(taskRowData);
    this.setState({ selectedTaskDetails: taskDetails });
  };

  private handleBackFromDetails = () => {
    this.setState({ selectedTaskDetails: null });
  };

  private handleTabChange = (newTabValue: string) => {
    this.setState({ selectedTabValue: newTabValue, selectedTaskDetails: null });
  };

  private handleApproveAction = async (taskDetails: TaskDetailsData) => {
    try {
      const actionResponse = await this.salesforceService.submitTaskAction({
        actionType: "Approve",
        contextId: taskDetails.workitemId,
      });

      if (actionResponse.success) {
        alert(`Approved! Status: ${actionResponse.instanceStatus || "Approved"}`);
        this.setState({ selectedTaskDetails: { ...taskDetails, status: "Approved" } });
      } else {
        alert("Approve failed");
      }
    } catch {
      alert("Approve failed");
    }
  };

  public render(): React.ReactElement<ITaskProps> {
    const {
      selectedTaskDetails,
      selectedTabValue,
      isLoading,
      oracleItems,
      salesforceItems
    } = this.state;

    if (selectedTaskDetails) {
      return (
        <div className={styles.main}>
          <div className={styles.pageContainer}>
            <TaskDetails
              data={selectedTaskDetails}
              onBack={this.handleBackFromDetails}
              onApprove={() => this.handleApproveAction(selectedTaskDetails)}
            />
          </div>
        </div>
      );
    }

    const tableColumns = [
      { columnKey: "workflowNumber", label: "Workflow No." },
      { columnKey: "taskTitle", label: "Task Title" },
      { columnKey: "priority", label: "Priority" },
      { columnKey: "dueDate", label: "Due Date" },
      { columnKey: "action", label: "Action" },
      { columnKey: "status", label: "Status" },
    ];

    const renderTaskRow = (taskItem: any): JSX.Element => (
      <TableRow key={taskItem.workitemId} onClick={() => this.handleRowClick(taskItem)}>
        <TableCell><TableCellLayout>{taskItem.workflowNumber}</TableCellLayout></TableCell>
        <TableCell><TableCellLayout>{taskItem.taskTitle}</TableCellLayout></TableCell>
        <TableCell>
          <TableCellLayout>
            <span
              className={`${styles.chip} 
                ${taskItem.priority === "High"
                  ? styles.chipHigh
                  : taskItem.priority === "Medium"
                    ? styles.chipMedium
                    : styles.chipLow
                }`}
            >
              {taskItem.priority || "—"}
            </span>
          </TableCellLayout>
        </TableCell>
        <TableCell>{formatIsoDateToDisplay(taskItem.dueDate)}</TableCell>

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
                taskItem.status === "Approved"
                  ? styles.stApproved
                  : taskItem.status === "Rejected"
                    ? styles.stRejected
                    : styles.stPending
              }`}
            >
              <span className={styles.statusText}>{taskItem.status}</span>
            </span>
          </TableCellLayout>
        </TableCell>
      </TableRow>
    );

    return (
      <div className={styles.main}>
        <div className={styles.pageContainer}>
          <div className={`${styles.taskHeader} ${styles.taskHeaderAbsolute}`}>
            <span className={styles.taskText}>Task</span>
            <span className={styles.approvalsText}> Approvals</span>
          </div>

          <NavSegment
            absolute={false}
            defaultValue={selectedTabValue as any}
            onChange={this.handleTabChange}
            labels={["All", "Oracle", "Salesforce"]}
          />

          <div className={styles.tableWrapper}>
            <Table aria-label="Task Approvals Table">
              <TableHeader>
                <TableRow>
                  {tableColumns.map((column) => (
                    <TableHeaderCell key={column.columnKey}>{column.label}</TableHeaderCell>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? null : (
                  <>
                    {(selectedTabValue === "Oracle" || selectedTabValue === "All") &&
                      oracleItems.map((task) => renderTaskRow(task))}
                    {(selectedTabValue === "Salesforce" || selectedTabValue === "All") &&
                      salesforceItems.map((task) => renderTaskRow(task))}
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
