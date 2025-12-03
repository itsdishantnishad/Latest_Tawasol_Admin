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

export interface TableColumn<T = object> {
    columnKey: string;
    label: string;
    renderCell?: (rowData: T, rowIndex: number) => React.ReactNode;
    renderHeader?: () => React.ReactNode;
}

export interface TableViewProps<T = object> {
    data: T[];
    columns: TableColumn<T>[];
    getRowKey: (rowData: T, rowIndex: number) => string | number;
    onRowClick?: (rowData: T, rowIndex: number) => void;
    ariaLabel?: string;
    className?: string;
}

const TableView = <T extends object = object>({
    data,
    columns,
    getRowKey,
    onRowClick,
    ariaLabel = "Data Table",
    className,
}: TableViewProps<T>): JSX.Element => {
    const handleRowClick = (rowData: T, rowIndex: number): void => {
        if (onRowClick) {
            onRowClick(rowData, rowIndex);
        }
    };

    const renderCell = (column: TableColumn<T>, rowData: T, rowIndex: number): React.ReactNode => {
        if (column.renderCell) {
            return column.renderCell(rowData, rowIndex);
        }

        // Default rendering: access the property by columnKey
        const cellValue = (rowData as Record<string, unknown>)[column.columnKey];
        return <TableCellLayout>{String(cellValue ?? "")}</TableCellLayout>;
    };

    return (
        <Table className={`${styles.table} ${className || ""}`} aria-label={ariaLabel}>
            <TableHeader className={styles.tableHeader}>
                <TableRow>
                    {columns.map((column) => (
                        <TableHeaderCell key={column.columnKey}>
                            {column.renderHeader ? column.renderHeader() : column.label}
                        </TableHeaderCell>
                    ))}
                </TableRow>
            </TableHeader>

            <TableBody className={styles.tableBody}>
                {data.map((rowData, rowIndex) => (
                    <TableRow
                        key={getRowKey(rowData, rowIndex)}
                        onClick={() => handleRowClick(rowData, rowIndex)}
                    >
                        {columns.map((column) => (
                            <TableCell key={column.columnKey}>
                                {renderCell(column, rowData, rowIndex)}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default TableView;