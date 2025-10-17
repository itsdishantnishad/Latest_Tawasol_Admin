import { BaseComponentContext } from '@microsoft/sp-component-base';
import { IPropertyFieldTeam } from "../propertyFields/teamPicker/IPropertyFieldTeamPicker";
import { ITeamsSearchService } from "./ITeamsSearchService";
/**
 * Service implementation to search sites in SharePoint
 */
export default class TeamsSearchService implements ITeamsSearchService {
    /**
     * Search sites from the SharePoint
     */
    searchTeams(ctx: BaseComponentContext, query: string): Promise<IPropertyFieldTeam[]>;
}
//# sourceMappingURL=TeamsSearchService.d.ts.map