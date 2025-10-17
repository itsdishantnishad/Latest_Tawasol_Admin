import * as React from "react";
import { TextField } from "@fluentui/react/lib/TextField";
import { Guid } from '@microsoft/sp-core-library';
import { GeneralHelper } from "../../helpers/GeneralHelper";
import * as strings from 'PropertyControlStrings';
import * as telemetry from '../../common/telemetry';
export default class PropertyFieldGuidHost extends React.Component {
    constructor(props) {
        super(props);
        this._validateGuid = (value) => {
            return GeneralHelper.isDefined(value) &&
                GeneralHelper.isDefined(Guid.tryParse(value)) &&
                Guid.isValid(value)
                ? ''
                : GeneralHelper.isDefined(this.props.errorMessage)
                    ? this.props.errorMessage
                    : strings.IncorrectGuidValidationMessage;
        };
        this._onChange = (event, value) => {
            this.setState({ value });
            if (GeneralHelper.isDefined(value)) {
                if (GeneralHelper.isDefined(Guid.tryParse(value)) && Guid.isValid(value)) {
                    this.props.onChanged(Guid.tryParse(value)["_guid"]);
                }
            }
            else {
                this.props.onChanged(undefined);
            }
        };
        this.state = {
            value: this.props.value
        };
        telemetry.track('PropertyFieldButton', {});
    }
    ///
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.value !== this.props.value) {
            this.setState({ value: this.props.value });
        }
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(TextField, { label: this.props.label ? this.props.label : null, value: this.state.value, onGetErrorMessage: this._validateGuid, onChange: this._onChange })));
    }
}
//# sourceMappingURL=PropertyFieldGuidHost.js.map