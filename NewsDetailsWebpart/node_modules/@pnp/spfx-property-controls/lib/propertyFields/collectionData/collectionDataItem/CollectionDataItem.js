var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as React from 'react';
import styles from '../PropertyFieldCollectionDataHost.module.scss';
import { TextField, Icon, Link, Dropdown, Callout, DirectionalHint, } from '@fluentui/react';
import * as strings from 'PropertyControlStrings';
import { CustomCollectionFieldType, } from '../ICustomCollectionField';
import { CollectionIconField } from '../collectionIconField';
import { clone, findIndex, sortBy } from '@microsoft/sp-lodash-subset';
import { CollectionNumberField } from '../collectionNumberField';
import { CollectionColorField } from '../collectionColorField';
import { Guid } from '@microsoft/sp-core-library';
import { CollectionDropdownField } from '../collectionDropdownField/CollectionDropdownField';
import { CollectionCheckboxField } from '../collectionCheckboxField/CollectionCheckboxField';
export class CollectionDataItem extends React.Component {
    constructor(props) {
        super(props);
        this.validation = {};
        /**
         * Update the item value on the field change
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.onValueChanged = (fieldId, value) => {
            return new Promise((resolve) => this.setState((prevState) => {
                const { crntItem } = prevState;
                // Update the changed field
                crntItem[fieldId] = value;
                // Store this in the current state
                return { crntItem };
            }, () => resolve()));
        };
        /**
         * Add the current row to the collection
         */
        this.addRow = () => __awaiter(this, void 0, void 0, function* () {
            if (this.props.fAddItem) {
                const { crntItem } = this.state;
                // Check if all the fields are correctly provided
                if (this.checkRowIsValidForSave(crntItem)) {
                    this.props.fAddItem(crntItem);
                    // Clear all field values
                    const emptyItem = this.generateEmptyItem();
                    this.setState({
                        crntItem: Object.assign({}, emptyItem),
                    });
                }
            }
        });
        /**
         * Add the current row to the collection
         */
        this.updateItem = () => __awaiter(this, void 0, void 0, function* () {
            const { crntItem } = this.state;
            const isValid = yield this.checkRowIsValidForSave(crntItem);
            if (this.props.fUpdateItem) {
                // Check if all the fields are correctly provided
                if (isValid) {
                    this.props.fUpdateItem(this.props.index, crntItem);
                }
            }
            // Set the validation for the item
            if (this.props.fValidation) {
                this.props.fValidation(this.props.index, isValid);
            }
        });
        /**
         * Delete the item from the collection
         */
        this.deleteRow = () => {
            if (this.props.fDeleteItem) {
                this.props.fDeleteItem(this.props.index);
            }
        };
        /**
         * Allow custom field validation
         *
         * @param field
         * @param value
         */
        this.fieldValidation = (field, value // eslint-disable-line @typescript-eslint/no-explicit-any
        ) => __awaiter(this, void 0, void 0, function* () {
            let validation = '';
            // Do the custom validation check
            if (field.onGetErrorMessage) {
                // Set initial field validation
                this.validation[field.id] = false;
                // Do the validation
                validation = yield field.onGetErrorMessage(value, this.props.index, this.state.crntItem);
            }
            return this.storeFieldValidation(field.id, validation, true);
        });
        /**
         * Custom field validation
         */
        this.onCustomFieldValidation = (fieldId, errorMsg) => __awaiter(this, void 0, void 0, function* () {
            console.log(fieldId, errorMsg);
            if (fieldId) {
                yield this.storeFieldValidation(fieldId, errorMsg, true);
            }
        });
        /**
         * URL field validation
         *
         * @param field
         * @param value
         * @param item
         */
        this.urlFieldValidation = (field, value, // eslint-disable-line @typescript-eslint/no-explicit-any
        item // eslint-disable-line @typescript-eslint/no-explicit-any
        ) => __awaiter(this, void 0, void 0, function* () {
            let isValid = true;
            let validation = '';
            // Check if custom validation is configured
            if (field.onGetErrorMessage) {
                // Using the custom validation
                validation = yield field.onGetErrorMessage(value, this.props.index, item);
                isValid = validation === '';
            }
            else {
                // Check if entered value is a valid URL
                const regEx = /(http|https)?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
                isValid = value === null || value.length === 0 || regEx.test(value);
                validation = isValid ? '' : strings.InvalidUrlError;
            }
            return this.storeFieldValidation(field.id, validation, true);
        });
        /**
         * Toggle the error callout
         */
        this.toggleErrorCallout = () => {
            this.setState((prevState) => ({
                showCallout: !prevState.showCallout,
            }));
        };
        this.hideErrorCallout = () => {
            this.setState({
                showCallout: false,
            });
        };
        // Create an empty item with all properties
        const emptyItem = this.generateEmptyItem();
        this.state = {
            crntItem: clone(this.props.item) || Object.assign({}, emptyItem),
            errorMsgs: [],
            showCallout: false,
            disableAdd: false,
        };
    }
    /**
     * componentDidUpdate lifecycle hook
     * @param prevProps
     * @param prevState
     */
    componentDidUpdate(prevProps) {
        if (this.props.item !== prevProps.item) {
            this.setState({
                crntItem: clone(this.props.item),
            });
        }
    }
    /**
     * Perform all required field checks at once
     */
    doAllFieldChecks() {
        return __awaiter(this, void 0, void 0, function* () {
            const { crntItem } = this.state;
            let disableAdd = null;
            // Check if current item is valid
            if (this.props.fAddInCreation) {
                if (yield this.checkRowIsValidForSave(crntItem)) {
                    disableAdd = false;
                    this.props.fAddInCreation(crntItem, true);
                }
                else {
                    disableAdd = true;
                    this.props.fAddInCreation(crntItem, false);
                }
            }
            this.setState({ disableAdd });
            // Check if item needs to be updated
            if (this.props.fUpdateItem) {
                yield this.updateItem();
            }
        });
    }
    /**
     * Check if all values of the required fields are provided
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkAllRequiredFieldsValid(item) {
        // Get all the required fields
        const requiredFields = this.props.fields.filter((f) => f.required);
        // Check all the required field values
        for (const field of requiredFields) {
            if (typeof item[field.id] === 'undefined' ||
                item[field.id] === null ||
                item[field.id] === '') {
                return false;
            }
        }
        return true;
    }
    /**
     * Check if any of the fields contain a value
     * @param item
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkAnyFieldContainsValue(item) {
        const { fields } = this.props;
        for (const field of fields) {
            if (typeof item[field.id] !== 'undefined' &&
                item[field.id] !== null &&
                item[field.id] !== '') {
                return true;
            }
        }
        return false;
    }
    /**
     * Check onGetCustomErrorMessage
     * @param item
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkAnyFieldCustomErrorMessage(item) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fields, index } = this.props;
            const validations = yield Promise.all(fields
                .filter((f) => f.onGetErrorMessage)
                .map((f) => __awaiter(this, void 0, void 0, function* () {
                const validation = yield f.onGetErrorMessage(item[f.id], index, item);
                return this.storeFieldValidation(f.id, validation);
            })));
            return validations.filter((v) => v && v.length > 0).length === 0;
        });
    }
    /**
     * Check if row is ready for save
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkRowIsValidForSave(item) {
        return __awaiter(this, void 0, void 0, function* () {
            return (this.checkAllRequiredFieldsValid(item) &&
                this.checkAnyFieldContainsValue(item) &&
                (yield this.checkAnyFieldCustomErrorMessage(item)) &&
                this.checkAllFieldsAreValid());
        });
    }
    /**
     * Checks if all fields are valid
     */
    checkAllFieldsAreValid() {
        if (this.validation) {
            const keys = Object.keys(this.validation);
            for (const key of keys) {
                if (!this.validation[key]) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * Updates callout and validation state
     */
    storeFieldValidation(fieldId, validation, doAllFieldChecks = false) {
        return __awaiter(this, void 0, void 0, function* () {
            // Store the field validation
            this.validation[fieldId] = validation === '';
            // Add message for the error callout
            this.errorCalloutHandler(fieldId, validation);
            if (doAllFieldChecks) {
                yield this.doAllFieldChecks();
            }
            return validation;
        });
    }
    /**
     * Error callout message handler
     *
     * @param field
     * @param message
     */
    errorCalloutHandler(fieldId, message) {
        this.setState((prevState) => {
            let { errorMsgs } = prevState;
            const { crntItem } = this.state;
            // Get the current field
            const fieldIdx = findIndex(this.props.fields, (f) => f.id === fieldId);
            if (fieldIdx === -1) {
                return;
            }
            const field = this.props.fields[fieldIdx];
            // Check if there already is a message for the field
            const fieldMsgIdx = findIndex(errorMsgs, (msg) => msg.field === field.title);
            // Add message
            let fieldMsg;
            if (fieldMsgIdx === -1) {
                fieldMsg = {
                    field: field.title,
                    message: message,
                };
            }
            else {
                // Update message
                fieldMsg = errorMsgs[fieldMsgIdx];
                if (fieldMsg) {
                    fieldMsg.message = message;
                }
            }
            // Check if field required message needs to be shown
            if (field.required) {
                if (typeof crntItem[field.id] === 'undefined' ||
                    crntItem[field.id] === null ||
                    crntItem[field.id] === '') {
                    fieldMsg.isRequired = true;
                }
                else {
                    fieldMsg.isRequired = false;
                }
            }
            // If required and message are false, it doesn't need to be added
            if (!fieldMsg.message && !fieldMsg.isRequired) {
                // Remove the item
                if (fieldMsgIdx !== -1) {
                    errorMsgs.splice(fieldMsgIdx, 1);
                }
            }
            else {
                if (fieldMsgIdx === -1) {
                    errorMsgs.push(fieldMsg);
                }
            }
            // Sort based on the index
            errorMsgs = sortBy(errorMsgs, ['field']);
            return {
                errorMsgs,
            };
        });
    }
    /**
     * Render the field
     *
     * @param field
     * @param item
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderField(field, item) {
        const disableFieldOnEdit = (field.disableEdit && !!this.props.fUpdateItem) ||
            (field.disable && field.disable(item));
        switch (field.type) {
            case CustomCollectionFieldType.boolean:
                return (React.createElement(CollectionCheckboxField, { field: field, item: item, disableEdit: disableFieldOnEdit, fOnValueChange: this.onValueChanged, fValidation: this.fieldValidation }));
            case CustomCollectionFieldType.dropdown:
                return (React.createElement(CollectionDropdownField, { field: field, item: item, disableEdit: disableFieldOnEdit, fOnValueChange: this.onValueChanged, fValidation: this.fieldValidation }));
            case CustomCollectionFieldType.number:
                return (React.createElement(CollectionNumberField, { field: field, item: item, disableEdit: disableFieldOnEdit, fOnValueChange: this.onValueChanged, fValidation: this.fieldValidation }));
            case CustomCollectionFieldType.fabricIcon:
                return (React.createElement(CollectionIconField, { renderMode: field.iconFieldRenderMode, field: field, item: item, disableEdit: disableFieldOnEdit, fOnValueChange: this.onValueChanged, fValidation: this.fieldValidation }));
            case CustomCollectionFieldType.color:
                return (React.createElement(CollectionColorField, { field: field, item: item, disableEdit: disableFieldOnEdit, fOnValueChange: this.onValueChanged, fValidation: this.fieldValidation }));
            case CustomCollectionFieldType.url:
                return (React.createElement(TextField, { placeholder: field.placeholder || field.title, value: item[field.id] ? item[field.id] : '', required: field.required, disabled: disableFieldOnEdit, className: styles.collectionDataField, onChange: (e, value) => this.onValueChanged(field.id, value), deferredValidationTime: field.deferredValidationTime || field.deferredValidationTime >= 0
                        ? field.deferredValidationTime
                        : 200, onGetErrorMessage: (value) => __awaiter(this, void 0, void 0, function* () { return this.urlFieldValidation(field, value, item); }), inputClassName: 'PropertyFieldCollectionData__panel__url-field' }));
            case CustomCollectionFieldType.custom:
                if (field.onCustomRender) {
                    return field.onCustomRender(field, item[field.id], (fieldId, value) => {
                        this.onValueChanged(fieldId, value)
                            .then(() => {
                            this.fieldValidation(field, value)
                                .then(() => {
                                /* no-op; */
                            })
                                .catch(() => {
                                /* no-op; */
                            });
                        })
                            .catch(() => {
                            /* no-op; */
                        });
                    }, item, item.uniqueId, this.onCustomFieldValidation);
                }
                return null;
            case CustomCollectionFieldType.string:
            default:
                return (React.createElement(TextField, { placeholder: field.placeholder || field.title, className: styles.collectionDataField, value: item[field.id] ? item[field.id] : '', required: field.required, disabled: disableFieldOnEdit, onChange: (e, value) => this.onValueChanged(field.id, value), deferredValidationTime: field.deferredValidationTime || field.deferredValidationTime >= 0
                        ? field.deferredValidationTime
                        : 200, onGetErrorMessage: (value) => __awaiter(this, void 0, void 0, function* () { return yield this.fieldValidation(field, value); }), inputClassName: 'PropertyFieldCollectionData__panel__string-field' }));
        }
    }
    /**
     * Retrieve all dropdown options
     */
    getSortingOptions() {
        const opts = [];
        const { totalItems } = this.props;
        for (let i = 1; i <= totalItems; i++) {
            opts.push({
                text: i.toString(),
                key: i,
            });
        }
        return opts;
    }
    /**
     * Creates an empty item with a unique id
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    generateEmptyItem() {
        // Create an empty item with all properties
        const emptyItem = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
        emptyItem.uniqueId = Guid.newGuid().toString();
        for (const field of this.props.fields) {
            // Assign default value or null to the emptyItem
            emptyItem[field.id] = field.defaultValue || null;
        }
        return emptyItem;
    }
    /**
     * Default React render
     */
    render() {
        const { crntItem, disableAdd } = this.state;
        const opts = this.getSortingOptions();
        return (React.createElement("div", { className: `PropertyFieldCollectionData__panel__table-row ${styles.tableRow} ${this.props.index === null ? styles.tableFooter : ''}` },
            this.props.sortingEnabled && this.props.totalItems && (React.createElement("span", { className: `PropertyFieldCollectionData__panel__sorting-field ${styles.tableCell}` },
                React.createElement(Dropdown, { options: opts, selectedKey: this.props.index + 1, onChanged: (opt) => this.props.fOnSorting(this.props.index, opt.key) }))),
            this.props.sortingEnabled && this.props.totalItems === null && (React.createElement("span", { className: `${styles.tableCell}` })),
            this.props.fields.map((f) => (React.createElement("span", { key: `dataitem-${f.id}`, className: `${styles.tableCell} ${styles.inputField}` }, this.renderField(f, crntItem)))),
            React.createElement("span", { className: styles.tableCell },
                React.createElement("span", { ref: (ref) => {
                        this.calloutCellRef = ref;
                    } },
                    React.createElement(Link, { title: strings.CollectionDataItemShowErrorsLabel, className: styles.errorCalloutLink, disabled: !this.state.errorMsgs || this.state.errorMsgs.length === 0, onClick: this.toggleErrorCallout },
                        React.createElement(Icon, { iconName: 'Error' }))),
                this.state.showCallout && (React.createElement(Callout, { className: styles.errorCallout, target: this.calloutCellRef, isBeakVisible: true, directionalHint: DirectionalHint.bottomLeftEdge, directionalHintForRTL: DirectionalHint.rightBottomEdge, onDismiss: this.hideErrorCallout }, this.state.errorMsgs && this.state.errorMsgs.length > 0 && (React.createElement("div", { className: styles.errorMsgs },
                    React.createElement("p", null, strings.CollectionDataItemFieldIssuesLabel),
                    React.createElement("ul", null, this.state.errorMsgs.map((msg, idx) => (React.createElement("li", { key: `${msg.field}-${idx}` },
                        React.createElement("b", null, msg.field),
                        ":",
                        ' ',
                        msg.message
                            ? msg.message
                            : msg.isRequired
                                ? strings.CollectionDataItemFieldRequiredLabel
                                : null))))))))),
            React.createElement("span", { className: styles.tableCell }, 
            /* Check add or delete action */
            this.props.index !== null ? (React.createElement(Link, { title: strings.CollectionDeleteRowButtonLabel, disabled: !this.props.fDeleteItem || this.props.disableItemDeletion, onClick: this.deleteRow },
                React.createElement(Icon, { iconName: 'Clear' }))) : (React.createElement(Link, { title: strings.CollectionAddRowButtonLabel, className: `${disableAdd ? styles.addBtnDisabled : styles.addBtn}`, disabled: disableAdd, onClick: () => __awaiter(this, void 0, void 0, function* () { return yield this.addRow(); }) },
                React.createElement(Icon, { iconName: 'Add' }))))));
    }
}
//# sourceMappingURL=CollectionDataItem.js.map