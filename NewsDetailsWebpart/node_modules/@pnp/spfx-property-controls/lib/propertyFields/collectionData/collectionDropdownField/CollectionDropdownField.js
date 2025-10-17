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
import { Dropdown } from '@fluentui/react';
import styles from '../PropertyFieldCollectionDataHost.module.scss';
export const CollectionDropdownField = ({ field, item, disableEdit, fOnValueChange, fValidation }) => {
    const [options, setOptions] = React.useState();
    const [errorMessage, setErrorMessage] = React.useState();
    const onValueChange = React.useCallback((value) => __awaiter(void 0, void 0, void 0, function* () {
        if (!field) {
            return;
        }
        if (fOnValueChange) {
            yield fOnValueChange(field.id, value);
        }
        if (fValidation) {
            const error = yield fValidation(field, value);
            setErrorMessage(error);
        }
    }), [field, fOnValueChange, fValidation]);
    React.useEffect(() => {
        if (!field || !field.options) {
            return;
        }
        let newOptions = [];
        if (typeof (field.options) === 'function') {
            if (!item) {
                return;
            }
            newOptions = field.options(field.id, item);
        }
        else {
            newOptions = field.options.slice();
        }
        setOptions(newOptions);
    }, [field, item, field.options]);
    React.useEffect(() => {
        if (item && field) {
            onValueChange(item[field.id]).then(() => { }).catch(() => { });
        }
    }, []);
    if (!field || !item) {
        return React.createElement(React.Fragment, null);
    }
    return React.createElement(Dropdown, { placeHolder: field.placeholder || field.title, options: options, selectedKey: item[field.id], required: field.required, disabled: disableEdit, onChange: (e, i) => { onValueChange(i.key).then(() => { }).catch(() => { }); }, onRenderOption: field.onRenderOption, className: `PropertyFieldCollectionData__panel__dropdown-field ${errorMessage ? styles.invalidField : ''}` });
};
//# sourceMappingURL=CollectionDropdownField.js.map