import * as React from 'react';
import { ComboBox } from '@fluentui/react/lib/ComboBox';
import { Label } from '@fluentui/react/lib/Label';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';
import styles from './PropertyFieldEditableComboBoxHost.module.scss';
import * as telemetry from '../../common/telemetry';
/**
 * @class PropertyFieldEditableComboBoxHost
 * @description Core JSX Element for displaying and managing an editable combo box
 */
export default class PropertyFieldEditableComboBoxHost extends React.Component {
    constructor(props, state) {
        super(props);
        this.logStyle = "background: crimson; padding: 5px; border-radius: 5px; color: white";
        this.box = React.createRef();
        telemetry.track('PropertyFieldEditableComboBox', {
            disabled: props.disabled
        });
        this.state = {
            options: props.options,
            selectedText: props.selectedText
        };
    }
    /**
     * @function optionChanged
     * @param event
     * @param option
     * @param index
     * @param value
     * @description Handles when the selected option has changed or whether a new option has been added
     */
    optionChanged(event, option, index, value) {
        //Determine if the option was selected or if a new value was added
        let txt;
        let wasAdded = false;
        if (option !== undefined) {
            //An option was selected
            txt = option.text;
            this.setState({ selectedText: txt });
        }
        else {
            //A new option was provided
            txt = value;
            //Add the new category to the list, if it is not undefined and then reload the list
            if (txt !== undefined && txt !== '') {
                //this.log(`${val} is being added to the list of categories...`);
                this.setState({
                    options: [...this.state.options, { key: txt, text: txt }]
                });
                this.setState({
                    selectedText: txt
                });
                wasAdded = true;
            }
            else if (txt === '') {
                this.setState({ selectedText: txt });
                //this.log(`Selected category state blanked out`);
            }
        }
        //this.log(`${val} was selected!`);
        this.props.onOptionChanged(txt, wasAdded);
    }
    /**
     * @function onKeyDown
     * @param event the keyboard event incoming
     * @description monitors the keystrokes to stop the user from exceeding the `maxFillInLength`
     */
    onKeyDown(event) {
        if (this.props.maxFillInLength !== undefined) {
            if (event.key.toLowerCase() !== 'backspace') {
                const text = event.target.value;
                if (text !== undefined && text !== null) {
                    if (text.length >= this.props.maxFillInLength) {
                        this.log(`Max character length hit!!! [${this.props.maxFillInLength.toString()}] : Stopping new characters.`);
                        event.preventDefault();
                    }
                }
            }
        }
    }
    /**
     * @function log
     * @param val the string to write out to the console
     * @description lightweight logging to the console, with just a little custom styling
     */
    log(val) {
        console.log(`%c>> ${val}`, this.logStyle);
    }
    /**
     * @function render
     * @description Renders out the Fluent UI `ComboBox` along with some labeling and tooltip components
     */
    render() {
        return (React.createElement(React.Fragment, null,
            React.createElement("div", { className: styles.catLabelContainer },
                React.createElement(Label, null, this.props.label),
                (this.props.showTooltip ?
                    React.createElement(TooltipHost, { content: this.props.tooltipText, className: styles.tooltip },
                        React.createElement(FontIcon, { iconName: "Info", className: styles.fontIcon }))
                    : null)),
            React.createElement(ComboBox, { componentRef: this.box, onChange: (event, option, index, value) => this.optionChanged(event, option, index, value), text: this.state.selectedText, allowFreeform: true, autoComplete: "on", onKeyDown: (event) => this.onKeyDown(event), options: this.state.options, disabled: this.props.disabled })));
    }
}
//# sourceMappingURL=PropertyFieldEditableComboBoxHost.js.map