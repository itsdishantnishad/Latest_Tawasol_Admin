import * as React from 'react';
import { Label } from '@fluentui/react/lib/Label';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { Async } from '@fluentui/react/lib/Utilities';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { SPColumnPickerService } from '../../services/SPColumnPickerService';
import FieldErrorMessage from '../errorMessage/FieldErrorMessage';
import * as telemetry from '../../common/telemetry';
import { setPropertyValue } from '../../helpers/GeneralHelper';
/**
* Renders the controls for PropertyFieldSPColumnMultiplePicker component
*/
export default class PropertyFieldColumnMultiPickerDropdownHost extends React.Component {
    /**
    * Constructor
    */
    constructor(props) {
        super(props);
        this.loaded = false;
        telemetry.track('PropertyFieldColumnMultiPicker', {
            disabled: props.disabled
        });
        this.onChanged = this.onChanged.bind(this);
        this.onSelectAllChanged = this.onSelectAllChanged.bind(this);
        this.state = {
            loadedColumns: {
                value: []
            },
            results: [],
            selectedKeys: [],
            loaded: this.loaded,
            errorMessage: ''
        };
        this.async = new Async(this);
        this.validate = this.validate.bind(this);
        this.notifyAfterValidate = this.notifyAfterValidate.bind(this);
        this.delayedValidate = this.async.debounce(this.validate, this.props.deferredValidationTime);
    }
    componentDidMount() {
        this.loadColumns();
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.props.listId !== prevProps.listId ||
            this.props.webAbsoluteUrl !== prevProps.webAbsoluteUrl) {
            this.loadColumns();
        }
    }
    loadColumns() {
        const { selectedColumns, columnReturnProperty, displayHiddenColumns } = this.props;
        const columnService = new SPColumnPickerService(this.props, this.props.context);
        const columnsToExclude = this.props.columnsToExclude || [];
        const options = [];
        const selectedKeys = [];
        let selectedColumnsKeys = [];
        if (selectedColumns && selectedColumns.length) {
            const firstItem = selectedColumns[0];
            if (typeof firstItem === 'string') {
                selectedColumnsKeys = selectedColumns;
            }
            else { // TODO: (Alex Terentiev) I believe this code should be removed as the type of selectedColumns is defined as string[]. Or change the type in properties interface
                selectedColumnsKeys = selectedColumns.map(o => (columnReturnProperty ? o[columnReturnProperty] : o.Id)); // eslint-disable-line @typescript-eslint/no-explicit-any
            }
        }
        columnService.getColumns(displayHiddenColumns).then((response) => {
            // Start mapping the Columns that are selected
            response.value.forEach((column) => {
                let isSelected = false;
                let indexInExisting = -1;
                const colPropsToCheck = columnReturnProperty ? column[columnReturnProperty] : column.Id;
                // Defines if the current list must be selected by default
                if (selectedColumnsKeys) {
                    indexInExisting = selectedColumnsKeys.indexOf(colPropsToCheck);
                }
                if (indexInExisting > -1) {
                    isSelected = true;
                    selectedKeys.push(colPropsToCheck);
                }
                // Make sure that the current column is NOT in the 'columnsToExclude' array
                if (columnsToExclude.indexOf(column.Title) === -1 && columnsToExclude.indexOf(column.Id) === -1) {
                    options.push({
                        key: colPropsToCheck,
                        text: column.Title,
                        selected: isSelected
                    });
                }
            });
            this.loaded = true;
            this.setState({
                loadedColumns: response,
                results: options,
                selectedKeys: selectedKeys,
                loaded: true
            });
        }).catch(() => { });
    }
    /**
    * Raises when a column has been selected
    */
    onChanged(element, option, index) {
        if (element) {
            //const value: string = (element.currentTarget as any).;
            let selectedKeys = this.state.selectedKeys;
            // Check if the element is selected
            if (option.selected === false) {
                // Remove the unselected item
                selectedKeys = selectedKeys.filter(s => s !== option.key);
            }
            else {
                // Add the selected item and filter out the doubles
                selectedKeys.push(option.key.toString());
                selectedKeys = selectedKeys.filter((item, pos, self) => {
                    return self.indexOf(item) === pos;
                });
            }
            // Update the state and validate
            this.setState({
                selectedKeys: selectedKeys
            });
            this.delayedValidate(selectedKeys);
        }
    }
    /**
     * Raises when the select all checkbox is changed
     */
    onSelectAllChanged(element, isChecked) {
        if (element) {
            const selectedKeys = new Array();
            const { results } = this.state;
            if (isChecked === true) {
                results.forEach((value) => {
                    selectedKeys.push(value.key.toString());
                });
            }
            this.setState({
                selectedKeys: selectedKeys
            });
            this.delayedValidate(selectedKeys);
        }
    }
    /**
    * Validates the new custom field value
    */
    validate(value) {
        if (this.props.onGetErrorMessage === null || typeof this.props.onGetErrorMessage === 'undefined') {
            this.notifyAfterValidate(value);
            return;
        }
        const errResult = this.props.onGetErrorMessage(value || []);
        if (typeof errResult !== 'undefined') {
            if (typeof errResult === 'string') {
                if (errResult === '') {
                    this.notifyAfterValidate(value);
                }
                this.setState({
                    errorMessage: errResult
                });
            }
            else {
                errResult.then((errorMessage) => {
                    if (typeof errorMessage === 'undefined' || errorMessage === '') {
                        this.notifyAfterValidate(value);
                    }
                    this.setState({
                        errorMessage: errorMessage
                    });
                }).catch(() => { });
            }
        }
        else {
            this.notifyAfterValidate(value);
        }
    }
    /**
    * Notifies the parent Web Part of a property value change
    */
    notifyAfterValidate(newValue) {
        const { onPropertyChange, onChange, selectedColumn, targetProperty, properties } = this.props;
        let propValue;
        if (!newValue || !newValue.length) {
            propValue = [];
        }
        else {
            propValue = [...newValue];
        }
        if (onPropertyChange && newValue !== null) {
            setPropertyValue(properties, targetProperty, propValue);
            onPropertyChange(targetProperty, selectedColumn, propValue);
            // Trigger the apply button
            if (typeof onChange !== 'undefined' && onChange !== null) {
                onChange(targetProperty, propValue);
            }
        }
    }
    /**
    * Called when the component will unmount
    */
    componentWillUnmount() {
        this.async.dispose();
    }
    /**
    * Renders the SPColumnMultiplePicker controls with Office UI  Fabric
    */
    render() {
        const { selectedKeys, results, errorMessage } = this.state;
        const { label, disabled } = this.props;
        if (this.loaded === false) {
            return (React.createElement("div", null,
                React.createElement(Label, null, label),
                React.createElement(Spinner, { size: SpinnerSize.medium })));
        }
        else {
            // Renders content
            return (React.createElement("div", null,
                React.createElement(Dropdown, { multiSelect: true, label: this.props.label, disabled: disabled, options: results, defaultSelectedKeys: selectedKeys, onChange: this.onChanged, selectedKeys: selectedKeys }),
                React.createElement(FieldErrorMessage, { errorMessage: errorMessage })));
        }
    }
}
//# sourceMappingURL=PropertyFieldColumnMultiPickerDropdownHost.js.map