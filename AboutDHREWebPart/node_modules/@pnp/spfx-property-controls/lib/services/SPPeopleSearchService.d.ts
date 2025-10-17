import { PrincipalType, IPropertyFieldGroupOrPerson } from './../propertyFields/peoplePicker/IPropertyFieldPeoplePicker';
import { ISPPeopleSearchService } from './ISPPeopleSearchService';
import { BaseComponentContext } from '@microsoft/sp-component-base';
/**
 * Service implementation to search people in SharePoint
 */
export default class SPPeopleSearchService implements ISPPeopleSearchService {
    /**
     * Search people from the SharePoint People database
     */
    searchPeople(ctx: BaseComponentContext, query: string, principalType: PrincipalType[], siteUrl?: string): Promise<IPropertyFieldGroupOrPerson[]>;
    /**
     * Generates Initials from a full name
     */
    private getFullNameInitials;
    /**
     * Gets the user photo url
     */
    private getUserPhotoUrl;
}
//# sourceMappingURL=SPPeopleSearchService.d.ts.map