import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PropertyPaneFieldType } from '@microsoft/sp-property-pane';
import PropertyFieldLabelHost from './PropertyFieldLabelWithCalloutHost';
/**
 * Represents a PropertyFieldLabelWithCallout object
 */
class PropertyFieldLabelWithCalloutBuilder {
    constructor(_targetProperty, _properties) {
        this.type = PropertyPaneFieldType.Custom;
        this.targetProperty = _targetProperty;
        this.properties = _properties;
        this.properties.onRender = this._render.bind(this);
        this.properties.onDispose = this._dispose.bind(this);
    }
    _render(elem, context, changeCallback) {
        const props = this.properties;
        const element = React.createElement(PropertyFieldLabelHost, Object.assign({}, props));
        ReactDOM.render(element, elem);
    }
    _dispose(elem) {
        ReactDOM.unmountComponentAtNode(elem);
    }
}
/**
 * Helper method to create a Label with Callout component on the PropertyPane.
 * @param targetProperty - Target property the Label with Callout component is associated to.
 * @param properties - Strongly typed Label with Callout component properties.
 */
export function PropertyFieldLabelWithCallout(targetProperty, properties) {
    return new PropertyFieldLabelWithCalloutBuilder(targetProperty, Object.assign(Object.assign({}, properties), { onRender: null, onDispose: null }));
}
//# sourceMappingURL=PropertyFieldLabelWithCallout.js.map