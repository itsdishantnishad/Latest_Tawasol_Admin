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
import { DEFAULT_SUGGESTIONS, MAX_ROW_HEIGHT, ROWS_PER_PAGE, } from './WebSearchTab.types';
import { PrimaryButton, DefaultButton, Label, SearchBox, Check, Dropdown, Image, ImageFit, Link, FocusZone, List, Selection, SelectionMode, SelectionZone, MessageBar, css, } from '@fluentui/react';
import { GeneralHelper } from '../../../../helpers/GeneralHelper';
import styles from './WebSearchTab.module.scss';
import * as strings from 'PropertyControlStrings';
/**
 * Renders search suggestions and performs seach queries
 */
export default class WebSearchTab extends React.Component {
    constructor(props) {
        super(props);
        this._listElem = undefined;
        this._onSelectionChanged = () => {
            // Get the selected item
            const selectedItems = this._selection.getSelection();
            const filePickerResult = this.state.filePickerResult;
            let selectedFileResult = null;
            if (selectedItems && selectedItems.length > 0) {
                //Get the selected key
                const selectedItem = selectedItems[0];
                //Brute force approach to making sure all URLs are loading over HTTPS
                // even if it breaks the page.
                const selectedUrl = selectedItem.contentUrl.replace('http://', 'https://');
                selectedFileResult = {
                    fileAbsoluteUrl: selectedUrl,
                    fileName: GeneralHelper.getFileNameFromUrl(selectedUrl),
                    fileNameWithoutExtension: GeneralHelper.getFileNameWithoutExtension(selectedUrl),
                    downloadFileContent: () => {
                        return this.props.bingSearchService.downloadBingContent(selectedUrl, GeneralHelper.getFileNameFromUrl(selectedUrl));
                    },
                };
            }
            // If clicked on already selected file -> deselect it
            if (filePickerResult &&
                selectedFileResult &&
                filePickerResult.fileAbsoluteUrl === selectedFileResult.fileAbsoluteUrl) {
                this._selection.setAllSelected(false);
                selectedFileResult = null;
            }
            // Save the selected file
            this.setState({
                filePickerResult: selectedFileResult,
            });
            if (this._listElem) {
                // Force the list to update to show the selection check
                this._listElem.forceUpdate();
            }
        };
        /**
         * Renders the returned search results
         */
        this._renderSearchResults = () => {
            const { results } = this.state;
            // If there are no results, tell 'em.
            if (results === undefined || results.length < 1) {
                return (React.createElement(Label, { className: styles.noResultLabel }, strings.NoResultsBadEnglish));
            }
            return (React.createElement(FocusZone, null,
                React.createElement(SelectionZone, { selection: this._selection, onItemInvoked: (item) => this._selection.setKeySelected(item.key, true, true) },
                    React.createElement(List, { ref: this._linkElement, className: styles.bingGrildList, items: this.state.results, getItemCountForPage: this._getItemCountForPage, getPageHeight: this._getPageHeight, renderedWindowsAhead: 4, onRenderCell: this._onRenderSearchResultsCell }))));
        };
        /**
         * Show an individual search result item
         */
        this._onRenderSearchResultsCell = (item, index) => {
            const { query } = this.state;
            let isSelected = false;
            if (this._selection && index !== undefined) {
                isSelected = this._selection.isIndexSelected(index);
            }
            // The logic for calculating the thumbnail dimensions is not quite the same as the out-of-the-box file picker,
            // but it'll have to do.
            // Find the aspect ratio of the picture
            const ratio = item.width / item.height;
            // Fit the height to the desired row height
            const thumbnailHeight = Math.min(this._rowHeight, item.height);
            // Resize the picture with the same aspect ratio
            const thumbnailWidth = thumbnailHeight * ratio;
            const searchResultAltText = strings.SearchResultAlt.replace('{0}', query);
            return (React.createElement("div", { className: styles.bingGridListCell, style: {
                    width: 100 / this._columnCount + '%',
                } },
                React.createElement("div", { "aria-label": searchResultAltText, className: css(styles.bingTile, isSelected ? styles.isSelected : undefined), "data-is-focusable": true, "data-selection-index": index, style: {
                        width: `${thumbnailWidth}px`,
                        height: `${thumbnailHeight}px`,
                    } },
                    React.createElement("div", { className: styles.bingTileContent, "data-selection-invoke": true },
                        React.createElement(Image, { src: item.thumbnailUrl, className: styles.bingTileThumbnail, alt: searchResultAltText, width: thumbnailWidth, height: thumbnailHeight }),
                        React.createElement("div", { className: styles.bingTileFrame }),
                        React.createElement("div", { className: styles.bingTileCheckCircle, role: 'checkbox', "aria-checked": isSelected, "data-item-index": index, "data-selection-toggle": true, "data-automationid": 'CheckCircle' },
                            React.createElement(Check, { checked: isSelected })),
                        React.createElement("div", { className: styles.bingTileNamePlate },
                            React.createElement(Link, { href: item.contentUrl, target: '_blank', "aria-label": strings.SearchResultAriaLabel }, item.displayUrl))))));
        };
        /**
         * Renders suggestions when there aren't any queries
         */
        this._renderSearchSuggestions = () => {
            const suggestions = this.props.suggestions !== undefined
                ? this.props.suggestions
                : DEFAULT_SUGGESTIONS;
            return (React.createElement(FocusZone, null,
                React.createElement(List, { className: styles.filePickerFolderCardGrid, items: suggestions, getItemCountForPage: this._getItemCountForPage, getPageHeight: this._getPageHeight, renderedWindowsAhead: 4, onRenderCell: this._onRenderSuggestionCell })));
        };
        /**
         * Gets search results from Bing
         */
        this._getSearchResults = () => __awaiter(this, void 0, void 0, function* () {
            // Do nothing
            if (this.state.query === undefined || !this.props.bingSearchService) {
                return;
            }
            // Show a loading indicator + remove selection
            this.setState({
                filePickerResult: null,
                isLoading: true,
            });
            const searchParams = {
                aspect: this.state.aspect,
                size: this.state.size,
                license: this.state.license,
                query: this.state.query,
            };
            const searchResults = yield this.props.bingSearchService.executeBingSearch(searchParams);
            // If the results were obtained
            if (searchResults) {
                // Set the items so that the selection zone can keep track of them
                this._selection.setItems(searchResults, true);
            }
            // Save results and stop loading indicator
            this.setState({
                isLoading: false,
                results: searchResults,
            });
        });
        /**
         * Calculates how many items there should be in the page
         */
        this._getItemCountForPage = (itemIndex, surfaceRect) => {
            if (itemIndex === 0) {
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
        this._onRenderSuggestionCell = (item, index) => {
            return (React.createElement("div", { className: styles.filePickerFolderCardTile, "data-is-focusable": true, style: {
                    width: 100 / this._columnCount + '%',
                } },
                React.createElement("div", { className: styles.filePickerFolderCardSizer },
                    React.createElement("div", { className: styles.filePickerFolderCardPadder },
                        React.createElement(Image, { src: item.backgroundUrl, className: styles.filePickerFolderCardImage, imageFit: ImageFit.cover }),
                        React.createElement(DefaultButton, { className: styles.filePickerFolderCardLabel, onClick: (_event) => this._handleSearch(item.topic) }, item.topic)))));
        };
        /**
         * Renders the search box
         */
        this._renderSearchBox = () => {
            const { query } = this.state;
            const hasQuery = query !== undefined;
            const license = this.state.license ? this.state.license : 'All';
            return (React.createElement("div", { className: styles.searchBoxContainer },
                React.createElement("div", { className: styles.searchBoxMedium },
                    React.createElement("div", { className: styles.searchBox },
                        React.createElement(SearchBox, { placeholder: strings.SearchBoxPlaceholder, value: query, onSearch: (newQuery) => this._handleSearch(newQuery) }))),
                React.createElement(Label, null, strings.PoweredByBing),
                hasQuery && (React.createElement("div", { className: styles.dropdownContainer },
                    React.createElement(Dropdown, { className: styles.filterDropdown, onRenderPlaceHolder: (props) => this._renderFilterPlaceholder(props), selectedKey: this.state.size, options: [
                            { key: 'All', text: strings.SizeOptionAll },
                            { key: 'Small', text: strings.SizeOptionSmall },
                            { key: 'Medium', text: strings.SizeOptionMedium },
                            { key: 'Large', text: strings.SizeOptionLarge },
                            { key: 'Wallpaper', text: strings.SizeOptionExtraLarge },
                        ], onChanged: (option, index) => this._handleChangeSize(option) }),
                    React.createElement(Dropdown, { className: styles.filterDropdown, onRenderPlaceHolder: (props) => this._renderFilterPlaceholder(props), selectedKey: this.state.aspect, options: [
                            { key: 'All', text: strings.LayoutOptionAll },
                            { key: 'Square', text: strings.LayoutOptionSquare },
                            { key: 'Wide', text: strings.LayoutOptionWide },
                            { key: 'Tall', text: strings.LayoutOptionTall },
                        ], onChanged: (option, index) => this._handleChangeLayout(option) }),
                    React.createElement(Dropdown, { className: styles.filterDropdown, onRenderPlaceHolder: (props) => this._renderFilterPlaceholder(props), selectedKey: license, options: [
                            { key: 'All', text: strings.LicenseOptionAll },
                            { key: 'Any', text: strings.LicenseOptionAny },
                        ], onChanged: (option, index) => this._handleChangeLicense(option) })))));
        };
        /**
         * Handles when a user changes the size drop down.
         * Resubmits search query
         */
        this._handleChangeSize = (option) => {
            this.setState({
                size: option.key,
            }, () => this._getSearchResults());
        };
        /**
         * Handles when user selects a new layout from the drop down.
         * Resubmits search query.
         */
        this._handleChangeLayout = (option) => {
            this.setState({
                aspect: option.key,
            }, () => this._getSearchResults());
        };
        /**
         * Handles when a user changes the license from the drop down
         * Resubits search query
         */
        this._handleChangeLicense = (option) => {
            this.setState({
                license: option.key,
            }, () => this._getSearchResults());
        };
        /**
         * Renders the drop down placeholders
         */
        this._renderFilterPlaceholder = (props) => {
            // return <span>{props.placeholder}</span>;
            return React.createElement("span", null, "Pick the value");
        };
        /**
         * Handles when user triggers search query
         */
        this._handleSearch = (newQuery) => {
            this.setState({
                query: newQuery,
            }, () => this._getSearchResults());
        };
        /**
         * Handles when user closes search pane
         */
        this._handleClose = () => {
            this.props.onClose();
        };
        /**
         * Handes when user saves selection
         * Calls property pane file picker's save function
         */
        this._handleSave = () => {
            this.props.onSave(this.state.filePickerResult);
        };
        /**
         * Creates a reference to the list
         */
        this._linkElement = (e) => {
            this._listElem = e;
        };
        this._selection = new Selection({
            selectionMode: SelectionMode.single,
            onSelectionChanged: this._onSelectionChanged,
        });
        this.state = {
            isLoading: false,
            results: undefined,
            filePickerResult: null,
        };
    }
    /**
     * Render the tab
     */
    render() {
        const { query, results } = this.state;
        return (React.createElement("div", { className: styles.tabContainer },
            React.createElement("div", { className: styles.tabHeaderContainer },
                React.createElement("h2", { className: styles.tabHeader }, strings.WebSearchLinkLabel)),
            this.props.bingSearchService && this._renderSearchBox(),
            React.createElement("div", { className: css(styles.tab, styles.tabOffset) },
                !query && this._renderSearchSuggestions(),
                query && results && this._renderSearchResults()),
            React.createElement("div", { className: styles.actionButtonsContainer },
                this.state.results && this.state.license === 'Any' && (React.createElement(MessageBar, null, strings.CreativeCommonsMessage)),
                React.createElement(Label, { className: styles.copyrightLabel },
                    strings.CopyrightWarning,
                    "\u00A0\u00A0",
                    React.createElement(Link, { target: '_blank', href: strings.CopyrightUrl }, strings.LearnMoreLink)),
                React.createElement("div", { className: styles.actionButtons },
                    React.createElement(PrimaryButton, { disabled: !this.state.filePickerResult, className: styles.actionButton, onClick: () => this._handleSave() }, strings.OpenButtonLabel),
                    React.createElement(DefaultButton, { onClick: () => this._handleClose(), className: styles.actionButton }, strings.CancelButtonLabel)))));
    }
}
//# sourceMappingURL=WebSearchTab.js.map