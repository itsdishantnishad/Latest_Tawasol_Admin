import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PropertyPaneFieldType, } from '@microsoft/sp-property-pane';
import PropertyFieldPasswordHost from './PropertyFieldPasswordHost';
class PropertyFieldPasswordBuilder {
    constructor(_targetProperty, _properties) {
        this.type = PropertyPaneFieldType.Custom;
        this.targetProperty = _targetProperty;
        this.properties = _properties;
        this.properties.onRender = this._render.bind(this);
        this.properties.onDispose = this._dispose.bind(this);
    }
    _render(elem, context, changeCallback) {
        const props = this.properties;
        const element = React.createElement(PropertyFieldPasswordHost, Object.assign(Object.assign({}, props), { onChanged: this._onChanged.bind(this) }));
        ReactDOM.render(element, elem);
        if (changeCallback) {
            this._onChangeCallback = changeCallback;
        }
    }
    _dispose(elem) {
        ReactDOM.unmountComponentAtNode(elem);
    }
    _onChanged(value) {
        if (this._onChangeCallback) {
            this._onChangeCallback(this.targetProperty, value);
        }
    }
}
export function PropertyFieldPassword(targetProperty, properties) {
    return new PropertyFieldPasswordBuilder(targetProperty, Object.assign(Object.assign({}, properties), { onChanged: properties.onChanged, onRender: null, onDispose: null }));
}
//# sourceMappingURL=PropertyFieldPassword.js.map