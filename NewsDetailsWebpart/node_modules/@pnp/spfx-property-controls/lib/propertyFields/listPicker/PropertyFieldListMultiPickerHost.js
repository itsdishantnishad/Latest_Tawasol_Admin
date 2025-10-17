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
import { Label } from '@fluentui/react/lib/Label';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { Async } from '@fluentui/react/lib/Utilities';
import { Checkbox } from '@fluentui/react/lib/Checkbox';
import SPListPickerService from '../../services/SPListPickerService';
import FieldErrorMessage from '../errorMessage/FieldErrorMessage';
import * as telemetry from '../../common/telemetry';
import { setPropertyValue } from '../../helpers/GeneralHelper';
/**
* Renders the controls for PropertyFieldSPListMultiplePicker component
*/
export default class PropertyFieldListMultiPickerHost extends React.Component {
    /**
    * Constructor
    */
    constructor(props) {
        super(props);
        this.loaded = false;
        telemetry.track('PropertyFieldListMultiPicker', {
            disabled: props.disabled
        });
        this.onChanged = this.onChanged.bind(this);
        this.onSelectAllChanged = this.onSelectAllChanged.bind(this);
        this.state = {
            loadedLists: {
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
        this.loadLists().then(() => { }).catch(() => { });
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.props.baseTemplate !== prevProps.baseTemplate ||
            this.props.webAbsoluteUrl !== prevProps.webAbsoluteUrl) {
            this.loadLists().then(() => { }).catch(() => { });
        }
    }
    /**
    * Loads the list from SharePoint current web site, or target site if specified by webRelativeUrl
    */
    loadLists() {
        return __awaiter(this, void 0, void 0, function* () {
            const { context, selectedLists } = this.props;
            // Builds the SharePoint List service
            const listService = new SPListPickerService(this.props, context);
            const listsToExclude = this.props.listsToExclude || [];
            let selectedListsKeys = [];
            if (selectedLists && selectedLists.length) {
                const firstItem = selectedLists[0];
                if (typeof firstItem === 'string') {
                    selectedListsKeys = selectedLists;
                }
                else {
                    selectedListsKeys = selectedLists.map(sl => sl.id);
                }
            }
            const options = [];
            const selectedKeys = [];
            // Gets the libs
            const response = yield listService.getLibs();
            response.value.forEach((list) => {
                let indexInExisting = -1;
                // Defines if the current list must be selected by default
                if (selectedListsKeys) {
                    indexInExisting = selectedListsKeys.indexOf(list.Id);
                }
                if (indexInExisting > -1) {
                    selectedKeys.push(list.Id);
                }
                // Add the option to the list if not inside the 'listsToExclude' array
                if (listsToExclude.indexOf(list.Title) === -1 && listsToExclude.indexOf(list.Id) === -1) {
                    options.push({
                        key: list.Id,
                        text: list.Title
                    });
                }
            });
            this.loaded = true;
            this.setState({
                loadedLists: response,
                results: options,
                selectedKeys: selectedKeys,
                loaded: true
            });
        });
    }
    /**
    * Raises when a list has been selected
    */
    onChanged(element, isChecked) {
        if (element) {
            const value = element.currentTarget.value; // eslint-disable-line @typescript-eslint/no-explicit-any
            let selectedKeys = this.state.selectedKeys;
            // Check if the element is selected
            if (isChecked === false) {
                // Remove the unselected item
                selectedKeys = selectedKeys.filter(s => s !== value);
            }
            else {
                // Add the selected item and filter out the doubles
                selectedKeys.push(value);
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
                    selectedKeys.push(value.key);
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
        const { onPropertyChange, onChange, selectedLists, targetProperty, properties, includeListTitleAndUrl } = this.props;
        const { loadedLists } = this.state;
        let propValue;
        if (!newValue || !newValue.length) {
            propValue = [];
        }
        else {
            if (includeListTitleAndUrl) {
                propValue = loadedLists.value.filter(l => newValue.indexOf(l.Id) !== -1).map(l => {
                    return {
                        id: l.Id,
                        title: l.Title,
                        url: l.RootFolder.ServerRelativeUrl
                    };
                });
            }
            else {
                propValue = [...newValue];
            }
        }
        if (onPropertyChange && newValue !== null) {
            setPropertyValue(properties, targetProperty, propValue);
            onPropertyChange(targetProperty, selectedLists, propValue);
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
    * Renders the SPListMultiplePicker controls with Office UI  Fabric
    */
    render() {
        const { selectedKeys, results, errorMessage } = this.state;
        const { label, disabled, showSelectAll, selectAllInList, selectAllInListLabel, targetProperty } = this.props;
        if (this.loaded === false) {
            return (React.createElement("div", null,
                React.createElement(Label, null, label),
                React.createElement(Spinner, { size: SpinnerSize.medium })));
        }
        else {
            // Renders content
            return (React.createElement("div", null,
                (showSelectAll === false || selectAllInList === true) &&
                    React.createElement(Label, null, label),
                showSelectAll === true &&
                    React.createElement("div", { style: { marginBottom: '5px' }, className: 'ms-ChoiceField' },
                        React.createElement(Checkbox, { checked: selectedKeys.length === results.length, label: selectAllInList === true ? selectAllInListLabel : label, onChange: this.onSelectAllChanged, styles: {
                                checkbox: {
                                    backgroundColor: (selectedKeys.length > 0 ? '#f4f4f4' : 'inherit'),
                                    visibility: (selectAllInList === false ? 'hidden' : 'visible')
                                }
                            } })),
                results.map((item, index) => {
                    const uniqueKey = targetProperty + '-' + item.key;
                    return (React.createElement("div", { style: { marginBottom: '5px' }, className: 'ms-ChoiceField', key: uniqueKey },
                        React.createElement(Checkbox, { checked: selectedKeys.indexOf(item.key.toString()) >= 0, disabled: disabled, label: item.text, onChange: this.onChanged, inputProps: { value: item.key } })));
                }),
                React.createElement(FieldErrorMessage, { errorMessage: errorMessage })));
        }
    }
}
//# sourceMappingURL=PropertyFieldListMultiPickerHost.js.map