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
  Button,
} from "@fluentui/react-components";

import Tag from "../../Components/Tag/Tag";
import NavSegment, { SystemFilterOption } from "./taskNavBtnComp";

import {
  TahweelSVG,
  SalesforceSVG,
  ServiceNowSVG,
  VIEW_DETAILS_EXTERNAL_LINK_SVG,
  PRIORITY_SORT_DOWN_SVG,
  PRIORITY_SORT_UP_SVG,
} from "../../assets/constants";

import { SfApprovalService, SFApproval } from "../../services/Integration/SalesForce";
import { ServiceNowApprovalService, ServiceNowApproval } from "../../services/Integration/ServiceNow";
import { TahweelService, TahweelApproval } from "../../services/Integration/TahweelService";

const TaskApprovalPlaceholderIcon: string = require("../../Components/../Components/FeatureContent/images/taskApprovalPlaceholderIcon.svg");

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

  // Priority sort toggle (desc: High->Low, asc: Low->High)
  prioritySortDir: "desc" | "asc";

  // for high volumes (UI performance) + future backend paging support
  visibleCountByTab: Record<SystemFilterOption, number>;
  totalCountByTab: Record<SystemFilterOption, number>;
}

/** Display constants */
const EMPTY_CELL_TEXT = "—";
const TABLE_COLUMN_COUNT = 6;
const DATE_LOCALE = "en-GB";
const DATE_DISPLAY_FORMAT: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };

// high-volume: render only N rows initially, allow Load More
const PAGE_SIZE = 20;

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

const TAHWEEL_TABLE_COLUMNS = [
  { columnKey: "workflowNumber", label: "Number" },
  { columnKey: "taskTitle", label: "Title" },
  { columnKey: "priority", label: "Priority" },
  { columnKey: "dueDate", label: "Assigned Date" },
  { columnKey: "requestedBy", label: "Created By" },
  { columnKey: "action", label: "Action" },
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

// Handles "1 - High" or "High"
const normalizePriorityLabel = (priority: string): string => {
  const p = (priority || "").toString().trim();
  if (!p) return "";
  const match = p.match(/^\s*\d+\s*-\s*(.+)\s*$/);
  return match && match[1] ? match[1].trim() : p;
};

export default class Task extends React.Component<ITaskProps, ITaskState> {
  private readonly salesforceService: SfApprovalService;
  private readonly serviceNowService: ServiceNowApprovalService;
  private readonly tahweelService: TahweelService;

  private _loadSequence = 0;

  constructor(props: ITaskProps) {
    super(props);

    this.state = {
      selectedTabValue: "Tahweel",
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

      prioritySortDir: "desc",

      // paging defaults
      visibleCountByTab: {
        Tahweel: PAGE_SIZE,
        Salesforce: PAGE_SIZE,
        ServiceNow: PAGE_SIZE,
      },

      // counts: future-ready for backend totalCount
      totalCountByTab: {
        Tahweel: 0,
        Salesforce: 0,
        ServiceNow: 0,
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
    // const userEmail = ("mohamed.thahir-c@dhre.ae").trim();
    if (!userEmail) throw new Error("User email is required.");
    return userEmail;
  }

  private mapSalesforceApprovalToRow(item: SFApproval): TaskRowItem {
    return {
      workflowNumber: item.workflowNumber || EMPTY_CELL_TEXT,
      taskTitle: item.taskTitle || EMPTY_CELL_TEXT,
      priority: item.priority || "",
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
      priority: item.priority || "",
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
      priority: item.priority || "",
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

      const totalCount = rows.length;
      const initialVisible = Math.min(this.state.visibleCountByTab[tab] || PAGE_SIZE, totalCount || 0);

      this.setState((prev) => ({
        isLoading: false,
        data: { ...prev.data, [tab]: rows },
        loaded: { ...prev.loaded, [tab]: true },

        totalCountByTab: { ...prev.totalCountByTab, [tab]: totalCount },
        visibleCountByTab: { ...prev.visibleCountByTab, [tab]: initialVisible || PAGE_SIZE },
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

  private handleLoadMore = (): void => {
    const tab = this.state.selectedTabValue;
    const totalLoaded = this.state.data[tab]?.length || 0;

    this.setState((prev) => {
      const current = prev.visibleCountByTab[tab] || PAGE_SIZE;
      const next = Math.min(current + PAGE_SIZE, totalLoaded);

      return {
        visibleCountByTab: { ...prev.visibleCountByTab, [tab]: next },
      };
    });
  };

  // ===== Priority sort =====
  private togglePrioritySort = (): void => {
    this.setState((prev) => ({
      prioritySortDir: prev.prioritySortDir === "desc" ? "asc" : "desc",
    }));
  };

  private getPriorityRank(priority: string): number {
    const p = normalizePriorityLabel(priority).toLowerCase();
    if (p === "high") return 3;
    if (p === "medium") return 2;
    if (p === "low") return 1;
    return 0;
  }

  private sortRowsByPriority(rows: TaskRowItem[], dir: "desc" | "asc"): TaskRowItem[] {
    // stable sort
    return rows
      .map((r, i) => ({ r, i }))
      .sort((a, b) => {
        const ra = this.getPriorityRank(a.r.priority);
        const rb = this.getPriorityRank(b.r.priority);

        if (ra !== rb) return dir === "desc" ? rb - ra : ra - rb;
        return a.i - b.i;
      })
      .map((x) => x.r);
  }

  public render(): React.ReactElement<ITaskProps> {
    const { selectedTabValue, isLoading, errorMessage, data, visibleCountByTab, totalCountByTab, prioritySortDir } = this.state;

    const activeRows: TaskRowItem[] = data[selectedTabValue];
    const visibleCount = Math.max(0, visibleCountByTab[selectedTabValue] || PAGE_SIZE);

    const sortedActiveRows = this.sortRowsByPriority(activeRows, prioritySortDir);
    const activeRowsToRender = sortedActiveRows.slice(0, visibleCount);

    const showPlaceholder = !isLoading && !errorMessage && activeRows.length === 0;

    const systemTabs = SYSTEM_TAB_DEFINITIONS.map((t) => ({
      ...t,
      count: (totalCountByTab[t.key] ?? data[t.key].length) || 0,
    }));

    const activeTableColumns =
      selectedTabValue === "ServiceNow"
        ? SERVICENOW_TABLE_COLUMNS
        : selectedTabValue === "Tahweel"
        ? TAHWEEL_TABLE_COLUMNS
        : SALESFORCE_TABLE_COLUMNS;

    const actionLinkLabel = "View Details";

    const renderTaskRow = (task: TaskRowItem): JSX.Element => {
      const priorityLabel = normalizePriorityLabel(task.priority) || EMPTY_CELL_TEXT;

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
              <a
                href={task.redirectURL}
                target="_blank"
                rel="noreferrer"
                className={styles.viewDetailsLink}
                aria-label="View Details (opens in new tab)"
              >
                <span className={styles.viewDetailsText}>{actionLinkLabel}</span>
                <span
                  className={styles.viewDetailsIcon}
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: VIEW_DETAILS_EXTERNAL_LINK_SVG }}
                />
              </a>
            ) : (
              EMPTY_CELL_TEXT
            )}
          </TableCell>
        </TableRow>
      );
    };

    const totalForActiveTab = (totalCountByTab[selectedTabValue] ?? activeRows.length) || activeRows.length;
    const canLoadMore = !isLoading && sortedActiveRows.length > 0 && visibleCount < sortedActiveRows.length;

    return (
      <div className={styles.main}>
        <div className={styles.pageContainer}>
          <div className={`${styles.taskHeader} ${styles.taskHeaderAbsolute}`}>
            <span className={styles.taskText}>Task</span>
            <span className={styles.approvalsText}> Approvals</span>
          </div>

          <NavSegment value={selectedTabValue} onChange={this.handleTabChange} tabs={systemTabs} />

          <div className={styles.tableWrapper}>
            {showPlaceholder ? (
              <div>
                <img
                  src={TaskApprovalPlaceholderIcon}
                  alt="No tasks"
                  style={{
                    maxWidth: 340,
                    width: "162px",
                    height: "80px",
                    display: "block",
                    margin: "0 auto 10px",
                  }}
                />
                <div className={styles.emptyStateTitle}>You have no new tasks</div>
                <div className={styles.emptyStateDescription}>
                  Any assigned tasks will appear here as soon as they&apos;re available.
                </div>
              </div>
            ) : (
              <Table className={styles.table} aria-label="Task Approvals Table">
                <TableHeader className={styles.tableHeader}>
                  <TableRow>
                    {activeTableColumns.map((column) => {
                      if (column.columnKey === "priority") {
                        const isDesc = prioritySortDir === "desc";
                        return (
                          <TableHeaderCell key={column.columnKey}>
                            <button
                              type="button"
                              className={styles.priorityHeaderBtn}
                              onClick={this.togglePrioritySort}
                              title={isDesc ? "Sort: Low to High" : "Sort: High to Low"}
                              aria-label={isDesc ? "Sort Priority Low to High" : "Sort Priority High to Low"}
                            >
                              <span>Priority</span>
                              <span
                                className={styles.priorityHeaderIcon}
                                aria-hidden="true"
                                dangerouslySetInnerHTML={{ __html: isDesc ? PRIORITY_SORT_DOWN_SVG : PRIORITY_SORT_UP_SVG }}
                              />
                            </button>
                          </TableHeaderCell>
                        );
                      }

                      return <TableHeaderCell key={column.columnKey}>{column.label}</TableHeaderCell>;
                    })}
                  </TableRow>
                </TableHeader>

                <TableBody className={styles.tableBody}>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={TABLE_COLUMN_COUNT}>
                        <TableCellLayout>Loading approvals...</TableCellLayout>
                      </TableCell>
                    </TableRow>
                  ) : errorMessage ? (
                    <TableRow>
                      <TableCell colSpan={TABLE_COLUMN_COUNT}>
                        <TableCellLayout>Error: {errorMessage}</TableCellLayout>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {activeRowsToRender.map(renderTaskRow)}

                      {canLoadMore && (
                        <TableRow>
                          <TableCell colSpan={TABLE_COLUMN_COUNT}>
                            <TableCellLayout>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                <span>
                                  Showing {Math.min(visibleCount, sortedActiveRows.length)} of {sortedActiveRows.length}
                                  {totalForActiveTab !== sortedActiveRows.length ? ` (Total: ${totalForActiveTab})` : ""}
                                </span>

                                <Button appearance="secondary" onClick={this.handleLoadMore}>
                                  Load more
                                </Button>
                              </div>
                            </TableCellLayout>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </TableBody>
              </Table>
            )}

            {errorMessage && <div className={styles.errormessage}>Error : {errorMessage}</div>}
          </div>
        </div>
      </div>
    );
  }
}
