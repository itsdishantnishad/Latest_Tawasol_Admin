import { IPropertyPaneField } from '@microsoft/sp-property-pane';
import { IPropertyFieldContentTypePickerProps, IPropertyFieldContentTypePickerPropsInternal } from './IPropertyFieldContentTypePicker';
/**
 * Helper method to create a SPContentType Picker on the PropertyPane.
 * @param targetProperty - Target property the SharePoint ContentType picker is associated to.
 * @param properties - Strongly typed SPContentType Picker properties.
 */
export declare function PropertyFieldContentTypePicker(targetProperty: string, properties: IPropertyFieldContentTypePickerProps): IPropertyPaneField<IPropertyFieldContentTypePickerPropsInternal>;
//# sourceMappingURL=PropertyFieldContentTypePicker.d.ts.map