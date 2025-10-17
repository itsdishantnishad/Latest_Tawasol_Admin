import { BaseComponentContext } from '@microsoft/sp-component-base';
import { IPropertyFieldViewPickerHostProps } from '../propertyFields/viewPicker';
import { ISPViewPickerService } from './ISPViewPickerService';
import { ISPViews } from '../propertyFields/viewPicker';
/**
 * Service implementation to get list & list items from current SharePoint site
 */
export declare class SPViewPickerService implements ISPViewPickerService {
    private context;
    private props;
    /**
     * Service constructor
     */
    constructor(_props: IPropertyFieldViewPickerHostProps, pageContext: BaseComponentContext);
    /**
     * Gets the collection of view for a selected list
     */
    getViews(): Promise<ISPViews>;
    /**
     * Returns an empty view for when a list isn't selected
     */
    private getEmptyViews;
}
//# sourceMappingURL=SPViewPickerService.d.ts.map