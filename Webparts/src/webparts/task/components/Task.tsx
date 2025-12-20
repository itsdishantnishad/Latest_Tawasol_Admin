import * as React from "react";
import styles from "./Task.module.scss";
import type { ITaskProps } from "./ITaskProps";

import {
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableHeader,
  TableHeaderCell,
  TableCellLayout,
} from "@fluentui/react-components";

import Tag from "../../Components/Tag/Tag";
import NavSegment, { SystemFilterOption } from "./taskNavBtnComp";

import { TahweelSVG, SalesforceSVG, ServiceNowSVG } from "../../assets/constants";

import { SfApprovalService, SFApproval } from "../../services/Integration/SalesForce";
import { ServiceNowApprovalService, ServiceNowApproval } from "../../services/Integration/ServiceNow";
import { TahweelService, TahweelApproval } from "../../services/Integration/TahweelService";

type TaskRowItem = {
  workflowNumber: string;
  taskTitle: string;
  priority: string;
  dueDate: string;
  requestorName: string;
  workitemId: string;
  redirectURL?: string;
  originSystem: string;
};

export interface ITaskState {
  selectedTabValue: SystemFilterOption;
  isLoading: boolean;
  errorMessage?: string;

  data: Record<SystemFilterOption, TaskRowItem[]>;
  loaded: Record<SystemFilterOption, boolean>;
}

/** Display constants */
const EMPTY_CELL_TEXT = "—";
const TABLE_COLUMN_COUNT = 6;
const DATE_LOCALE = "en-GB";
const DATE_DISPLAY_FORMAT: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };

const SYSTEM_TAB_DEFINITIONS = [
  { key: "Tahweel" as const, label: "Tahweel", iconSvg: TahweelSVG },
  { key: "Salesforce" as const, label: "Salesforce", iconSvg: SalesforceSVG },
  { key: "ServiceNow" as const, label: "ServiceNow", iconSvg: ServiceNowSVG },
];

const SALESFORCE_TABLE_COLUMNS = [
  { columnKey: "workflowNumber", label: "Workflow No." },
  { columnKey: "taskTitle", label: "Task Title" },
  { columnKey: "priority", label: "Priority" },
  { columnKey: "dueDate", label: "Due Date" },
  { columnKey: "requestedBy", label: "Requested By" },
  { columnKey: "action", label: "Action" },
];

const SERVICENOW_TABLE_COLUMNS = [
  { columnKey: "workflowNumber", label: "Number" },
  { columnKey: "taskTitle", label: "Short Description" },
  { columnKey: "priority", label: "Priority" },
  { columnKey: "dueDate", label: "Due Date" },
  { columnKey: "requestedBy", label: "Opened By" },
  { columnKey: "action", label: "Link" },
];

const PRIORITY_BADGE_BG_BY_LABEL: Record<string, string> = {
  High: "#fdede8",
  Medium: "#feefd4",
  Low: "#e2edfe",
};

const PRIORITY_BADGE_TEXT_BY_LABEL: Record<string, string> = {
  High: "#ff3a00",
  Medium: "#dda338",
  Low: "#2b77d6",
};

const normalizeApiDateString = (value: string): string => {
  if (!value) return "";
  const hasSpace = value.indexOf(" ") !== -1;
  const hasT = value.indexOf("T") !== -1;
  return hasSpace && !hasT ? value.replace(" ", "T") : value;
};

const formatDateForDisplay = (value: string): string => {
  if (!value) return EMPTY_CELL_TEXT;
  const cleaned = normalizeApiDateString(value);
  const d = new Date(cleaned);
  if (isNaN(d.getTime())) return EMPTY_CELL_TEXT;
  return d.toLocaleDateString(DATE_LOCALE, DATE_DISPLAY_FORMAT);
};

export default class Task extends React.Component<ITaskProps, ITaskState> {
  private readonly salesforceService: SfApprovalService;
  private readonly serviceNowService: ServiceNowApprovalService;
  private readonly tahweelService: TahweelService;

  private _loadSequence = 0;

  constructor(props: ITaskProps) {
    super(props);

    this.state = {
      selectedTabValue: "Salesforce",
      isLoading: false,
      errorMessage: undefined,

      data: {
        Tahweel: [],
        Salesforce: [],
        ServiceNow: [],
      },
      loaded: {
        Tahweel: false,
        Salesforce: false,
        ServiceNow: false,
      },
    };

    this.salesforceService = new SfApprovalService({ httpClient: this.props.httpClient });
    this.serviceNowService = new ServiceNowApprovalService({ httpClient: this.props.httpClient });
    this.tahweelService = new TahweelService({ httpClient: this.props.httpClient });
  }

  public async componentDidMount(): Promise<void> {
    await this.loadTabData(this.state.selectedTabValue);
  }

  private getUserEmailOrThrow(): string {
    const userEmail = (this.props.userEmail || "").trim();
    if (!userEmail) throw new Error("User email is required.");
    return userEmail;
  }

  private mapSalesforceApprovalToRow(item: SFApproval): TaskRowItem {
    return {
      workflowNumber: item.workflowNumber || EMPTY_CELL_TEXT,
      taskTitle: item.taskTitle || EMPTY_CELL_TEXT,
      priority: item.priority || EMPTY_CELL_TEXT,
      dueDate: item.dueDate || "",
      requestorName: item.requestorName || EMPTY_CELL_TEXT,
      workitemId: item.workitemId || item.workflowNumber || "",
      redirectURL: item.redirectURL,
      originSystem: item.originSystem || "Salesforce",
    };
  }

  private mapServiceNowApprovalToRow(item: ServiceNowApproval): TaskRowItem {
    return {
      workflowNumber: item.workflowNumber || EMPTY_CELL_TEXT,
      taskTitle: item.taskTitle || EMPTY_CELL_TEXT,
      priority: item.priority || EMPTY_CELL_TEXT,
      dueDate: item.dueDate || "",
      requestorName: item.requestorName || EMPTY_CELL_TEXT,
      workitemId: item.workitemId || item.workflowNumber || "",
      redirectURL: item.redirectURL,
      originSystem: item.originSystem || "ServiceNow",
    };
  }

  private mapTahweelApprovalToRow(item: TahweelApproval): TaskRowItem {
    return {
      workflowNumber: item.workflowNumber || EMPTY_CELL_TEXT,
      taskTitle: item.taskTitle || EMPTY_CELL_TEXT,
      priority: item.priority || EMPTY_CELL_TEXT,
      dueDate: item.dueDate || "",
      requestorName: item.requestorName || EMPTY_CELL_TEXT,
      workitemId: item.workitemId || item.workflowNumber || "",
      redirectURL: item.redirectURL,
      originSystem: item.originSystem || "Tahweel",
    };
  }

  private async loadTabData(tab: SystemFilterOption): Promise<void> {
    if (this.state.loaded[tab]) return;

    const seq = ++this._loadSequence;
    this.setState({ isLoading: true, errorMessage: undefined });

    try {
      const userEmail = this.getUserEmailOrThrow();
      let rows: TaskRowItem[] = [];

      if (tab === "Salesforce") {
        const res = await this.salesforceService.fetchApprovalsByEmail(userEmail);
        rows = (res?.approvals || []).map((x) => this.mapSalesforceApprovalToRow(x));
      } else if (tab === "ServiceNow") {
        const res = await this.serviceNowService.fetchApprovalsByEmail(userEmail);
        rows = (res?.approvals || []).map((x) => this.mapServiceNowApprovalToRow(x));
      } else if (tab === "Tahweel") {
        const { personNumber } = await this.tahweelService.fetchPersonNumberByEmail(userEmail);
        const res = await this.tahweelService.fetchTahweelApprovalsByEmployeeNumber(personNumber);
        rows = (res?.approvals || []).map((x) => this.mapTahweelApprovalToRow(x));
      } else {
        rows = [];
      }

      if (seq !== this._loadSequence) return;

      this.setState((prev) => ({
        isLoading: false,
        data: { ...prev.data, [tab]: rows },
        loaded: { ...prev.loaded, [tab]: true },
      }));
    } catch (e: any) {
      if (seq !== this._loadSequence) return;

      this.setState({
        isLoading: false,
        errorMessage: e?.message || "Failed to load approvals",
      });
    }
  }

  private handleTabChange = async (value: SystemFilterOption): Promise<void> => {
    if (value === this.state.selectedTabValue) return;

    this.setState({ selectedTabValue: value, errorMessage: undefined });
    await this.loadTabData(value);
  };

  public render(): React.ReactElement<ITaskProps> {
    const { selectedTabValue, isLoading, errorMessage, data } = this.state;

    const activeRows: TaskRowItem[] = data[selectedTabValue];
    const systemTabs = SYSTEM_TAB_DEFINITIONS.map((t) => ({
      ...t,
      count: data[t.key].length,
    }));

    const activeTableColumns =
      selectedTabValue === "ServiceNow" ? SERVICENOW_TABLE_COLUMNS : SALESFORCE_TABLE_COLUMNS;

    const actionLinkLabel =
      selectedTabValue === "ServiceNow" || selectedTabValue === "Tahweel" ? "Open" : "View Details";

    const renderTaskRow = (task: TaskRowItem): JSX.Element => {
      const priorityLabel = task.priority || EMPTY_CELL_TEXT;

      return (
        <TableRow key={(task.workitemId || task.workflowNumber) + ""}>
          <TableCell>
            <TableCellLayout>{task.workflowNumber || EMPTY_CELL_TEXT}</TableCellLayout>
          </TableCell>

          <TableCell>
            <TableCellLayout>{task.taskTitle || EMPTY_CELL_TEXT}</TableCellLayout>
          </TableCell>

          <TableCell>
            <TableCellLayout>
              <Tag
                label={priorityLabel}
                backgroundColor={PRIORITY_BADGE_BG_BY_LABEL[priorityLabel] || "#f3f3f3"}
                textColor={PRIORITY_BADGE_TEXT_BY_LABEL[priorityLabel] || "#333"}
              />
            </TableCellLayout>
          </TableCell>

          <TableCell>{formatDateForDisplay(task.dueDate)}</TableCell>

          <TableCell>
            <TableCellLayout>{task.requestorName || EMPTY_CELL_TEXT}</TableCellLayout>
          </TableCell>

          <TableCell>
            {task.redirectURL ? (
              <a href={task.redirectURL} target="_blank" rel="noreferrer" className={styles.viewDetailsLink}>
                {actionLinkLabel}
              </a>
            ) : (
              EMPTY_CELL_TEXT
            )}
          </TableCell>
        </TableRow>
      );
    };

    return (
      <div className={styles.main}>
        <div className={styles.pageContainer}>
          <div className={`${styles.taskHeader} ${styles.taskHeaderAbsolute}`}>
            <span className={styles.taskText}>Task</span>
            <span className={styles.approvalsText}> Approvals</span>
          </div>

          <NavSegment value={selectedTabValue} onChange={this.handleTabChange} tabs={systemTabs} />

          <div className={styles.tableWrapper}>
            <Table className={styles.table} aria-label="Task Approvals Table">
              <TableHeader className={styles.tableHeader}>
                <TableRow>
                  {activeTableColumns.map((column) => (
                    <TableHeaderCell key={column.columnKey}>{column.label}</TableHeaderCell>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody className={styles.tableBody}>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={TABLE_COLUMN_COUNT}>
                      <TableCellLayout>Loading approvals...</TableCellLayout>
                    </TableCell>
                  </TableRow>
                ) : activeRows.length > 0 ? (
                  activeRows.map(renderTaskRow)
                ) : (
                  <TableRow>
                    <TableCell colSpan={TABLE_COLUMN_COUNT}>
                      <TableCellLayout>No approvals found</TableCellLayout>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {errorMessage && <div className={styles.errormessage}>Error : {errorMessage}</div>}
          </div>
        </div>
      </div>
    );
  }
}
