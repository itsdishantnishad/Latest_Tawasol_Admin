import * as strings from 'PropertyControlStrings';
import * as React from 'react';
import { Dropdown } from '@fluentui/react';
import * as telemetry from '../../common/telemetry';
export default class PropertyFieldMultiSelectHost extends React.Component {
    constructor(props) {
        super(props);
        telemetry.track('PropertyFieldMultiSelect', {
            disabled: props.disabled
        });
    }
    render() {
        if (!this.props.options || (this.props.options && this.props.options.length === 0)) {
            return (React.createElement("div", null,
                React.createElement(Dropdown, { key: `MultiSelectOptionsDisabled`, label: this.props.label, options: [], placeHolder: strings.propertyFieldMultiSelectNoOptions, disabled: true })));
        }
        return (React.createElement("div", null,
            React.createElement(Dropdown, Object.assign({ key: `MultiSelectOptions` }, this.props, { multiSelect: true }))));
    }
}
//# sourceMappingURL=PropertyFieldMultiSelectHost.js.map