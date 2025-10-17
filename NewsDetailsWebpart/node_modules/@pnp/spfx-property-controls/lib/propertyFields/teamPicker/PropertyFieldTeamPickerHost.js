var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as React from "react";
import { Label } from "@fluentui/react/lib/Label";
import { SearchBox } from "@fluentui/react/lib/SearchBox";
import { Spinner, SpinnerSize } from "@fluentui/react/lib/Spinner";
import * as strings from "PropertyControlStrings";
import { initializeIcons } from "@uifabric/icons";
import { Async } from "@fluentui/react/lib/Utilities";
import * as telemetry from "../../common/telemetry";
import TeamsSearchService from "../../services/TeamsSearchService";
import FieldErrorMessage from "../errorMessage/FieldErrorMessage";
import styles from "./PropertyFieldTeamPickerHost.module.scss";
import { PropertyFieldTeamPickerListItem } from "./PropertyFieldTeamPickerListItem/PropertyFieldTeamPickerListItem";
export default class PropertyFieldTeamPickerHost extends React.Component {
    constructor(props) {
        super(props);
        this.onSearchFieldChange = (newValue) => __awaiter(this, void 0, void 0, function* () {
            if (newValue && newValue.length > 2) {
                this.setState({ isLoading: true });
                try {
                    const teams = yield this.teamsService.searchTeams(this.props.context, newValue);
                    this.setState({ teamSearchResults: teams });
                }
                catch (error) {
                    this.setState({ errorMessage: error.message });
                }
                finally {
                    this.setState({ isLoading: false });
                }
            }
            else {
                this.setState({ teamSearchResults: [] });
            }
        });
        this.handleCheckboxChange = (team, checked) => {
            let selectedTeams = [...this.state.selectedTeams];
            if (checked) {
                if (this.props.multiSelect) {
                    selectedTeams.push(team);
                }
                else {
                    selectedTeams = [team];
                }
            }
            else {
                if (this.props.multiSelect) {
                    selectedTeams.splice(selectedTeams.indexOf(team), 1);
                }
                else {
                    selectedTeams = [];
                }
            }
            this.props.onPropertyChange(this.props.targetProperty, this.state.selectedTeams, selectedTeams);
            // Trigger the apply button
            if (typeof this.props.onChange !== 'undefined' && this.props.onChange !== null) {
                this.props.onChange(this.props.targetProperty, selectedTeams);
            }
            this.setState({ selectedTeams });
        };
        initializeIcons();
        telemetry.track('PropertyFieldTeamPicker', {
            disabled: props.disabled
        });
        this.state = {
            isLoading: false,
            selectedTeams: props.initialTeams || [],
            teamSearchResults: [],
            errorMessage: null
        };
        this.async = new Async(this);
        this.teamsService = new TeamsSearchService();
    }
    /**
     * componentWillUnmount lifecycle hook
     */
    componentWillUnmount() {
        this.async.dispose();
    }
    render() {
        const { isLoading, teamSearchResults, selectedTeams } = this.state;
        return (React.createElement("div", null,
            this.props.label && React.createElement(Label, null, this.props.label),
            React.createElement(SearchBox, { placeholder: strings.TeamPickerSearchBoxPlaceholder, onChanged: this.async.debounce(this.onSearchFieldChange, this.props.deferredValidationTime) }),
            isLoading &&
                React.createElement(Spinner, { size: SpinnerSize.medium }),
            !isLoading && teamSearchResults &&
                React.createElement("div", null,
                    teamSearchResults.length > 0 &&
                        React.createElement("ul", { className: styles.siteList }, teamSearchResults.map((team) => React.createElement(PropertyFieldTeamPickerListItem, { key: team.id, checked: selectedTeams.filter(s => s.id === team.id).length > 0, handleCheckboxChange: this.handleCheckboxChange, team: team }))),
                    teamSearchResults.length === 0 &&
                        React.createElement(Label, null, strings.TeamPickerNoResults)),
            selectedTeams && selectedTeams.length > 0 &&
                React.createElement("div", null,
                    React.createElement(Label, { className: styles.bold },
                        selectedTeams.length,
                        " ",
                        strings.TeamPickerSitesChosen),
                    React.createElement("ul", { className: styles.siteList }, selectedTeams.map((team) => React.createElement(PropertyFieldTeamPickerListItem, { key: team.id, checked: selectedTeams.filter(s => s.id === team.id).length > 0, handleCheckboxChange: this.handleCheckboxChange, team: team })))),
            React.createElement(FieldErrorMessage, { errorMessage: this.state.errorMessage })));
    }
}
//# sourceMappingURL=PropertyFieldTeamPickerHost.js.map