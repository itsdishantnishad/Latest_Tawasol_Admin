import * as React from 'react';
import { findIndex } from '@microsoft/sp-lodash-subset';
import { DocumentLibraryBrowser, FileBrowser } from '../controls';
import { PrimaryButton, DefaultButton, Breadcrumb, ScrollablePane, } from '@fluentui/react';
import { Link } from '@fluentui/react/lib/Link';
import styles from './SiteFilePickerTab.module.scss';
import * as strings from 'PropertyControlStrings';
export default class SiteFilePickerTab extends React.Component {
    constructor(props) {
        super(props);
        this.renderBreadcrumbItem = (item) => {
            return (React.createElement(Link, { href: item.href, onClick: item.onClick, key: item.key, className: `ms-Link ms-Breadcrumb-itemLink ${styles.breadcrumbNavItem}` }, item.text));
        };
        /**
         * Handles breadcrump item click
         */
        this.onBreadcrumpItemClick = (node) => {
            let { breadcrumbItems } = this.state;
            let breadcrumbClickedItemIndx = 0;
            // Site node clicked
            if (!node.libraryData && !node.folderData) {
                this.setState({
                    libraryAbsolutePath: undefined,
                    libraryPath: undefined,
                    folderName: undefined,
                });
            }
            // Check if it is folder item
            else if (node.folderData) {
                this._handleOpenFolder(node.folderData, false);
                // select which node has been clicked
                breadcrumbClickedItemIndx = findIndex(breadcrumbItems, (item) => item.folderData && item.folderData.absoluteUrl === node.key);
            }
            // Check if it is library node
            else if (node.libraryData) {
                this._handleOpenLibrary(node.libraryData, false);
                // select which node has been clicked
                breadcrumbClickedItemIndx = findIndex(breadcrumbItems, (item) => item.libraryData && item.libraryData.serverRelativeUrl === node.key);
            }
            // Trim nodes array
            breadcrumbItems = breadcrumbItems.slice(0, breadcrumbClickedItemIndx + 1);
            // Set new current node
            breadcrumbItems[breadcrumbItems.length - 1].isCurrentItem = true;
            this.setState({
                breadcrumbItems,
                filePickerResult: undefined,
            });
        };
        /**
         * Is called when user selects a different file
         */
        this._handleSelectionChange = (filePickerResult) => {
            if (filePickerResult) {
                filePickerResult.downloadFileContent = () => {
                    return this.props.fileBrowserService.downloadSPFileContent(filePickerResult.fileAbsoluteUrl, filePickerResult.fileName);
                };
            }
            // this.props.fileBrowserService
            this.setState({
                filePickerResult,
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
                breadcrumbItems.map((item) => {
                    item.isCurrentItem = false;
                });
                const breadcrumbNode = {
                    folderData: folder,
                    isCurrentItem: true,
                    text: folder.name,
                    key: folder.absoluteUrl,
                };
                breadcrumbNode.onClick = () => {
                    this.onBreadcrumpItemClick(breadcrumbNode);
                };
                breadcrumbItems.push(breadcrumbNode);
            }
            this.setState({
                filePickerResult: null,
                libraryPath: folder.serverRelativeUrl,
                folderName: folder.name,
                libraryAbsolutePath: folder.absoluteUrl,
                breadcrumbItems,
            });
        };
        /**
         * Triggered when user opens a top-level document library
         */
        this._handleOpenLibrary = (library, addBreadcrumbNode) => {
            const { breadcrumbItems } = this.state;
            if (addBreadcrumbNode) {
                breadcrumbItems.map((item) => {
                    item.isCurrentItem = false;
                });
                const breadcrumbNode = {
                    libraryData: library,
                    isCurrentItem: true,
                    text: library.title,
                    key: library.serverRelativeUrl,
                };
                breadcrumbNode.onClick = () => {
                    this.onBreadcrumpItemClick(breadcrumbNode);
                };
                breadcrumbItems.push(breadcrumbNode);
            }
            this.setState({
                libraryAbsolutePath: library.absoluteUrl,
                libraryTitle: library.title,
                libraryId: library.id,
                libraryPath: library.serverRelativeUrl,
                breadcrumbItems,
            });
        };
        // Add current site to the breadcrumb or the provided node
        const breadcrumbSiteNode = this.props
            .breadcrumbFirstNode
            ? this.props.breadcrumbFirstNode
            : {
                isCurrentItem: true,
                text: props.context.pageContext.web.title,
                key: props.context.pageContext.web.id.toString(),
            };
        breadcrumbSiteNode.onClick = () => {
            this.onBreadcrumpItemClick(breadcrumbSiteNode);
        };
        this.state = {
            filePickerResult: null,
            libraryAbsolutePath: undefined,
            libraryTitle: strings.DocumentLibraries,
            libraryId: '',
            libraryPath: undefined,
            folderName: strings.DocumentLibraries,
            breadcrumbItems: [breadcrumbSiteNode],
        };
    }
    render() {
        return (React.createElement("div", { className: styles.tabContainer },
            React.createElement("div", { className: styles.tabHeaderContainer },
                React.createElement(Breadcrumb, { items: this.state.breadcrumbItems, 
                    /*onRenderItem={this.renderBreadcrumbItem}*/ className: styles.breadcrumbNav })),
            React.createElement("div", { className: styles.tabFiles },
                this.state.libraryAbsolutePath === undefined && (React.createElement("div", { className: styles.scrollablePaneWrapper },
                    React.createElement(ScrollablePane, null,
                        React.createElement(DocumentLibraryBrowser, { fileBrowserService: this.props.fileBrowserService, onOpenLibrary: (selectedLibrary) => this._handleOpenLibrary(selectedLibrary, true), includePageLibraries: this.props.includePageLibraries })))),
                this.state.libraryAbsolutePath !== undefined && (React.createElement(FileBrowser, { onChange: (filePickerResult) => this._handleSelectionChange(filePickerResult), onOpenFolder: (folder) => this._handleOpenFolder(folder, true), fileBrowserService: this.props.fileBrowserService, libraryName: this.state.libraryTitle, libraryId: this.state.libraryId, folderPath: this.state.libraryPath, accepts: this.props.accepts, context: this.props.context }))),
            React.createElement("div", { className: styles.actionButtonsContainer },
                React.createElement("div", { className: styles.actionButtons },
                    React.createElement(PrimaryButton, { disabled: !this.state.filePickerResult, onClick: () => this._handleSave(), className: styles.actionButton }, strings.OpenButtonLabel),
                    React.createElement(DefaultButton, { onClick: () => this._handleClose(), className: styles.actionButton }, strings.CancelButtonLabel)))));
    }
}
//# sourceMappingURL=SiteFilePickerTab.js.map