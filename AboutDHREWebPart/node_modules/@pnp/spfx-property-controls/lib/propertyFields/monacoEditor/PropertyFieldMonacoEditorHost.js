import * as React from 'react';
import { DefaultButton, mergeStyles, mergeStyleSets, Panel, PanelType, PrimaryButton, Stack, TextField, } from '@fluentui/react';
import strings from 'PropertyControlStrings';
import * as telemetry from '../../common/telemetry';
import { MonacoEditor } from './monacoEditorControl';
const DEFAULT_PANEL_WIDTH = "800px";
export default class PropertyFieldMonacoEditorHost extends React.Component {
    constructor(props) {
        super(props);
        this.showPanel = (indicator) => {
            this.setState({ showPanel: indicator });
        };
        this.controlClasses = mergeStyleSets({
            headerTitle: mergeStyles({
                paddingTop: 20,
            }),
            textFieldStyles: mergeStyles({
                paddingBottom: 5,
            }),
        });
        this._onValueChange = (newValue, errors) => {
            this.setState({ value: newValue, validationErrors: errors });
        };
        this.onRenderFooterContent = () => {
            return (React.createElement(Stack, { horizontal: true, horizontalAlign: "start", tokens: { childrenGap: 5 } },
                React.createElement(PrimaryButton, { onClick: (ev) => {
                        ev.preventDefault();
                        this.props.onPropertyChange(this.state.value);
                        this.showPanel(false);
                    } }, strings.MonacoEditorSaveButtonLabel),
                React.createElement(DefaultButton, { onClick: (ev) => {
                        ev.preventDefault();
                        this.props.onPropertyChange(this.props.value);
                        this.showPanel(false);
                    } }, strings.MonacoEditorCancelButtonLabel)));
        };
        telemetry.track("PropertyFieldOrder", {});
        this.state = {
            value: this.props.value,
            validationErrors: [],
            showPanel: false,
        };
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.value !== this.props.value) {
            this.setState({ value: this.props.value });
        }
    }
    render() {
        const { panelWidth } = this.props;
        const _panelWidth = panelWidth ? `${panelWidth}px` : DEFAULT_PANEL_WIDTH;
        return (React.createElement(React.Fragment, null,
            React.createElement(TextField, { value: this.props.value, readOnly: true, className: this.controlClasses.textFieldStyles }),
            React.createElement(PrimaryButton, { text: strings.MonacoEditorOpenButtonLabel, onClick: (ev) => {
                    ev.preventDefault();
                    this.showPanel(true);
                } }),
            React.createElement(Panel, { type: PanelType.custom, customWidth: _panelWidth, isOpen: this.state.showPanel, onDismiss: () => {
                    this.showPanel(false);
                }, headerText: strings.MonacoEditorPanelTitle, onRenderFooterContent: this.onRenderFooterContent, isFooterAtBottom: true, layerProps: { eventBubblingEnabled: true } },
                React.createElement("div", { className: this.controlClasses.headerTitle },
                    React.createElement(MonacoEditor, Object.assign({}, this.props, { onValueChange: this._onValueChange }))))));
    }
}
//# sourceMappingURL=PropertyFieldMonacoEditorHost.js.map