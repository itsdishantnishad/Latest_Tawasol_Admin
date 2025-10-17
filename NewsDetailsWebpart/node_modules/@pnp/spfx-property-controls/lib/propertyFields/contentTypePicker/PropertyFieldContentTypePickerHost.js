import * as React from 'react';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { Async } from '@fluentui/react/lib/Utilities';
import { Label } from '@fluentui/react/lib/Label';
import { SPContentTypePickerService } from '../../services/SPContentTypePickerService';
import FieldErrorMessage from '../errorMessage/FieldErrorMessage';
import * as telemetry from '../../common/telemetry';
import { setPropertyValue } from '../../helpers/GeneralHelper';
// Empty contentType value
const EMPTY_CONTENT_TYPE_KEY = 'NO_CONTENT_TYPE_SELECTED';
/**
 * Renders the controls for PropertyFieldContentTypePicker component
 */
export default class PropertyFieldContentTypePickerHost extends React.Component {
    /**
     * Constructor method
     */
    constructor(props) {
        super(props);
        this.options = [];
        telemetry.track('PropertyFieldContentTypePicker', {
            disabled: props.disabled
        });
        this.state = {
            results: this.options,
            errorMessage: ''
        };
        this.async = new Async(this);
        this.validate = this.validate.bind(this);
        this.onChanged = this.onChanged.bind(this);
        this.notifyAfterValidate = this.notifyAfterValidate.bind(this);
        this.delayedValidate = this.async.debounce(this.validate, this.props.deferredValidationTime);
    }
    componentDidMount() {
        // Start retrieving the content types
        this.loadContentTypes();
    }
    componentDidUpdate(prevProps, _prevState) {
        if (this.props.listId !== prevProps.listId || this.props.webAbsoluteUrl !== prevProps.webAbsoluteUrl) {
            this.loadContentTypes();
        }
    }
    /**
     * Loads the loadContentTypes from a selected SharePoint list or SharePoint site
     */
    loadContentTypes() {
        const contentTypeService = new SPContentTypePickerService(this.props, this.props.context);
        const contentTypesToExclude = this.props.contentTypesToExclude || [];
        this.options = [];
        contentTypeService.getContentTypes().then((response) => {
            console.log(response);
            // Start mapping the contentTypes that are selected
            response.value.forEach((contentType) => {
                if (this.props.selectedContentType === contentType.Id.StringValue) {
                    this.selectedKey = contentType.Id.StringValue;
                }
                // Make sure that the current contentType is NOT in the 'contentTypesToExclude' array
                if (contentTypesToExclude.indexOf(contentType.Name) === -1 && contentTypesToExclude.indexOf(contentType.Id.StringValue) === -1) {
                    this.options.push({
                        key: contentType.Id.StringValue,
                        text: contentType.Name
                    });
                }
            });
            // Option to unselect the contentType
            this.options.unshift({
                key: EMPTY_CONTENT_TYPE_KEY,
                text: ''
            });
            // Update the current component state
            this.setState({
                results: this.options,
                selectedKey: this.selectedKey
            });
        }).catch((error) => {
            console.error('Error loading content types:', error);
            // Handle the error appropriately, e.g., display an error message to the user
            this.setState({
                errorMessage: 'Error : List does not exist.\n\nThe page you selected contains a list that does not exist.  It may have been deleted by another user.'
            });
        });
    }
    /**
     * Raises when a contentType has been selected
     */
    onChanged(element, option, index) {
        const newValue = option.key;
        this.delayedValidate(newValue);
    }
    /**
     * Validates the new custom field value
     */
    validate(value) {
        if (this.props.onGetErrorMessage === null || this.props.onGetErrorMessage === undefined) {
            this.notifyAfterValidate(this.props.selectedContentType, value);
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
                    this.notifyAfterValidate(this.props.selectedContentType, value);
                }
                this.setState({
                    errorMessage: errResult
                });
            }
            else {
                errResult.then((errorMessage) => {
                    if (!errorMessage) {
                        this.notifyAfterValidate(this.props.selectedContentType, value);
                    }
                    this.setState({
                        errorMessage: errorMessage
                    });
                }).catch(() => { });
            }
        }
        else {
            this.notifyAfterValidate(this.props.selectedContentType, value);
        }
    }
    /**
     * Notifies the parent Web Part of a property value change
     */
    notifyAfterValidate(oldValue, newValue) {
        // Check if the user wanted to unselect the contentType
        const propValue = newValue === EMPTY_CONTENT_TYPE_KEY ? '' : newValue;
        // Deselect all options
        this.options = this.state.results.map(option => {
            if (option.selected) {
                option.selected = false;
            }
            return option;
        });
        // Set the current selected key
        this.selectedKey = newValue;
        // Update the state
        this.setState({
            selectedKey: this.selectedKey,
            results: this.options
        });
        if (this.props.onPropertyChange && propValue !== null) {
            // Store the new property value
            setPropertyValue(this.props.properties, this.props.targetProperty, propValue);
            // Trigger the default onPropertyChange event
            this.props.onPropertyChange(this.props.targetProperty, oldValue, propValue);
            // Trigger the apply button
            if (typeof this.props.onChange !== 'undefined' && this.props.onChange !== null) {
                this.props.onChange(this.props.targetProperty, propValue);
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
     * Renders the SPContentTypePicker controls with Office UI Fabric
     */
    render() {
        // Renders content
        return (React.createElement("div", null,
            this.props.label && React.createElement(Label, null, this.props.label),
            React.createElement(Dropdown, { disabled: this.props.disabled, label: '', onChange: this.onChanged, options: this.state.results, selectedKey: this.state.selectedKey }),
            React.createElement(FieldErrorMessage, { errorMessage: this.state.errorMessage })));
    }
}
//# sourceMappingURL=PropertyFieldContentTypePickerHost.js.map