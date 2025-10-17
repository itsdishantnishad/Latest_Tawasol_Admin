import * as React from "react";
import { MessageBar } from "@fluentui/react/lib/MessageBar";
import * as telemetry from '../../common/telemetry';
export default class PropertyFieldPasswordHost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: this.props.text
        };
        telemetry.track('PropertyFieldPassword', {});
    }
    ///
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.text !== this.props.text) {
            this.setState({ text: this.props.text });
        }
    }
    render() {
        return (React.createElement("div", null, this.props.isVisible &&
            React.createElement(MessageBar, { className: this.props.className, messageBarType: this.props.messageType, isMultiline: this.props.multiline, truncated: this.props.truncate }, this.state.text)));
    }
}
//# sourceMappingURL=PropertyFieldMessageHost.js.map