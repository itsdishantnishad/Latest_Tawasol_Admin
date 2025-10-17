import { IPropertyFieldColumnPickerPropsInternal } from './IPropertyFieldColumnPicker';
import { IDropdownOption } from '@fluentui/react/lib/Dropdown';
/**
 * PropertyFieldColumnPickerHost properties interface
 */
export interface IPropertyFieldColumnPickerHostProps extends IPropertyFieldColumnPickerPropsInternal {
    onChange: (targetProperty?: string, newValue?: any) => void;
}
/**
 * PropertyFieldColumnPickerHost state interface
 */
export interface IPropertyFieldColumnPickerHostState {
    results: IDropdownOption[];
    selectedKey?: string;
    errorMessage?: string;
}
//# sourceMappingURL=IPropertyFieldColumnPickerHost.d.ts.map