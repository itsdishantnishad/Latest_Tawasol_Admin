var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as React from 'react';
import { findIndex } from '@microsoft/sp-lodash-subset';
import { Breadcrumb } from '@fluentui/react/lib/Breadcrumb';
import { FileBrowser } from '../controls';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import styles from './OneDriveFilesTab.module.scss';
import * as strings from 'PropertyControlStrings';
export class OneDriveFilesTab extends React.Component {
    constructor(props) {
        super(props);
        /**
         * Handles breadcrump item click
         */
        this.onBreadcrumpItemClick = (node) => {
            let { breadcrumbItems } = this.state;
            let breadcrumbClickedItemIndx = 0;
            // Site node clicked
            if (node.folderData === null) {
                this.setState({
                    libraryAbsolutePath: undefined,
                    folderPath: undefined,
                    folderName: undefined
                });
            }
            // Check if it is folder item
            else {
                this._handleOpenFolder(node.folderData, false);
                // select which node has been clicked
                breadcrumbClickedItemIndx = findIndex(breadcrumbItems, item => item.folderData && item.folderData.absoluteUrl === node.key);
            }
            // Trim nodes array
            breadcrumbItems = breadcrumbItems.slice(0, breadcrumbClickedItemIndx + 1);
            // Set new current node
            breadcrumbItems[breadcrumbItems.length - 1].isCurrentItem = true;
            this.setState({
                breadcrumbItems,
                filePickerResult: undefined
            });
        };
        /**
         * Is called when user selects a different file
         */
        this._handleSelectionChange = (filePickerResult) => {
            if (filePickerResult) {
                filePickerResult.downloadFileContent = () => { return this.props.oneDriveService.downloadSPFileContent(filePickerResult.spItemUrl, filePickerResult.fileName); };
            }
            this.setState({
                filePickerResult
            });
        };
        /**
         * Called when user saves
         */
        this._handleSave = () => {
            this.props.onSave(this.state.filePickerResult);
        };
        /**
         * Called when user closes tab
         */
        this._handleClose = () => {
            this.props.onClose();
        };
        /**
         * Triggered when user opens a file folder
         */
        this._handleOpenFolder = (folder, addBreadcrumbNode) => {
            const { breadcrumbItems } = this.state;
            if (addBreadcrumbNode) {
                breadcrumbItems.map(item => { item.isCurrentItem = false; });
                const breadcrumbNode = {
                    folderData: folder,
                    isCurrentItem: true,
                    text: folder.name,
                    key: folder.absoluteUrl
                };
                breadcrumbNode.onClick = () => { this.onBreadcrumpItemClick(breadcrumbNode); };
                breadcrumbItems.push(breadcrumbNode);
            }
            this.setState({
                folderPath: folder.serverRelativeUrl,
                folderName: folder.name,
                libraryAbsolutePath: folder.absoluteUrl,
                breadcrumbItems
            });
        };
        this.state = {
            filePickerResult: null,
            libraryAbsolutePath: undefined,
            libraryTitle: strings.DocumentLibraries,
            libraryId: '',
            folderPath: undefined,
            folderName: strings.DocumentLibraries,
            breadcrumbItems: []
        };
    }
    componentDidMount() {
        return __awaiter(this, void 0, void 0, function* () {
            const { oneDriveService, } = this.props;
            const { folderPath, libraryAbsolutePath, libraryTitle, libraryId } = yield oneDriveService.getOneDriveMetadata();
            const oneDriveFolderData = {
                isFolder: true,
                modified: null,
                modifiedFriendly: null,
                absoluteUrl: libraryAbsolutePath,
                name: libraryTitle,
                fileIcon: "",
                serverRelativeUrl: folderPath,
                spItemUrl: "",
                supportsThumbnail: false,
                fileType: ""
            };
            const breadcrumbItems = this.state.breadcrumbItems;
            // Add OneDrive folder as a first node
            const breadcrumbNode = {
                folderData: oneDriveFolderData,
                isCurrentItem: true,
                text: oneDriveFolderData.name,
                key: oneDriveFolderData.absoluteUrl
            };
            breadcrumbNode.onClick = () => { this.onBreadcrumpItemClick(breadcrumbNode); };
            breadcrumbItems.push(breadcrumbNode);
            this.setState({
                libraryAbsolutePath: libraryAbsolutePath,
                folderName: folderPath,
                libraryTitle,
                libraryId
            });
        });
    }
    render() {
        const { libraryId, libraryTitle, folderPath, breadcrumbItems, libraryAbsolutePath, filePickerResult } = this.state;
        const { oneDriveService, accepts } = this.props;
        return (React.createElement("div", { className: styles.tabContainer },
            React.createElement("div", { className: styles.tabHeaderContainer },
                React.createElement(Breadcrumb, { items: breadcrumbItems, className: styles.breadcrumbNav })),
            React.createElement("div", { className: styles.tabFiles }, libraryAbsolutePath !== undefined &&
                React.createElement(FileBrowser, { onChange: (fpr) => this._handleSelectionChange(fpr), onOpenFolder: (folder) => this._handleOpenFolder(folder, true), fileBrowserService: oneDriveService, libraryName: libraryTitle, libraryId: libraryId, folderPath: folderPath, accepts: accepts, context: this.props.context })),
            React.createElement("div", { className: styles.actionButtonsContainer },
                React.createElement("div", { className: styles.actionButtons },
                    React.createElement(PrimaryButton, { disabled: !filePickerResult, onClick: () => this._handleSave(), className: styles.actionButton }, strings.OpenButtonLabel),
                    React.createElement(DefaultButton, { onClick: () => this._handleClose(), className: styles.actionButton }, strings.CancelButtonLabel)))));
    }
}
//# sourceMappingURL=OneDriveFilesTab.js.map