import * as React from "react";
import { TextField } from "@fluentui/react/lib/TextField";
import * as telemetry from '../../common/telemetry';
export default class PropertyFieldPasswordHost extends React.Component {
    constructor(props) {
        super(props);
        telemetry.track('PropertyFieldPassword', {});
        this.state = {
            value: this.props.value
        };
    }
    ///
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.value !== this.props.value) {
            this.setState({ value: this.props.value });
        }
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(TextField, { type: "password", label: this.props.label ? this.props.label : null, value: this.state.value, onChange: (e, newValue) => {
                    this.setState({ value: newValue });
                    this.props.onChanged(newValue);
                } })));
    }
}
//# sourceMappingURL=PropertyFieldPasswordHost.js.map