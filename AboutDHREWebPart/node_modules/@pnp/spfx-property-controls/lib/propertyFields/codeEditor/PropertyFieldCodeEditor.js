import * as React from 'react';
import * as ReactDom from 'react-dom';
import { PropertyPaneFieldType } from '@microsoft/sp-property-pane';
import PropertyFieldCodeEditorHost from './PropertyFieldCodeEditorHost';
/**
 * Represents a PropertyFieldCodeEditor object
 */
class PropertyFieldCodeEditorBuilder {
    onPropertyChange(propertyPath, oldValue, newValue) { } // eslint-disable-line @typescript-eslint/no-explicit-any
    /**
     * Constructor method
     */
    constructor(_targetProperty, _properties) {
        // Properties defined by IPropertyPaneField
        this.type = PropertyPaneFieldType.Custom;
        this.disabled = false;
        this.deferredValidationTime = 200;
        this.render = this.render.bind(this);
        this.targetProperty = _targetProperty;
        this.properties = _properties;
        this.properties.onDispose = this.dispose;
        this.properties.onRender = this.render;
        this.label = _properties.label;
        this.onPropertyChange = _properties.onPropertyChange;
        this.customProperties = _properties.properties;
        this.key = _properties.key;
        this.panelTitle = _properties.panelTitle;
        this.language = _properties.language;
        this.initialValue = _properties.initialValue;
        if (_properties.disabled === true) {
            this.disabled = _properties.disabled;
        }
        if (_properties.deferredValidationTime) {
            this.deferredValidationTime = _properties.deferredValidationTime;
        }
        if (_properties.options) {
            this.options = _properties.options;
        }
        this.panelWidth = _properties.panelWidth;
    }
    /**
     * Renders the SPListPicker field content
     */
    render(elem, ctx, changeCallback) {
        // Construct the JSX properties
        const element = React.createElement(PropertyFieldCodeEditorHost, {
            label: this.label,
            targetProperty: this.targetProperty,
            panelTitle: this.panelTitle,
            language: this.language,
            initialValue: this.initialValue,
            onDispose: this.dispose,
            onRender: this.render,
            onChange: changeCallback,
            onPropertyChange: this.onPropertyChange,
            properties: this.customProperties,
            key: this.key,
            disabled: this.disabled,
            deferredValidationTime: this.deferredValidationTime,
            options: this.options,
            panelWidth: this.panelWidth
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
 * Helper method to create a SPList Picker on the PropertyPane.
 * @param targetProperty - Target property the SharePoint list picker is associated to.
 * @param properties - Strongly typed SPList Picker properties.
 */
export function PropertyFieldCodeEditor(targetProperty, properties) {
    // Calls the PropertyFieldCodeEditor builder object
    // This object will simulate a PropertyFieldCustom to manage his rendering process
    return new PropertyFieldCodeEditorBuilder(targetProperty, Object.assign(Object.assign({}, properties), { targetProperty: targetProperty, onRender: null, onDispose: null }));
}
//# sourceMappingURL=PropertyFieldCodeEditor.js.map