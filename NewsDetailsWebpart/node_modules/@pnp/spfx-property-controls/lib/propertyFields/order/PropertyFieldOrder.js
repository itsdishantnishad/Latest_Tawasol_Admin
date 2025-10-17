import { PropertyPaneFieldType } from '@microsoft/sp-property-pane';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { setPropertyValue } from '../../helpers/GeneralHelper';
import PropertyFieldOrderHost from './PropertyFieldOrderHost';
class PropertyFieldOrderBuilder {
    constructor(_targetProperty, _properties) {
        //Properties defined by IPropertyPaneField
        this.type = PropertyPaneFieldType.Custom;
        this.targetProperty = _targetProperty;
        this.properties = {
            key: _properties.key,
            label: _properties.label,
            onPropertyChange: _properties.onPropertyChange,
            disabled: _properties.disabled,
            properties: _properties.properties,
            items: _properties.items,
            textProperty: _properties.textProperty,
            moveUpIconName: _properties.moveUpIconName,
            moveDownIconName: _properties.moveDownIconName,
            disableDragAndDrop: _properties.disableDragAndDrop,
            removeArrows: _properties.removeArrows,
            maxHeight: _properties.maxHeight,
            onRenderItem: _properties.onRenderItem,
            onRender: this.onRender.bind(this)
        };
        this.items = _properties.items;
    }
    render() {
        if (!this.elem) {
            return;
        }
        this.onRender(this.elem);
    }
    onRender(elem, ctx, changeCallback) {
        if (!this.elem) {
            this.elem = elem;
        }
        this.changeCB = changeCallback;
        const element = React.createElement(PropertyFieldOrderHost, {
            label: this.properties.label,
            disabled: this.properties.disabled,
            items: this.items,
            textProperty: this.properties.textProperty,
            moveUpIconName: this.properties.moveUpIconName || 'ChevronUpSmall',
            moveDownIconName: this.properties.moveDownIconName || 'ChevronDownSmall',
            disableDragAndDrop: this.properties.disableDragAndDrop,
            removeArrows: this.properties.removeArrows,
            maxHeight: this.properties.maxHeight,
            onRenderItem: this.properties.onRenderItem,
            valueChanged: this.onValueChanged.bind(this)
        });
        ReactDom.render(element, elem);
    }
    onValueChanged(newValue) {
        if (this.properties.onPropertyChange && newValue !== null) {
            this.properties.onPropertyChange(this.targetProperty, this.items, newValue);
            this.items = newValue;
            setPropertyValue(this.properties.properties, this.targetProperty, newValue);
            if (typeof this.changeCB !== 'undefined' && this.changeCB !== null) {
                this.changeCB(this.targetProperty, newValue);
            }
        }
    }
}
export function PropertyFieldOrder(targetProperty, properties) {
    return new PropertyFieldOrderBuilder(targetProperty, properties);
}
//# sourceMappingURL=PropertyFieldOrder.js.map