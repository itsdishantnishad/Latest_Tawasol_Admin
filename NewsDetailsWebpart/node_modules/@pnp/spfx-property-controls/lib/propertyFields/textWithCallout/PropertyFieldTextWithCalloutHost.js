import * as React from 'react';
import PropertyFieldHeader from '../../common/propertyFieldHeader/PropertyFieldHeader';
import * as telemetry from '../../common/telemetry';
import { TextField } from '@fluentui/react';
import omit from 'lodash/omit';
export default class PropertyFieldTextWithCalloutHost extends React.Component {
    constructor(props) {
        super(props);
        telemetry.track('PropertyFieldTextWithCallout', {
            disabled: props.disabled
        });
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(PropertyFieldHeader, Object.assign({}, this.props)),
            React.createElement(TextField, Object.assign({}, omit(this.props, ['label']), { onChange: (event, newValue) => {
                    if (this.props.onChanged) {
                        this.props.onChanged(newValue);
                    }
                } }))));
    }
}
//# sourceMappingURL=PropertyFieldTextWithCalloutHost.js.map