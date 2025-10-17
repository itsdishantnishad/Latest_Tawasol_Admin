import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PropertyPaneFieldType } from '@microsoft/sp-property-pane';
import PropertyFieldCheckboxHost from './PropertyFieldCheckboxWithCalloutHost';
/**
 * Represents a PropertyFieldCheckboxWithCallout object
 */
class PropertyFieldCheckboxWithCalloutBuilder {
    constructor(_targetProperty, _properties) {
        this.type = PropertyPaneFieldType.Custom;
        this.targetProperty = _targetProperty;
        this.properties = _properties;
        this.properties.onRender = this._render.bind(this);
        this.properties.onDispose = this._dispose.bind(this);
    }
    _render(elem, context, changeCallback) {
        const props = this.properties;
        const element = React.createElement(PropertyFieldCheckboxHost, Object.assign(Object.assign({}, props), { onChange: this._onChange.bind(this) }));
        ReactDOM.render(element, elem);
        if (changeCallback) {
            this._onChangeCallback = changeCallback;
        }
    }
    _dispose(elem) {
        ReactDOM.unmountComponentAtNode(elem);
    }
    _onChange(e, value) {
        if (this._onChangeCallback) {
            this._onChangeCallback(this.targetProperty, value);
        }
    }
}
/**
 * Helper method to create a Checkbox with Callout component on the PropertyPane.
 * @param targetProperty - Target property the Checkbox with Callout component is associated to.
 * @param properties - Strongly typed Checkbox with Callout component properties.
 */
export function PropertyFieldCheckboxWithCallout(targetProperty, properties) {
    return new PropertyFieldCheckboxWithCalloutBuilder(targetProperty, Object.assign(Object.assign({}, properties), { onRender: null, onDispose: null }));
}
//# sourceMappingURL=PropertyFieldCheckboxWithCallout.js.map