import * as React from 'react';
import * as ReactDom from 'react-dom';
import { PropertyPaneFieldType } from '@microsoft/sp-property-pane';
import PropertyPaneWebPartInformationHost from './PropertyPaneWebPartInformationHost';
class PropertyPaneWebPartInformationBuilder {
    constructor(_properties) {
        this.type = PropertyPaneFieldType.Custom;
        this.properties = {
            key: _properties.key,
            moreInfoLink: _properties.moreInfoLink,
            moreInfoLinkTarget: _properties.moreInfoLinkTarget !== undefined ? _properties.moreInfoLinkTarget : "_blank",
            videoProperties: _properties.videoProperties,
            description: _properties.description,
            onRender: this.onRender.bind(this)
        };
    }
    render() {
        if (!this.elem) {
            return;
        }
        this.onRender(this.elem);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onRender(elem, ctx, changeCallback) {
        if (!this.elem) {
            this.elem = elem;
        }
        const element = React.createElement(PropertyPaneWebPartInformationHost, {
            moreInfoLink: this.properties.moreInfoLink,
            moreInfoLinkTarget: this.properties.moreInfoLinkTarget,
            description: this.properties.description,
            videoProperties: this.properties.videoProperties
        });
        ReactDom.render(element, elem);
    }
}
export function PropertyPaneWebPartInformation(properties) {
    return new PropertyPaneWebPartInformationBuilder(properties);
}
//# sourceMappingURL=PropertyPaneWebPartInformation.js.map