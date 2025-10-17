import * as React from 'react';
import PlaceholderWithCallout from '../../common/placeholderWithCallout/PlaceholderWithCallout';
import * as telemetry from '../../common/telemetry';
import { Link } from '@fluentui/react';
/**
* Renders the control for PropertyFieldLinkWithCallout component
*/
export default class PropertyFieldLinkHost extends React.Component {
    constructor(props) {
        super(props);
        telemetry.track('PropertyFieldLink', {
            disabled: props.disabled
        });
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(PlaceholderWithCallout, Object.assign({}, this.props),
                React.createElement(Link, Object.assign({}, this.props), this.props.text))));
    }
}
//# sourceMappingURL=PropertyFieldLinkWithCalloutHost.js.map