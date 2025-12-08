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
import Tag from '../../Components/Tag/Tag';

import sfListingMock from './dummyData';
import NavSegment from './taskNavBtnComp';

import {
  SfApprovalService,
  TaskListApiResponse,
  TaskListItem
} from '../../services/Task/SalesforceApprovalService';

export interface ITaskState {
  selectedTabValue: string;
  isLoading: boolean;
  errorMessage?: string;
  oracleItems: TaskListItem[];
  salesforceItems: TaskListItem[];
}

const formatIsoDateToDisplay = (isoString: string) =>
  new Date(isoString).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

export default class Task extends React.Component<ITaskProps, ITaskState> {
  private readonly salesforceBaseUrl: string =
    "https://dubaiproperties--dev.sandbox.my.salesforce.com";

  private readonly salesforceService: SfApprovalService;

  constructor(props: ITaskProps) {
    super(props);
    this.state = {
      selectedTabValue: "All",
      isLoading: true,
      oracleItems: [],
      salesforceItems: [],
    };

    this.salesforceService = new SfApprovalService({
      httpClient: this.props.httpClient,
      salesforceBaseUrl: this.salesforceBaseUrl,
      // accessToken: '<<INJECT_BEARER_TOKEN_HERE>>'
    });
  }

  public async componentDidMount(): Promise<void> {
    try {
      const currentUserEmail =
        this.props.userEmail || this.props.userDisplayName || "someone@example.com";

      const listResponse: TaskListApiResponse =
        await this.salesforceService.fetchApprovalsByEmail(currentUserEmail);

      const allApprovals = listResponse.approvals || [];

      const salesforceList = allApprovals.filter(
        (task) => (task.originSystem || "").toLowerCase() === "salesforce"
      );

      // Oracle will still use dummy data for now
      const oracleList: TaskListItem[] = sfListingMock.oracle;

      this.setState({
        oracleItems: oracleList,
        salesforceItems: salesforceList,
        isLoading: false,
      });
    } catch (error: any) {
      // Fallback to full dummy data (Salesforce + Oracle)
      this.setState({
        oracleItems: sfListingMock.oracle,
        salesforceItems: sfListingMock.salesForce,
        isLoading: false,
        errorMessage:
          (error?.message && error.message !== "MOCK_MODE")
            ? error.message
            : undefined,
      });
    }
  }

  private normalizeOriginSystem(originSystem?: string): string {
    const lower = (originSystem || "").toLowerCase();
    if (lower === "oracle") return "Oracle";
    if (lower === "salesforce") return "Salesforce";
    return originSystem || "—";
  }

  /** Build Salesforce deep link only for Salesforce-origin tasks */
  private buildSalesforceDeepLink(taskRowData: TaskListItem): string | null {
    if (this.normalizeOriginSystem(taskRowData.originSystem) !== "Salesforce") {
      return null;
    }

    if (!taskRowData.workitemId) {
      return null;
    }

    // Standard Lightning record URL for ProcessInstanceWorkitem
    return `${this.salesforceBaseUrl}/lightning/r/ProcessInstanceWorkitem/${taskRowData.workitemId}/view`;
  }

  private handleTabChange = (newTabValue: string) => {
    this.setState({ selectedTabValue: newTabValue });
  };

  public render(): React.ReactElement<ITaskProps> {
    const {
      selectedTabValue,
      isLoading,
      oracleItems,
      salesforceItems
    } = this.state;

    // Columns: Workflow No. | Task Title | Priority | Due Date | Requested By | Action
    const tableColumns = [
      { columnKey: "workflowNumber", label: "Workflow No." },
      { columnKey: "taskTitle", label: "Task Title" },
      { columnKey: "priority", label: "Priority" },
      { columnKey: "dueDate", label: "Due Date" },
      { columnKey: "requestedBy", label: "Requested By" },
      { columnKey: "action", label: "Action" },
    ];

    const priorityTagBgColor: Record<string, string> = {
      High: '#fdede8',
      Medium: '#feefd4',
      Low: '#e2edfe',
    };

    const priorityTagTextColor: Record<string, string> = {
      High: '#ff3a00',
      Medium: '#dda338',
      Low: '#2b77d6',
    };

    const renderTaskRow = (taskItem: TaskListItem): JSX.Element => {
      const deepLink = this.buildSalesforceDeepLink(taskItem);

      return (
        <TableRow key={taskItem.workitemId || taskItem.workflowNumber}>
          <TableCell>
            <TableCellLayout>{taskItem.workflowNumber}</TableCellLayout>
          </TableCell>
          <TableCell>
            <TableCellLayout>{taskItem.taskTitle}</TableCellLayout>
          </TableCell>
          <TableCell>
            <TableCellLayout>
              <Tag
                label={taskItem.priority || '—'}
                backgroundColor={
                  priorityTagBgColor[taskItem.priority as keyof typeof priorityTagBgColor]
                }
                textColor={
                  priorityTagTextColor[taskItem.priority as keyof typeof priorityTagTextColor]
                }
              />
            </TableCellLayout>
          </TableCell>
          <TableCell>
            {taskItem.dueDate
              ? formatIsoDateToDisplay(taskItem.dueDate)
              : '—'}
          </TableCell>
          <TableCell>
            <TableCellLayout>
              {taskItem.requestorName || '—'}
            </TableCellLayout>
          </TableCell>
          <TableCell>
            {deepLink ? (
              <a
                href={deepLink}
                target="_blank"
                rel="noreferrer"
                className={styles.viewDetailsLink}
              >
                View Details
              </a>
            ) : (
              <span className={styles.viewDetailsDisabled}>View Details</span>
            )}
          </TableCell>
        </TableRow>
      );
    };

    const rowsToRender: TaskListItem[] = [
      ...(selectedTabValue === "Oracle" || selectedTabValue === "All" ? oracleItems : []),
      ...(selectedTabValue === "Salesforce" || selectedTabValue === "All" ? salesforceItems : []),
    ];

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
            <Table className={styles.table} aria-label="Task Approvals Table">
              <TableHeader className={styles.tableHeader}>
                <TableRow>
                  {tableColumns.map((column) => (
                    <TableHeaderCell key={column.columnKey}>
                      {column.label}
                    </TableHeaderCell>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody className={styles.tableBody}>
                {isLoading
                  ? null
                  : rowsToRender.map(task => renderTaskRow(task))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }
}
