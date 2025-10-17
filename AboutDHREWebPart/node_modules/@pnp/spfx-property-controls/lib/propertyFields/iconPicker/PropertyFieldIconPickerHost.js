import * as React from 'react';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import * as telemetry from '../../common/telemetry';
import { DialogType } from '@fluentui/react/lib/Dialog';
import { PanelType } from '@fluentui/react/lib/Panel';
import { Label } from '@fluentui/react/lib/Label';
import { setPropertyValue } from '../../helpers/GeneralHelper';
import { IconSelector } from '../../common/iconSelector/IconSelector';
export default class PropertyFieldIconPickerHost extends React.Component {
    constructor(props) {
        super(props);
        this.closePanel = () => {
            this.setState({
                currentIcon: this.props.currentIcon,
                isPanelOpen: false
            });
        };
        this.iconPickerOnClick = () => {
            this.setState({
                isPanelOpen: true
            });
        };
        this.iconOnClick = (iconName) => {
            if (this.props.onChanged) {
                if (typeof this.props.onChanged !== 'undefined' && this.props.onChanged !== null) {
                    this.props.onChange(this.props.targetProperty, iconName);
                }
            }
            this.setState({
                currentIcon: iconName
            });
        };
        this.confirmSelection = () => {
            if (this.props.onSave) {
                this.props.onSave(this.state.currentIcon);
                setPropertyValue(this.props.properties, this.props.targetProperty, this.state.currentIcon);
                this.props.onPropertyChange(this.props.targetProperty, this.props.currentIcon, this.state.currentIcon);
                if (typeof this.props.onChange !== 'undefined' && this.props.onChange !== null) {
                    this.props.onChange(this.props.targetProperty, this.state.currentIcon);
                }
            }
            this.setState({
                isPanelOpen: false
            });
        };
        telemetry.track('PropertyFieldIconPicker', {
            disabled: props.disabled
        });
        this.state = {
            currentIcon: this.props.currentIcon || null,
            isPanelOpen: false
        };
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.currentIcon !== this.props.currentIcon) {
            this.setState({
                currentIcon: this.props.currentIcon
            });
        }
    }
    render() {
        const { buttonLabel, buttonClassName, disabled, panelClassName, label } = this.props;
        let renderOption = this.props.renderOption;
        const iconProps = { iconName: this.props.currentIcon };
        renderOption = renderOption === undefined ? 'panel' : renderOption;
        return React.createElement("div", null,
            label && label.length > 0 && React.createElement(Label, null, label),
            React.createElement(PrimaryButton, { text: buttonLabel, onClick: this.iconPickerOnClick, className: buttonClassName, disabled: disabled, iconProps: iconProps, "data-automation-id": `icon-picker-open` }),
            React.createElement(IconSelector, { renderOption: renderOption, currentIcon: this.state.currentIcon, panelClassName: panelClassName, panelType: PanelType.medium, dialogType: DialogType.normal, isOpen: this.state.isPanelOpen, onChange: this.iconOnClick, onDismiss: this.closePanel, onSave: this.confirmSelection }));
    }
}
//# sourceMappingURL=PropertyFieldIconPickerHost.js.map