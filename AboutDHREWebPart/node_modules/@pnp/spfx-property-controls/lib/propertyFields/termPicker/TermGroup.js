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
import { GROUP_IMG, EXPANDED_IMG, COLLAPSED_IMG } from './PropertyFieldTermPickerHost';
import TermSet from './TermSet';
import styles from './PropertyFieldTermPickerHost.module.scss';
import * as strings from 'PropertyControlStrings';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
/**
 * Term group component
 */
export default class TermGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
            loaded: !!(props.group.TermSets && props.group.TermSets._Child_Items_)
        };
        // Check if the term group has to be automatically opened
        const selectedTermsInGroup = this.props.activeNodes.filter(node => node.termGroup === this.props.group.Id);
        if (selectedTermsInGroup.length > 0) {
            this._loadTermSets(true).then(() => { }).catch(() => { });
        }
        this._handleClick = this._handleClick.bind(this);
        this._autoExpand = this._autoExpand.bind(this);
    }
    /**
     * Handle the click event: collapse or expand
     */
    _handleClick() {
        const isExpanded = this.state.expanded; // current state
        this.setState({
            expanded: !isExpanded
        });
        if (!isExpanded) {
            this._loadTermSets().then(() => { }).catch(() => { });
        }
    }
    /**
     * Function to auto expand the termset
     */
    _autoExpand() {
        this.setState({
            expanded: true
        });
    }
    _loadTermSets(autoExpand) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state.loaded) {
                return;
            }
            const termSets = yield this.props.termsService.getGroupTermSets(this.props.group);
            //
            // NOTE: the next line is kinda incorrect from React perspective as we're modifying props.
            // But it is done to avoid redux usage or reimplementing the whole logic
            // 
            this.props.group.TermSets = termSets;
            this.setState({
                loaded: true,
                expanded: typeof autoExpand !== 'undefined' ? autoExpand : this.state.expanded
            });
        });
    }
    render() {
        // Specify the inline styling to show or hide the termsets
        const styleProps = {
            display: this.state.expanded ? 'block' : 'none'
        };
        return (React.createElement("div", null,
            React.createElement("div", { className: `${styles.listItem}`, onClick: this._handleClick },
                React.createElement("img", { src: this.state.expanded ? EXPANDED_IMG : COLLAPSED_IMG, alt: strings.TermPickerExpandNode, title: strings.TermPickerExpandNode }),
                React.createElement("img", { src: GROUP_IMG, title: strings.TermPickerMenuGroup, alt: strings.TermPickerMenuGroup }),
                " ",
                this.props.group.Name),
            React.createElement("div", { style: styleProps }, this.state.loaded ? this.props.group.TermSets._Child_Items_.map(termset => {
                return React.createElement(TermSet, { key: termset.Id, termset: termset, termGroup: this.props.group.Id, termstore: this.props.termstore, termsService: this.props.termsService, autoExpand: this._autoExpand, activeNodes: this.props.activeNodes, changedCallback: this.props.changedCallback, multiSelection: this.props.multiSelection, isTermSetSelectable: this.props.isTermSetSelectable, areTermsSelectable: this.props.areTermsSelectable, areTermsHidden: this.props.areTermsHidden, disabledTermIds: this.props.disabledTermIds, anchorId: this.props.anchorId });
            }) : React.createElement(Spinner, { size: SpinnerSize.medium }))));
    }
}
//# sourceMappingURL=TermGroup.js.map