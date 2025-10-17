import * as React from 'react';
import PlaceholderWithCallout from '../../common/placeholderWithCallout/PlaceholderWithCallout';
import * as telemetry from '../../common/telemetry';
import { Checkbox } from '@fluentui/react';
/**
 * Renders the control for PropertyFieldCheckboxWithCallout component
 */
export default class PropertyFieldCheckboxHost extends React.Component {
    constructor(props) {
        super(props);
        telemetry.track('PropertyFieldCheckbox', {
            disabled: props.disabled
        });
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(PlaceholderWithCallout, Object.assign({}, this.props),
                React.createElement(Checkbox, Object.assign({}, this.props, { label: this.props.text })))));
    }
}
//# sourceMappingURL=PropertyFieldCheckboxWithCalloutHost.js.map