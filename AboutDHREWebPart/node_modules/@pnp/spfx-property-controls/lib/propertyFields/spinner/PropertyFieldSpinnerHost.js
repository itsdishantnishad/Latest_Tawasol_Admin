import * as React from 'react';
import { Spinner } from '@fluentui/react';
import * as telemetry from '../../common/telemetry';
export default class PropertyFieldSpinnerHost extends React.Component {
    constructor(props) {
        super(props);
        telemetry.track('PropertyFieldSpinner', {});
        this.state = {
            isVisible: this.props.isVisible,
        };
    }
    ///
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.isVisible !== this.props.isVisible) {
            this.setState({ isVisible: this.props.isVisible });
        }
    }
    render() {
        return (React.createElement("div", null, this.props.isVisible && (React.createElement(Spinner, { className: this.props.className, size: this.props.size, label: this.props.label }))));
    }
}
//# sourceMappingURL=PropertyFieldSpinnerHost.js.map