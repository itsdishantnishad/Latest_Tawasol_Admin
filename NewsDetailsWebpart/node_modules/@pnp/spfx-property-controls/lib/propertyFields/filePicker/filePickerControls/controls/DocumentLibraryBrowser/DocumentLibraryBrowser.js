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
import { FocusZone } from '@fluentui/react/lib/FocusZone';
import { List } from '@fluentui/react/lib/List';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { Image, ImageFit } from '@fluentui/react/lib/Image';
import { DefaultButton } from '@fluentui/react/lib/Button';
import styles from './DocumentLibraryBrowser.module.scss';
import * as strings from 'PropertyControlStrings';
/**
 * Rows per page
 */
export const ROWS_PER_PAGE = 3;
/**
 * Maximum row height
 */
export const MAX_ROW_HEIGHT = 250;
/**
 * This would have been better done as an Office Fabric TileList, but it isn't available yet for production use
 */
export class DocumentLibraryBrowser extends React.Component {
    constructor(props) {
        super(props);
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
        /**
         * Gets the height of a list "page"
         */
        this._getPageHeight = () => {
            return this._rowHeight * ROWS_PER_PAGE;
        };
        /**
         * Renders a cell for search suggestions
         */
        this._onRenderLibraryTile = (item, index) => {
            const imgSrc = item.iconPath ? item.iconPath : "";
            return (React.createElement("div", { className: styles.filePickerFolderCardTile, "data-is-focusable": true, style: {
                    width: 100 / this._columnCount + '%'
                } },
                React.createElement("div", { className: styles.filePickerFolderCardSizer },
                    React.createElement("div", { className: styles.filePickerFolderCardPadder },
                        React.createElement(Image, { src: imgSrc, className: styles.filePickerFolderCardImage, imageFit: ImageFit.cover }),
                        React.createElement(DefaultButton, { className: styles.filePickerFolderCardLabel, onClick: (_event) => this._handleOpenLibrary(item) }, item.title)))));
        };
        /**
         * Calls parent when library is opened
         */
        this._handleOpenLibrary = (library) => {
            this.props.onOpenLibrary(library);
        };
        this.state = {
            isLoading: true,
            lists: []
        };
    }
    componentDidMount() {
        return __awaiter(this, void 0, void 0, function* () {
            const includePageLibraries = this.props.includePageLibraries ? this.props.includePageLibraries : false;
            const lists = yield this.props.fileBrowserService.getSiteMediaLibraries(includePageLibraries);
            this.setState({
                lists: lists,
                isLoading: false
            });
        });
    }
    render() {
        if (this.state.isLoading) {
            return (React.createElement(Spinner, { label: strings.Loading }));
        }
        const libraries = this.state.lists;
        return (React.createElement("div", { className: styles.documentLibraryBrowserContainer },
            React.createElement(FocusZone, null,
                React.createElement(List, { ref: (e) => {
                        const needToUpdate = !!e && !this._columnWidth;
                        //
                        // sometimes getItemCountForPage is called when surfaceRect is still has 0 width
                        // We need to rerender the list if that happens
                        //
                        if (needToUpdate) {
                            setTimeout(() => {
                                e.forceUpdate();
                            }, 0);
                        }
                    }, className: styles.filePickerFolderCardGrid, items: libraries, getItemCountForPage: this._getItemCountForPage, getPageHeight: this._getPageHeight, renderedWindowsAhead: 4, onRenderCell: this._onRenderLibraryTile }))));
    }
}
//# sourceMappingURL=DocumentLibraryBrowser.js.map