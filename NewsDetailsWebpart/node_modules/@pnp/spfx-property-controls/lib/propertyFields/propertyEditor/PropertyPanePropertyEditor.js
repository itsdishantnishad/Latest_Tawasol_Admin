import * as React from 'react';
import * as ReactDom from 'react-dom';
import { PropertyPaneFieldType } from '@microsoft/sp-property-pane';
import PropertyPanePropertyEditorHost from './PropertyPanePropertyEditorHost';
class PropertyPanePropertyEditorBuilder {
    constructor(_properties) {
        //Properties defined by IPropertyPaneField
        this.type = PropertyPaneFieldType.Custom;
        this.properties = {
            key: _properties.key,
            webpart: _properties.webpart,
            onRender: this.onRender.bind(this)
        };
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
        const element = React.createElement(PropertyPanePropertyEditorHost, {
            webpart: this.properties.webpart
        });
        ReactDom.render(element, elem);
    }
}
export function PropertyPanePropertyEditor(properties) {
    return new PropertyPanePropertyEditorBuilder(properties);
}
//# sourceMappingURL=PropertyPanePropertyEditor.js.map