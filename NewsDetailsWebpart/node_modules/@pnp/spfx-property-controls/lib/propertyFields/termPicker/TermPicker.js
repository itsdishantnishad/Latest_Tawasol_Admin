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
import { BasePicker } from '@fluentui/react/lib/Pickers';
import styles from './PropertyFieldTermPickerHost.module.scss';
import * as strings from 'PropertyControlStrings';
import { TermStorePickerServiceHelper } from '../../services/ISPTermStorePickerService';
export class TermBasePicker extends BasePicker {
}
export default class TermPicker extends React.Component {
    /**
     * Constructor method
     */
    constructor(props) {
        super(props);
        this.onRenderItem = this.onRenderItem.bind(this);
        this.onRenderSuggestionsItem = this.onRenderSuggestionsItem.bind(this);
        this.onFilterChanged = this.onFilterChanged.bind(this);
        this.onGetTextFromItem = this.onGetTextFromItem.bind(this);
        this.state = {
            terms: this.props.value
        };
    }
    /**
     * UNSAFE_componentWillReceiveProps method
     */
    UNSAFE_componentWillReceiveProps(nextProps) {
        // check to see if props is different to avoid re-rendering
        const newKeys = nextProps.value.map(a => a.key);
        const currentKeys = this.state.terms.map(a => a.key);
        newKeys.sort();
        currentKeys.sort();
        if (newKeys.join(',') !== currentKeys.join(',')) {
            this.setState({ terms: nextProps.value });
        }
    }
    /**
     * Renders the item in the picker
     */
    onRenderItem(term) {
        return (React.createElement("div", { className: styles.pickedTermRoot, key: term.index, "data-selection-index": term.index, "data-is-focusable": !term.disabled && true },
            React.createElement("span", { className: styles.pickedTermText }, term.item.name),
            !term.disabled &&
                React.createElement("span", { className: styles.pickedTermCloseIcon, onClick: term.onRemoveItem },
                    React.createElement("i", { className: "ms-Icon ms-Icon--Cancel", "aria-hidden": "true" }))));
    }
    /**
     * Renders the suggestions in the picker
     */
    onRenderSuggestionsItem(term, props) {
        let termParent = term.termSetName;
        let termTitle = `${term.name} [${term.termSetName}]`;
        if (term.path.indexOf(";") !== -1) {
            const splitPath = term.path.split(";");
            termParent = splitPath[splitPath.length - 2];
            splitPath.pop();
            termTitle = `${term.name} [${term.termSetName}:${splitPath.join(':')}]`;
        }
        return (React.createElement("div", { className: styles.termSuggestion, title: termTitle },
            React.createElement("div", null, term.name),
            // Check if term or term set is fetched
            term.termSet.indexOf(term.key) !== -1 ? (React.createElement("div", { className: styles.termSuggestionSubTitle }, strings.TermPickerTermSetLabel)) : (React.createElement("div", { className: styles.termSuggestionSubTitle },
                " ",
                strings.TermPickerInLabel,
                " ",
                termParent))));
    }
    /**
     * When Filter Changes a new search for suggestions
     */
    onFilterChanged(filterText, tagList) {
        return __awaiter(this, void 0, void 0, function* () {
            const { allowMultipleSelections, isTermSetSelectable, disabledTermIds } = this.props;
            // Only allow to select other tags if multi-selection is enabled
            if (filterText !== "" && (allowMultipleSelections || tagList.length === 0)) {
                const { termsService } = this.props;
                const terms = yield termsService.searchTermsByName(filterText);
                // Check if the termset can be selected
                if (isTermSetSelectable) {
                    // Retrieve the current termset
                    const termSets = yield termsService.getTermSets();
                    // Check if termset was retrieved and if it contains the filter value
                    if (termSets && termSets.length > 0) {
                        for (const termSet of termSets) {
                            if (termSet.Name.toLowerCase().indexOf(filterText.toLowerCase()) === 0) {
                                // Add the termset to the suggestion list
                                terms.push({
                                    key: TermStorePickerServiceHelper.cleanGuid(termSet.Id),
                                    name: termSet.Name,
                                    path: "",
                                    termSet: termSet.Id,
                                    termGroup: termSet.Group
                                });
                            }
                        }
                    }
                }
                // Filter out the terms which are already set
                const filteredTerms = [];
                for (const term of terms) {
                    let canBePicked = true;
                    // Check if the term is in the disabled list
                    if (disabledTermIds && disabledTermIds.length > 0) {
                        if (disabledTermIds.indexOf(term.key) !== -1) {
                            canBePicked = false;
                        }
                    }
                    // Check if the term can be used
                    if (canBePicked) {
                        // Only retrieve the terms which are not yet tagged
                        if (tagList.filter(tag => tag.key === term.key).length === 0) {
                            filteredTerms.push(term);
                        }
                    }
                }
                return filteredTerms;
            }
            else {
                return Promise.resolve([]);
            }
        });
    }
    /**
     * gets the text from an item
     */
    onGetTextFromItem(item) {
        return item.name;
    }
    /**
   * Render method
   */
    render() {
        return (React.createElement("div", null,
            React.createElement(TermBasePicker, { disabled: this.props.disabled, onResolveSuggestions: this.onFilterChanged, onRenderSuggestionsItem: this.onRenderSuggestionsItem, getTextFromItem: this.onGetTextFromItem, onRenderItem: this.onRenderItem, defaultSelectedItems: this.props.value, selectedItems: this.state.terms, itemLimit: !this.props.allowMultipleSelections ? 1 : undefined, onChange: this.props.onChanged, resolveDelay: this.props.resolveDelay, className: styles.termBasePicker })));
    }
}
//# sourceMappingURL=TermPicker.js.map