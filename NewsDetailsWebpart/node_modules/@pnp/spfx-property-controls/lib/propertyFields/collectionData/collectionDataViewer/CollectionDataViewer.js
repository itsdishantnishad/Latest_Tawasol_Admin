import * as React from 'react';
import styles from '../PropertyFieldCollectionDataHost.module.scss';
import { CollectionDataItem } from '../collectionDataItem';
import { PrimaryButton, DefaultButton, Icon } from '@fluentui/react';
import * as strings from 'PropertyControlStrings';
import { cloneDeep, sortBy } from '@microsoft/sp-lodash-subset';
export class CollectionDataViewer extends React.Component {
    constructor(props) {
        super(props);
        this.SORT_IDX = 'sortIdx';
        /**
         * Add a new item to the collection
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.addItem = (item) => {
            this.setState((prevState) => {
                let crntItems = [...prevState.crntItems, item];
                crntItems = this.updateSortProperty(crntItems);
                return {
                    crntItems,
                    inCreationItem: null,
                    inCreationItemValid: null,
                };
            });
        };
        /**
         * Remove an item from the collection
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.updateItem = (idx, item) => {
            this.setState((prevState) => {
                const { crntItems } = prevState;
                // Update the item in the array
                crntItems[idx] = item;
                return { crntItems };
            });
        };
        /**
         * Remove an item from the collection
         */
        this.deleteItem = (idx) => {
            this.setState((prevState) => {
                let { crntItems } = prevState;
                const { validation } = prevState;
                crntItems.splice(idx, 1);
                delete validation[idx];
                // Update the sort propety
                crntItems = this.updateSortProperty(crntItems);
                return {
                    crntItems: sortBy(crntItems, this.SORT_IDX),
                    validation: validation,
                };
            });
        };
        /**
         * Validate every item
         */
        this.validateItem = (idx, isValid) => {
            this.setState((prevState) => {
                const { validation } = prevState;
                validation[idx] = isValid;
                return {
                    validation: prevState.validation,
                };
            });
        };
        /**
         * Currently in creation
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.addInCreation = (item, isValid) => {
            this.setState({
                inCreationItem: item,
                inCreationItemValid: isValid,
            });
        };
        /**
         * Add the item and save the form
         */
        this.addAndSave = () => {
            // Check if the item is not empty
            if (this.state.inCreationItem) {
                let crntItems = [...this.state.crntItems, this.state.inCreationItem];
                crntItems = this.updateSortProperty(crntItems);
                this.props.fOnSave(crntItems);
            }
            else {
                this.onSave();
            }
        };
        /**
         * Update the sort order
         */
        this.updateSortOrder = (oldIdx, newIdx) => {
            this.setState((prevState) => {
                const { crntItems } = prevState;
                let newOrderedItems = cloneDeep(crntItems);
                newOrderedItems = this.moveItemTo(newOrderedItems, oldIdx, newIdx - 1);
                newOrderedItems = this.updateSortProperty(newOrderedItems);
                newOrderedItems = sortBy(newOrderedItems, this.SORT_IDX);
                return {
                    crntItems: newOrderedItems,
                };
            });
        };
        /**
         * Save the collection data
         */
        this.onSave = () => {
            this.props.fOnSave(this.state.crntItems);
        };
        /**
         * Cancel
         */
        this.onCancel = () => {
            this.props.fOnClose();
        };
        this.state = {
            crntItems: [],
            inCreationItem: null,
            inCreationItemValid: null,
            validation: {},
        };
    }
    /**
     * componentDidMount lifecycle hook
     */
    componentDidMount() {
        let crntItems = this.props.value
            ? sortBy(cloneDeep(this.props.value), this.SORT_IDX)
            : [];
        crntItems = crntItems.map((item, idx) => {
            if (!item[this.SORT_IDX]) {
                item[this.SORT_IDX] = idx + 1;
            }
            return item;
        });
        // Update the sort propety
        crntItems = this.updateSortProperty(crntItems);
        this.setState({
            crntItems: sortBy(crntItems, this.SORT_IDX),
        });
    }
    /**
     * Check if all items are valid
     */
    allItemsValid() {
        const { validation } = this.state;
        if (validation) {
            const keys = Object.keys(validation);
            for (const key of keys) {
                if (!validation[key]) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * Move an item in the array
     *
     * @param crntItems
     * @param oldIdx
     * @param newIdx
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    moveItemTo(crntItems, oldIdx, newIdx) {
        if (newIdx > -1 && newIdx < crntItems.length) {
            const removedElement = crntItems.splice(oldIdx, 1)[0];
            if (removedElement) {
                crntItems.splice(newIdx, 0, removedElement);
            }
        }
        return crntItems;
    }
    /**
     * Update the sort property
     *
     * @param crntItems
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateSortProperty(crntItems) {
        // Update the sort order
        return crntItems.map((item, itemIdx) => {
            item[this.SORT_IDX] = itemIdx + 1;
            return item;
        });
    }
    /**
     * Default React render
     */
    render() {
        const crntItems = [
            ...this.state.crntItems,
            this.state.inCreationItem,
        ].filter((i) => i);
        const visibleFields = this.props.fields.filter((f) => !f.isVisible || f.isVisible(f, crntItems));
        return (React.createElement("div", null,
            React.createElement("div", { className: `PropertyFieldCollectionData__panel__table ${styles.table} ${this.props.tableClassName || ''}` },
                React.createElement("div", { className: `PropertyFieldCollectionData__panel__table-head ${styles.tableRow} ${styles.tableHead}` },
                    this.props.enableSorting && (React.createElement("span", { className: `PropertyFieldCollectionData__panel__table-cell ${styles.tableCell}` })),
                    visibleFields.map((f) => (React.createElement("span", { key: `dataviewer-${f.id}`, className: `PropertyFieldCollectionData__panel__table-cell ${styles.tableCell}` },
                        f.title,
                        ' ',
                        f.required && (React.createElement(Icon, { className: styles.required, iconName: 'Asterisk' }))))),
                    React.createElement("span", { className: `PropertyFieldCollectionData__panel__table-cell ${styles.tableCell}` }),
                    React.createElement("span", { className: `PropertyFieldCollectionData__panel__table-cell ${styles.tableCell}` })),
                this.state.crntItems &&
                    this.state.crntItems.length > 0 &&
                    this.state.crntItems.map((item, idx, allItems) => (React.createElement(CollectionDataItem, { key: item.uniqueId, fields: visibleFields, index: idx, item: item, totalItems: allItems.length, sortingEnabled: this.props.enableSorting, disableItemDeletion: this.props.disableItemDeletion, fUpdateItem: this.updateItem, fDeleteItem: this.deleteItem, fValidation: this.validateItem, fOnSorting: this.updateSortOrder }))),
                !this.props.disableItemCreation && (React.createElement(CollectionDataItem, { fields: visibleFields, index: null, item: null, sortingEnabled: this.props.enableSorting, totalItems: null, fAddItem: this.addItem, fAddInCreation: this.addInCreation }))),
            (!this.state.crntItems || this.state.crntItems.length === 0) && (React.createElement("p", { className: `PropertyFieldCollectionData__panel__no-collection-data ${styles.noCollectionData}` }, strings.CollectionDataEmptyValue)),
            React.createElement("div", { className: `PropertyFieldCollectionData__panel__actions ${styles.panelActions}` },
                this.state.inCreationItem && this.state.inCreationItemValid && (React.createElement(PrimaryButton, { text: this.props.saveAndAddBtnLabel ||
                        strings.CollectionSaveAndAddButtonLabel, onClick: this.addAndSave, disabled: !this.allItemsValid(), className: 'PropertyFieldCollectionData__panel__action__add' })),
                !(this.state.inCreationItem && this.state.inCreationItemValid) && (React.createElement(PrimaryButton, { text: this.props.saveBtnLabel || strings.SaveButtonLabel, onClick: this.onSave, disabled: !this.allItemsValid(), className: 'PropertyFieldCollectionData__panel__action__save' })),
                React.createElement(DefaultButton, { text: this.props.cancelBtnLabel || strings.CancelButtonLabel, onClick: this.onCancel, className: 'PropertyFieldCollectionData__panel__action__cancel' }))));
    }
}
//# sourceMappingURL=CollectionDataViewer.js.map