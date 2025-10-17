import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PropertyPaneFieldType } from '@microsoft/sp-property-pane';
import PropertyFieldDropdownHost from './PropertyFieldDropdownWithCalloutHost';
import omit from 'lodash/omit';
class PropertyFieldDropdownWithCalloutBuilder {
    constructor(_targetProperty, _properties) {
        this.type = PropertyPaneFieldType.Custom;
        this.targetProperty = _targetProperty;
        this.properties = _properties;
        this.properties.onRender = this._render.bind(this);
        this.properties.onDispose = this._dispose.bind(this);
    }
    _render(elem, context, changeCallback) {
        const props = this.properties;
        const element = React.createElement(PropertyFieldDropdownHost, Object.assign(Object.assign({}, omit(props, ['options', 'ariaPositionInSet', 'ariaSetSize'])), { options: props.options || [], onChanged: this._onChanged.bind(this) }));
        ReactDOM.render(element, elem);
        if (changeCallback) {
            this._onChangeCallback = changeCallback;
        }
    }
    _dispose(elem) {
        ReactDOM.unmountComponentAtNode(elem);
    }
    _onChanged(item) {
        if (this._onChangeCallback) {
            this._onChangeCallback(this.targetProperty, item.key);
        }
    }
}
export function PropertyFieldDropdownWithCallout(targetProperty, properties) {
    return new PropertyFieldDropdownWithCalloutBuilder(targetProperty, Object.assign(Object.assign({}, properties), { onRender: null, onDispose: null }));
}
//# sourceMappingURL=PropertyFieldDropdownWithCallout.js.map