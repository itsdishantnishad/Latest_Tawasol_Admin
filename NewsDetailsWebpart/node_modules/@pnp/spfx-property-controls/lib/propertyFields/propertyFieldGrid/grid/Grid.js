/* eslint-disable no-prototype-builtins */
/* eslint-disable no-unused-expressions */
import * as React from 'react';
import strings from 'PropertyControlStrings';
import { FontIcon } from '@fluentui/react';
import { Body1Strong, createTableColumn, DataGrid, DataGridBody, DataGridCell, DataGridHeader, DataGridHeaderCell, DataGridRow, TableCellLayout, } from '@fluentui/react-components';
const columnSizingOptions = {
    title: {
        minWidth: 40,
        defaultWidth: 80,
    },
    description: {
        defaultWidth: 80,
        minWidth: 60,
        idealWidth: 80,
    },
};
export const Grid = (props) => {
    const { items, onSelected, defaultSelectedItems, multiSelect, column1Label, column2Label } = props;
    const selectionMode = React.useMemo(() => multiSelect ? "multiselect" : "single" !== null && "single" !== void 0 ? "single" : "single", [multiSelect]);
    const [selectedRows, setSelectedRows] = React.useState(() => {
        if (defaultSelectedItems) {
            const set = new Set();
            for (const item of defaultSelectedItems) {
                const index = items.findIndex((i) => i.key === item.key);
                if (index > -1) {
                    set.add(index);
                }
            }
            return set;
        }
        return new Set([]);
    });
    const columns = [
        createTableColumn({
            columnId: "title",
            compare: (a, b) => {
                if (typeof a.title === "string" && typeof b.title === "string") {
                    return a.title.localeCompare(b.title);
                }
                return 0;
            },
            renderHeaderCell: () => {
                return React.createElement(Body1Strong, null, column1Label !== null && column1Label !== void 0 ? column1Label : strings.gridControlColumn1Label);
            },
            renderCell: (item) => {
                return (React.createElement(TableCellLayout, { media: React.isValidElement(item.icon) ? item.icon : React.createElement(FontIcon, { iconName: item.icon }) }, item.title));
            },
        }),
        createTableColumn({
            columnId: "description",
            compare: (a, b) => {
                if (typeof a.description === "string" && typeof b.description === "string") {
                    return a.description.localeCompare(b.description);
                }
                return 0;
            },
            renderHeaderCell: () => {
                return React.createElement(Body1Strong, null, column2Label !== null && column2Label !== void 0 ? column2Label : strings.gridControlColumn2Label,
                    " ");
            },
            renderCell: (item) => {
                return (React.createElement(TableCellLayout, null, React.isValidElement(item.description) ? item.description : item.description));
            },
        }),
    ];
    const onSelectionChange = React.useCallback((e, data) => {
        const entries = data.selectedItems.entries();
        // select all entries in the map
        const itemsSelected = [];
        const toArray = Array.from(entries);
        for (const item of toArray) {
            const rowId = item[0];
            const itemSelected = items[rowId];
            // code to be executed for each itemSelected
            itemsSelected.push(itemSelected);
        }
        onSelected(itemsSelected);
        setSelectedRows(data.selectedItems);
    }, [onSelected, items]);
    const [sortState, setSortState] = React.useState({
        sortColumn: "title",
        sortDirection: "ascending",
    });
    const onSortChange = (e, nextSortState) => {
        setSortState(nextSortState);
    };
    return (React.createElement(DataGrid, { items: items, columns: columns, selectionMode: selectionMode, selectedItems: selectedRows, onSelectionChange: onSelectionChange, sortable: true, sortState: sortState, onSortChange: onSortChange, resizableColumns: true, columnSizingOptions: columnSizingOptions },
        React.createElement(DataGridHeader, null,
            React.createElement(DataGridRow, null, ({ renderHeaderCell }) => React.createElement(DataGridHeaderCell, null, renderHeaderCell()))),
        React.createElement(DataGridBody, null, ({ item, rowId }) => (React.createElement(DataGridRow, { key: rowId, selectionCell: { radioIndicator: { "aria-label": "Select row" } } }, ({ renderCell }) => React.createElement(DataGridCell, null, renderCell(item)))))));
};
//# sourceMappingURL=Grid.js.map