import * as React from 'react';
import styles from './Task.module.scss';
import type { ITaskProps } from './ITaskProps';
// import { escape } from '@microsoft/sp-lodash-subset';
import { SelectTabData, SelectTabEvent, Tab, TabList } from "@fluentui/react-components";
import {
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableHeader,
  TableHeaderCell,
  TableCellLayout,

} from "@fluentui/react-components";
// import TaskRow from './TaskRow';
import sfListingMock from './dummyData';



// type Row = {
//   id: string;
//   workflowNumber: string;
//   taskTitle: string;
//   priority: "" | "High" | "Medium" | "Low";
//   status: "Pending" | "Approved" | "Rejected" | string;
//   originSystem: string;
//   dueDate: string;

//   // --- NEW: carry extra fields through to details ---
//   createdOn?: string;
//   assignedTo?: string;
//   requestorName?: string;
//   requestorDepartment?: string | null;

// };
// export type FetchSalesforceListingFn = (email: string) => Promise<SFListingResponse>;
// export type FetchOracleListingFn = (email: string) => Promise<SFListingResponse>;


// Map API approval -> Row (now including the extra fields)
// const approvalToRow = (a: SFApproval): Row => ({
//   id: a.workitemId,
//   workflowNumber: a.workflowNumber,
//   taskTitle: a.taskTitle || a.taskType || "—",
//   priority: (a.priority as Row["priority"]) || "",
//   status: a.status,
//   originSystem: a.originSystem,
//   dueDate: a.dueDate,

//   // --- NEW: pass-through fields from API ---
//   createdOn: a.createdOn,
//   assignedTo: a.assignedTo,
//   requestorName: a.requestorName,
//   requestorDepartment: a.requestorDepartment ?? null,
// });

// Build TaskDetails payload from Row (now forwarding the extra fields)
// const toDetails = (row: Row): TaskDetailsData => ({
//   workitemId: row.id,
//   workflowNumber: row.workflowNumber,
//   taskTitle: row.taskTitle,
//   taskType: row.taskTitle,
//   priority: row.priority,
//   originSystem: row.originSystem,
//   status: row.status,
//   createdOn: row.createdOn,                  // NEW
//   dueDate: row.dueDate,
//   assignedTo: row.assignedTo,                // NEW
//   requestorName: row.requestorName,          // NEW
//   requestorDepartment: row.requestorDepartment, // NEW
// });

// const columns = ["Workflow No.", "Task Title", "Priority", "Due Date", "Action", "Status"] as const;
// const labels: readonly Option[] = ["Services", "Oracle", "Salesforce"];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

export interface ITaskState {
  selectedTab: any;
}

export default class Task extends React.Component<ITaskProps, ITaskState> {
  constructor(props: ITaskProps) {
    super(props);
    this.state = {
      selectedTab: "all"
    };
  }

  public render(): React.ReactElement<ITaskProps> {
    const {
    } = this.props;

    const columns = [
      { columnKey: "workflowNumber", label: "Workflow No." },
      { columnKey: "taskTitle", label: "Task Title" },
      { columnKey: "priority", label: "Priority" },
      { columnKey: "dueDate", label: "Due Date" },
      { columnKey: "action", label: "Action" },
      { columnKey: "status", label: "Status" },
    ];

    const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
      this.setState({
        selectedTab: data.value
      })

      switch (data.value) {
        case "birthday":
          // setNewsArticles([...globalNews]);
          // setNewsType("Company News");
          return;
        case "anniversary":
          // setNewsArticles([...localNews]);
          // setNewsType("Local News");
          return;
        case "newJoiners":
          // setNewsArticles([...subscribedNews]);
          // setNewsType("My News");
          return;
        default:
        // setNewsArticles([...globalNews]);
      }
    };

    const tableBody = (item: any): JSX.Element => {
      return (
        <TableRow >
          <TableCell>
            <TableCellLayout>
              {item.workflowNumber}
            </TableCellLayout>
          </TableCell>
          <TableCell>
            <TableCellLayout>
              {item.taskTitle}
            </TableCellLayout>
          </TableCell>
          <TableCell>
            <TableCellLayout>
              <span className={`${styles.chip} 
              ${item.priority === "High" ? styles.chipHigh :
                  item.priority === "Medium" ? styles.chipMedium
                    : styles.chipLow}`}>
                {item.priority}
              </span>
            </TableCellLayout>
          </TableCell>
          <TableCell>{fmtDate(item.dueDate)}</TableCell>
          <TableCell>
            <TableCellLayout>
              {item.action}
            </TableCellLayout>
          </TableCell>
          <TableCell>
            <TableCellLayout>
              <div className={styles.value}>
                <span
                  className={`${styles.statusPill} ${item.status === "Approved"
                    ? styles.stApproved
                    : item.status === "Rejected"
                      ? styles.stRejected
                      : styles.stPending
                    }`}
                >
                  <span className={styles.statusText}>{item.status}</span>
                </span>
              </div>

            </TableCellLayout>
          </TableCell>
        </TableRow>
      )
    }


    return (
      <>
        <div className={styles.main} >
          <div className={`${styles.taskHeader} ${styles.taskHeaderAbsolute}`}>
            <span className={styles.taskText}>Task</span>
            <span className={styles.approvalsText}> Approvals</span>
          </div>

          <TabList selectedValue={this.state.selectedTab} onTabSelect={onTabSelect} selectTabOnFocus={true} size="large">
            <Tab id="All" value="all">
              All
            </Tab>
            <Tab id="Oracle" value="oracle">
              Oracle
            </Tab>
            <Tab id="Salesforce" value="salesforce">
              Salesforce
            </Tab>
          </TabList>

          <Table arial-label="Default table" style={{ minWidth: "510px" }}>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHeaderCell key={column.columnKey}>
                    {column.label}
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(this.state.selectedTab === "oracle" || this.state.selectedTab === "all") && sfListingMock.oracle.map((orcaItem: any) => (
                tableBody(orcaItem)
              ))}
              {(this.state.selectedTab === "salesforce" || this.state.selectedTab === "all") && sfListingMock.salesForce.map((salesItem: any) => (
                tableBody(salesItem)
              ))}
            </TableBody>
          </Table>
        </div>
      </>
    );
  }
}
