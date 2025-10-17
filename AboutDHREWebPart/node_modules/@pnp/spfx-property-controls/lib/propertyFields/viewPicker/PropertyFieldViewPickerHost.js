import * as React from 'react';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { Async } from '@fluentui/react/lib/Utilities';
import { Label } from '@fluentui/react/lib/Label';
import { SPViewPickerService } from '../../services/SPViewPickerService';
import FieldErrorMessage from '../errorMessage/FieldErrorMessage';
import * as telemetry from '../../common/telemetry';
import { setPropertyValue } from '../../helpers/GeneralHelper';
// Empty view value
const EMPTY_VIEW_KEY = 'NO_VIEW_SELECTED';
/**
 * Renders the controls for PropertyFieldViewPicker component
 */
export default class PropertyFieldViewPickerHost extends React.Component {
    /**
     * Constructor method
     */
    constructor(props) {
        super(props);
        this.options = [];
        telemetry.track('PropertyFieldViewPicker', {
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
        // Start retrieving the list views
        this.loadViews();
    }
    componentDidUpdate(prevProps, _prevState) {
        if (this.props.listId !== prevProps.listId || this.props.webAbsoluteUrl !== prevProps.webAbsoluteUrl) {
            this.loadViews();
        }
    }
    /**
     * Loads the views from a SharePoint list
     */
    loadViews() {
        const viewService = new SPViewPickerService(this.props, this.props.context);
        const viewsToExclude = this.props.viewsToExclude || [];
        this.options = [];
        viewService.getViews().then((response) => {
            // Start mapping the views that are selected
            response.value.forEach((view) => {
                if (this.props.selectedView === view.Id) {
                    this.selectedKey = view.Id;
                }
                // Make sure that the current view is NOT in the 'viewsToExclude' array
                if (viewsToExclude.indexOf(view.Title) === -1 && viewsToExclude.indexOf(view.Id) === -1) {
                    this.options.push({
                        key: view.Id,
                        text: view.Title
                    });
                }
            });
            // Option to unselect the view
            this.options.unshift({
                key: EMPTY_VIEW_KEY,
                text: ''
            });
            // Update the current component state
            this.setState({
                results: this.options,
                selectedKey: this.selectedKey
            });
        }).catch(() => { });
    }
    /**
     * Raises when a view has been selected
     */
    onChanged(option, _index) {
        const newValue = option.key;
        this.delayedValidate(newValue);
    }
    /**
     * Validates the new custom field value
     */
    validate(value) {
        if (this.props.onGetErrorMessage === null || this.props.onGetErrorMessage === undefined) {
            this.notifyAfterValidate(this.props.selectedView, value);
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
                    this.notifyAfterValidate(this.props.selectedView, value);
                }
                this.setState({
                    errorMessage: errResult
                });
            }
            else {
                errResult.then((errorMessage) => {
                    if (!errorMessage) {
                        this.notifyAfterValidate(this.props.selectedView, value);
                    }
                    this.setState({
                        errorMessage: errorMessage
                    });
                }).catch(() => { });
            }
        }
        else {
            this.notifyAfterValidate(this.props.selectedView, value);
        }
    }
    /**
     * Notifies the parent Web Part of a property value change
     */
    notifyAfterValidate(oldValue, newValue) {
        // Check if the user wanted to unselect the view
        const propValue = newValue === EMPTY_VIEW_KEY ? '' : newValue;
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
     * Renders the SPViewPicker controls with Office UI Fabric
     */
    render() {
        // Renders content
        return (React.createElement("div", null,
            this.props.label && React.createElement(Label, null, this.props.label),
            React.createElement(Dropdown, { disabled: this.props.disabled, label: '', onChanged: this.onChanged, options: this.state.results, selectedKey: this.state.selectedKey }),
            React.createElement(FieldErrorMessage, { errorMessage: this.state.errorMessage })));
    }
}
//# sourceMappingURL=PropertyFieldViewPickerHost.js.map