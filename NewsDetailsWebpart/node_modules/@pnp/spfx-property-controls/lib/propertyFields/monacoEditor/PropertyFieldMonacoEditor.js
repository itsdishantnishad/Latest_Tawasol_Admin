import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PropertyPaneFieldType, } from '@microsoft/sp-property-pane';
import PropertyFieldMonacoEditorHost from './PropertyFieldMonacoEditorHost';
class PropertyFieldMonacoEditorBuilder {
    constructor(_targetProperty, _properties) {
        this.type = PropertyPaneFieldType.Custom;
        this.targetProperty = _targetProperty;
        this.properties = _properties;
        this.properties.onRender = this._render.bind(this);
        this.properties.onDispose = this._dispose.bind(this);
    }
    _render(elem, context, changeCallback) {
        const props = this.properties;
        const element = React.createElement(PropertyFieldMonacoEditorHost, Object.assign(Object.assign({}, props), { onPropertyChange: this._onValueChanged.bind(this) }));
        ReactDOM.render(element, elem);
        if (changeCallback) {
            this._onChangeCallback = changeCallback;
        }
    }
    _dispose(elem) {
        ReactDOM.unmountComponentAtNode(elem);
    }
    _onValueChanged(value, validationErrors) {
        if (this._onChangeCallback) {
            this._onChangeCallback(this.targetProperty, value);
            this.properties.onChange(value);
        }
    }
}
export function PropertyFieldMonacoEditor(targetProperty, properties) {
    return new PropertyFieldMonacoEditorBuilder(targetProperty, Object.assign(Object.assign({}, properties), { onRender: null, onDispose: null }));
}
//# sourceMappingURL=PropertyFieldMonacoEditor.js.map