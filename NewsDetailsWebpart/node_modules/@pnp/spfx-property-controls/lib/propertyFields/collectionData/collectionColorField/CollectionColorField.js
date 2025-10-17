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
import { Callout, DirectionalHint, ColorPicker, Async } from '@fluentui/react';
export class CollectionColorField extends React.Component {
    constructor(props, state) {
        super(props, state);
        this._colorElement = React.createRef();
        this._onCalloutDismiss = () => {
            this.setState({
                isCalloutVisible: false
            });
        };
        this._onCalloutToggle = () => {
            this.setState({
                isCalloutVisible: !this.state.isCalloutVisible
            });
        };
        /**
        * Value change event handler
        *
        * @param field
        * @param value
        */
        this.valueChange = (field, value) => __awaiter(this, void 0, void 0, function* () {
            this.setState({
                color: value
            });
            yield this.props.fOnValueChange(field.id, value);
            this.delayedValidate(field, value);
        });
        /**
         * Delayed field validation
         */
        this.valueValidation = (field, value) => __awaiter(this, void 0, void 0, function* () {
            const validation = yield this.props.fValidation(field, value);
            // Update the error message
            this.setState({
                errorMessage: validation
            });
        });
        const { field, item } = this.props;
        this.state = {
            isCalloutVisible: false,
            color: item[field.id] ? item[field.id] : "#0000ff",
            errorMessage: ''
        };
        this.async = new Async(this);
        this.delayedValidate = this.async.debounce(this.valueValidation, (this.props.field.deferredValidationTime || this.props.field.deferredValidationTime >= 0) ? this.props.field.deferredValidationTime : 200);
    }
    /**
     * UNSAFE_componentWillMount lifecycle hook
     */
    UNSAFE_componentWillMount() {
        this.valueChange(this.props.field, this.props.item[this.props.field.id]).then(() => { }).catch(() => { });
    }
    /**
     * componentWillUnmount lifecycle hook
     */
    componentWillUnmount() {
        this.async.dispose();
    }
    render() {
        return (React.createElement("div", { className: `PropertyFieldCollectionData__panel__color-field ${styles.colorField} ${this.state.errorMessage ? styles.invalidField : ""}` },
            React.createElement("div", { className: styles.colorIndicator, style: { backgroundColor: this.state.color, cursor: this.props.disableEdit ? 'default' : 'hand' }, ref: this._colorElement, onClick: () => { if (!this.props.disableEdit)
                    this._onCalloutToggle(); } }),
            React.createElement(Callout, { gapSpace: 0, target: this._colorElement.current, onDismiss: this._onCalloutDismiss, setInitialFocus: true, hidden: !this.state.isCalloutVisible, directionalHint: DirectionalHint.rightCenter },
                React.createElement(ColorPicker, { color: this.state.color, alphaSliderHidden: true, onChange: (ev, color) => __awaiter(this, void 0, void 0, function* () { return yield this.valueChange(this.props.field, color.str); }) }))));
    }
}
//# sourceMappingURL=CollectionColorField.js.map