/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PropertyPaneFieldType, } from '@microsoft/sp-property-pane';
import PropertyFieldGridControl from './PropertyFieldGridControl';
class PropertyFieldGridBuilder {
    constructor(targetProperty, properties) {
        this.type = PropertyPaneFieldType.Custom;
        this.targetProperty = targetProperty;
        this.properties = properties;
        this.properties.onRender = this.render.bind(this);
        this.properties.onDispose = this._dispose.bind(this);
    }
    render(elem, context, changeCallback) {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        const props = this.properties;
        const element = React.createElement(PropertyFieldGridControl, Object.assign(Object.assign({}, props), { onSelected: this.onSeleted.bind(this) }));
        if (changeCallback) {
            this._onChangeCallback = changeCallback;
        }
        ReactDOM.render(element, elem);
    }
    onSeleted(items) {
        this.properties.onSelected(items);
        if (this._onChangeCallback) {
            this._onChangeCallback(this.targetProperty, items);
        }
        this.targetProperty = items;
    }
    _dispose(elem) {
        ReactDOM.unmountComponentAtNode(elem);
    }
}
export function PropertyFieldGrid(targetProperty, properties) {
    return new PropertyFieldGridBuilder(targetProperty, Object.assign(Object.assign({}, properties), { onRender: null, onDispose: null }));
}
//# sourceMappingURL=PropertyFieldGrid.js.map