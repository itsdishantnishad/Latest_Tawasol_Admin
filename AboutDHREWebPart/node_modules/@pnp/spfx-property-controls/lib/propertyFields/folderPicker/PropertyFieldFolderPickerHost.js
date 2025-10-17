import * as React from 'react';
import styles from './FolderPicker.module.scss';
import { IconButton, PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Label } from '@fluentui/react/lib/Label';
import { Link } from '@fluentui/react/lib/Link';
import { getId } from '@fluentui/react/lib/Utilities';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { FolderExplorer } from './controls/FolderExplorer';
import * as telemetry from '../../common/telemetry';
import { getPropertyValue, setPropertyValue } from '../../helpers/GeneralHelper';
export default class PropertyFieldFolderPickerHost extends React.Component {
    constructor(props) {
        super(props);
        this._folderLinkId = getId('folderLink');
        this._showPanel = () => {
            this.setState({ showPanel: true });
        };
        this._hidePanel = () => {
            this.setState({ showPanel: false });
        };
        this._onRenderFooterContent = () => {
            return (React.createElement("div", { className: styles.actions },
                React.createElement(PrimaryButton, { iconProps: { iconName: 'Save' }, onClick: this._onFolderSave }, "Save"),
                React.createElement(DefaultButton, { iconProps: { iconName: 'Cancel' }, onClick: this._hidePanel }, "Cancel")));
        };
        this._onFolderSelect = (folder) => {
            this._selectedFolder = folder;
        };
        this._onFolderSave = () => {
            this.props.onSelect(this._selectedFolder);
            setPropertyValue(this.props.properties, this.props.targetProperty, this._selectedFolder);
            this.props.onPropertyChange(this.props.targetProperty, this.props.selectedFolder, this._selectedFolder);
            if (typeof this.props.onChange !== 'undefined' && this.props.onChange !== null) {
                this.props.onChange(this.props.targetProperty, this._selectedFolder);
            }
            this.setState({
                selectedFolder: this._selectedFolder,
                showPanel: false,
            });
        };
        this._resetSelection = () => {
            this._selectedFolder = null;
            this.setState({
                selectedFolder: this._selectedFolder,
            });
            this.props.onSelect(this._selectedFolder);
            setPropertyValue(this.props.properties, this.props.targetProperty, this._selectedFolder);
            this.props.onPropertyChange(this.props.targetProperty, this.props.selectedFolder, this._selectedFolder);
            if (typeof this.props.onChange !== 'undefined' && this.props.onChange !== null) {
                this.props.onChange(this.props.targetProperty, this._selectedFolder);
            }
        };
        telemetry.track('PropertyFieldFolderPicker', {
            disabled: props.disabled
        });
        this.state = {
            showPanel: false,
            selectedFolder: getPropertyValue(props.properties, props.targetProperty) || this.props.defaultFolder
        };
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        const currentValue = getPropertyValue(this.props.properties, this.props.targetProperty);
        const nextValue = getPropertyValue(nextProps.properties, nextProps.targetProperty);
        if (currentValue !== nextValue) {
            this.setState({
                selectedFolder: nextValue
            });
        }
    }
    render() {
        return (React.createElement("div", null,
            this.props.label &&
                React.createElement(Label, { className: this.props.required ? styles.required : '', htmlFor: this._folderLinkId }, this.props.label),
            React.createElement("div", { className: styles.folderPicker },
                React.createElement("div", { className: styles.selection },
                    !this.state.selectedFolder &&
                        React.createElement("span", { className: styles.selectFolderLabel }, "Select a folder"),
                    this.state.selectedFolder &&
                        React.createElement("div", { className: styles.selectFolder },
                            React.createElement(Link, { className: styles.selectedLink, target: '_blank', "data-interception": "off", id: this._folderLinkId, href: this.state.selectedFolder.ServerRelativeUrl },
                                React.createElement("span", { title: this.state.selectedFolder.Name }, this.state.selectedFolder.Name)),
                            React.createElement(IconButton, { iconProps: { iconName: 'Cancel' }, title: "Delete selection", ariaLabel: "Delete selection", onClick: this._resetSelection, disabled: this.props.disabled }))),
                React.createElement("div", { className: styles.selectButton },
                    React.createElement(IconButton, { iconProps: { iconName: 'FolderList' }, title: "Select folder", ariaLabel: "Select folder", disabled: this.props.disabled, onClick: this._showPanel }))),
            React.createElement(Panel, { isOpen: this.state.showPanel, type: PanelType.medium, onDismiss: this._hidePanel, headerText: "Select folder", closeButtonAriaLabel: "Close", onRenderFooterContent: this._onRenderFooterContent },
                React.createElement("div", null,
                    React.createElement(FolderExplorer, { context: this.props.context, rootFolder: this.props.rootFolder, defaultFolder: this.state.selectedFolder, onSelect: this._onFolderSelect, canCreateFolders: this.props.canCreateFolders, siteAbsoluteUrl: this.props.siteAbsoluteUrl })))));
    }
}
//# sourceMappingURL=PropertyFieldFolderPickerHost.js.map