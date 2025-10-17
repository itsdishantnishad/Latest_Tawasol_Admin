import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PropertyPaneFieldType, } from '@microsoft/sp-property-pane';
import PropertyFieldMultiSelectHost from './PropertyFieldMultiSelectHost';
import { cloneDeep } from '@microsoft/sp-lodash-subset';
import omit from 'lodash/omit';
class PropertyFieldMultiSelectBuilder {
    constructor(_targetProperty, _properties) {
        this.type = PropertyPaneFieldType.Custom;
        this.targetProperty = _targetProperty;
        this.properties = _properties;
        this.properties.onRender = this._render.bind(this);
        this.properties.onDispose = this._dispose.bind(this);
    }
    _render(elem, context, changeCallback) {
        const props = this.properties;
        const element = React.createElement(PropertyFieldMultiSelectHost, Object.assign(Object.assign({}, omit(props, ['options', 'ariaPositionInSet', 'ariaSetSize'])), { options: props.options || [], onChanged: this._onChanged.bind(this) }));
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
            // Get all the selected keys
            const updateSelectedKeys = this.properties.selectedKeys ? cloneDeep(this.properties.selectedKeys) : [];
            // Check if item got selected
            if (item.selected) {
                updateSelectedKeys.push(item.key);
            }
            else {
                // Remove the item from the selected keys list
                const itemIdx = updateSelectedKeys.indexOf(item.key);
                if (itemIdx > -1) {
                    updateSelectedKeys.splice(itemIdx, 1);
                }
            }
            this._onChangeCallback(this.targetProperty, updateSelectedKeys);
        }
    }
}
export function PropertyFieldMultiSelect(targetProperty, properties) {
    return new PropertyFieldMultiSelectBuilder(targetProperty, Object.assign(Object.assign({}, properties), { onRender: null, onDispose: null }));
}
//# sourceMappingURL=PropertyFieldMultiSelect.js.map