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
import SPSiteSearchService from '../../services/SPSiteSearchService';
import FieldErrorMessage from '../errorMessage/FieldErrorMessage';
import * as telemetry from '../../common/telemetry';
import { Label } from '@fluentui/react/lib/Label';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import * as strings from 'PropertyControlStrings';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { PropertyFieldSitePickerListItem } from './PropertyFieldSitePickerListItem/PropertyFieldSitePickerListItem';
import styles from './PropertyFieldSitePickerHost.module.scss';
import { initializeIcons } from '@uifabric/icons';
import { Async } from '@fluentui/react/lib/Utilities';
export default class PropertyFieldSitePickerHost extends React.Component {
    constructor(props) {
        super(props);
        this.onSearchFieldChange = (newValue) => __awaiter(this, void 0, void 0, function* () {
            if (!newValue) {
                this.setState({ siteSearchResults: [] });
                return;
            }
            this.setState({ isLoading: true });
            try {
                const { trimDuplicates, additionalQuery } = this.props;
                const sites = yield this.searchService.searchSites(this.props.context, newValue, !!trimDuplicates, additionalQuery);
                this.setState({ siteSearchResults: sites });
            }
            catch (error) {
                this.setState({ errorMessage: error });
            }
            finally {
                this.setState({ isLoading: false });
            }
        });
        this.handleCheckboxChange = (site, checked) => {
            let selectedSites = [...this.state.selectedSites];
            if (checked) {
                if (this.props.multiSelect) {
                    selectedSites.push(site);
                }
                else {
                    selectedSites = [site];
                }
            }
            else {
                if (this.props.multiSelect) {
                    selectedSites.splice(selectedSites.indexOf(site), 1);
                }
                else {
                    selectedSites = [];
                }
            }
            this.props.onPropertyChange(this.props.targetProperty, this.state.selectedSites, selectedSites);
            // Trigger the apply button
            if (typeof this.props.onChange !== 'undefined' && this.props.onChange !== null) {
                this.props.onChange(this.props.targetProperty, selectedSites);
            }
            this.setState({ selectedSites });
        };
        initializeIcons();
        telemetry.track('PropertyFieldSitePicker', {
            disabled: props.disabled
        });
        this.state = {
            isLoading: false,
            selectedSites: props.initialSites || [],
            siteSearchResults: [],
            errorMessage: null
        };
        this.async = new Async(this);
        this.searchService = new SPSiteSearchService();
    }
    /**
     * componentWillUnmount lifecycle hook
     */
    componentWillUnmount() {
        this.async.dispose();
    }
    render() {
        const { isLoading, siteSearchResults, selectedSites } = this.state;
        return (React.createElement("div", null,
            this.props.label && React.createElement(Label, null, this.props.label),
            React.createElement(SearchBox, { disabled: this.props.disabled, placeholder: strings.SitePickerSearchBoxPlaceholder, onChanged: this.async.debounce(this.onSearchFieldChange, this.props.deferredValidationTime) }),
            isLoading &&
                React.createElement(Spinner, { size: SpinnerSize.medium }),
            !isLoading && siteSearchResults &&
                React.createElement("div", null,
                    siteSearchResults.length > 0 &&
                        React.createElement("ul", { className: styles.siteList }, siteSearchResults.map((site) => React.createElement(PropertyFieldSitePickerListItem, { key: site.url, checked: selectedSites.filter(s => s.url === site.url).length > 0, handleCheckboxChange: this.handleCheckboxChange, site: site }))),
                    siteSearchResults.length === 0 &&
                        React.createElement(Label, null, strings.SitePickerNoResults)),
            selectedSites && selectedSites.length > 0 &&
                React.createElement("div", null,
                    React.createElement(Label, { className: styles.bold },
                        selectedSites.length,
                        " ",
                        strings.SitePickerSitesChosen),
                    React.createElement("ul", { className: styles.siteList }, selectedSites.map((site) => React.createElement(PropertyFieldSitePickerListItem, { key: site.url, checked: selectedSites.filter(s => s.url === site.url).length > 0, handleCheckboxChange: this.handleCheckboxChange, site: site })))),
            React.createElement(FieldErrorMessage, { errorMessage: this.state.errorMessage })));
    }
}
//# sourceMappingURL=PropertyFieldSitePickerHost.js.map