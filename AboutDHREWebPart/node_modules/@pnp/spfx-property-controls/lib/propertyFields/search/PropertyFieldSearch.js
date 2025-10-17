import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PropertyPaneFieldType, } from '@microsoft/sp-property-pane';
import PropertyFieldSearchHost from './PropertyFieldSearchHost';
class PropertyFieldSearchBuilder {
    constructor(_targetProperty, _properties) {
        this.type = PropertyPaneFieldType.Custom;
        this.targetProperty = _targetProperty;
        this.properties = _properties;
        this.properties.onRender = this._render.bind(this);
        this.properties.onDispose = this._dispose.bind(this);
    }
    _render(elem, context, changeCallback) {
        const props = this.properties;
        const element = React.createElement(PropertyFieldSearchHost, Object.assign(Object.assign({}, props), { onChange: this._onChanged.bind(this) }));
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
export function PropertyFieldSearch(targetProperty, properties) {
    return new PropertyFieldSearchBuilder(targetProperty, Object.assign(Object.assign({}, properties), { onChange: properties.onChange, onClear: properties.onClear, onEscape: properties.onEscape, onSearch: properties.onSearch, onRender: null, onDispose: null }));
}
//# sourceMappingURL=PropertyFieldSearch.js.map