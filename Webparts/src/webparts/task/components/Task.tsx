// import * as React from 'react';
// import styles from './Task.module.scss';
// import type { ITaskProps } from './ITaskProps';
// import {
//   TableBody,
//   TableCell,
//   TableRow,
//   Table,
//   TableHeader,
//   TableHeaderCell,
//   TableCellLayout,
// } from "@fluentui/react-components";
// import Tag from '../../Components/Tag/Tag';
// import NavSegment from './taskNavBtnComp';
// import {
//   SfApprovalService,
//   SFApproval,
// } from '../../services/Integration/SalesForce';


// import {
//   ServiceNowApprovalService,
//   ServiceNowTaskListItem
// } from '../../services/Task/ServiceNowApprovalService';

// export interface ITaskState {
//   selectedTabValue: string;
//   isLoading: boolean;
//   errorMessage?: string;
//   oracleItems: ServiceNowTaskListItem[];
//   salesforceItems: SFApproval[];
//   rawResponse?: any;
// }

// const formatIsoDateToDisplay = (isoString: string) => {
//   if (!isoString) return '—';
//   const date = new Date(isoString);
//   return date.toLocaleDateString('en-GB', {
//     day: "2-digit",
//     month: "short",
//     year: "numeric"
//   });
// };

// export default class Task extends React.Component<ITaskProps, ITaskState> {
//   private salesforceService: SfApprovalService;

//   constructor(props: ITaskProps) {
//     super(props);
//     this.state = {
//       selectedTabValue: "All",
//       isLoading: false,
//       salesforceItems: [],
//       rawResponse: undefined,
//       errorMessage: undefined,
//       oracleItems: [],
//     };

//     this.salesforceService = new SfApprovalService({
//       httpClient: this.props.httpClient,
//     });
//   }

//   // private readonly salesforceBaseUrl: string =
//   //   "https://infaservicesuat.dubaiholding.com";


//   private readonly serviceNowService: ServiceNowApprovalService;

//   // constructor(props: ITaskProps) {
//   //   super(props);
//   //   this.state = {
//   //     selectedTabValue: "All",
//   //     isLoading: true,
//   //     oracleItems: [],
//   //     salesforceItems: [],
//   //   };

//   //   this.salesforceService = new SfApprovalService({
//   //     httpClient: this.props.httpClient,
//   //     salesforceBaseUrl: this.salesforceBaseUrl,
//   //   });

//   //   this.serviceNowService = new ServiceNowApprovalService({
//   //     httpClient: this.props.httpClient,
//   //     baseUrl: this.salesforceBaseUrl,
//   //   });
//   // }

//   public async componentDidMount(): Promise<void> {
//     try {
//       const email = this.props.userEmail || "";
//       const res = await this.salesforceService.fetchApprovalsByEmail(email);

//       this.setState({
//         isLoading: false,
//         salesforceItems: res.approvals || [],
//         rawResponse: res,
//       });
//     } catch (e: any) {
//       console.error("Salesforce API error:", e);
//       this.setState({
//         isLoading: false,
//         salesforceItems: [],
//         rawResponse: undefined,
//         errorMessage: e?.message || "Failed to load Salesforce approvals",
//       });
//     }

//     // try {
//     //   const currentUserEmail = this.props.userEmail || "aisha.amiri@dhre.ae";

//     //   const [sfResponse, oracleItems] = await Promise.all([
//     //     this.salesforceService.fetchApprovalsByEmail(currentUserEmail),
//     // //     this.serviceNowService.fetchApprovalsByEmail(currentUserEmail)
//     //   ]);

//     //   this.setState({
//     //     oracleItems: oracleItems,
//     //     salesforceItems: sfResponse.approvals,
//     //     isLoading: false,
//     //   });
//     // } catch (error: any) {
//     //   console.error('Error loading approvals:', error);
//     //   this.setState({
//     //     oracleItems: [],
//     //     salesforceItems: [],
//     //     isLoading: false,
//     //     errorMessage: error.message,
//     //   });
//     // }
//   }

//   private handleTabChange = (value: string): void => {
//     this.setState({ selectedTabValue: value });
//   };

//   public render(): React.ReactElement<ITaskProps> {
//     const {
//       selectedTabValue,
//       isLoading,
//       oracleItems,
//       salesforceItems
//     } = this.state;

//     const tableColumns = [
//       { columnKey: "workflowNumber", label: "Workflow No." },
//       { columnKey: "taskTitle", label: "Task Title" },
//       { columnKey: "priority", label: "Priority" },
//       { columnKey: "dueDate", label: "Due Date" },
//       { columnKey: "requestedBy", label: "Requested By" },
//       { columnKey: "action", label: "Action" },
//     ];

//     const priorityTagBgColor: Record<string, string> = {
//       High: '#fdede8',
//       Medium: '#feefd4',
//       Low: '#e2edfe',
//     };

//     const priorityTagTextColor: Record<string, string> = {
//       High: '#ff3a00',
//       Medium: '#dda338',
//       Low: '#2b77d6',
//     };

//     const renderTaskRow = (taskItem: ServiceNowTaskListItem | SFApproval): JSX.Element => {
//       return (
//         <TableRow key={taskItem.workitemId || taskItem.workflowNumber}>
//           <TableCell>
//             <TableCellLayout>{taskItem.workflowNumber}</TableCellLayout>
//           </TableCell>
//           <TableCell>
//             <TableCellLayout>{taskItem.taskTitle}</TableCellLayout>
//           </TableCell>
//           <TableCell>
//             <TableCellLayout>
//               <Tag
//                 label={taskItem.priority || '—'}
//                 backgroundColor={priorityTagBgColor[taskItem.priority as keyof typeof priorityTagBgColor]}
//                 textColor={priorityTagTextColor[taskItem.priority as keyof typeof priorityTagTextColor]}
//               />
//             </TableCellLayout>
//           </TableCell>
//           <TableCell>
//             {formatIsoDateToDisplay(taskItem.dueDate)}
//           </TableCell>
//           <TableCell>
//             <TableCellLayout>{taskItem.requestorName || '—'}</TableCellLayout>
//           </TableCell>
//           <TableCell>
//             <a
//               href={taskItem.redirectURL || "#"}
//               target="_blank"
//               className={styles.viewDetailsLink}
//             >
//               View Details
//             </a>
//           </TableCell>
//         </TableRow>
//       );
//     };

//     const rowsToRender: (ServiceNowTaskListItem | SFApproval)[] = [
//       ...(selectedTabValue === "Oracle" || selectedTabValue === "All" ? oracleItems : []),
//       ...(selectedTabValue === "Salesforce" || selectedTabValue === "All" ? salesforceItems : []),
//     ];

//     return (
//       <div className={styles.main}>
//         <div className={styles.pageContainer}>
//           <div className={`${styles.taskHeader} ${styles.taskHeaderAbsolute}`}>
//             <span className={styles.taskText}>Task</span>
//             <span className={styles.approvalsText}> Approvals</span>
//           </div>

//           <NavSegment
//             absolute={false}
//             defaultValue={selectedTabValue as any}
//             onChange={this.handleTabChange}
//             labels={["All", "Oracle", "Salesforce"]}
//           />

//           <div className={styles.tableWrapper}>
//             <Table className={styles.table} aria-label="Task Approvals Table">
//               <TableHeader className={styles.tableHeader}>
//                 <TableRow>
//                   {tableColumns.map((column) => (
//                     <TableHeaderCell key={column.columnKey}>
//                       {column.label}
//                     </TableHeaderCell>
//                   ))}
//                 </TableRow>
//               </TableHeader>

//               <TableBody className={styles.tableBody}>
//                 {isLoading ? (
//                   <TableRow>
//                     <TableCell colSpan={6}>
//                       <TableCellLayout>Loading approvals...</TableCellLayout>
//                     </TableCell>
//                   </TableRow>
//                 ) : rowsToRender.length > 0 ? (
//                   rowsToRender.map(task => renderTaskRow(task))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={6}>
//                       <TableCellLayout>No approvals found</TableCellLayout>
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </div>
//       </div>
//     );
//   }
// }










































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
import { ServiceNowApprovalService, ServiceNowTaskListItem } from "../../services/Task/ServiceNowApprovalService";

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

const formatIsoDateToDisplay = (isoString: string) => {
  if (!isoString) return "—";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default class Task extends React.Component<ITaskProps, ITaskState> {
  private readonly salesforceService: SfApprovalService;
  private readonly serviceNowService: ServiceNowApprovalService;

  private _loadSeq = 0;

  constructor(props: ITaskProps) {
    super(props);

    this.state = {
      // since only Salesforce is integrated right now, keep it default
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
  }

  public async componentDidMount(): Promise<void> {
    await this.loadTabData(this.state.selectedTabValue);
  }

  private getUserEmailOrThrow(): string {
    const email = (this.props.userEmail || "").trim();
    if (!email) throw new Error("User email is required.");
    return email;
  }

  private toRowFromSF(item: SFApproval): TaskRowItem {
    return {
      workflowNumber: item.workflowNumber || "—",
      taskTitle: item.taskTitle || "—",
      priority: item.priority || "—",
      dueDate: item.dueDate || "",
      requestorName: item.requestorName || "—",
      workitemId: item.workitemId || item.workflowNumber || "",
      redirectURL: item.redirectURL,
      originSystem: item.originSystem || "Salesforce",
    };
  }

  private toRowFromServiceNow(item: ServiceNowTaskListItem): TaskRowItem {
    return {
      workflowNumber: item.workflowNumber || "—",
      taskTitle: item.taskTitle || "—",
      priority: item.priority || "—",
      dueDate: item.dueDate || "",
      requestorName: item.requestorName || "—",
      workitemId: item.workitemId || item.workflowNumber || "",
      redirectURL: item.redirectURL,
      originSystem: item.originSystem || "ServiceNow",
    };
  }

  private async loadTabData(tab: SystemFilterOption): Promise<void> {
    // don’t call again if already loaded
    if (this.state.loaded[tab]) return;

    const seq = ++this._loadSeq;

    this.setState({ isLoading: true, errorMessage: undefined });

    try {
      const userEmail = this.getUserEmailOrThrow();

      let rows: TaskRowItem[] = [];

      if (tab === "Salesforce") {
        const res = await this.salesforceService.fetchApprovalsByEmail(userEmail);
        rows = (res?.approvals || []).map((x) => this.toRowFromSF(x));
      } else if (tab === "ServiceNow") {
        // integrate when ready; for now it will only be called when user clicks this tab
        const res = await this.serviceNowService.fetchApprovalsByEmail(userEmail);
        rows = (res || []).map((x) => this.toRowFromServiceNow(x));
      } else {
        // Tahweel (Oracle) pending – only called when user clicks Tahweel
        rows = [];
      }

      // prevent out-of-order setState if user clicks tabs fast
      if (seq !== this._loadSeq) return;

      this.setState((prev) => ({
        isLoading: false,
        data: { ...prev.data, [tab]: rows },
        loaded: { ...prev.loaded, [tab]: true },
      }));
    } catch (e: any) {
      if (seq !== this._loadSeq) return;

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

    const rowsToRender: TaskRowItem[] = data[selectedTabValue];

    const tabs = [
      { key: "Tahweel" as const, label: "Tahweel", count: data.Tahweel.length, iconSvg: TahweelSVG },
      { key: "Salesforce" as const, label: "Salesforce", count: data.Salesforce.length, iconSvg: SalesforceSVG },
      { key: "ServiceNow" as const, label: "ServiceNow", count: data.ServiceNow.length, iconSvg: ServiceNowSVG },
    ];

    const tableColumns = [
      { columnKey: "workflowNumber", label: "Workflow No." },
      { columnKey: "taskTitle", label: "Task Title" },
      { columnKey: "priority", label: "Priority" },
      { columnKey: "dueDate", label: "Due Date" },
      { columnKey: "requestedBy", label: "Requested By" },
      { columnKey: "action", label: "Action" },
    ];

    const priorityTagBgColor: Record<string, string> = {
      High: "#fdede8",
      Medium: "#feefd4",
      Low: "#e2edfe",
    };

    const priorityTagTextColor: Record<string, string> = {
      High: "#ff3a00",
      Medium: "#dda338",
      Low: "#2b77d6",
    };

    const renderTaskRow = (task: TaskRowItem): JSX.Element => {
      const p = task.priority || "—";
      return (
        <TableRow key={(task.workitemId || task.workflowNumber) + ""}>
          <TableCell>
            <TableCellLayout>{task.workflowNumber || "—"}</TableCellLayout>
          </TableCell>

          <TableCell>
            <TableCellLayout>{task.taskTitle || "—"}</TableCellLayout>
          </TableCell>

          <TableCell>
            <TableCellLayout>
              <Tag
                label={p}
                backgroundColor={priorityTagBgColor[p] || "#f3f3f3"}
                textColor={priorityTagTextColor[p] || "#333"}
              />
            </TableCellLayout>
          </TableCell>

          <TableCell>{formatIsoDateToDisplay(task.dueDate)}</TableCell>

          <TableCell>
            <TableCellLayout>{task.requestorName || "—"}</TableCellLayout>
          </TableCell>

          <TableCell>
            {task.redirectURL ? (
              <a href={task.redirectURL} target="_blank" rel="noreferrer" className={styles.viewDetailsLink}>
                View Details
              </a>
            ) : (
              "—"
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

          <NavSegment value={selectedTabValue} onChange={this.handleTabChange} tabs={tabs} />

          <div className={styles.tableWrapper}>
            <Table className={styles.table} aria-label="Task Approvals Table">
              <TableHeader className={styles.tableHeader}>
                <TableRow>
                  {tableColumns.map((column) => (
                    <TableHeaderCell key={column.columnKey}>{column.label}</TableHeaderCell>
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
                  rowsToRender.map(renderTaskRow)
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>
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
