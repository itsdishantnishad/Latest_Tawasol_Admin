import * as React from 'react';
import { Button } from '@fluentui/react';
import PlaceholderWithCallout from '../../common/placeholderWithCallout/PlaceholderWithCallout';
import * as telemetry from '../../common/telemetry';
/**
 * Renders the control for PropertyFieldButtonWithCallout component
 */
export default class PropertyFieldButtonHost extends React.Component {
    constructor(props) {
        super(props);
        telemetry.track('PropertyFieldButton', {
            disabled: props.disabled
        });
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(PlaceholderWithCallout, Object.assign({}, this.props),
                React.createElement(Button, Object.assign({}, this.props)))));
    }
}
//# sourceMappingURL=PropertyFieldButtonWithCalloutHost.js.map