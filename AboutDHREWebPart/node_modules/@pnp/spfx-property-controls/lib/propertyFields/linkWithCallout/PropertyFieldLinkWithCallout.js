import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PropertyPaneFieldType } from '@microsoft/sp-property-pane';
import PropertyFieldLinkHost from './PropertyFieldLinkWithCalloutHost';
import omit from 'lodash/omit';
/**
 * Represents a PropertyFieldLinkWithCallout object
 */
class PropertyFieldLinkWithCalloutBuilder {
    constructor(_targetProperty, _properties) {
        this.type = PropertyPaneFieldType.Custom;
        this.targetProperty = _targetProperty;
        this.properties = _properties;
        this.properties.onRender = this._render.bind(this);
        this.properties.onDispose = this._dispose.bind(this);
    }
    _render(elem, context, changeCallback) {
        const props = omit(this.properties);
        const element = React.createElement(PropertyFieldLinkHost, Object.assign({}, props));
        ReactDOM.render(element, elem);
    }
    _dispose(elem) {
        ReactDOM.unmountComponentAtNode(elem);
    }
}
/**
 * Helper method to create a Link with Callout component on the PropertyPane.
 * @param targetProperty - Target property the Link with Callout component is associated to.
 * @param properties - Strongly typed Link with Callout component properties.
 */
export function PropertyFieldLinkWithCallout(targetProperty, properties) {
    return new PropertyFieldLinkWithCalloutBuilder(targetProperty, Object.assign(Object.assign({}, properties), { onRender: null, onDispose: null }));
}
//# sourceMappingURL=PropertyFieldLinkWithCallout.js.map