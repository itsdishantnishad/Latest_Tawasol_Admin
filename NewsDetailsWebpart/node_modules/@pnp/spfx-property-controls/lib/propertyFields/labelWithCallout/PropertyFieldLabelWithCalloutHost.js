import * as React from 'react';
import PlaceholderWithCallout from '../../common/placeholderWithCallout/PlaceholderWithCallout';
import * as telemetry from '../../common/telemetry';
import { Label } from '@fluentui/react';
/**
* Renders the control for PropertyFieldLabelWithCallout component
*/
export default class PropertyFieldLabelHost extends React.Component {
    constructor(props) {
        super(props);
        telemetry.track('PropertyFieldLabel', {
            disabled: props.disabled
        });
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(PlaceholderWithCallout, Object.assign({}, this.props),
                React.createElement(Label, Object.assign({}, this.props), this.props.text))));
    }
}
//# sourceMappingURL=PropertyFieldLabelWithCalloutHost.js.map