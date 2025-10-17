import * as React from 'react';
import * as ReactDom from 'react-dom';
import PropertyPaneMarkdownContentHost from './PropertyPaneMarkdownContentHost';
import { PropertyPaneFieldType } from '@microsoft/sp-property-pane';
class PropertyPaneMarkdownContentBuilder {
    constructor(_properties) {
        this.type = PropertyPaneFieldType.Custom;
        this.properties = {
            key: _properties.key,
            label: _properties.label,
            markdown: _properties.markdown,
            options: _properties.options,
            onRender: this.onRender.bind(this),
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
        const element = React.createElement(PropertyPaneMarkdownContentHost, {
            description: this.properties.label,
            markdown: this.properties.markdown,
            markdownProps: this.properties.options
        });
        ReactDom.render(element, elem);
    }
}
/**
 * Creates a property pane section that displays read-only markdown content.
 * Use this property pane control to display additional instructions, help
 * screens, etc.
 *
 * @param properties
 */
export function PropertyPaneMarkdownContent(properties) {
    return new PropertyPaneMarkdownContentBuilder(properties);
}
//# sourceMappingURL=PropertyPaneMarkdownContent.js.map