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
import { GeneralHelper } from '../../../../../helpers/GeneralHelper';
import { LoadingState } from './IFileBrowserState';
import { TilesList } from '../TilesList/TilesList';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode, DetailsRow } from '@fluentui/react/lib/DetailsList';
import { CommandBar } from '@fluentui/react/lib/CommandBar';
import { ScrollablePane } from '@fluentui/react/lib/ScrollablePane';
import styles from './FileBrowser.module.scss';
import * as strings from 'PropertyControlStrings';
const LAYOUT_STORAGE_KEY = 'comparerSiteFilesLayout';
export class FileBrowser extends React.Component {
    constructor(props) {
        super(props);
        /**
         * Triggers paged data load
         */
        this._loadNextDataRequest = () => __awaiter(this, void 0, void 0, function* () {
            if (this.state.loadingState === LoadingState.idle) {
                // Load next list items from next page
                yield this._getListItems(true);
            }
        });
        /**
        * Renders a placeholder to indicate that the folder is empty
        */
        this._renderEmptyFolder = () => {
            return (React.createElement("div", { className: styles.emptyFolder },
                React.createElement("div", { className: styles.emptyFolderImage },
                    React.createElement("img", { className: styles.emptyFolderImageTag, src: strings.OneDriveEmptyFolderIconUrl, alt: strings.OneDriveEmptyFolderAlt })),
                React.createElement("div", { role: "alert" },
                    React.createElement("div", { className: styles.emptyFolderTitle }, strings.OneDriveEmptyFolderTitle),
                    React.createElement("div", { className: styles.emptyFolderSubText },
                        React.createElement("span", { className: styles.emptyFolderPc }, strings.OneDriveEmptyFolderDescription)))));
        };
        /**
         * Renders row with file or folder style.
         */
        this._onRenderRow = (props) => {
            const fileItem = props.item;
            return React.createElement(DetailsRow, Object.assign({}, props, { className: fileItem.isFolder ? styles.folderRow : styles.fileRow }));
        };
        /**
         * Get the list of toolbar items on the left side of the toolbar.
         * We leave it empty for now, but we may add the ability to upload later.
         */
        this._getToolbarItems = () => {
            return [];
        };
        this.getFarItems = () => {
            const { selectedView } = this.state;
            let viewIconName = undefined;
            let viewName = undefined;
            switch (this.state.selectedView) {
                case 'list':
                    viewIconName = 'List';
                    viewName = strings.ListLayoutList;
                    break;
                case 'compact':
                    viewIconName = 'AlignLeft';
                    viewName = strings.ListLayoutCompact;
                    break;
                default:
                    viewIconName = 'GridViewMedium';
                    viewName = strings.ListLayoutTile;
            }
            const farItems = [
                {
                    key: 'listOptions',
                    className: styles.commandBarNoChevron,
                    title: strings.ListOptionsTitle,
                    ariaLabel: strings.ListOptionsAlt.replace('{0}', viewName),
                    iconProps: {
                        iconName: viewIconName
                    },
                    iconOnly: true,
                    subMenuProps: {
                        items: [
                            {
                                key: 'list',
                                name: strings.ListLayoutList,
                                iconProps: {
                                    iconName: 'List'
                                },
                                canCheck: true,
                                checked: this.state.selectedView === 'list',
                                ariaLabel: strings.ListLayoutAriaLabel.replace('{0}', strings.ListLayoutList).replace('{1}', selectedView === 'list' ? strings.Selected : undefined),
                                title: strings.ListLayoutListDescrition,
                                onClick: (_ev, item) => this._handleSwitchLayout(item)
                            },
                            {
                                key: 'compact',
                                name: strings.ListLayoutCompact,
                                iconProps: {
                                    iconName: 'AlignLeft'
                                },
                                canCheck: true,
                                checked: this.state.selectedView === 'compact',
                                ariaLabel: strings.ListLayoutAriaLabel.replace('{0}', strings.ListLayoutCompact).replace('{1}', selectedView === 'compact' ? strings.Selected : undefined),
                                title: strings.ListLayoutCompactDescription,
                                onClick: (_ev, item) => this._handleSwitchLayout(item)
                            },
                            {
                                key: 'tiles',
                                name: 'Tiles',
                                iconProps: {
                                    iconName: 'GridViewMedium'
                                },
                                canCheck: true,
                                checked: this.state.selectedView === 'tiles',
                                ariaLabel: strings.ListLayoutAriaLabel.replace('{0}', strings.ListLayoutTile).replace('{1}', selectedView === 'tiles' ? strings.Selected : undefined),
                                title: strings.ListLayoutTileDescription,
                                onClick: (_ev, item) => this._handleSwitchLayout(item)
                            }
                        ]
                    }
                }
            ];
            return farItems;
        };
        /**
         * Called when users switch the view
         */
        this._handleSwitchLayout = (item) => {
            if (item) {
                // Store the user's favourite layout
                if (localStorage) {
                    localStorage.setItem(LAYOUT_STORAGE_KEY, item.key);
                }
                this.setState({
                    selectedView: item.key
                });
            }
        };
        /**
         * Gratuitous sorting
         */
        this._onColumnClick = (event, column) => {
            const { columns } = this.state;
            let { items } = this.state;
            let isSortedDescending = column.isSortedDescending;
            // If we've sorted this column, flip it.
            if (column.isSorted) {
                isSortedDescending = !isSortedDescending;
            }
            const newColumns = columns.map(col => {
                col.isSorted = col.key === column.key;
                if (col.isSorted) {
                    col.isSortedDescending = isSortedDescending;
                }
                return col;
            });
            if (items[items.length - 1] !== null) // there are no more items to fetch from the server (there is no 'null' placeholder), we can sort client-side
             {
                // Sort the items.
                items = items.concat([]).sort((a, b) => {
                    let firstValue = a[column.fieldName || ''];
                    let secondValue = b[column.fieldName || ''];
                    if (typeof firstValue === 'string') {
                        firstValue = firstValue.toLocaleLowerCase();
                        secondValue = secondValue.toLocaleLowerCase();
                    }
                    const sortFactor = isSortedDescending ? -1 : 1;
                    if (firstValue > secondValue)
                        return 1 * sortFactor;
                    else if (firstValue < secondValue)
                        return -1 * sortFactor;
                    else
                        return 0;
                });
                // If the column being sorted is the 'name' column, then keep all the folders together
                if (column.fieldName === "name") {
                    const folders = items.filter(item => item.isFolder);
                    const files = items.filter(item => !item.isFolder);
                    items = [
                        ...(isSortedDescending ? files : folders),
                        ...(isSortedDescending ? folders : files),
                    ];
                }
                // Reset the items and columns to match the state.
                this.setState({
                    items: items,
                    columns: newColumns,
                    currentSortColumnName: column.fieldName
                });
            }
            else { // we need to sort server-side
                this.setState({
                    columns: newColumns,
                    currentSortColumnName: column.fieldName
                }, () => {
                    this._getListItems().then(() => { }).catch(() => { });
                });
            }
        };
        /**
         * When a folder is opened, calls parent tab to navigate down
         */
        this._handleOpenFolder = (item) => {
            // De-select the list item that was clicked, the item in the same position
            this._selection.setAllSelected(false);
            // item in the folder will appear selected
            this.setState({
                loadingState: LoadingState.loading,
                filePickerResult: undefined
            }, () => { this.props.onOpenFolder(item); });
        };
        /**
         * Handles selected item change
         */
        this._itemSelectionChanged = (item) => {
            let selectedItem = null;
            // Deselect item
            if (item && this.state.filePickerResult && item.absoluteUrl === this.state.filePickerResult.fileAbsoluteUrl) {
                this._selection.setAllSelected(false);
                selectedItem = null;
            }
            else if (item) {
                const selectedItemIndex = this.state.items.indexOf(item);
                this._selection.selectToIndex(selectedItemIndex);
                selectedItem = item;
            }
            let filePickerResult = null;
            if (selectedItem && !selectedItem.isFolder) {
                filePickerResult = {
                    fileAbsoluteUrl: selectedItem.absoluteUrl,
                    fileName: GeneralHelper.getFileNameFromUrl(selectedItem.name),
                    fileNameWithoutExtension: GeneralHelper.getFileNameWithoutExtension(selectedItem.name),
                    spItemUrl: selectedItem.spItemUrl,
                    downloadFileContent: null
                };
            }
            this.props.onChange(filePickerResult);
            this.setState({
                filePickerResult
            });
        };
        /**
         * Handles item click.
         */
        this._handleItemInvoked = (item) => {
            // If a file is selected, open the library
            if (item.isFolder) {
                this._handleOpenFolder(item);
            }
            else {
                // Otherwise, remember it was selected
                this._itemSelectionChanged(item);
            }
        };
        // If possible, load the user's favourite layout
        const lastLayout = localStorage ?
            localStorage.getItem(LAYOUT_STORAGE_KEY)
            : 'list';
        const columns = [
            {
                key: 'column1',
                name: 'Type',
                ariaLabel: strings.TypeAriaLabel,
                iconName: 'Page',
                isIconOnly: true,
                fieldName: 'docIcon',
                headerClassName: styles.iconColumnHeader,
                minWidth: 16,
                maxWidth: 16,
                onColumnClick: this._onColumnClick,
                onRender: (item) => {
                    const folderIcon = strings.FolderIconUrl;
                    // TODO: Improve file icon URL
                    const isPhoto = GeneralHelper.isImage(item.name);
                    const iconUrl = isPhoto
                        ? strings.PhotoIconUrl
                        : item.fileType.toLowerCase() === "aspx"
                            ? 'https://res-1.cdn.office.net/files/fabric-cdn-prod_20220127.003/assets/item-types/20/spo.svg'
                            : `https://res-1.cdn.office.net/files/fabric-cdn-prod_20220127.003/assets/item-types/20/${item.fileType}.svg`;
                    const altText = item.isFolder ? strings.FolderAltText : strings.ImageAltText.replace('{0}', item.fileType);
                    return React.createElement("div", { className: styles.fileTypeIcon },
                        React.createElement("img", { src: item.isFolder ? folderIcon : iconUrl, className: styles.fileTypeIconIcon, alt: altText, title: altText }));
                }
            },
            {
                key: 'column2',
                name: strings.NameField,
                fieldName: 'name',
                minWidth: 210,
                isRowHeader: true,
                isResizable: true,
                isSorted: true,
                isSortedDescending: false,
                sortAscendingAriaLabel: strings.SortedAscending,
                sortDescendingAriaLabel: strings.SortedDescending,
                onColumnClick: this._onColumnClick,
                data: 'string',
                isPadded: true,
                onRender: (item) => {
                    if (item.isFolder) {
                        return React.createElement("span", { className: styles.folderItem, onClick: (_event) => this._handleOpenFolder(item) }, item.name);
                    }
                    else {
                        return React.createElement("span", { className: styles.fileItem }, item.name);
                    }
                },
            },
            {
                key: 'column3',
                name: strings.ModifiedField,
                fieldName: 'modified',
                minWidth: 120,
                isResizable: true,
                onColumnClick: this._onColumnClick,
                data: 'number',
                onRender: (item) => {
                    //const dateModified = moment(item.modified).format(strings.DateFormat);
                    return React.createElement("span", null, item.modifiedFriendly);
                },
                isPadded: true
            },
            {
                key: 'column4',
                name: strings.ModifiedByField,
                fieldName: 'modifiedBy',
                minWidth: 120,
                isResizable: true,
                data: 'string',
                onColumnClick: this._onColumnClick,
                onRender: (item) => {
                    return React.createElement("span", null, item.modifiedBy);
                },
                isPadded: true
            },
            {
                key: 'column5',
                name: strings.FileSizeField,
                fieldName: 'fileSize',
                minWidth: 70,
                maxWidth: 90,
                isResizable: true,
                data: 'number',
                onColumnClick: this._onColumnClick,
                onRender: (item) => {
                    return React.createElement("span", null, item.fileSize ? GeneralHelper.formatBytes(item.fileSize, 1) : undefined);
                }
            }
        ];
        this._selection = new Selection({
            selectionMode: SelectionMode.single
        });
        const currentSortColumn = columns.filter(c => c.isSorted === true); // TODO: switch to '.find' if/when this codebase upgrade to >= ES2015
        this.state = {
            columns: columns,
            items: [],
            nextPageQueryString: null,
            loadingState: LoadingState.loading,
            selectedView: lastLayout,
            filePickerResult: null,
            currentSortColumnName: currentSortColumn.length ? currentSortColumn[0].fieldName : null,
        };
    }
    /**
     * Gets the list of files when settings change
     * @param prevProps
     * @param prevState
     */
    componentDidUpdate(prevProps, prevState) {
        if (this.props.folderPath !== prevProps.folderPath) {
            this._selection.setAllSelected(false);
            this._getListItems().then(() => { }).catch(() => { });
        }
    }
    /**
     * Gets the list of files when tab first loads
     */
    componentDidMount() {
        this._getListItems().then(() => { }).catch(() => { });
    }
    render() {
        return (React.createElement("div", null,
            (this.state.items && this.state.items.length > 0 && this.state.loadingState !== LoadingState.loading) &&
                React.createElement("div", null,
                    React.createElement("div", { className: styles.itemPickerTopBar },
                        React.createElement(CommandBar, { items: this._getToolbarItems(), farItems: this.getFarItems() })),
                    React.createElement("div", { className: styles.scrollablePaneWrapper },
                        React.createElement(ScrollablePane, null, this.state.selectedView !== 'tiles' ?
                            (React.createElement(DetailsList, { items: this.state.items, compact: this.state.selectedView === 'compact', columns: this.state.columns, selectionMode: SelectionMode.single, setKey: "set", layoutMode: DetailsListLayoutMode.justified, isHeaderVisible: true, selection: this._selection, onActiveItemChanged: (item, index, ev) => this._handleItemInvoked(item), selectionPreservedOnEmptyClick: true, enterModalSelectionOnTouch: true, onRenderRow: this._onRenderRow, onRenderMissingItem: () => { this._loadNextDataRequest().then(() => { }).catch(() => { }); return null; } })) :
                            (React.createElement(TilesList, { fileBrowserService: this.props.fileBrowserService, filePickerResult: this.state.filePickerResult, selection: this._selection, items: this.state.items, onFolderOpen: this._handleOpenFolder, onFileSelected: this._itemSelectionChanged, onNextPageDataRequest: this._loadNextDataRequest, context: this.props.context }))))),
            (this.state.loadingState === LoadingState.idle && (!this.state.items || this.state.items.length <= 0)) &&
                /* Render information about empty folder */
                this._renderEmptyFolder(),
            this.state.loadingState !== LoadingState.idle &&
                React.createElement(Spinner, { label: strings.Loading })));
    }
    /**
     * Gets all files in a library with a matchihg path
     */
    _getListItems(concatenateResults = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const { libraryId, folderPath, accepts } = this.props;
            let { nextPageQueryString } = this.state;
            const { items, currentSortColumnName, columns } = this.state;
            const currentSortColumn = columns.filter(c => c.fieldName === currentSortColumnName); // TODO: switch to '.find' if/when this codebase upgrade to >= ES2015
            const isSortedDescending = currentSortColumn.length ? currentSortColumn[0].isSortedDescending : false;
            let filesQueryResult = { items: [], nextHref: null };
            const loadingState = concatenateResults ? LoadingState.loadingNextPage : LoadingState.loading;
            // If concatenate results is set to false -> it's needed to load new data without nextPageUrl
            nextPageQueryString = concatenateResults ? nextPageQueryString : null;
            try {
                this.setState({
                    loadingState,
                    nextPageQueryString
                });
                // Load files in the folder
                filesQueryResult = yield this.props.fileBrowserService.getListItemsByListId(libraryId, folderPath, accepts, nextPageQueryString, currentSortColumnName, isSortedDescending);
            }
            catch (error) {
                filesQueryResult.items = null;
                console.error(error.message);
            }
            finally {
                // Remove the null mark from the end of the items array
                if (concatenateResults && items && items.length > 0 && items[items.length - 1] === null) {
                    // Remove the null mark
                    items.splice(items.length - 1, 1);
                }
                //concatenate results
                const newItems = concatenateResults ? items.concat(filesQueryResult.items) : filesQueryResult.items;
                // If there are more items to load -> add null mark at the end of the array
                if (filesQueryResult.nextHref) {
                    newItems.push(null);
                }
                if (!concatenateResults) {
                    // de-select anything that was previously selected
                    this._selection.setAllSelected(false);
                }
                this.setState({
                    items: newItems,
                    nextPageQueryString: filesQueryResult.nextHref,
                    // isLoading: false,
                    // isLoadingNextPage: false
                    loadingState: LoadingState.idle
                });
            }
        });
    }
}
//# sourceMappingURL=FileBrowser.js.map