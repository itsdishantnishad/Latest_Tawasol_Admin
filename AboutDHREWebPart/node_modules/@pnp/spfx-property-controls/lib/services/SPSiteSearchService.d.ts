import { BaseComponentContext } from '@microsoft/sp-component-base';
import { ISPSiteSearchService } from './ISPSiteSearchService';
import { IPropertyFieldSite } from '../propertyFields/sitePicker/IPropertyFieldSitePicker';
/**
 * Service implementation to search sites in SharePoint
 */
export default class SPSiteSearchService implements ISPSiteSearchService {
    /**
     * Search sites from the SharePoint
     */
    searchSites(ctx: BaseComponentContext, query: string, trimDuplicates: boolean, additionalQuery?: string | undefined): Promise<IPropertyFieldSite[]>;
}
//# sourceMappingURL=SPSiteSearchService.d.ts.map