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
import { Label, Nav, Panel, PanelType, PrimaryButton, ActionButton, css, } from '@fluentui/react';
// Localization
import * as strings from 'PropertyControlStrings';
import LinkFilePickerTab from './LinkFilePickerTab/LinkFilePickerTab';
import UploadFilePickerTab from './UploadFilePickerTab/UploadFilePickerTab';
import SiteFilePickerTab from './SiteFilePickerTab/SiteFilePickerTab';
import WebSearchTab from './WebSearchTab/WebSearchTab';
import RecentFilesTab from './RecentFilesTab/RecentFilesTab';
import styles from './FilePicker.module.scss';
import { FileBrowserService } from '../../../services/FileBrowserService';
import { OneDriveFilesTab } from './OneDriveFilesTab';
import { OneDriveService } from '../../../services/OneDriveService';
import { OrgAssetsService } from '../../../services/OrgAssetsService';
import { FilePickerTabType } from './FilePicker.types';
import { FilesSearchService } from '../../../services/FilesSearchService';
import { StockImages } from './StockImagesTab';
export class FilePicker extends React.Component {
    constructor(props) {
        super(props);
        /**
         * Renders the panel header
         */
        this._renderHeader = () => {
            return (React.createElement("div", { className: 'ms-Panel-header' },
                React.createElement("p", { className: css('ms-Panel-headerText', styles.header), role: 'heading' }, strings.FilePickerHeader)));
        };
        /**
         * Open the panel
         */
        this._handleOpenPanel = () => {
            this.setState({
                panelOpen: true,
                selectedTab: this.props.defaultSelectedTab
                    ? this.props.defaultSelectedTab
                    : FilePickerTabType.RecentTab,
            });
        };
        /**
         * Closes the panel
         */
        this._handleClosePanel = () => {
            this.props.onCancel();
            this.setState({
                panelOpen: false,
            });
        };
        /**
         * On save action
         */
        this._handleSave = (filePickerResult) => {
            this.props.onSave(filePickerResult);
            this.setState({
                panelOpen: false,
            });
        };
        /**
         * Changes the selected tab when a link is selected
         */
        this._handleLinkClick = (ev, item) => {
            this.setState({ selectedTab: item.key });
        };
        /**
         * Prepares navigation panel options
         */
        this._getNavPanelOptions = () => {
            const addUrl = this.props.storeLastActiveTab !== false;
            const links = [];
            if (!this.props.hideRecentTab) {
                links.push({
                    name: strings.RecentLinkLabel,
                    url: addUrl ? '#recent' : undefined,
                    icon: 'Recent',
                    key: FilePickerTabType.RecentTab,
                });
            }
            if (!this.props.hideStockImages) {
                links.push({
                    name: strings.StockImagesLinkLabel,
                    url: addUrl ? '#stockImages' : undefined,
                    key: FilePickerTabType.StockImagesTab,
                    icon: 'ImageSearch',
                });
            }
            if (this.props.bingAPIKey && !this.props.hideWebSearchTab) {
                links.push({
                    name: strings.WebSearchLinkLabel,
                    url: addUrl ? '#search' : undefined,
                    key: FilePickerTabType.WebSearchTab,
                    icon: 'Search',
                });
            }
            if (!this.props.hideOrganisationalAssetTab &&
                this.state.organisationAssetsEnabled) {
                links.push({
                    name: 'Your organisation',
                    url: addUrl ? '#orgAssets' : undefined,
                    icon: 'FabricFolderConfirm',
                    key: FilePickerTabType.OrganisationalAssetTab,
                });
            }
            if (!this.props.hideOneDriveTab) {
                links.push({
                    name: 'OneDrive',
                    url: addUrl ? '#onedrive' : undefined,
                    key: FilePickerTabType.OneDriveTab,
                    icon: 'OneDriveLogo',
                });
            }
            if (!this.props.hideSiteFilesTab) {
                links.push({
                    name: strings.SiteLinkLabel,
                    url: addUrl ? '#globe' : undefined,
                    key: FilePickerTabType.SiteFilesTab,
                    icon: 'Globe',
                });
            }
            if (!this.props.hideLocalUploadTab) {
                links.push({
                    name: strings.UploadLinkLabel,
                    url: addUrl ? '#upload' : undefined,
                    key: FilePickerTabType.LocalUploadTab,
                    icon: 'System',
                });
            }
            if (!this.props.hideLinkUploadTab) {
                links.push({
                    name: strings.FromLinkLinkLabel,
                    url: addUrl ? '#link' : undefined,
                    key: FilePickerTabType.LinkUploadTab,
                    icon: 'Link',
                });
            }
            const groups = [{ links }];
            return groups;
        };
        // Initialize file browser services
        this.fileBrowserService = new FileBrowserService(props.context, this.props.itemsCountQueryLimit);
        this.oneDriveService = new OneDriveService(props.context, this.props.itemsCountQueryLimit);
        this.orgAssetsService = new OrgAssetsService(props.context, this.props.itemsCountQueryLimit);
        this.fileSearchService = new FilesSearchService(props.context, this.props.bingAPIKey);
        this.state = {
            panelOpen: false,
            selectedTab: this.props.defaultSelectedTab
                ? this.props.defaultSelectedTab
                : FilePickerTabType.RecentTab,
            organisationAssetsEnabled: false,
            showFullNav: true,
        };
    }
    componentDidMount() {
        return __awaiter(this, void 0, void 0, function* () {
            // Load information about Organisation Assets Library
            let orgAssetsEnabled = false;
            if (!this.props.hideOrganisationalAssetTab) {
                const orgAssetsLibraries = yield this.orgAssetsService.getSiteMediaLibraries();
                orgAssetsEnabled = orgAssetsLibraries ? true : false;
            }
            this.setState({
                organisationAssetsEnabled: orgAssetsEnabled,
            });
        });
    }
    render() {
        // If no acceptable file type was passed, and we're expecting images, set the default image filter
        const accepts = this.props.accepts;
        const buttonClassName = this.props.buttonClassName
            ? this.props.buttonClassName
            : '';
        const panelClassName = this.props.panelClassName
            ? this.props.panelClassName
            : '';
        const linkTabProps = {
            accepts: accepts,
            context: this.props.context,
            onClose: () => this._handleClosePanel(),
            onSave: (value) => {
                this._handleSave(value);
            },
        };
        const buttonProps = {
            text: this.props.buttonLabel,
            disabled: this.props.disabled,
            onClick: this._handleOpenPanel,
            className: `pnp__file-picker__button ${buttonClassName}`,
        };
        return (React.createElement("div", { className: `pnp__file-picker` },
            this.props.label && (React.createElement(Label, { required: this.props.required }, this.props.label)),
            this.props.buttonIcon ? (React.createElement(ActionButton, Object.assign({ iconProps: { iconName: this.props.buttonIcon } }, buttonProps))) : (React.createElement(PrimaryButton, Object.assign({}, buttonProps))),
            React.createElement(Panel, { isOpen: this.state.panelOpen, isBlocking: true, hasCloseButton: true, className: `pnp__file-picker__panel ${styles.filePicker} ${panelClassName}`, onDismiss: this._handleClosePanel, type: PanelType.extraLarge, isFooterAtBottom: true, onRenderNavigation: () => {
                    return undefined;
                }, headerText: strings.FilePickerHeader, isLightDismiss: true, onRenderHeader: () => this._renderHeader() },
                React.createElement("div", { className: styles.nav },
                    React.createElement(Nav, { groups: this._getNavPanelOptions(), selectedKey: this.state.selectedTab, onLinkClick: (ev, item) => this._handleLinkClick(ev, item) })),
                React.createElement("div", { className: styles.tabsContainer },
                    this.state.selectedTab === FilePickerTabType.LinkUploadTab && (React.createElement(LinkFilePickerTab, Object.assign({ fileSearchService: this.fileSearchService, allowExternalLinks: this.props.allowExternalLinks, checkIfFileExists: this.props.checkIfFileExists !== false }, linkTabProps))),
                    this.state.selectedTab === FilePickerTabType.StockImagesTab && (React.createElement(StockImages, Object.assign({ language: this.props.context.pageContext.cultureInfo.currentCultureName, fileSearchService: this.fileSearchService }, linkTabProps))),
                    this.state.selectedTab === FilePickerTabType.LocalUploadTab && (React.createElement(UploadFilePickerTab, Object.assign({}, linkTabProps))),
                    this.state.selectedTab === FilePickerTabType.SiteFilesTab && (React.createElement(SiteFilePickerTab, Object.assign({ fileBrowserService: this.fileBrowserService, includePageLibraries: this.props.includePageLibraries }, linkTabProps))),
                    this.state.selectedTab ===
                        FilePickerTabType.OrganisationalAssetTab && (React.createElement(SiteFilePickerTab, Object.assign({ breadcrumbFirstNode: {
                            isCurrentItem: true,
                            text: strings.OrgAssetsTabLabel,
                            key: FilePickerTabType.OrganisationalAssetTab,
                        }, fileBrowserService: this.orgAssetsService }, linkTabProps))),
                    this.state.selectedTab === FilePickerTabType.WebSearchTab && (React.createElement(WebSearchTab, Object.assign({ bingSearchService: this.fileSearchService }, linkTabProps))),
                    this.state.selectedTab === FilePickerTabType.OneDriveTab && (React.createElement(OneDriveFilesTab, Object.assign({ oneDriveService: this.oneDriveService }, linkTabProps))),
                    this.state.selectedTab === FilePickerTabType.RecentTab && (React.createElement(RecentFilesTab, Object.assign({ fileSearchService: this.fileSearchService }, linkTabProps)))))));
    }
}
//# sourceMappingURL=FilePicker.js.map