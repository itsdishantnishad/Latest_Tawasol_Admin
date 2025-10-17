import { BaseComponentContext } from '@microsoft/sp-component-base';
import { ISPLists, IPropertyFieldListPickerHostProps } from '../propertyFields/listPicker/IPropertyFieldListPickerHost';
/**
 * Service implementation to get list & list items from current SharePoint site
 */
export default class SPListPickerService {
    private context;
    private props;
    /**
     * Service constructor
     */
    constructor(_props: IPropertyFieldListPickerHostProps, pageContext: BaseComponentContext);
    /**
     * Gets the collection of libs in the current SharePoint site, or target site if specified by webRelativeUrl
     */
    getLibs(): Promise<ISPLists>;
}
//# sourceMappingURL=SPListPickerService.d.ts.map