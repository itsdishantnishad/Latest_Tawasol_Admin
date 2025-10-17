import * as React from 'react';
import * as ReactDom from 'react-dom';
import { PropertyPaneFieldType } from '@microsoft/sp-property-pane';
import PropertyFieldEditableComboBoxHost from './PropertyFieldEditableComboBoxHost';
class PropertyFieldEditableComboBoxBuilder {
    //private changeCB?: (text: string, wasAdded: boolean) => void;
    constructor(_targetProperty, _properties) {
        //Properties defined by IPropertyPaneField
        this.type = PropertyPaneFieldType.Custom;
        this.targetProperty = _targetProperty;
        this.properties = {
            key: _properties.key,
            disabled: _properties.disabled,
            label: _properties.label,
            maxFillInLength: _properties.maxFillInLength,
            onPropertyChange: _properties.onPropertyChange,
            onOptionAdded: _properties.onOptionAdded,
            options: _properties.options,
            selectedText: _properties.selectedText,
            showTooltip: _properties.showTooltip,
            tooltipText: _properties.tooltipText,
            properties: _properties.properties,
            onRender: this.onRender.bind(this)
        };
        this.currentOptionText = _properties.selectedText;
    }
    render() {
        if (!this.elem) {
            return;
        }
        this.onRender(this.elem);
    }
    onRender(elem) {
        if (!this.elem) {
            this.elem = elem;
        }
        //Render the property in our PropertyPane
        const element = React.createElement(PropertyFieldEditableComboBoxHost, {
            key: this.properties.key,
            disabled: this.properties.disabled,
            label: this.properties.label,
            options: this.properties.options,
            selectedText: this.properties.selectedText,
            maxFillInLength: this.properties.maxFillInLength,
            showTooltip: this.properties.showTooltip,
            tooltipText: this.properties.tooltipText,
            onOptionChanged: this.onOptionChanged.bind(this)
        });
        ReactDom.render(element, elem);
    }
    onOptionChanged(text, wasAdded) {
        if (this.properties !== undefined) {
            if (this.properties.onPropertyChange && text !== null) {
                const newOption = text;
                const oldOption = this.currentOptionText;
                this.currentOptionText = newOption;
                this.properties.onPropertyChange(this.targetProperty, oldOption, newOption);
                this.properties.properties[this.targetProperty] = newOption;
                if (wasAdded) {
                    this.properties.onOptionAdded(text);
                }
            }
        }
    }
}
export function PropertyFieldEditableComboBox(targetProperty, properties) {
    return new PropertyFieldEditableComboBoxBuilder(targetProperty, properties);
}
//# sourceMappingURL=PropertyFieldEditableComboBox.js.map