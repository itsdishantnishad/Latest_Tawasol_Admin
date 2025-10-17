var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from 'react';
import styles from './TilesList.module.scss';
import { SelectionZone } from '@fluentui/react/lib/Selection';
import { List } from '@fluentui/react/lib/List';
import { FocusZone } from '@fluentui/react/lib/FocusZone';
import { css } from '@fluentui/react/lib/Utilities';
import { FolderTile } from '../FolderTile';
import { DocumentTile } from '../DocumentTile';
/**
 * Rows per page
 */
const ROWS_PER_PAGE = 3;
/**
 * Maximum row height
 */
const MAX_ROW_HEIGHT = 250;
/**
 * Maximum number of cells per page
 */
const CELLS_PER_PAGE = 48;
/**
 * Standard tile margin
 */
const STANDARD_TILE_MARGIN = 4;
/**
 * Standard left and right padding
 */
const TILE_HORZ_PADDING = 32;
/**
 * Standard bottom margin
 */
const BOTTOM_MARGIN = 36;
export class TilesList extends React.Component {
    constructor(props) {
        super(props);
        this._listElem = undefined;
        /**
        * Gets called what a file is selected.
        */
        this._handleItemInvoked = (item) => {
            // If a file is selected, open the library
            if (item.isFolder) {
                this.props.onFolderOpen(item);
            }
            else {
                // Otherwise, remember it was selected
                this.props.onFileSelected(item);
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
                this._pageWidth = surfaceRect.width;
            }
            // Get the list of items
            const { items } = this.props;
            const isFolder = items && items.length > itemIndex && items[itemIndex] ? items[itemIndex].isFolder : undefined;
            // Group items by folders and files
            let pageLength = 0;
            for (let index = itemIndex; index < items.length; index++) {
                const element = items[index];
                if (element && element.isFolder === isFolder) {
                    pageLength++;
                }
                else {
                    break;
                }
            }
            // Return the page lenght, up to the maximum number of cells per page
            return Math.min(pageLength, CELLS_PER_PAGE);
        };
        /**
         * Renders a custom list page
         */
        this._onRenderPage = (pageProps, _defaultRender) => {
            const { page, className: pageClassName } = pageProps, divProps = __rest(pageProps, ["page", "className"]);
            const { items } = page;
            // If there are not items to be rendered or the last one is a null mark -> request for next page data
            if (!items) {
                return null;
            }
            return (React.createElement("div", Object.assign({}, divProps, { className: css(pageClassName, styles.listPage), key: page.key }),
                React.createElement("div", { className: styles.grid, style: {
                        width: this._pageWidth,
                        marginTop: -STANDARD_TILE_MARGIN,
                        marginBottom: BOTTOM_MARGIN,
                        marginLeft: -STANDARD_TILE_MARGIN,
                        marginRight: -STANDARD_TILE_MARGIN
                    } }, items.map((item, index) => {
                    return this._onRenderCell(item, index);
                }))));
        };
        /** Calculates the list "page" height (a.k.a. row) */
        this._getPageHeight = () => {
            return this._rowHeight * ROWS_PER_PAGE;
        };
        /**
         * Renders a file folder cover
         */
        this._onRenderCell = (item, index) => {
            if (!item) {
                this.props.onNextPageDataRequest();
                return null;
            }
            const isSelected = this.props.filePickerResult && item.absoluteUrl === this.props.filePickerResult.fileAbsoluteUrl;
            // I know this is a lot of divs and spans inside of each other, but my
            // goal was to mimic the HTML and style of the out-of-the-box file picker
            // to the best of my ability.
            return (React.createElement("div", { className: styles.listCell, "data-item-index": index, style: {
                    flexBasis: this._columnWidth,
                    maxWidth: this._columnWidth,
                    margin: STANDARD_TILE_MARGIN,
                    borderStyle: "none",
                    borderWidth: 0
                } },
                React.createElement("div", { role: "presentation", className: styles.cell, 
                    // I don't agree with this magic number. Where does this come from?
                    style: { paddingTop: "97.16%" } },
                    React.createElement("div", { role: "presentation", className: styles.cellContent }, item.isFolder ?
                        React.createElement(FolderTile, { item: item, index: index, isSelected: isSelected, pageWidth: this._pageWidth, tileDimensions: {
                                width: this._columnWidth - TILE_HORZ_PADDING,
                                height: this._rowHeight - TILE_HORZ_PADDING
                            }, onItemInvoked: (itemInvoked) => this._handleItemInvoked(itemInvoked), context: this.props.context })
                        :
                            React.createElement(DocumentTile, { fileBrowserService: this.props.fileBrowserService, item: item, index: index, isSelected: isSelected, pageWidth: this._pageWidth, tileDimensions: {
                                    width: this._columnWidth - TILE_HORZ_PADDING,
                                    height: this._rowHeight - TILE_HORZ_PADDING
                                }, onItemInvoked: (itemInvoked) => this._handleItemInvoked(itemInvoked) })))));
        };
    }
    componentDidUpdate(prevProps) {
        if (this.props.filePickerResult !== prevProps.filePickerResult) {
            this._listElem.forceUpdate();
        }
    }
    render() {
        return (React.createElement(SelectionZone, { selection: this.props.selection, onItemInvoked: (item) => { this._handleItemInvoked(item); } },
            React.createElement(FocusZone, null,
                React.createElement(List, { ref: (e) => {
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
                    }, className: styles.folderList, items: this.props.items, getItemCountForPage: this._getItemCountForPage, getPageHeight: this._getPageHeight, onRenderPage: (pageProps, defaultRender) => this._onRenderPage(pageProps, defaultRender) }))));
    }
}
//# sourceMappingURL=TilesList.js.map