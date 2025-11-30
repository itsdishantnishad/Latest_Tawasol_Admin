
import React from "react";
import styles from "./TableView.module.scss";

import {
    TableBody,
    TableCell,
    TableRow,
    Table,
    TableHeader,
    TableHeaderCell,
    TableCellLayout,
} from "@fluentui/react-components";

import Tag from "../../../../Tag/Tag";

const formatIsoDateToDisplay = (isoString: string) =>
    new Date(isoString).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

const tableBodyData = [
    {
        "workitemId": "04iUB000002JFj1YAG",
        "workflowNumber": "E-35961",
        "taskType": "Salary Certificate",
        "taskTitle": "oracle Salary Certificate",
        "taskDescription": "",
        "status": "Pending",
        "requestorName": "Ayaan Ali",
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
        "requestorDepartment": "Procurement",
        "priority": "High",
        "originSystem": "Oracle",
        "dueDate": "2025-11-18T08:00:00.000Z",
        "createdOn": "2025-10-13T11:45:00.000Z",
        "assignedTo": "005TX0000044AAD",
        "action": "Pending"
    }
]

const TableView = () => {

    const tableColumns = [
        { columnKey: "workflowNumber", label: "Workflow No." },
        { columnKey: "taskTitle", label: "Task Title" },
        { columnKey: "priority", label: "Priority" },
        { columnKey: "dueDate", label: "Due Date" },
        { columnKey: "action", label: "Action" },
        { columnKey: "status", label: "Status" },
    ];

    const statusTagColor = {
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

    const renderTaskRow = (taskItem: any): JSX.Element => (
        <TableRow key={taskItem.workitemId} onClick={() => { console.log("clicked") }}>
            <TableCell>
                <TableCellLayout>{taskItem.workflowNumber}</TableCellLayout>
            </TableCell>
            <TableCell>
                <TableCellLayout>{taskItem.taskTitle}</TableCellLayout>
            </TableCell>
            <TableCell>
                <TableCellLayout>
                    <Tag
                        label={taskItem.priority}
                        backgroundColor={priorityTagBgColor[taskItem.priority as keyof typeof priorityTagBgColor]}
                        textColor={priorityTagTextColor[taskItem.priority as keyof typeof priorityTagTextColor]}
                    />
                </TableCellLayout>
            </TableCell>
            <TableCell>{formatIsoDateToDisplay(taskItem.dueDate)}</TableCell>
            <TableCell>
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
            </TableCell>

            <TableCell>
                <TableCellLayout>
                    <Tag
                        label={taskItem.status}
                        backgroundColor={statusTagColor[taskItem.status as keyof typeof statusTagColor]}
                    />
                </TableCellLayout>
            </TableCell>
        </TableRow>
    );


    return (
        <Table className={styles.table} aria-label="Task Approvals Table">
            <TableHeader className={styles.tableHeader}>
                <TableRow>
                    {tableColumns.map((column) => (
                        <TableHeaderCell key={column.columnKey}>{column.label}</TableHeaderCell>
                    ))}
                </TableRow>
            </TableHeader>

            <TableBody className={styles.tableBody}>
                {tableBodyData.map((task) => renderTaskRow(task))}
            </TableBody>
        </Table>
    )
}

export default TableView;