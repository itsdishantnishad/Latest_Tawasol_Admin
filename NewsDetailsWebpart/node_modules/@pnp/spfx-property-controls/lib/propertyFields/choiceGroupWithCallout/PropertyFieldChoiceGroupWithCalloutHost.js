import * as React from 'react';
import omit from 'lodash/omit';
import PropertyFieldHeader from '../../common/propertyFieldHeader/PropertyFieldHeader';
import * as telemetry from '../../common/telemetry';
import { ChoiceGroup } from '@fluentui/react';
export default class PropertyFieldToggleWithCalloutHost extends React.Component {
    constructor(props) {
        super(props);
        telemetry.track('PropertyFieldToggleWithCallout', {
            disabled: props.disabled,
        });
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(PropertyFieldHeader, Object.assign({}, this.props)),
            React.createElement(ChoiceGroup, Object.assign({}, omit(this.props, ['label'])))));
    }
}
//# sourceMappingURL=PropertyFieldChoiceGroupWithCalloutHost.js.map