import * as React from 'react';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import AceEditor from 'react-ace';
import * as telemetry from '../../common/telemetry';
import styles from './PropertyPanePropertyEditorHost.module.scss';
import * as strings from 'PropertyControlStrings';
import { GeneralHelper, getPropertyValue, setPropertyValue } from '../../helpers/GeneralHelper';
export default class PropertyPanePropertyEditorHost extends React.Component {
    constructor(props, state) {
        super(props);
        this.cancel = true;
        this.fileRef = null;
        this.setFileRef = (element) => {
            this.fileRef = element;
        };
        this.getProperties = () => {
            let props = {};
            props = this.props.webpart.properties;
            return JSON.stringify(props);
        };
        /**
         * Called when the save button  gets clicked
         */
        this.onSave = () => {
            var _a, _b;
            const newProperties = JSON.parse(this.state.propertiesJson);
            for (const propName in newProperties) {
                if (!Object.hasOwnProperty.call(newProperties, propName)) {
                    continue;
                }
                // Do not update dynamic data properties
                const currentValue = getPropertyValue(this.props.webpart.properties, propName);
                if ((currentValue === null || currentValue === void 0 ? void 0 : currentValue.__type) === "DynamicProperty") {
                    const currVal = currentValue;
                    const newVal = newProperties[propName];
                    if (GeneralHelper.isDefined(newVal.value)) {
                        currVal.setValue(newVal.value);
                    }
                    if (GeneralHelper.isDefined(newVal.reference)) {
                        currVal.setReference(newVal.reference._reference);
                    }
                }
                else {
                    setPropertyValue(this.props.webpart.properties, propName, newProperties[propName]);
                }
                if (typeof ((_a = this.props.webpart.properties[propName]) === null || _a === void 0 ? void 0 : _a.onChange) !== 'undefined' && ((_b = this.props.webpart.properties[propName]) === null || _b === void 0 ? void 0 : _b.onChange) !== null) {
                    this.props.webpart.properties[propName].onChange(propName, newProperties[propName]);
                }
            }
            this.props.webpart.render();
            this.props.webpart.context.propertyPane.refresh();
            this.setState((current) => (Object.assign(Object.assign({}, current), { openPanel: false })));
        };
        /**
         * Called when the properties editor changes
         */
        this.onChange = (newValue, event) => {
            this.setState((current) => (Object.assign(Object.assign({}, current), { propertiesJson: newValue })));
        };
        /**
         * Called to open the editor panel
         */
        this.onOpenPanel = () => {
            // Store the current code value
            this.previousValue = JSON.stringify(this.props.webpart.properties, null, '\t');
            this.setState((current) => (Object.assign(Object.assign({}, current), { propertiesJson: this.previousValue })));
            this.cancel = true;
            this.setState({
                openPanel: true,
            });
        };
        /**
        * Close the panel
        */
        this.onClosePanel = () => {
            this.setState((crntState) => {
                const newState = {
                    openPanel: false,
                };
                // Check if the property has to be reset
                if (this.cancel) {
                    newState.propertiesJson = this.previousValue;
                }
                return newState;
            });
        };
        /**
         * Called when clicking 'Download'
         */
        this.onDownload = () => {
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.setAttribute("style", "display: none");
            a.setAttribute("data-interception", "off");
            const json = JSON.stringify(JSON.parse(this.state.propertiesJson), null, '\t'); // remove indentation
            const blob = new Blob([json], { type: "octet/stream" });
            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = "webpartproperties.json";
            a.click();
            window.URL.revokeObjectURL(url);
        };
        /**
         * Called when the changed event occurs on the file upload control
         */
        this.onUpload = () => {
            if (this.fileRef.files.length > 0 && this.fileRef.files[0].type === "application/json") {
                const fileReader = new FileReader();
                fileReader.readAsText(this.fileRef.files[0]);
                fileReader.onload = () => {
                    let jsonString = fileReader.result;
                    const json = JSON.parse(jsonString); // normalize as an object
                    jsonString = JSON.stringify(json, null, '\t'); // and format as an indented string again
                    this.setState((current) => (Object.assign(Object.assign({}, current), { propertiesJson: jsonString })));
                };
            }
            else {
                alert(strings.JsonFileRequiredMessage);
            }
        };
        telemetry.track('PropertyWebPartInformation', {});
        this.state = {
            propertiesJson: this.getProperties(),
            errorMessage: undefined,
        };
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(DefaultButton, { onClick: this.onOpenPanel }, strings.EditPropertiesButtonLabel),
            React.createElement(Panel, { isOpen: this.state.openPanel, hasCloseButton: true, onDismiss: this.onClosePanel, isLightDismiss: true, type: PanelType.medium, headerText: strings.EditPropertiesPanelHeaderText, onRenderFooterContent: () => (React.createElement("div", { className: styles.actions },
                    React.createElement("div", { className: "ms-Grid", dir: "ltr" },
                        React.createElement("div", { className: "ms-Grid-row" },
                            React.createElement("div", { className: "ms-Grid-col ms-sm6 ms-md6 ms-lg6 ms-textAlignLeft" },
                                React.createElement(PrimaryButton, { iconProps: { iconName: 'Accept' }, text: strings.ApplyButtonLabel, value: strings.ApplyButtonLabel, onClick: this.onSave }),
                                React.createElement(DefaultButton, { iconProps: { iconName: 'Cancel' }, text: strings.CancelButtonLabel, value: strings.CancelButtonLabel, onClick: this.onClosePanel })),
                            React.createElement("div", { className: "ms-Grid-col ms-sm6 ms-md6 ms-lg6 ms-textAlignRight" },
                                React.createElement(DefaultButton, { color: "ms-bgColor-themeLight", iconProps: { iconName: 'Download' }, text: strings.ExportButtonLabel, value: strings.ExportButtonLabel, onClick: this.onDownload }),
                                React.createElement("input", { type: "file", id: "uploadwebpartjson", ref: this.setFileRef, style: { display: "none" }, onChange: this.onUpload }),
                                React.createElement(DefaultButton, { iconProps: { iconName: 'Upload' }, text: strings.ImportButtonLabel, value: strings.ImportButtonLabel, onClick: () => { this.fileRef.click(); } })))))) },
                React.createElement(AceEditor, { mode: 'ace/mode/json', theme: "monokai", onChange: this.onChange, value: this.state.propertiesJson, name: `code-property-editor`, editorProps: { $blockScrolling: true } }))));
    }
}
//# sourceMappingURL=PropertyPanePropertyEditorHost.js.map