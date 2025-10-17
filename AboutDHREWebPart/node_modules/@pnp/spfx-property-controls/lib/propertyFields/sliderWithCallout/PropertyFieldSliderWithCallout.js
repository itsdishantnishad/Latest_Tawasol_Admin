import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PropertyPaneFieldType } from '@microsoft/sp-property-pane';
import PropertyFieldSliderWithCalloutHost from './PropertyFieldSliderWithCalloutHost';
import { debounce } from '../../common/util/Util';
class PropertyFieldSliderWithCalloutBuilder {
    constructor(_targetProperty, _properties) {
        this.type = PropertyPaneFieldType.Custom;
        this._debounce = debounce();
        this.targetProperty = _targetProperty;
        this.properties = _properties;
        this.properties.onRender = this._render.bind(this);
        this.properties.onDispose = this._dispose.bind(this);
    }
    _render(elem, context, changeCallback) {
        const props = this.properties;
        const element = React.createElement(PropertyFieldSliderWithCalloutHost, Object.assign(Object.assign({}, props), { onChange: this._onChanged.bind(this) }));
        ReactDOM.render(element, elem);
        if (changeCallback) {
            this._onChangeCallback = changeCallback;
        }
    }
    _dispose(elem) {
        ReactDOM.unmountComponentAtNode(elem);
    }
    _onChanged(value) {
        const props = this.properties;
        if (this._onChangeCallback) {
            if (props.debounce) {
                this._debounce(() => { console.log(`Debounced after ${props.debounce}`); this._onChangeCallback(this.targetProperty, value); }, props.debounce);
            }
            else {
                this._onChangeCallback(this.targetProperty, value);
            }
        }
    }
}
export function PropertyFieldSliderWithCallout(targetProperty, properties) {
    return new PropertyFieldSliderWithCalloutBuilder(targetProperty, Object.assign(Object.assign({}, properties), { onRender: null, onDispose: null }));
}
//# sourceMappingURL=PropertyFieldSliderWithCallout.js.map