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
import styles from '../PropertyFieldCollectionDataHost.module.scss';
import { Async } from '@fluentui/react';
import { isEqual } from '@microsoft/sp-lodash-subset';
export class CollectionNumberField extends React.Component {
    constructor(props) {
        super(props);
        /**
         * Value change event handler
         *
         * @param field
         * @param value
         */
        this.valueChange = (field, value) => __awaiter(this, void 0, void 0, function* () {
            const inputVal = typeof value === 'string' ? parseInt(value) : value;
            this.setState({
                value: inputVal,
            });
            yield this.props.fOnValueChange(field.id, value);
            this.delayedValidate(field, inputVal);
        });
        /**
         * Delayed field validation
         */
        this.valueValidation = (field, value) => __awaiter(this, void 0, void 0, function* () {
            // debugger;
            const validation = yield this.props.fValidation(field, value);
            // Update the error message
            this.setState({
                errorMessage: validation,
            });
        });
        this.state = {
            value: null,
            errorMessage: '',
        };
        this.async = new Async(this);
        this.delayedValidate = this.async.debounce(this.valueValidation, this.props.field.deferredValidationTime ||
            this.props.field.deferredValidationTime >= 0
            ? this.props.field.deferredValidationTime
            : 200);
    }
    /**
     * UNSAFE_componentWillMount lifecycle hook
     */
    UNSAFE_componentWillMount() {
        this.setState({
            value: this.props.item[this.props.field.id],
        });
        this.valueChange(this.props.field, this.props.item[this.props.field.id])
            .then(() => {
            /* no-op; */
        })
            .catch(() => {
            /* no-op; */
        });
    }
    /**
     * UNSAFE_componentWillUpdate lifecycle hook
     *
     * @param nextProps
     * @param nextState
     */
    UNSAFE_componentWillUpdate(nextProps, nextState) {
        if (!isEqual(nextProps.item, this.props.item)) {
            this.setState({
                value: nextProps.item[nextProps.field.id],
            });
        }
    }
    /**
     * componentWillUnmount lifecycle hook
     */
    componentWillUnmount() {
        this.async.dispose();
    }
    /**
     * Default React render method
     */
    render() {
        const { errorMessage, value } = this.state;
        return (React.createElement("div", { className: `PropertyFieldCollectionData__panel__number-field ${styles.numberField} ${errorMessage ? styles.invalidField : ''}` },
            React.createElement("input", { type: 'number', role: 'spinbutton', placeholder: this.props.field.placeholder || this.props.field.title, "aria-valuemax": 99999, "aria-valuemin": -999999, "aria-valuenow": this.props.item[this.props.field.id] || '', "aria-invalid": !!errorMessage, value: !value && value !== 0 ? '' : value, onChange: (ev) => __awaiter(this, void 0, void 0, function* () { return yield this.valueChange(this.props.field, ev.target.value); }), disabled: this.props.disableEdit })));
    }
}
//# sourceMappingURL=CollectionNumberField.js.map