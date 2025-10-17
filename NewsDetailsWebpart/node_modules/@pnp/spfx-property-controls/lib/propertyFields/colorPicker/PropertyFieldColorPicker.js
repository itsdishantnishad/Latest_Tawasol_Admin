import { PropertyPaneFieldType } from '@microsoft/sp-property-pane';
import { getColorFromString } from '@fluentui/react';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { setPropertyValue } from '../../helpers/GeneralHelper';
import { debounce } from '../../common/util/Util';
import { PropertyFieldColorPickerStyle, } from './IPropertyFieldColorPicker';
import PropertyFieldColorPickerHost from './PropertyFieldColorPickerHost';
class PropertyFieldColorPickerBuilder {
    constructor(_targetProperty, _properties) {
        //Properties defined by IPropertyPaneField
        this.type = PropertyPaneFieldType.Custom;
        this._debounce = debounce(); // eslint-disable-line @typescript-eslint/no-explicit-any
        this.targetProperty = _targetProperty;
        this.properties = {
            key: _properties.key,
            label: _properties.label,
            onPropertyChange: _properties.onPropertyChange,
            selectedColor: _properties.selectedColor,
            disabled: _properties.disabled,
            debounce: _properties.debounce,
            isHidden: _properties.isHidden,
            alphaSliderHidden: _properties.alphaSliderHidden,
            showPreview: _properties.showPreview,
            properties: _properties.properties,
            style: _properties.style,
            iconName: _properties.iconName,
            onRender: this.onRender.bind(this)
        };
        if (typeof _properties.selectedColor === 'undefined') {
            this.color = '#ffffff';
        }
        else {
            if (typeof _properties.selectedColor === 'string') {
                this.color = _properties.selectedColor;
            }
            else {
                this.color = _properties.selectedColor.str;
            }
        }
        this.valueAsObject = _properties.valueAsObject;
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
        const element = React.createElement(PropertyFieldColorPickerHost, {
            label: this.properties.label,
            alphaSliderHidden: this.properties.alphaSliderHidden,
            showPreview: this.properties.showPreview,
            disabled: this.properties.disabled,
            debounce: this.properties.debounce,
            isHidden: this.properties.isHidden,
            selectedColor: this.color,
            style: this.properties.style || PropertyFieldColorPickerStyle.Inline,
            iconName: this.properties.iconName || 'Color',
            onColorChanged: this.onColorChanged.bind(this)
        });
        ReactDom.render(element, elem);
    }
    onColorChanged(newColor) {
        if (this.properties.onPropertyChange && newColor !== null) {
            const newValue = (this.valueAsObject ? getColorFromString(newColor) : newColor);
            const oldValue = (this.valueAsObject ? getColorFromString(this.color) : this.color);
            this.color = newColor;
            if (this.properties.debounce) {
                this._debounce(() => {
                    this.onColorChangedInternal(oldValue, newValue);
                }, this.properties.debounce);
            }
            else {
                this.onColorChangedInternal(oldValue, newValue);
            }
        }
    }
    onColorChangedInternal(oldValue, newValue) {
        this.properties.onPropertyChange(this.targetProperty, oldValue, newValue);
        setPropertyValue(this.properties.properties, this.targetProperty, newValue);
        if (typeof this.changeCB !== 'undefined' && this.changeCB !== null) {
            this.changeCB(this.targetProperty, newValue);
        }
    }
}
export function PropertyFieldColorPicker(targetProperty, properties) {
    return new PropertyFieldColorPickerBuilder(targetProperty, properties);
}
//# sourceMappingURL=PropertyFieldColorPicker.js.map