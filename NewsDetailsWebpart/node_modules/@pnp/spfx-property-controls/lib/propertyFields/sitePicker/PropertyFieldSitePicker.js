import * as React from 'react';
import * as ReactDom from 'react-dom';
import { PropertyPaneFieldType } from '@microsoft/sp-property-pane';
import PropertyFieldSitePickerHost from './PropertyFieldSitePickerHost';
/**
 * Represents a PropertyFieldSitePicker object
 */
class PropertyFieldSitePickerBuilder {
    /**
     * Constructor method
     */
    constructor(_targetProperty, _properties) {
        // Properties defined by IPropertyPaneField
        this.type = PropertyPaneFieldType.Custom;
        this.disabled = false;
        this.multiSelect = false;
        this.deferredValidationTime = 200;
        this.render = this.render.bind(this);
        this.label = _properties.label;
        this.targetProperty = _properties.targetProperty;
        this.properties = _properties;
        this.properties.onDispose = this.dispose;
        this.properties.onRender = this.render;
        this.onPropertyChange = _properties.onPropertyChange;
        this.context = _properties.context;
        this.initialSites = _properties.initialSites;
        this.customProperties = _properties.properties;
        this.key = _properties.key;
        this.onGetErrorMessage = _properties.onGetErrorMessage;
        this.trimDuplicates = _properties.trimDuplicates;
        this.additionalQuery = _properties.additionalQuery;
        if (typeof _properties.disabled !== 'undefined') {
            this.disabled = _properties.disabled;
        }
        if (_properties.deferredValidationTime) {
            this.deferredValidationTime = _properties.deferredValidationTime;
        }
        if (typeof _properties.multiSelect !== "undefined") {
            this.multiSelect = _properties.multiSelect;
        }
    }
    /**
     * Renders the PeoplePicker field content
     */
    render(elem, ctx, changeCallback) {
        // Construct the JSX properties
        const element = React.createElement(PropertyFieldSitePickerHost, {
            label: this.label,
            disabled: this.disabled,
            targetProperty: this.targetProperty,
            initialSites: this.initialSites,
            multiSelect: this.multiSelect,
            onDispose: this.dispose,
            onRender: this.render,
            onChange: changeCallback,
            onPropertyChange: this.onPropertyChange,
            context: this.context,
            properties: this.customProperties,
            key: this.key,
            onGetErrorMessage: this.onGetErrorMessage,
            deferredValidationTime: this.deferredValidationTime,
            trimDuplicates: this.trimDuplicates,
            additionalQuery: this.additionalQuery
        });
        // Calls the REACT content generator
        ReactDom.render(element, elem);
    }
    /**
    * Disposes the current object
    */
    dispose(elem) { }
}
/**
 * Helper method to create a Site Picker on the PropertyPane.
 * @param targetProperty - Target property the site picker is associated to.
 * @param properties - Strongly typed site Picker properties.
 */
export function PropertyFieldSitePicker(targetProperty, properties) {
    // Calls the PropertyFieldSitePicker builder object
    // This object will simulate a PropertyFieldCustom to manage his rendering process
    return new PropertyFieldSitePickerBuilder(targetProperty, Object.assign(Object.assign({}, properties), { targetProperty: targetProperty, onDispose: null, onRender: null }));
}
//# sourceMappingURL=PropertyFieldSitePicker.js.map