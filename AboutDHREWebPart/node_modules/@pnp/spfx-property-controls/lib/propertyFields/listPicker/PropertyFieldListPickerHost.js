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
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { Async } from '@fluentui/react/lib/Utilities';
import { Label } from '@fluentui/react/lib/Label';
import SPListPickerService from '../../services/SPListPickerService';
import FieldErrorMessage from '../errorMessage/FieldErrorMessage';
import * as telemetry from '../../common/telemetry';
import { setPropertyValue } from '../../helpers/GeneralHelper';
// Empty list value, to be checked for single list selection
const EMPTY_LIST_KEY = 'NO_LIST_SELECTED';
/**
 * Renders the controls for PropertyFieldListPicker component
 */
export default class PropertyFieldListPickerHost extends React.Component {
    /**
     * Constructor method
     */
    constructor(props) {
        super(props);
        telemetry.track('PropertyFieldListPicker', {
            disabled: props.disabled
        });
        this.state = {
            loadedLists: {
                value: []
            },
            results: [],
            errorMessage: ''
        };
        this.async = new Async(this);
        this.validate = this.validate.bind(this);
        this.onChanged = this.onChanged.bind(this);
        this.notifyAfterValidate = this.notifyAfterValidate.bind(this);
        this.delayedValidate = this.async.debounce(this.validate, this.props.deferredValidationTime);
    }
    componentDidMount() {
        // Start retrieving the SharePoint lists
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
            const { context, selectedList } = this.props;
            const listService = new SPListPickerService(this.props, context);
            const listsToExclude = this.props.listsToExclude || [];
            const options = [];
            let selectedListKey = '';
            if (selectedList) {
                selectedListKey = typeof selectedList === 'string' ? selectedList : selectedList.id;
            }
            let selectedKey;
            const response = yield listService.getLibs();
            // Start mapping the list that are selected
            response.value.forEach((list) => {
                if (selectedListKey === list.Id) {
                    selectedKey = list.Id;
                }
                // Make sure that the current list is NOT in the 'listsToExclude' array
                if (listsToExclude.indexOf(list.Title) === -1 && listsToExclude.indexOf(list.Id) === -1) {
                    options.push({
                        key: list.Id,
                        text: list.Title
                    });
                }
            });
            // Option to unselect the list
            options.unshift({
                key: EMPTY_LIST_KEY,
                text: ''
            });
            // Update the current component state
            this.setState({
                loadedLists: response,
                results: options,
                selectedKey: selectedKey
            });
        });
    }
    /**
     * Raises when a list has been selected
     */
    onChanged(option, index) {
        const newValue = option.key;
        this.delayedValidate(newValue);
    }
    /**
     * Validates the new custom field value
     */
    validate(value) {
        if (this.props.onGetErrorMessage === null || this.props.onGetErrorMessage === undefined) {
            this.notifyAfterValidate(value);
            return;
        }
        if (this.latestValidateValue === value) {
            return;
        }
        this.latestValidateValue = value;
        const errResult = this.props.onGetErrorMessage(value || '');
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
                    if (!errorMessage) {
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
        const { onPropertyChange, targetProperty, selectedList, includeListTitleAndUrl, properties, onChange } = this.props;
        const { loadedLists } = this.state;
        // Check if the user wanted to unselect the list
        let propValue;
        if (includeListTitleAndUrl) {
            if (newValue === EMPTY_LIST_KEY) {
                propValue = undefined;
            }
            else {
                const spList = loadedLists.value.filter(l => l.Id === newValue)[0];
                propValue = {
                    id: newValue,
                    title: spList.Title,
                    url: spList.RootFolder.ServerRelativeUrl
                };
            }
        }
        else {
            propValue = newValue === EMPTY_LIST_KEY ? '' : newValue;
        }
        // Deselect all options
        const options = this.state.results.map(option => {
            if (option.selected) {
                option.selected = false;
            }
            return option;
        });
        // Set the current selected key
        const selectedKey = newValue;
        // Update the state
        this.setState({
            selectedKey: selectedKey,
            results: options
        });
        if (onPropertyChange && propValue !== null) {
            // Store the new property value
            setPropertyValue(properties, targetProperty, propValue);
            // Trigger the default onPrpertyChange event
            onPropertyChange(targetProperty, selectedList, propValue);
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
        if (typeof this.async !== 'undefined') {
            this.async.dispose();
        }
    }
    /**
     * Renders the SPListpicker controls with Office UI Fabric
     */
    render() {
        // Renders content
        return (React.createElement("div", null,
            this.props.label && React.createElement(Label, null, this.props.label),
            React.createElement(Dropdown, { disabled: this.props.disabled, label: '', onChanged: this.onChanged, options: this.state.results, selectedKey: this.state.selectedKey }),
            React.createElement(FieldErrorMessage, { errorMessage: this.state.errorMessage })));
    }
}
//# sourceMappingURL=PropertyFieldListPickerHost.js.map