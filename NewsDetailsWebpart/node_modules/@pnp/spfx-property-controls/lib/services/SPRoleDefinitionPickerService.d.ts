import { BaseComponentContext } from '@microsoft/sp-component-base';
import { IPropertyFieldRoleDefinitionPickerHostProps } from '../propertyFields/roleDefinitionPicker';
import { ISPRoleDefinitionPickerService } from './ISPRoleDefinitionPickerService';
import { IRoleDefinitionInformationCollection } from '../propertyFields/roleDefinitionPicker';
/**
 * Service implementation to get list & list items from current SharePoint site
 */
export declare class SPRoleDefinitionPickerService implements ISPRoleDefinitionPickerService {
    private context;
    private props;
    /**
     * Service constructor
     */
    constructor(_props: IPropertyFieldRoleDefinitionPickerHostProps, pageContext: BaseComponentContext);
    /**
     * Gets the collection of view for a selected list
     */
    getRoleDefinitions(): Promise<IRoleDefinitionInformationCollection>;
    /**
     * Returns an empty view for when a list isn't selected
     */
    private getEmptyViews;
}
//# sourceMappingURL=SPRoleDefinitionPickerService.d.ts.map