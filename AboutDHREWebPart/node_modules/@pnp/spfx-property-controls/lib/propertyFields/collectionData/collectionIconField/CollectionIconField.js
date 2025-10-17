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
import { TextField, Icon, ActionButton } from '@fluentui/react';
import { IconSelector } from '../../../common/iconSelector/IconSelector';
export class CollectionIconField extends React.Component {
    constructor(props) {
        super(props);
        this._onSelectIconClick = () => {
            this.setState({
                isPanelOpen: true
            });
        };
        this._onIconChage = (iconName) => __awaiter(this, void 0, void 0, function* () {
            const { field } = this.props;
            this.setState({
                isPanelOpen: false
            });
            yield this.props.fOnValueChange(field.id, iconName);
            const errorMessage = yield this.props.fValidation(field, iconName);
            this.setState({
                errorMessage: errorMessage
            });
        });
        this._onPanelDismiss = () => {
            this.setState({
                isPanelOpen: false
            });
        };
        this.state = {
            isPanelOpen: false
        };
    }
    render() {
        const { field, item, renderMode } = this.props;
        const iconName = item[field.id] ? item[field.id] : '';
        const label = iconName || field.placeholder || field.title;
        return (React.createElement(React.Fragment, null,
            renderMode !== 'picker' &&
                React.createElement("div", { className: `PropertyFieldCollectionData__panel__icon-field ${styles.iconField}` },
                    React.createElement(TextField, { placeholder: field.placeholder || field.title, className: styles.collectionDataField, value: iconName, required: field.required, onChange: (e, value) => __awaiter(this, void 0, void 0, function* () { return yield this.props.fOnValueChange(field.id, value); }), deferredValidationTime: field.deferredValidationTime || field.deferredValidationTime >= 0 ? field.deferredValidationTime : 200, onGetErrorMessage: (value) => __awaiter(this, void 0, void 0, function* () { return yield this.props.fValidation(this.props.field, value); }), disabled: this.props.disableEdit }),
                    React.createElement(Icon, { iconName: item[field.id] ? item[field.id] : "" })),
            renderMode === 'picker' &&
                React.createElement("div", { className: `PropertyFieldCollectionData__panel__icon-field ${styles.collectionDataField} ${styles.iconPicker}` },
                    React.createElement(ActionButton, { required: field.required, disabled: this.props.disableEdit, onClick: this._onSelectIconClick, title: label, ariaLabel: label, styles: {
                            root: {
                                padding: '0px',
                                textAlign: 'left',
                            },
                            icon: {
                                marginLeft: '0px'
                            },
                            label: {
                                whiteSpace: 'nowrap',
                                marginLeft: iconName ? 'inherit' : '0px',
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '80px'
                            }
                        }, iconProps: {
                            iconName: iconName
                        } }, label),
                    field.required && React.createElement("span", { className: styles.requiredField }, "*"),
                    React.createElement(IconSelector, { currentIcon: iconName, renderOption: 'panel', isOpen: this.state.isPanelOpen, onSave: this._onIconChage, onDismiss: this._onPanelDismiss }))));
    }
}
//# sourceMappingURL=CollectionIconField.js.map