import { IPropertyPaneField } from '@microsoft/sp-property-pane';
import { IPropertyFieldColumnPickerProps, IPropertyFieldColumnPickerPropsInternal } from './IPropertyFieldColumnPicker';
/**
 * Helper method to create a SPColumn Picker on the PropertyPane.
 * @param targetProperty - Target property the SharePoint column picker is associated to.
 * @param properties - Strongly typed SPColumn Picker properties.
 */
export declare function PropertyFieldColumnPicker(targetProperty: string, properties: IPropertyFieldColumnPickerProps): IPropertyPaneField<IPropertyFieldColumnPickerPropsInternal>;
//# sourceMappingURL=PropertyFieldColumnPicker.d.ts.map