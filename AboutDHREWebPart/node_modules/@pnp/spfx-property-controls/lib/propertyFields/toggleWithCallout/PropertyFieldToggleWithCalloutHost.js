import * as React from 'react';
import PropertyFieldHeader from '../../common/propertyFieldHeader/PropertyFieldHeader';
import * as telemetry from '../../common/telemetry';
import { Toggle } from '@fluentui/react';
import omit from 'lodash/omit';
export default class PropertyFieldToggleWithCalloutHost extends React.Component {
    constructor(props) {
        super(props);
        telemetry.track('PropertyFieldToggleWithCallout', {
            disabled: props.disabled,
        });
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(PropertyFieldHeader, Object.assign({}, this.props, { label: this.props.label.toString() })),
            React.createElement(Toggle, Object.assign({}, omit(this.props, ['label'])))));
    }
}
//# sourceMappingURL=PropertyFieldToggleWithCalloutHost.js.map