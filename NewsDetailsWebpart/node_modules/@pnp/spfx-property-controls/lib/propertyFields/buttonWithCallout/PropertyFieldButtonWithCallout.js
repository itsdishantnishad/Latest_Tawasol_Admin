import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PropertyPaneFieldType, } from '@microsoft/sp-property-pane';
import PropertyFieldButtonHost from './PropertyFieldButtonWithCalloutHost';
import { ButtonType } from '@fluentui/react';
import omit from 'lodash/omit';
/**
 * Represents a PropertyFieldButtonWithCallout object
 */
class PropertyFieldButtonWithCalloutBuilder {
    constructor(_targetProperty, _properties) {
        this.type = PropertyPaneFieldType.Custom;
        this.targetProperty = _targetProperty;
        this.properties = _properties;
        this.properties.onRender = this._render.bind(this);
        this.properties.onDispose = this._dispose.bind(this);
    }
    _render(elem, context, changeCallback) {
        const props = this.properties;
        //
        // PropertyPaneButtonType is not assignable to ButtonType
        //
        const buttonTypeString = ButtonType[this.properties.buttonType];
        const buttonType = ButtonType[buttonTypeString];
        const element = React.createElement(PropertyFieldButtonHost, Object.assign(Object.assign({}, omit(props, ['icon', 'buttonType'])), { buttonType: buttonType }));
        ReactDOM.render(element, elem);
    }
    _dispose(elem) {
        ReactDOM.unmountComponentAtNode(elem);
    }
}
/**
 * Helper method to create a Button with Callout component on the PropertyPane.
 * @param targetProperty - Target property the Button with Callout component is associated to.
 * @param properties - Strongly typed Button with Callout component properties.
 */
export function PropertyFieldButtonWithCallout(targetProperty, properties) {
    return new PropertyFieldButtonWithCalloutBuilder(targetProperty, Object.assign(Object.assign({}, properties), { onRender: null, onDispose: null }));
}
//# sourceMappingURL=PropertyFieldButtonWithCallout.js.map