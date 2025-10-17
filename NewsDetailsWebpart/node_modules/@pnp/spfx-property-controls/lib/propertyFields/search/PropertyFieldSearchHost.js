import * as React from "react";
import { SearchBox } from "@fluentui/react";
import * as telemetry from '../../common/telemetry';
export default class PropertyFieldSearchHost extends React.Component {
    constructor(props) {
        super(props);
        telemetry.track('PropertyFieldOrder', {});
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
            React.createElement(SearchBox, { underlined: this.props.underlined, placeholder: this.props.placeholder, onSearch: this.props.onSearch, onClear: this.props.onClear, onEscape: this.props.onEscape, value: this.state.value, onChange: (e, newvalue) => {
                    this.setState({ value: newvalue });
                    this.props.onChange(newvalue);
                } })));
    }
}
//# sourceMappingURL=PropertyFieldSearchHost.js.map