import * as React from 'react';
import * as strings from 'PropertyControlStrings';
import * as telemetry from '../../common/telemetry';
export default class PropertyPaneWebPartInformationHost extends React.Component {
    constructor(props) {
        super(props);
        telemetry.track('PropertyWebPartInformation', {});
    }
    render() {
        let iframeElm = null;
        const { videoProperties } = this.props;
        if (videoProperties && videoProperties.embedLink !== "") {
            const linkProperties = {};
            linkProperties.src = videoProperties.embedLink;
            if (videoProperties.height) {
                linkProperties.height = videoProperties.height;
            }
            if (videoProperties.width) {
                linkProperties.width = videoProperties.width;
            }
            for (const prop in videoProperties.properties) {
                if (Object.prototype.hasOwnProperty.call(videoProperties.properties, prop)) {
                    linkProperties[prop] = this.props.videoProperties[prop];
                }
            }
            iframeElm = React.createElement("iframe", Object.assign({}, linkProperties));
        }
        return (React.createElement("div", null,
            React.createElement("div", { dangerouslySetInnerHTML: { __html: this.props.description } }),
            this.props.moreInfoLink && (React.createElement("div", null,
                React.createElement("a", { href: this.props.moreInfoLink, target: this.props.moreInfoLinkTarget }, strings.MoreInfoLabel))),
            iframeElm));
    }
}
//# sourceMappingURL=PropertyPaneWebPartInformationHost.js.map