import * as React from 'react';
import * as ReactDom from 'react-dom';
import { PropertyPaneFieldType } from '@microsoft/sp-property-pane';
import PropertyFieldSpinButtonHost from './PropertyFieldSpinButtonHost';
import { setPropertyValue } from '../../helpers/GeneralHelper';
class PropertyFieldSpinButtonBuilder {
    constructor(_targetProperty, _properties) {
        //Properties defined by IPropertyPaneField
        this.type = PropertyPaneFieldType.Custom;
        this.targetProperty = _targetProperty;
        this.properties = {
            key: _properties.key,
            label: _properties.label,
            step: _properties.step || 1,
            min: _properties.min,
            max: _properties.max,
            onPropertyChange: _properties.onPropertyChange,
            disabled: _properties.disabled,
            properties: _properties.properties,
            incrementIconName: _properties.incrementIconName,
            decrementIconName: _properties.decrementIconName,
            suffix: _properties.suffix,
            decimalPlaces: _properties.decimalPlaces || 0,
            onRender: this.onRender.bind(this)
        };
        this.svalue = _properties.initialValue || this.properties.min || 0;
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
        const element = React.createElement(PropertyFieldSpinButtonHost, {
            label: this.properties.label,
            disabled: this.properties.disabled,
            value: this.formatValueString(this.svalue),
            incrementIconName: this.properties.incrementIconName || 'ChevronUpSmall',
            decrementIconName: this.properties.decrementIconName || 'ChevronDownSmall',
            onValidate: this.validate.bind(this),
            onIncrement: this.increment.bind(this),
            onDecrement: this.decrement.bind(this)
        });
        ReactDom.render(element, elem);
    }
    validate(rawValue) {
        const numValue = this.extractNumValue(rawValue);
        return this.validateNumber(numValue);
    }
    validateNumber(numValue) {
        // Check against max value
        if (typeof this.properties.max !== "undefined" && numValue > this.properties.max) {
            numValue = this.properties.max;
        }
        // Check against min value
        if (typeof this.properties.min !== "undefined" && numValue < this.properties.min) {
            numValue = this.properties.min;
        }
        //ensure matching rounding for decimals
        numValue = +numValue.toFixed(this.properties.decimalPlaces);
        //Check for change and notify
        if (numValue !== this.svalue) {
            this.onValueChanged(numValue);
        }
        return this.formatValueString(numValue);
    }
    increment(rawValue) {
        let numValue = this.extractNumValue(rawValue);
        numValue += this.properties.step;
        return this.validateNumber(numValue);
    }
    decrement(rawValue) {
        let numValue = this.extractNumValue(rawValue);
        numValue -= this.properties.step;
        return this.validateNumber(numValue);
    }
    extractNumValue(rawValue) {
        let numValue;
        const baseValue = this.removeSuffix(rawValue);
        if (isNaN(+baseValue)) {
            if (this.properties.min) {
                numValue = Math.max(this.properties.min, 0);
            }
            else {
                numValue = 0;
            }
        }
        else {
            numValue = +baseValue;
        }
        return numValue;
    }
    hasSuffix(rawValue) {
        if (!this.properties.suffix) {
            return false;
        }
        const subString = rawValue.substr(rawValue.length - this.properties.suffix.length);
        return subString === this.properties.suffix;
    }
    removeSuffix(rawValue) {
        if (!this.hasSuffix(rawValue)) {
            return rawValue;
        }
        return rawValue.substr(0, rawValue.length - this.properties.suffix.length);
    }
    formatValueString(numValue) {
        return this.addSuffix(numValue.toFixed(this.properties.decimalPlaces));
    }
    addSuffix(stringValue) {
        if (!this.properties.suffix) {
            return stringValue;
        }
        return stringValue + this.properties.suffix;
    }
    onValueChanged(newValue) {
        if (this.properties.onPropertyChange && newValue !== null) {
            this.properties.onPropertyChange(this.targetProperty, this.svalue, newValue);
            this.svalue = newValue;
            setPropertyValue(this.properties.properties, this.targetProperty, newValue);
            if (typeof this.changeCB !== 'undefined' && this.changeCB !== null) {
                this.changeCB(this.targetProperty, newValue);
            }
        }
    }
}
export function PropertyFieldSpinButton(targetProperty, properties) {
    return new PropertyFieldSpinButtonBuilder(targetProperty, properties);
}
//# sourceMappingURL=PropertyFieldSpinButton.js.map