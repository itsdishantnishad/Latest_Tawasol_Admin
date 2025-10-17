import { BaseComponentContext } from '@microsoft/sp-component-base';
import { IPropertyFieldColumnPickerHostProps } from '../propertyFields/columnPicker';
import { ISPColumnPickerService } from './ISPColumnPickerService';
import { ISPColumns } from '../propertyFields/columnPicker';
/**
 * Service implementation to get list & list items from current SharePoint site
 */
export declare class SPColumnPickerService implements ISPColumnPickerService {
    private context;
    private props;
    /**
     * Service constructor
     */
    constructor(_props: IPropertyFieldColumnPickerHostProps, pageContext: BaseComponentContext);
    /**
     * Gets the collection of column for a selected list
     */
    getColumns(displayHiddenColumns?: boolean): Promise<ISPColumns>;
    /**
     * Returns an empty column for when a list isn't selected
     */
    private getEmptyColumns;
    /**
     * Returns 3 fake SharePoint Columns for the Mock mode
     */
    private getColumnsFromMock;
}
//# sourceMappingURL=SPColumnPickerService.d.ts.map