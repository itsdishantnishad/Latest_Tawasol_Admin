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
import NavSegment from './taskNavBtnComp';
import {
  SfApprovalService,
  SFApproval,
} from '../../services/Integration/SalesForce';


import {
  ServiceNowApprovalService,
  ServiceNowTaskListItem
} from '../../services/Task/ServiceNowApprovalService';

export interface ITaskState {
  selectedTabValue: string;
  isLoading: boolean;
  errorMessage?: string;
  oracleItems: ServiceNowTaskListItem[];
  salesforceItems: SFApproval[];
  rawResponse?: any;
}

const formatIsoDateToDisplay = (isoString: string) => {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

export default class Task extends React.Component<ITaskProps, ITaskState> {
  private salesforceService: SfApprovalService;

  constructor(props: ITaskProps) {
    super(props);
    this.state = {
      selectedTabValue: "All",
      isLoading: false,
      salesforceItems: [],
      rawResponse: undefined,
      errorMessage: undefined,
      oracleItems: [],
    };

    this.salesforceService = new SfApprovalService({
      httpClient: this.props.httpClient,
    });
  }

  // private readonly salesforceBaseUrl: string =
  //   "https://infaservicesuat.dubaiholding.com";


  private readonly serviceNowService: ServiceNowApprovalService;

  // constructor(props: ITaskProps) {
  //   super(props);
  //   this.state = {
  //     selectedTabValue: "All",
  //     isLoading: true,
  //     oracleItems: [],
  //     salesforceItems: [],
  //   };

  //   this.salesforceService = new SfApprovalService({
  //     httpClient: this.props.httpClient,
  //     salesforceBaseUrl: this.salesforceBaseUrl,
  //   });

  //   this.serviceNowService = new ServiceNowApprovalService({
  //     httpClient: this.props.httpClient,
  //     baseUrl: this.salesforceBaseUrl,
  //   });
  // }

  public async componentDidMount(): Promise<void> {
    try {
      const email = this.props.userEmail || "";
      const res = await this.salesforceService.fetchApprovalsByEmail(email);

      this.setState({
        isLoading: false,
        salesforceItems: res.approvals || [],
        rawResponse: res,
      });
    } catch (e: any) {
      console.error("Salesforce API error:", e);
      this.setState({
        isLoading: false,
        salesforceItems: [],
        rawResponse: undefined,
        errorMessage: e?.message || "Failed to load Salesforce approvals",
      });
    }

    // try {
    //   const currentUserEmail = this.props.userEmail || "aisha.amiri@dhre.ae";

    //   const [sfResponse, oracleItems] = await Promise.all([
    //     this.salesforceService.fetchApprovalsByEmail(currentUserEmail),
    // //     this.serviceNowService.fetchApprovalsByEmail(currentUserEmail)
    //   ]);

    //   this.setState({
    //     oracleItems: oracleItems,
    //     salesforceItems: sfResponse.approvals,
    //     isLoading: false,
    //   });
    // } catch (error: any) {
    //   console.error('Error loading approvals:', error);
    //   this.setState({
    //     oracleItems: [],
    //     salesforceItems: [],
    //     isLoading: false,
    //     errorMessage: error.message,
    //   });
    // }
  }

  private handleTabChange = (value: string): void => {
    this.setState({ selectedTabValue: value });
  };

  public render(): React.ReactElement<ITaskProps> {
    const {
      selectedTabValue,
      isLoading,
      oracleItems,
      salesforceItems
    } = this.state;

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

    const renderTaskRow = (taskItem: ServiceNowTaskListItem | SFApproval): JSX.Element => {
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
                backgroundColor={priorityTagBgColor[taskItem.priority as keyof typeof priorityTagBgColor]}
                textColor={priorityTagTextColor[taskItem.priority as keyof typeof priorityTagTextColor]}
              />
            </TableCellLayout>
          </TableCell>
          <TableCell>
            {formatIsoDateToDisplay(taskItem.dueDate)}
          </TableCell>
          <TableCell>
            <TableCellLayout>{taskItem.requestorName || '—'}</TableCellLayout>
          </TableCell>
          <TableCell>
            <a
              href={taskItem.redirectURL || "#"}
              target="_blank"
            >
              View Details
            </a>
            <span className={styles.viewDetailsLink}>View Details</span>
          </TableCell>
        </TableRow>
      );
    };

    const rowsToRender: (ServiceNowTaskListItem | SFApproval)[] = [
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <TableCellLayout>Loading approvals...</TableCellLayout>
                    </TableCell>
                  </TableRow>
                ) : rowsToRender.length > 0 ? (
                  rowsToRender.map(task => renderTaskRow(task))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <TableCellLayout>No approvals found</TableCellLayout>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }
}