import * as React from 'react';
import { SpinButton, Position } from '@fluentui/react';
import * as telemetry from '../../common/telemetry';
export default class PropertyFieldSpinButtonHost extends React.Component {
    constructor(props, state) {
        super(props);
        telemetry.track('PropertyFieldSpinButton', {
            disabled: props.disabled,
        });
        this.state = {
            errorMessage: undefined,
        };
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(SpinButton, { label: this.props.label, labelPosition: Position.top, value: this.props.value, onValidate: this.props.onValidate, onIncrement: this.props.onIncrement, onDecrement: this.props.onDecrement, disabled: this.props.disabled, incrementButtonIcon: { iconName: this.props.incrementIconName }, decrementButtonIcon: { iconName: this.props.decrementIconName } })));
    }
}
//# sourceMappingURL=PropertyFieldSpinButtonHost.js.map