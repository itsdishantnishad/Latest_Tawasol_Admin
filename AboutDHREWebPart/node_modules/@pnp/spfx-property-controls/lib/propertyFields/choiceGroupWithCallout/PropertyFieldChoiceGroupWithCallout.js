/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import omit from 'lodash/omit';
import { PropertyPaneFieldType, } from '@microsoft/sp-property-pane';
import PropertyFieldToggleWithCalloutHost from './PropertyFieldChoiceGroupWithCalloutHost';
class PropertyFieldChoiceGroupWithCalloutBuilder {
    constructor(_targetProperty, _properties) {
        this.type = PropertyPaneFieldType.Custom;
        this.targetProperty = _targetProperty;
        this.properties = _properties;
        this.properties.onRender = this._render.bind(this);
        this.properties.onDispose = this._dispose.bind(this);
    }
    _render(elem, context, changeCallback) {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        // IPropertyPaneChoiceGroupOption should be manually converted to IChoiceGroupOption
        const options = [];
        let selectedKey = undefined;
        this.properties.options.forEach((o) => {
            options.push(Object.assign(Object.assign({}, omit(o, ['key', 'iconProps'])), { iconProps: o.iconProps && {
                    iconName: o.iconProps.officeFabricIconFontName,
                }, key: o.key.toString() }));
            if (o.checked) {
                selectedKey = o.key;
            }
        });
        const props = this.properties;
        const element = React.createElement(PropertyFieldToggleWithCalloutHost, Object.assign(Object.assign({}, omit(props, ['options'])), { options: options, onChange: this._onChanged.bind(this), selectedKey: selectedKey }));
        ReactDOM.render(element, elem);
        if (changeCallback) {
            this._onChangeCallback = changeCallback;
        }
    }
    _dispose(elem) {
        ReactDOM.unmountComponentAtNode(elem);
    }
    _onChanged(ev, option) {
        if (this._onChangeCallback && option) {
            this._onChangeCallback(this.targetProperty, option.key);
        }
    }
}
export function PropertyFieldChoiceGroupWithCallout(targetProperty, properties) {
    return new PropertyFieldChoiceGroupWithCalloutBuilder(targetProperty, Object.assign(Object.assign({}, properties), { onRender: null, onDispose: null }));
}
//# sourceMappingURL=PropertyFieldChoiceGroupWithCallout.js.map