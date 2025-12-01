import React, { useState } from "react";
import styles from "./TaskApprovals.module.scss";
import CategoryView, { ICategoryItem } from "../CategoryView/CategoryView";
import TableView, { TableColumn } from "../../../widgets/TableView/TableView";
import Tag from "../../Tag/Tag";
import PrimaryButton from "../../PrimaryButton/PrimaryButton";

interface TaskApprovalData {
    workitemId: string;
    workflowNumber: string;
    taskType: string;
    taskTitle: string;
    taskDescription: string;
    status: "Approved" | "Rejected" | "Pending";
    requestorName: string;
    requestorAvatar: string;
    requestorDepartment: string;
    priority: "High" | "Medium" | "Low";
    originSystem: string;
    dueDate: string;
    createdOn: string;
    assignedTo: string;
    action: string;
}

const TaskApprovals: React.FC = () => {
    const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);

    // Sample category data - replace with actual data from your API/service
    const categories: ICategoryItem[] = [
        {
            id: "tahweel",
            name: "Tahweel",
            icon: "http://localhost:3845/assets/5ef86ae7106ed269747770b78bd3763bbcc0c8a7.png",
            count: 8
        },
        {
            id: "salesforce",
            name: "Salesforce",
            icon: "http://localhost:3845/assets/a04068baa3bf4c37b858d84c23f7a58a5d8bfd4a.png",
            count: 22
        },
        {
            id: "servicenow",
            name: "ServiceNow",
            icon: "http://localhost:3845/assets/cbebbd7b6244cd3ad75080c7963562bed3a21fd6.png",
            count: 12
        }
    ];

    // Sample table data - replace with actual data from your API/service
    const tableBodyData: TaskApprovalData[] = [
        {
            "workitemId": "04iUB000002JFj1YAG",
            "workflowNumber": "E-35961",
            "taskType": "Salary Certificate",
            "taskTitle": "oracle Salary Certificate",
            "taskDescription": "",
            "status": "Pending",
            "requestorName": "Ayaan Ali",
            "requestorAvatar": "https://picsum.photos/id/1/100",
            "requestorDepartment": "HR",
            "priority": "High",
            "originSystem": "Oracle",
            "dueDate": "2025-11-03T08:00:00.000Z",
            "createdOn": "2025-10-10T09:30:00.000Z",
            "assignedTo": "005TX0000044AAA",
            "action": "Pending"
        },
        {
            "workitemId": "04iUB000002JFj2YAG",
            "workflowNumber": "E-35962",
            "taskType": "Leave Approval",
            "taskTitle": "oracle Annual Leave Approval",
            "taskDescription": "",
            "status": "Approved",
            "requestorName": "Mira Kapoor",
            "requestorAvatar": "https://picsum.photos/id/1/100",
            "requestorDepartment": "Finance",
            "priority": "Medium",
            "originSystem": "Oracle",
            "dueDate": "2025-11-07T08:00:00.000Z",
            "createdOn": "2025-10-11T10:15:00.000Z",
            "assignedTo": "005TX0000044AAB",
            "action": "Approved"
        },
        {
            "workitemId": "04iUB000002JFj3YAG",
            "workflowNumber": "E-35963",
            "taskType": "Account Name Change",
            "taskTitle": "oracle Account Name Change",
            "taskDescription": "",
            "status": "Rejected",
            "requestorName": "Hassan Raza",
            "requestorAvatar": "https://picsum.photos/id/1/100",
            "requestorDepartment": "Sales",
            "priority": "Low",
            "originSystem": "Oracle",
            "dueDate": "2025-11-12T08:00:00.000Z",
            "createdOn": "2025-10-12T08:05:00.000Z",
            "assignedTo": "005TX0000044AAC",
            "action": "Rejected"
        },
        {
            "workitemId": "04iUB000002JFj4YAG",
            "workflowNumber": "E-35964",
            "taskType": "Vendor Creation",
            "taskTitle": "oracle New Vendor Onboarding",
            "taskDescription": "",
            "status": "Pending",
            "requestorName": "Noor Fatima",
            "requestorAvatar": "https://picsum.photos/id/1/100",
            "requestorDepartment": "Procurement",
            "priority": "High",
            "originSystem": "Oracle",
            "dueDate": "2025-11-18T08:00:00.000Z",
            "createdOn": "2025-10-13T11:45:00.000Z",
            "assignedTo": "005TX0000044AAD",
            "action": "Pending"
        }
    ];

    const handleCategoryClick = (category: ICategoryItem, index: number): void => {
        setActiveCategoryIndex(index);
        // Add your logic here to handle category selection
        console.log("Selected category:", category);
    };

    const handleRowClick = (rowData: TaskApprovalData, rowIndex: number): void => {
        console.log("Row clicked:", rowData);
        // Add your logic here to handle row click (e.g., navigate to details page)
    };

    const formatIsoDateToDisplay = (isoString: string): string =>
        new Date(isoString).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

    const handleViewAll = () => {
        // View all control
    }

    const priorityTagBgColor = {
        'High': '#fdede8',
        'Medium': '#feefd4',
        'Low': '#e2edfe',
    };

    const priorityTagTextColor = {
        'High': '#ff3a00',
        'Medium': '#dda338',
        'Low': '#2b77d6',
    };

    // Define table columns with custom renderers
    const tableColumns: TableColumn<TaskApprovalData>[] = [
        {
            columnKey: "workflowNumber",
            label: "Workflow No.",
        },
        {
            columnKey: "taskTitle",
            label: "Task Title",
        },
        {
            columnKey: "priority",
            label: "Priority",
            renderCell: (rowData) => (
                <Tag
                    label={rowData.priority}
                    backgroundColor={priorityTagBgColor[rowData.priority]}
                    textColor={priorityTagTextColor[rowData.priority]}
                />
            ),
        },
        {
            columnKey: "dueDate",
            label: "Due Date",
            renderCell: (rowData) => formatIsoDateToDisplay(rowData.dueDate),
        },
        {
            columnKey: "requestedBy",
            label: "Requested By",
            renderCell: (rowData) => (
                <div className={styles.requestorWrapper}>
                    <img
                        src={rowData.requestorAvatar}
                        alt={rowData.requestorName}
                        width={32}
                        height={32}
                    />
                    <span className={styles.requestorName}>{rowData.requestorName}</span>
                </div>
            ),
        },
        {
            columnKey: "action",
            label: "Action",
            renderCell: (rowData) => (
                <div className={styles.actionCell}>
                    <span className={styles.actionItem}>
                        <span
                            className={styles.actionIcon}
                            dangerouslySetInnerHTML={{ __html: "❌" }}
                        />
                        Reject
                    </span>
                    <span className={styles.actionItem}>
                        <span
                            className={styles.actionIcon}
                            dangerouslySetInnerHTML={{ __html: "✅" }}
                        />
                        Approve
                    </span>
                </div>
            ),
        },
    ];

    return (
        <div className={styles.taskApprovalsContainer}>
            <CategoryView
                categories={categories}
                activeIndex={activeCategoryIndex}
                onCategoryClick={handleCategoryClick}
            />
            <div className={styles.tableWrapper}>
                <TableView
                    data={tableBodyData}
                    columns={tableColumns}
                    getRowKey={(rowData) => rowData.workitemId}
                    onRowClick={handleRowClick}
                    ariaLabel="Task Approvals Table"
                />
            </div>
            <div className={styles.ctaWrapper}>
                <PrimaryButton label="View All" onClick={handleViewAll} />
            </div>
        </div>
    );
};

export default TaskApprovals;