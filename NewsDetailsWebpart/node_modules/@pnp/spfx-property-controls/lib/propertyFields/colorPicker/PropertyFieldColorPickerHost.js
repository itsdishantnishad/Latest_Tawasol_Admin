import * as React from 'react';
import { Label } from '@fluentui/react/lib/Label';
import { ColorPicker } from '@fluentui/react/lib/ColorPicker';
import { IconButton } from '@fluentui/react/lib/Button';
import styles from './PropertyFieldColorPickerHost.module.scss';
import * as strings from 'PropertyControlStrings';
import { PropertyFieldColorPickerStyle } from './IPropertyFieldColorPicker';
import * as telemetry from '../../common/telemetry';
export default class PropertyFieldColorPickerHost extends React.Component {
    constructor(props, state) {
        super(props);
        telemetry.track('PropertyFieldColorPicker', {
            disabled: props.disabled
        });
        this.state = {
            errorMessage: undefined,
            inlinePickerShowing: false
        };
        this.onTogglePicker = this.onTogglePicker.bind(this);
    }
    render() {
        return (React.createElement("div", { className: `${styles.pfColorPicker} ${this.props.isHidden ? styles.hidden : ""}` },
            this.props.label && React.createElement(Label, null, this.props.label),
            this.props.style === PropertyFieldColorPickerStyle.Inline &&
                React.createElement("table", { className: styles.cpInlineTable },
                    React.createElement("tbody", null,
                        React.createElement("tr", null,
                            React.createElement("td", { style: { width: "100%" } },
                                this.state.inlinePickerShowing &&
                                    React.createElement("div", { className: "ms-slideDownIn20" },
                                        React.createElement(ColorPicker, { color: this.props.selectedColor, onChange: (e, color) => this.props.onColorChanged(color.str), alphaSliderHidden: this.props.alphaSliderHidden, showPreview: this.props.showPreview, strings: strings.ColorPickerStrings })),
                                !this.state.inlinePickerShowing &&
                                    React.createElement("div", { className: "ms-slideUpIn20 ms-borderColor-neutralDark", style: { backgroundColor: this.props.selectedColor, border: "1px solid" } }, "\u00A0")),
                            React.createElement("td", { className: styles.cpInlineRow },
                                React.createElement(IconButton, { title: strings.ColorPickerButtonTitle, disabled: this.props.disabled, iconProps: { iconName: this.props.iconName, ariaLabel: strings.ColorPickerButtonTitle }, onClick: this.onTogglePicker }))))),
            this.props.style === PropertyFieldColorPickerStyle.Full && !this.props.disabled &&
                React.createElement("div", null,
                    React.createElement("div", { style: { width: 0, height: 0, overflow: 'hidden' } },
                        React.createElement("input", null)),
                    React.createElement(ColorPicker, { color: this.props.selectedColor, onChange: (e, color) => this.props.onColorChanged(color.str), alphaSliderHidden: this.props.alphaSliderHidden })),
            this.props.style === PropertyFieldColorPickerStyle.Full && this.props.disabled &&
                React.createElement("fieldset", { disabled: true, className: styles.disabledCP },
                    React.createElement(ColorPicker, { color: this.props.selectedColor, alphaSliderHidden: this.props.alphaSliderHidden }))));
    }
    onTogglePicker() {
        this.setState({
            inlinePickerShowing: !this.state.inlinePickerShowing
        });
    }
}
//# sourceMappingURL=PropertyFieldColorPickerHost.js.map