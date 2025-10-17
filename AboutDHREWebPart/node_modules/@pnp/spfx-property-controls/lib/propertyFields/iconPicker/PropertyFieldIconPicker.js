import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PropertyPaneFieldType, } from '@microsoft/sp-property-pane';
import PropertyFieldIconPickerHost from './PropertyFieldIconPickerHost';
class PropertyFieldIconPickerBuilder {
    constructor(_targetProperty, _properties) {
        this.type = PropertyPaneFieldType.Custom;
        this.disabled = false;
        this.targetProperty = _targetProperty;
        this.properties = _properties;
        this.onPropertyChange = _properties.onPropertyChange;
        this.customProperties = _properties.properties;
        this.key = _properties.key;
        this.onSave = _properties.onSave;
        this.onChanged = _properties.onChanged;
        this.buttonClassName = _properties.buttonClassName;
        this.buttonLabel = _properties.buttonLabel;
        this.disabled = _properties.disabled;
        this.panelClassName = _properties.panelClassName;
        this.currentIcon = _properties.currentIcon;
        this.renderOption = _properties.renderOption;
        this.label = _properties.label;
        this.properties.onRender = this._render.bind(this);
        this.properties.onDispose = this._dispose.bind(this);
        if (_properties.disabled === true) {
            this.disabled = _properties.disabled;
        }
    }
    _render(elem, context, changeCallback) {
        const element = React.createElement(PropertyFieldIconPickerHost, {
            key: this.key,
            buttonLabel: this.buttonLabel,
            buttonClassName: this.buttonClassName,
            disabled: this.disabled,
            panelClassName: this.panelClassName,
            currentIcon: this.currentIcon,
            renderOption: this.renderOption,
            properties: this.customProperties,
            label: this.label,
            onSave: this.onSave,
            onChanged: this.onChanged,
            targetProperty: this.targetProperty,
            onChange: changeCallback,
            onPropertyChange: this.onPropertyChange,
            onRender: this._render,
            onDispose: this._dispose
        });
        ReactDOM.render(element, elem);
    }
    _dispose(elem) {
        ReactDOM.unmountComponentAtNode(elem);
    }
    onPropertyChange(propertyPath, oldValue, newValue) {
    }
}
export function PropertyFieldIconPicker(targetProperty, properties) {
    return new PropertyFieldIconPickerBuilder(targetProperty, Object.assign(Object.assign({}, properties), { targetProperty: targetProperty, onRender: null, onDispose: null }));
}
//# sourceMappingURL=PropertyFieldIconPicker.js.map