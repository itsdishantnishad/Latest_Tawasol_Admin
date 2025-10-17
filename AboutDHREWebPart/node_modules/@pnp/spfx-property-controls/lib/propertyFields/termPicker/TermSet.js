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
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { Checkbox } from '@fluentui/react/lib/Checkbox';
import { TermStorePickerServiceHelper } from '../../services/ISPTermStorePickerService';
import { EXPANDED_IMG, COLLAPSED_IMG, TERMSET_IMG, TERM_IMG } from './PropertyFieldTermPickerHost';
import Term from './Term';
import styles from './PropertyFieldTermPickerHost.module.scss';
import * as strings from 'PropertyControlStrings';
/**
 * Term set component
 */
export default class TermSet extends React.Component {
    constructor(props) {
        super(props);
        /**
         * The term set selection changed
         */
        this.termSetSelectionChange = (ev, isChecked) => {
            const { termset } = this.props;
            this.props.changedCallback({
                Id: TermStorePickerServiceHelper.cleanGuid(termset.Id),
                Name: termset.Name,
                PathOfTerm: "",
                _ObjectType_: termset._ObjectType_,
                _ObjectIdentity_: termset._ObjectIdentity_,
                Description: termset.Description,
                IsDeprecated: null,
                IsAvailableForTagging: null,
                IsRoot: null,
                TermSet: termset
            }, this.props.termGroup, isChecked);
        };
        this.state = {
            expanded: false,
            loaded: false,
            terms: []
        };
        // Check if the termset has to be automatically opened
        const selectedTermsInSet = this.props.activeNodes.filter(node => node.termSet === this.props.termset.Id);
        if (selectedTermsInSet.length > 0) {
            this._autoLoadTerms();
        }
        this._handleClick = this._handleClick.bind(this);
        this._loadTerms = this._loadTerms.bind(this);
    }
    /**
     * Autoload the terms of the term set
     */
    _autoLoadTerms() {
        this.props.autoExpand();
        this._loadTerms(true).then(() => { }).catch(() => { });
    }
    /**
     * Handle the click event: collapse or expand
     */
    _handleClick() {
        if (this.props.areTermsHidden) {
            return;
        }
        this.setState({
            expanded: !this.state.expanded
        });
        if (!this.state.expanded) {
            this._loadTerms().then(() => { }).catch(() => { });
        }
    }
    /**
     * Load the terms for the current term set
     */
    _loadTerms(autoExpand) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if there are already terms loaded
            if (!this.state.loaded) {
                // Receive all the terms for the current term set
                const terms = this.props.areTermsHidden
                    ? null
                    : yield this.props.termsService.getAllTerms(this.props.termset);
                if (terms !== null) {
                    if (this.props.anchorId) {
                        const anchorTerm = terms.filter(t => t.Id.toLocaleLowerCase() === this.props.anchorId.toLocaleLowerCase()).shift();
                        if (anchorTerm) {
                            const anchorTermPath = `${anchorTerm.PathOfTerm};`;
                            this._anchorName = anchorTerm.Name;
                            let anchorTerms = terms.filter(t => t.PathOfTerm.substring(0, anchorTermPath.length) === anchorTermPath && t.Id !== anchorTerm.Id);
                            anchorTerms = anchorTerms.map(term => {
                                term.PathDepth = term.PathDepth - anchorTerm.PathDepth;
                                return term;
                            });
                            this.setState({
                                terms: anchorTerms,
                                loaded: true,
                                expanded: typeof autoExpand !== 'undefined' ? autoExpand : this.state.expanded
                            });
                        }
                        else {
                            //just set terms
                            this.setState({
                                terms: terms,
                                loaded: true,
                                expanded: typeof autoExpand !== 'undefined' ? autoExpand : this.state.expanded
                            });
                        }
                    }
                    else {
                        this.setState({
                            terms: terms,
                            loaded: true,
                            expanded: typeof autoExpand !== 'undefined' ? autoExpand : this.state.expanded
                        });
                    }
                }
                else {
                    this.setState({
                        terms: [],
                        loaded: true
                    });
                }
            }
        });
    }
    render() {
        // Specify the inline styling to show or hide the termsets
        const styleProps = {
            display: this.state.expanded ? 'block' : 'none'
        };
        let termElm = React.createElement("div", null);
        // Check if the terms have been loaded
        if (this.state.expanded) {
            if (this.state.loaded) {
                if (this.state.terms.length > 0) {
                    termElm = (React.createElement("div", { style: styleProps }, this.state.terms.map(term => {
                        let disabled = false;
                        if (this.props.disabledTermIds && this.props.disabledTermIds.length > 0) {
                            // Check if the current term ID exists in the disabled term IDs array
                            disabled = this.props.disabledTermIds.indexOf(term.Id) !== -1;
                        }
                        return React.createElement(Term, { key: term.Id, term: term, termset: this.props.termset.Id, termGroup: this.props.termGroup, activeNodes: this.props.activeNodes, changedCallback: this.props.changedCallback, multiSelection: this.props.multiSelection, disabled: disabled, isTermSelectable: this.props.areTermsSelectable });
                    })));
                }
                else {
                    termElm = React.createElement("div", { className: `${styles.listItem} ${styles.term}` }, strings.TermPickerNoTerms);
                }
            }
            else {
                termElm = React.createElement(Spinner, { size: SpinnerSize.medium });
            }
        }
        return (React.createElement("div", null,
            React.createElement("div", { className: `${styles.listItem} ${styles.termset} ${this.props.isTermSetSelectable && !this.props.areTermsHidden && !this.props.anchorId ? styles.termSetSelectable : ""}`, onClick: this._handleClick },
                React.createElement("img", { className: `${this.props.areTermsHidden ? styles.termsHidden : ""}`, src: this.state.expanded ? EXPANDED_IMG : COLLAPSED_IMG, alt: strings.TermPickerExpandTitle, title: strings.TermPickerExpandTitle }),
                // Show the termset selection box
                (this.props.isTermSetSelectable && !this.props.anchorId) &&
                    React.createElement(Checkbox, { className: styles.termSetSelector, checked: this.props.activeNodes.filter(a => a.path === "" && a.termSet.indexOf(a.key) !== -1 && this.props.termset.Id.indexOf(a.key) !== -1).length >= 1, onChange: this.termSetSelectionChange }),
                React.createElement("img", { src: this.props.anchorId ? TERM_IMG : TERMSET_IMG, alt: strings.TermPickerMenuTermSet, title: strings.TermPickerMenuTermSet }),
                this.props.anchorId ?
                    this._anchorName :
                    this.props.termset.Name),
            React.createElement("div", { style: styleProps }, termElm)));
    }
}
//# sourceMappingURL=TermSet.js.map