import { BaseComponentContext } from '@microsoft/sp-component-base';
import { IPropertyFieldContentTypePickerHostProps } from '../propertyFields/contentTypePicker';
import { ISPContentTypePickerService } from './ISPContentTypePickerService';
import { ISPContentTypes } from '../propertyFields/contentTypePicker';
/**
 * Service implementation to get Content Types from SharePoint site or selected SharePoint List
 */
export declare class SPContentTypePickerService implements ISPContentTypePickerService {
    private context;
    private props;
    /**
     * Service constructor
     */
    constructor(_props: IPropertyFieldContentTypePickerHostProps, pageContext: BaseComponentContext);
    /**
     * Gets the collection of ContentTypes from SharePoint site or selected SharePoint List
     */
    getContentTypes(): Promise<ISPContentTypes>;
    /**
     * Returns an empty contentType for when no selection is done
     */
    private getEmptycontentTypes;
}
//# sourceMappingURL=SPContentTypePickerService.d.ts.map