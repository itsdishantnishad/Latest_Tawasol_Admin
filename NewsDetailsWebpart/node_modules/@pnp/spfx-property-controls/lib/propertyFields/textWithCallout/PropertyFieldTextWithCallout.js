import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PropertyPaneFieldType } from '@microsoft/sp-property-pane';
import PropertyFieldTextWithCalloutHost from './PropertyFieldTextWithCalloutHost';
import omit from 'lodash/omit';
class PropertyFieldTextWithCalloutBuilder {
    constructor(_targetProperty, _properties) {
        this.type = PropertyPaneFieldType.Custom;
        this.targetProperty = _targetProperty;
        this.properties = _properties;
        this.properties.onRender = this._render.bind(this);
        this.properties.onDispose = this._dispose.bind(this);
        this.properties.onChanged = this._onChanged.bind(this);
    }
    _render(elem, context, changeCallback) {
        const props = this.properties;
        const element = React.createElement(PropertyFieldTextWithCalloutHost, Object.assign(Object.assign({}, omit(props, ['logName'])), { onNotifyValidationResult: this._onValidated.bind(this), onChanged: this._onChanged.bind(this) }));
        ReactDOM.render(element, elem);
        if (changeCallback) {
            this._onChangeCallback = changeCallback;
        }
    }
    _dispose(elem) {
        ReactDOM.unmountComponentAtNode(elem);
    }
    _onValidated(errorMessage, value) {
        if (!errorMessage && this._onChangeCallback) {
            this._onChangeCallback(this.targetProperty, value);
        }
    }
    _onChanged(value) {
        if (this._onChangeCallback) {
            this._onChangeCallback(this.targetProperty, value);
        }
    }
}
export function PropertyFieldTextWithCallout(targetProperty, properties) {
    return new PropertyFieldTextWithCalloutBuilder(targetProperty, Object.assign(Object.assign({}, properties), { onChanged: properties.onChanged, onRender: null, onDispose: null }));
}
//# sourceMappingURL=PropertyFieldTextWithCallout.js.map