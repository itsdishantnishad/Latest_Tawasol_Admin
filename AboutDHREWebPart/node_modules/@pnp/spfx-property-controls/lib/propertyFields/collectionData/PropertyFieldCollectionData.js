import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PropertyPaneFieldType, } from '@microsoft/sp-property-pane';
import { PropertyFieldCollectionDataHost } from './PropertyFieldCollectionDataHost';
/**
 * Property Field Collection Data Builder Class
 */
class PropertyFieldCollectionDataBuilder {
    constructor(_targetProperty, _properties) {
        this.type = PropertyPaneFieldType.Custom;
        this.targetProperty = _targetProperty;
        this.properties = _properties;
        this.properties.onRender = this.render.bind(this);
        this.properties.onDispose = this.dispose.bind(this);
    }
    render(elem, context, changeCallback) {
        const props = this.properties;
        const element = React.createElement(PropertyFieldCollectionDataHost, Object.assign(Object.assign({}, props), { onChanged: this.onChanged.bind(this) }));
        ReactDOM.render(element, elem);
        if (changeCallback) {
            this._onChangeCallback = changeCallback;
        }
    }
    /**
     * Dispose the property field
     */
    dispose(elem) {
        ReactDOM.unmountComponentAtNode(elem);
    }
    /**
     * On field change event handler
     * @param value
     */
    onChanged(value) {
        if (this._onChangeCallback) {
            this._onChangeCallback(this.targetProperty, value);
        }
    }
}
/**
 * Property field
 * @param targetProperty
 * @param properties
 */
export function PropertyFieldCollectionData(targetProperty, properties) {
    return new PropertyFieldCollectionDataBuilder(targetProperty, Object.assign(Object.assign({}, properties), { onRender: null, onDispose: null }));
}
//# sourceMappingURL=PropertyFieldCollectionData.js.map