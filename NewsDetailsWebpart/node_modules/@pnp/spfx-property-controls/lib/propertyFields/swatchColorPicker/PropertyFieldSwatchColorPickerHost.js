import { IconButton } from '@fluentui/react/lib/Button';
import { Label } from '@fluentui/react/lib/Label';
import { SwatchColorPicker } from '@fluentui/react/lib/SwatchColorPicker';
import * as strings from 'PropertyControlStrings';
import * as React from 'react';
import * as telemetry from '../../common/telemetry';
import { PropertyFieldSwatchColorPickerStyle } from './IPropertyFieldSwatchColorPicker';
import styles from './PropertyFieldSwatchColorPickerHost.module.scss';
export default class PropertyFieldSwatchColorPickerHost extends React.Component {
    constructor(props, state) {
        super(props);
        telemetry.track('PropertyFieldSwatchColorPicker', {
            disabled: props.disabled
        });
        this.state = {
            errorMessage: undefined,
            inlinePickerShowing: false
        };
        this.onTogglePicker = this.onTogglePicker.bind(this);
    }
    render() {
        return (React.createElement("div", { className: styles.pfSwatchColorPicker },
            this.props.label && React.createElement(Label, null, this.props.label),
            this.props.style === PropertyFieldSwatchColorPickerStyle.Inline &&
                React.createElement("table", { className: styles.cpInlineTable },
                    React.createElement("tbody", null,
                        React.createElement("tr", null,
                            React.createElement("td", { style: { width: "100%" } },
                                this.state.inlinePickerShowing &&
                                    React.createElement("div", { className: 'ms-slideDownIn20 ' + styles.cpSwatchRow }, this.renderSwatchColorPicker()),
                                !this.state.inlinePickerShowing &&
                                    React.createElement("div", { className: "ms-slideUpIn20 ms-borderColor-neutralDark", style: { backgroundColor: this.props.selectedColor, border: "1px solid" } }, "\u00A0")),
                            React.createElement("td", { className: styles.cpInlineRow },
                                React.createElement(IconButton, { title: strings.ColorPickerButtonTitle, disabled: this.props.disabled, iconProps: { iconName: this.props.iconName, ariaLabel: strings.ColorPickerButtonTitle }, onClick: this.onTogglePicker }))))),
            this.props.style === PropertyFieldSwatchColorPickerStyle.Full && this.renderSwatchColorPicker()));
    }
    renderSwatchColorPicker() {
        const colorCells = this.props.colors.map((value, index) => {
            return {
                id: index.toString(),
                label: value.label,
                color: value.color
            };
        });
        return (React.createElement(SwatchColorPicker, { disabled: this.props.disabled, columnCount: this.props.columnCount, selectedId: this.selectedColorId().toString(), colorCells: colorCells, cellShape: this.props.showAsCircles ? 'circle' : 'square', onColorChanged: this.props.onColorChanged }));
    }
    onTogglePicker() {
        this.setState({
            inlinePickerShowing: !this.state.inlinePickerShowing
        });
    }
    selectedColorId() {
        for (let i = 0; i < this.props.colors.length; i++) {
            if (this.props.colors[i].color === this.props.selectedColor) {
                return i;
            }
        }
        return -1;
    }
}
//# sourceMappingURL=PropertyFieldSwatchColorPickerHost.js.map