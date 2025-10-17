import * as React from 'react';
import * as ReactDom from 'react-dom';
import { PropertyPaneFieldType, } from '@microsoft/sp-property-pane';
import { DayOfWeek } from '@fluentui/react/lib/DateTimeUtilities';
import PropertyFieldDateTimePickerHost from './PropertyFieldDateTimePickerHost';
import { TimeConvention, DateConvention } from './IPropertyFieldDateTimePicker';
/**
 * Represents a PropertyFieldDateTimePicker object
 */
class PropertyFieldDateTimePickerBuilder {
    /**
     * Constructor
     */
    constructor(_targetProperty, _properties) {
        // Properties defined by IPropertyPaneField
        this.type = PropertyPaneFieldType.Custom;
        this.disabled = false;
        this.deferredValidationTime = 200;
        this.showLabels = true;
        this.render = this.render.bind(this);
        this.targetProperty = _properties.targetProperty;
        this.properties = _properties;
        this.label = _properties.label;
        this.initialDate = _properties.initialDate;
        this.properties.onDispose = this.dispose;
        this.properties.onRender = this.render;
        this.onPropertyChange = _properties.onPropertyChange;
        this.formatDate = _properties.formatDate;
        this.customProperties = _properties.properties;
        this.key = _properties.key;
        this.onGetErrorMessage = _properties.onGetErrorMessage;
        if (_properties.deferredValidationTime) {
            this.deferredValidationTime = _properties.deferredValidationTime;
        }
        if (typeof _properties.disabled !== 'undefined') {
            this.disabled = _properties.disabled;
        }
        if (typeof _properties.dateConvention !== 'undefined') {
            this.dateConvention = _properties.dateConvention;
        }
        else {
            this.dateConvention = DateConvention.DateTime;
        }
        if (typeof _properties.timeConvention !== 'undefined') {
            this.timeConvention = _properties.timeConvention;
        }
        else {
            this.timeConvention = TimeConvention.Hours24;
        }
        if (typeof _properties.firstDayOfWeek !== 'undefined') {
            this.firstDayOfWeek = _properties.firstDayOfWeek;
        }
        else {
            this.firstDayOfWeek = DayOfWeek.Sunday;
        }
        this.showLabels = _properties.showLabels;
    }
    /**
     * Renders the DatePicker field content
     */
    render(elem, ctx, changeCallback) {
        // Construct the JSX properties
        const element = React.createElement(PropertyFieldDateTimePickerHost, {
            label: this.label,
            disabled: this.disabled,
            initialDate: this.initialDate,
            targetProperty: this.targetProperty,
            formatDate: this.formatDate,
            dateConvention: this.dateConvention,
            timeConvention: this.timeConvention,
            firstDayOfWeek: this.firstDayOfWeek,
            onDispose: this.dispose,
            onRender: this.render,
            onPropertyChange: this.onPropertyChange,
            onChange: changeCallback,
            properties: this.customProperties,
            key: this.key,
            onGetErrorMessage: this.onGetErrorMessage,
            deferredValidationTime: this.deferredValidationTime,
            showLabels: this.showLabels
        });
        // Calls the REACT content generator
        ReactDom.render(element, elem);
    }
    /**
     * Disposes the current object
     */
    dispose(elem) {
        ReactDom.unmountComponentAtNode(elem);
    }
}
/**
 * Helper method to create the customer field on the PropertyPane.
 * @param targetProperty - Target property the custom field is associated to.
 * @param properties - Strongly typed custom field properties.
 */
export function PropertyFieldDateTimePicker(targetProperty, properties) {
    // Calls the PropertyFieldDateTimePicker builder object
    // This object will simulate a PropertyFieldCustom to manage his rendering process
    return new PropertyFieldDateTimePickerBuilder(targetProperty, Object.assign(Object.assign({}, properties), { targetProperty: targetProperty, onDispose: null, onRender: null }));
}
//# sourceMappingURL=PropertyFieldDateTimePicker.js.map