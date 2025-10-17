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
import styles from './FolderExplorer.module.scss';
import * as strings from 'PropertyControlStrings';
import { Icon } from "@fluentui/react/lib/Icon";
import { FolderExplorerService } from '../../../../services/FolderExplorerService';
import { NewFolder } from "../NewFolder";
import { Breadcrumb } from "@fluentui/react/lib/Breadcrumb";
import { SearchBox } from '@fluentui/react/lib/SearchBox';
export class FolderExplorer extends React.Component {
    constructor(props) {
        super(props);
        this._allLibraries = [];
        this._allFolders = [];
        /**
       * Get HTML elements for rendering breadcrumb
       */
        this._getBreadcrumbDOM = () => {
            let breadCrumbDOM = null;
            const breadCrumbItems = this._getCurrentBreadcrumbItems();
            const overflowIndex = breadCrumbItems.length > 1 ? 1 : 0;
            breadCrumbDOM = React.createElement(Breadcrumb, { items: breadCrumbItems, className: styles.breadcrumbPath, maxDisplayedItems: 3, overflowIndex: overflowIndex });
            return breadCrumbDOM;
        };
        /**
       * Get breadcrumb items
       * @returns an array of IBreadcrumbItem objects
       */
        this._getCurrentBreadcrumbItems = () => {
            let items = [];
            if (this.props.initialBreadcrumbItems) {
                items = [...this.props.initialBreadcrumbItems];
            }
            const rootItem = { text: this.props.rootFolder.Name, key: 'Root-Item', onClick: this._getFolders.bind(this, this.props.rootFolder) };
            items.push(rootItem);
            if (this.state.selectedFolder && this.state.selectedFolder.ServerRelativeUrl !== this.props.rootFolder.ServerRelativeUrl) {
                const folderPathSplit = this.state.selectedFolder.ServerRelativeUrl.replace(this.props.rootFolder.ServerRelativeUrl, '').split('/');
                let folderPath = this.props.rootFolder.ServerRelativeUrl;
                folderPathSplit.forEach((folderName, index) => {
                    if (folderName !== '') {
                        folderPath += '/' + folderName;
                        let itemText = folderName;
                        // check if library and if so use the Title of the library that was retrieved in case it's not the same as the url part
                        const lib = this._allLibraries.filter(l => l.ServerRelativeUrl === folderPath);
                        if (lib.length === 1) {
                            itemText = lib[0].Name;
                        }
                        const folderItem = { text: itemText, key: `Folder-${index.toString()}`, onClick: this._getFolders.bind(this, { Name: folderName, ServerRelativeUrl: folderPath }) };
                        items.push(folderItem);
                    }
                });
            }
            items[items.length - 1].isCurrentItem = true;
            return items;
        };
        /**
       * Filter list of folders based on user input
       * @param filterText - The text to use when filtering the collection
       */
        this._onChangeFilterText = (filterText) => {
            this.setState({
                folders: filterText ? this._allFolders.filter(f => f.Name.toLowerCase().indexOf(filterText.toLowerCase()) > -1) : this._allFolders
            });
        };
        /**
      * Load sub folders and files within a given folder
      * @param folder - Name of the folder
      */
        this._getFolders = (folder) => __awaiter(this, void 0, void 0, function* () {
            this.setState({ foldersLoading: true });
            try {
                const siteAbsoluteUrl = this.props.siteAbsoluteUrl || this.props.context.pageContext.web.absoluteUrl;
                // check if absolute url ends with relative url to know if we are at the site level
                if (siteAbsoluteUrl.lastIndexOf(folder.ServerRelativeUrl, siteAbsoluteUrl.length - folder.ServerRelativeUrl.length) !== -1) {
                    // site level, get libraries
                    if (this._allLibraries.length > 0) {
                        this._allFolders = [...this._allLibraries];
                    }
                    else {
                        this._allLibraries = yield this._spService.getDocumentLibraries(siteAbsoluteUrl);
                        this._allFolders = [...this._allLibraries];
                    }
                }
                else {
                    // library/folder level, get folders
                    this._allFolders = yield this._spService.getFolders(siteAbsoluteUrl, folder.ServerRelativeUrl);
                }
                this.setState({ folders: this._allFolders, selectedFolder: folder, foldersLoading: false });
                // callback to parent component
                this.props.onSelect(folder);
            }
            catch (error) {
                this.setState({ selectedFolder: null, foldersLoading: false });
                console.error(error);
            }
        });
        /**
        * Add new subfolder to current folder
        */
        this._addSubFolder = (newFolder) => __awaiter(this, void 0, void 0, function* () {
            if (newFolder) {
                // add folder if a folder with the same name does not exist yet
                if (!this._allFolders.some(f => f.Name === newFolder.Name)) {
                    // update both list of folders
                    this._allFolders.push(newFolder);
                    this.setState({
                        folders: this._allFolders
                    });
                }
            }
        });
        this._spService = new FolderExplorerService(this.props.context.serviceScope);
        this.state = {
            foldersLoading: false,
            folders: [],
            selectedFolder: null,
        };
    }
    componentDidMount() {
        return __awaiter(this, void 0, void 0, function* () {
            const targetFolder = this.props.defaultFolder ? this.props.defaultFolder : this.props.rootFolder;
            const siteAbsoluteUrl = this.props.siteAbsoluteUrl || this.props.context.pageContext.web.absoluteUrl;
            // get libraries if site absolute url does not end with folder relative url - if not retrieving document libraries by default
            if (siteAbsoluteUrl.lastIndexOf(targetFolder.ServerRelativeUrl, siteAbsoluteUrl.length - targetFolder.ServerRelativeUrl.length) === -1) {
                this._allLibraries = yield this._spService.getDocumentLibraries(siteAbsoluteUrl);
            }
            yield this._getFolders(targetFolder);
        });
    }
    render() {
        const siteAbsoluteUrl = this.props.siteAbsoluteUrl || this.props.context.pageContext.web.absoluteUrl;
        return (React.createElement("div", null,
            !this.props.hiddenBreadcrumb &&
                this._getBreadcrumbDOM(),
            React.createElement("div", { style: { opacity: this.state.foldersLoading ? 0.8 : 1, } },
                !this.props.hiddenFilterBox && this._allFolders.length > 0 &&
                    React.createElement("div", null,
                        React.createElement(SearchBox, { className: styles.filterBox, placeholder: strings.FolderFilterBoxPlaceholder, onSearch: this._onChangeFilterText, onChange: (e, value) => this._onChangeFilterText(value) })),
                this.state.folders.length === 0 &&
                    React.createElement("div", { className: styles.status },
                        React.createElement("span", { role: "status" }, this.state.foldersLoading ? strings.FolderExplorerLoading : strings.FolderExplorerNoItems)),
                this.state.folders.length > 0 &&
                    React.createElement("div", null, this.state.folders.map((folder) => {
                        return (React.createElement("div", { key: folder.Name, className: styles.libraryItem, onClick: () => { this._getFolders(folder).then(() => { }).catch(() => { }); } },
                            React.createElement(Icon, { iconName: "FabricFolder", className: styles.folderIcon }),
                            folder.Name));
                    })),
                this.props.canCreateFolders && (this.state.selectedFolder && this.state.selectedFolder.ServerRelativeUrl !== this.props.context.pageContext.web.serverRelativeUrl) &&
                    React.createElement(NewFolder, { context: this.props.context, siteAbsoluteUrl: siteAbsoluteUrl, selectedFolder: this.state.selectedFolder, addSubFolder: this._addSubFolder }))));
    }
}
//# sourceMappingURL=FolderExplorer.js.map