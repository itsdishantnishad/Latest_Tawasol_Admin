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
import { PrimaryButton, DefaultButton, Spinner, FocusZone, List, css, Selection, SelectionMode, SelectionZone, Image, ImageFit, Check, } from '@fluentui/react';
import { Placeholder } from '../../placeHolderControl';
import { GeneralHelper } from '../../../../helpers/GeneralHelper';
import * as strings from 'PropertyControlStrings';
import styles from './RecentFilesTab.module.scss';
/**
 * Rows per page
 */
const ROWS_PER_PAGE = 3;
/**
 * Maximum row height
 */
const MAX_ROW_HEIGHT = 175;
export default class RecentFilesTab extends React.Component {
    constructor(props) {
        super(props);
        this._listElem = undefined;
        this._onSelectionChanged = () => {
            // Get the selected item
            const selectedItems = this._selection.getSelection();
            if (selectedItems && selectedItems.length > 0) {
                //Get the selected key
                const selectedKey = selectedItems[0];
                const filePickerResult = {
                    fileAbsoluteUrl: selectedKey.fileUrl,
                    fileName: GeneralHelper.getFileNameFromUrl(selectedKey.fileUrl),
                    fileNameWithoutExtension: GeneralHelper.getFileNameWithoutExtension(selectedKey.fileUrl),
                    downloadFileContent: () => {
                        return this.props.fileSearchService.downloadSPFileContent(selectedKey.fileUrl, GeneralHelper.getFileNameFromUrl(selectedKey.fileUrl));
                    },
                };
                // Save the selected file
                this.setState({
                    filePickerResult,
                });
            }
            else {
                // Remove any selected file
                this.setState({
                    filePickerResult: undefined,
                });
            }
            if (this._listElem) {
                // Force the list to update to show the selection check
                this._listElem.forceUpdate();
            }
        };
        /**
         * Calculates how many items there should be in the page
         */
        this._getItemCountForPage = (itemIndex, surfaceRect) => {
            if (itemIndex === 0 && surfaceRect.width > 0) {
                this._columnCount = Math.ceil(surfaceRect.width / MAX_ROW_HEIGHT);
                this._columnWidth = Math.floor(surfaceRect.width / this._columnCount);
                this._rowHeight = this._columnWidth;
            }
            return this._columnCount * ROWS_PER_PAGE;
        };
        /** Calculates the list "page" height (a.k.a. row) */
        this._getPageHeight = () => {
            return this._rowHeight * ROWS_PER_PAGE;
        };
        /**
         * Renders a "please wait" spinner while we're loading
         */
        this._renderSpinner = () => {
            return React.createElement(Spinner, { label: strings.Loading });
        };
        /**
         * Renders a message saying that there are no recent files
         */
        this._renderPlaceholder = () => {
            return (React.createElement(Placeholder, { iconName: 'OpenFolderHorizontal', iconText: strings.NoRecentFiles, description: strings.NoRecentFilesDescription }));
        };
        /**
         * Renders a grid list containing results
         */
        this._renderGridList = () => {
            return (React.createElement("span", { className: styles.recentGridList, role: 'grid' },
                React.createElement(FocusZone, null,
                    React.createElement(SelectionZone, { selection: this._selection, onItemInvoked: (item) => this._handleItemInvoked(item) },
                        React.createElement(List, { ref: this._linkElement, items: this.state.results, onRenderCell: this._onRenderCell, getItemCountForPage: this._getItemCountForPage, getPageHeight: this._getPageHeight, renderedWindowsAhead: 4 })))));
        };
        /**
         * Renders each result in its own cell
         */
        this._onRenderCell = (item, index) => {
            let isSelected = false;
            if (this._selection && index !== undefined) {
                isSelected = this._selection.isIndexSelected(index);
            }
            return (React.createElement("div", { className: styles.gridListCell, role: 'gridCell' },
                React.createElement("div", { className: css(styles.itemTile, styles.isFile, styles.hasThumbnail, isSelected ? styles.isSelected : undefined), role: 'link', "aria-selected": isSelected, "data-is-draggable": 'false', "data-is-focusable": 'true', "data-selection-index": index, "data-selection-invoke": 'true', "data-item-index": index, "data-automationid": 'ItemTile', style: {
                        width: this._columnWidth,
                        height: this._rowHeight,
                    } },
                    React.createElement("div", { className: styles.itemTileContent },
                        React.createElement("div", { className: styles.itemTileFile },
                            React.createElement("div", { className: styles.itemTileFileContainer },
                                React.createElement("div", { className: styles.itemTileThumbnail },
                                    React.createElement(Image, { src: item.fileUrl, width: this._columnWidth, height: this._rowHeight, imageFit: ImageFit.cover })),
                                React.createElement("div", { className: styles.itemTileCheckCircle, role: 'checkbox', "aria-checked": isSelected, "data-item-index": index, "data-selection-toggle": true, "data-automationid": 'CheckCircle' },
                                    React.createElement(Check, { checked: isSelected })),
                                React.createElement("div", { className: styles.itemTileNamePlate },
                                    React.createElement("div", { className: styles.itemTileName }, item.name),
                                    React.createElement("div", { className: styles.itemTileSubText },
                                        React.createElement("span", null,
                                            strings.EditedByNamePlate,
                                            item.editedBy)))))))));
        };
        /**
         * Gets called what a file is selected.
         */
        this._handleItemInvoked = (item) => {
            this._selection.setKeySelected(item.key, true, true);
        };
        /**
         * Gets called when it is time to save the currently selected item
         */
        this._handleSave = () => {
            this.props.onSave(this.state.filePickerResult);
        };
        /**
         * Gets called when it is time to close (without saving)
         */
        this._handleClose = () => {
            this.props.onClose();
        };
        /**
         * Creates a ref to the list
         */
        this._linkElement = (e) => {
            const needToUpdate = !this._listElem && !!e && !this._columnWidth;
            this._listElem = e;
            //
            // sometimes getItemCountForPage is called when surfaceRect is still has 0 width
            // We need to rerender the list if that happens
            //
            if (needToUpdate) {
                setTimeout(() => {
                    this._listElem.forceUpdate();
                }, 0);
            }
        };
        this._selection = new Selection({
            selectionMode: SelectionMode.single,
            onSelectionChanged: this._onSelectionChanged,
        });
        this.state = {
            isLoading: true,
            results: [],
            filePickerResult: null,
        };
    }
    /**
     * Gets the most recently used files
     */
    componentDidMount() {
        return __awaiter(this, void 0, void 0, function* () {
            const recentFilesResult = yield this.props.fileSearchService.executeRecentSearch(this.props.accepts);
            this._selection.setItems(recentFilesResult, true);
            this.setState({
                isLoading: false,
                results: recentFilesResult,
            });
        });
    }
    /**
     * Render the tab
     */
    render() {
        const { results, isLoading } = this.state;
        return (React.createElement("div", { className: styles.tabContainer },
            React.createElement("div", { className: styles.tabHeaderContainer },
                React.createElement("h2", { className: styles.tabHeader }, strings.RecentDocumentsHeader)),
            React.createElement("div", { className: css(styles.tab, styles.tabOffset) }, isLoading
                ? this._renderSpinner()
                : results === undefined || results.length < 1
                    ? this._renderPlaceholder()
                    : this._renderGridList()),
            React.createElement("div", { className: styles.actionButtonsContainer },
                React.createElement("div", { className: styles.actionButtons },
                    React.createElement(PrimaryButton, { disabled: !this.state.filePickerResult, onClick: () => this._handleSave(), className: styles.actionButton }, strings.OpenButtonLabel),
                    React.createElement(DefaultButton, { onClick: () => this._handleClose(), className: styles.actionButton }, strings.CancelButtonLabel)))));
    }
}
//# sourceMappingURL=RecentFilesTab.js.map