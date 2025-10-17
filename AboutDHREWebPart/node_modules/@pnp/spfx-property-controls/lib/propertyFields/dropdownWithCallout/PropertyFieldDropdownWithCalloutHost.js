import * as React from 'react';
import PropertyFieldHeader from '../../common/propertyFieldHeader/PropertyFieldHeader';
import * as telemetry from '../../common/telemetry';
import { Dropdown, SelectableOptionMenuItemType, } from '@fluentui/react';
import omit from 'lodash/omit';
export default class PropertyFieldDropdownHost extends React.Component {
    constructor(props) {
        super(props);
        telemetry.track('PropertyFieldDropdown', {
            disabled: props.disabled,
        });
    }
    render() {
        const dropdownProps = omit(this.props, ['label']);
        dropdownProps.options = this._convertPropPaneOptionsToDropdownOptions(dropdownProps.options);
        return (React.createElement("div", null,
            React.createElement(PropertyFieldHeader, Object.assign({}, this.props)),
            React.createElement(Dropdown, Object.assign({}, dropdownProps))));
    }
    _convertPropPaneOptionsToDropdownOptions(propPaneOptions) {
        return propPaneOptions.map((propPaneOption) => {
            return {
                key: propPaneOption.key,
                text: propPaneOption.text,
                index: propPaneOption.index,
                itemType: SelectableOptionMenuItemType[SelectableOptionMenuItemType[propPaneOption.type]],
            };
        });
    }
}
//# sourceMappingURL=PropertyFieldDropdownWithCalloutHost.js.map