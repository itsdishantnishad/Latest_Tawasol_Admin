import { IChoiceGroupOption } from '@fluentui/react/lib/ChoiceGroup';
import { ISPColumns } from './ISPColumns';
import { IPropertyFieldColumnPickerPropsInternal } from './IPropertyFieldColumnPicker';
/**
 * PropertyFieldColumnPickerHost properties interface
 */
export interface IPropertyFieldColumnMultiPickerHostProps extends IPropertyFieldColumnPickerPropsInternal {
    onChange: (targetProperty?: string, newValue?: any) => void;
}
/**
 * PropertyFieldSPColumnMultiplePickerHost state interface
 */
export interface IPropertyFieldColumnMultiPickerHostState {
    loadedColumns: ISPColumns;
    results: IChoiceGroupOption[];
    selectedKeys: string[];
    loaded: boolean;
    errorMessage?: string;
}
//# sourceMappingURL=IPropertyFieldColumnMultiPickerHost.d.ts.map