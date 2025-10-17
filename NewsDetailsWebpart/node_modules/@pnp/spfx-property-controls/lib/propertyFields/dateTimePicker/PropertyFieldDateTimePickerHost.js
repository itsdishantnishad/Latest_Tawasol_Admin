import * as React from 'react';
import { TimeConvention, DateConvention } from './IPropertyFieldDateTimePicker';
import { DatePicker } from '@fluentui/react/lib/DatePicker';
import { Label } from '@fluentui/react/lib/Label';
import { Async } from '@fluentui/react/lib/Utilities';
import * as strings from 'PropertyControlStrings';
import FieldErrorMessage from '../errorMessage/FieldErrorMessage';
import styles from './PropertyFieldDateTimePickerHost.module.scss';
import HoursComponent from './HoursComponent';
import MinutesComponent from './MinutesComponent';
import SecondsComponent from './SecondsComponent';
import * as telemetry from '../../common/telemetry';
import { setPropertyValue } from '../../helpers/GeneralHelper';
/**
 * Defines the labels of the DatePicker control (as months, days, etc.)
 */
class DatePickerStrings {
    constructor() {
        /**
         * An array of strings for the full names of months.
         * The array is 0-based, so months[0] should be the full name of January.
         */
        this.months = [
            strings.DatePickerMonthLongJanuary, strings.DatePickerMonthLongFebruary,
            strings.DatePickerMonthLongMarch, strings.DatePickerMonthLongApril,
            strings.DatePickerMonthLongMay, strings.DatePickerMonthLongJune, strings.DatePickerMonthLongJuly,
            strings.DatePickerMonthLongAugust, strings.DatePickerMonthLongSeptember, strings.DatePickerMonthLongOctober,
            strings.DatePickerMonthLongNovember, strings.DatePickerMonthLongDecember
        ];
        /**
         * An array of strings for the short names of months.
         * The array is 0-based, so shortMonths[0] should be the short name of January.
         */
        this.shortMonths = [
            strings.DatePickerMonthShortJanuary, strings.DatePickerMonthShortFebruary,
            strings.DatePickerMonthShortMarch, strings.DatePickerMonthShortApril,
            strings.DatePickerMonthShortMay, strings.DatePickerMonthShortJune, strings.DatePickerMonthShortJuly,
            strings.DatePickerMonthShortAugust, strings.DatePickerMonthShortSeptember, strings.DatePickerMonthShortOctober,
            strings.DatePickerMonthShortNovember, strings.DatePickerMonthShortDecember
        ];
        /**
         * An array of strings for the full names of days of the week.
         * The array is 0-based, so days[0] should be the full name of Sunday.
         */
        this.days = [
            strings.DatePickerDayLongSunday, strings.DatePickerDayLongMonday, strings.DatePickerDayLongTuesday,
            strings.DatePickerDayLongWednesday, strings.DatePickerDayLongThursday, strings.DatePickerDayLongFriday,
            strings.DatePickerDayLongSaturday
        ];
        /**
         * An array of strings for the initials of the days of the week.
         * The array is 0-based, so days[0] should be the initial of Sunday.
         */
        this.shortDays = [
            strings.DatePickerDayShortSunday, strings.DatePickerDayShortMonday, strings.DatePickerDayShortTuesday,
            strings.DatePickerDayShortWednesday, strings.DatePickerDayShortThursday, strings.DatePickerDayShortFriday,
            strings.DatePickerDayShortSaturday
        ];
        /**
         * String to render for button to direct the user to today's date.
         */
        this.goToToday = strings.DatepickerGoToToday;
        /**
         * Error message to render for TextField if isRequired validation fails.
         */
        this.isRequiredErrorMessage = '';
        /**
         * Error message to render for TextField if input date string parsing fails.
         */
        this.invalidInputErrorMessage = '';
    }
}
/**
 * Renders the controls for PropertyFieldDateTimePicker component
 */
class PropertyFieldDateTimePickerHost extends React.Component {
    /**
     * Constructor
     */
    constructor(props) {
        super(props);
        telemetry.track('PropertyFieldDateTimePicker', {
            dateConvention: props.dateConvention ? DateConvention[props.dateConvention] : '',
            formatDate: !!props.formatDate,
            timeConvention: props.timeConvention ? TimeConvention[props.timeConvention] : '',
            disabled: props.disabled
        });
        // Bind the current object to the external called onSelectDate method
        this._onSelectDate = this._onSelectDate.bind(this);
        this._dropdownHoursChanged = this._dropdownHoursChanged.bind(this);
        this._dropdownMinutesChanged = this._dropdownMinutesChanged.bind(this);
        this._dropdownSecondsChanged = this._dropdownSecondsChanged.bind(this);
        // Initiate the current date values
        this._crntDate = this._getDateValue();
        // Intiate the time values (only when date and time convention is active)
        this._crntHours = this.props.dateConvention === DateConvention.DateTime && this._getDateValue() !== null ? this._getDateValue().getHours() : 0;
        this._crntMinutes = this.props.dateConvention === DateConvention.DateTime && this._getDateValue() !== null ? this._getDateValue().getMinutes() : 0;
        this._crntSeconds = this.props.dateConvention === DateConvention.DateTime && this._getDateValue() !== null ? this._getDateValue().getSeconds() : 0;
        // Set the current state
        this.state = {
            day: this._crntDate,
            hours: this._crntHours,
            minutes: this._crntMinutes,
            seconds: this._crntSeconds,
            errorMessage: ''
        };
        this.async = new Async(this);
        this.validate = this.validate.bind(this);
        this.notifyAfterValidate = this.notifyAfterValidate.bind(this);
        this.delayedValidate = this.async.debounce(this.validate, this.props.deferredValidationTime);
    }
    /**
     * Function to retrieve the initial date
     */
    _getDateValue() {
        if (typeof this.props.initialDate !== 'undefined' && this.props.initialDate !== null) {
            if (typeof this.props.initialDate.value !== 'undefined' && this.props.initialDate.value !== null) {
                return new Date(this.props.initialDate.value.toString());
            }
        }
        return null;
    }
    /**
     * Function called when the DatePicker Office UI Fabric component selected date changed
     */
    _onSelectDate(date) {
        if (date === null) {
            return;
        }
        this._crntDate = date;
        this._saveDate();
    }
    /**
     * Function called when hours value have been changed
     * @param element Hours dropdown value
     */
    _dropdownHoursChanged(element) {
        this._crntHours = parseInt(element.key.toString());
        this._saveDate();
    }
    /**
     * Function called when minutes value have been changed
     * @param element Minutes dropdown value
     */
    _dropdownMinutesChanged(element) {
        this._crntMinutes = parseInt(element.key.toString());
        this._saveDate();
    }
    /**
     * Function called when seconds value have been changed
     * @param element Seconds dropdown value
     */
    _dropdownSecondsChanged(element) {
        this._crntSeconds = parseInt(element.key.toString());
        this._saveDate();
    }
    /**
     * Save the new date
     */
    _saveDate() {
        // Check if the current date object exists
        if (this._crntDate === null) {
            return;
        }
        // Set the current date state for the component
        this.setState({
            day: this._crntDate,
            hours: this._crntHours,
            minutes: this._crntMinutes,
            seconds: this._crntSeconds
        });
        // Create the final date object
        const finalDate = new Date(this._crntDate.toISOString());
        finalDate.setHours(this._crntHours);
        finalDate.setMinutes(this._crntMinutes);
        finalDate.setSeconds(this._crntSeconds);
        if (finalDate !== null) {
            let finalDateAsString = '';
            if (this.props.formatDate) {
                finalDateAsString = this.props.formatDate(finalDate);
            }
            else {
                finalDateAsString = finalDate.toString();
            }
            this.delayedValidate({
                value: finalDate,
                displayValue: finalDateAsString
            });
        }
    }
    /**
     * Validates the new custom field value
     */
    validate(dateVal) {
        if (typeof this.props.onGetErrorMessage === 'undefined' || this.props.onGetErrorMessage === null) {
            this.notifyAfterValidate(this.props.initialDate, dateVal);
            return;
        }
        if (this._latestValidateValue === dateVal.displayValue) {
            return;
        }
        this._latestValidateValue = dateVal.displayValue;
        const result = this.props.onGetErrorMessage(dateVal.displayValue || '');
        if (typeof result !== 'undefined') {
            if (typeof result === 'string') {
                if (result === '') {
                    this.notifyAfterValidate(this.props.initialDate, dateVal);
                }
                this.setState({
                    errorMessage: result
                });
            }
            else {
                result.then((errorMessage) => {
                    if (typeof errorMessage === 'undefined' || errorMessage === '') {
                        this.notifyAfterValidate(this.props.initialDate, dateVal);
                    }
                    this.setState({
                        errorMessage: errorMessage
                    });
                }).catch(() => { });
            }
        }
        else {
            this.notifyAfterValidate(this.props.initialDate, dateVal);
        }
    }
    /**
     * Notifies the parent Web Part of a property value change
     */
    notifyAfterValidate(oldValue, newValue) {
        if (this.props.onPropertyChange && newValue !== null) {
            setPropertyValue(this.props.properties, this.props.targetProperty, newValue);
            this.props.onPropertyChange(this.props.targetProperty, oldValue, newValue);
            //  Trigger the apply button
            if (typeof this.props.onChange !== 'undefined' && this.props.onChange !== null) {
                this.props.onChange(this.props.targetProperty, newValue);
            }
        }
    }
    /**
     * Called when the component will unmount
     */
    componentWillUnmount() {
        this.async.dispose();
    }
    /**
     * Renders the control
     */
    render() {
        // Defines the DatePicker control labels
        const dateStrings = new DatePickerStrings();
        const { showLabels, disabled, timeConvention, dateConvention, label, formatDate } = this.props;
        // Check if the time element needs to be rendered
        let timeElm = React.createElement("tr", null);
        if (dateConvention === DateConvention.DateTime) {
            timeElm = (React.createElement("tr", null,
                showLabels && React.createElement("td", { className: styles.labelCell },
                    React.createElement(Label, { className: styles.fieldLabel }, strings.DateTimePickerTime)),
                React.createElement("td", null,
                    React.createElement("table", { cellPadding: '0', cellSpacing: '0' },
                        React.createElement("tbody", null,
                            React.createElement("tr", null,
                                React.createElement("td", null,
                                    React.createElement(HoursComponent, { disabled: disabled, timeConvention: timeConvention, value: this.state.hours, onChange: this._dropdownHoursChanged })),
                                React.createElement("td", { className: styles.seperator },
                                    React.createElement(Label, null, ":")),
                                React.createElement("td", null,
                                    React.createElement(MinutesComponent, { disabled: disabled, value: this.state.minutes, onChange: this._dropdownMinutesChanged })),
                                React.createElement("td", { className: styles.seperator },
                                    React.createElement(Label, null, ":")),
                                React.createElement("td", null,
                                    React.createElement(SecondsComponent, { disabled: disabled, value: this.state.seconds, onChange: this._dropdownSecondsChanged }))))))));
        }
        // Renders content
        return (React.createElement("div", { className: styles.propertyFieldDateTimePicker },
            label && React.createElement(Label, null, label),
            React.createElement("table", { cellPadding: '0', cellSpacing: '0' },
                React.createElement("tbody", null,
                    React.createElement("tr", null,
                        showLabels && React.createElement("td", { className: styles.labelCell },
                            React.createElement(Label, { className: styles.fieldLabel }, strings.DateTimePickerDate)),
                        React.createElement("td", null,
                            React.createElement(DatePicker, { formatDate: formatDate, disabled: disabled, value: this.state.day, strings: dateStrings, isMonthPickerVisible: true, onSelectDate: this._onSelectDate, allowTextInput: false, firstDayOfWeek: this.props.firstDayOfWeek }))),
                    !!timeElm &&
                        React.createElement("tr", null,
                            React.createElement("td", { className: styles.spacerRow, colSpan: showLabels ? 2 : 1 })),
                    timeElm)),
            React.createElement(FieldErrorMessage, { errorMessage: this.state.errorMessage })));
    }
}
PropertyFieldDateTimePickerHost.defaultProps = {
    showLabels: true
};
export default PropertyFieldDateTimePickerHost;
//# sourceMappingURL=PropertyFieldDateTimePickerHost.js.map