import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PropertyPaneFieldType } from '@microsoft/sp-property-pane';
import PropertyFieldToggleWithCalloutHost from './PropertyFieldToggleWithCalloutHost';
class PropertyFieldToggleWithCalloutBuilder {
    constructor(_targetProperty, _properties) {
        this.type = PropertyPaneFieldType.Custom;
        this.targetProperty = _targetProperty;
        this.properties = _properties;
        this.properties.onRender = this._render.bind(this);
        this.properties.onDispose = this._dispose.bind(this);
    }
    _render(elem, context, changeCallback) {
        const props = this.properties;
        const element = React.createElement(PropertyFieldToggleWithCalloutHost, Object.assign(Object.assign({}, props), { onChanged: this._onChanged.bind(this) }));
        ReactDOM.render(element, elem);
        if (changeCallback) {
            this._onChangeCallback = changeCallback;
        }
    }
    _dispose(elem) {
        ReactDOM.unmountComponentAtNode(elem);
    }
    _onChanged(checked) {
        if (this._onChangeCallback) {
            this._onChangeCallback(this.targetProperty, checked);
        }
    }
}
export function PropertyFieldToggleWithCallout(targetProperty, properties) {
    return new PropertyFieldToggleWithCalloutBuilder(targetProperty, Object.assign(Object.assign({}, properties), { onRender: null, onDispose: null }));
}
//# sourceMappingURL=PropertyFieldToggleWithCallout.js.map