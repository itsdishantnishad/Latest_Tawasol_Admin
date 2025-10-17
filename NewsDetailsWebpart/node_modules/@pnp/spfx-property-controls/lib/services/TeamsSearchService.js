var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { batch } from "../helpers/GraphHelper";
/**
 * Service implementation to search sites in SharePoint
 */
export default class TeamsSearchService {
    /**
     * Search sites from the SharePoint
     */
    searchTeams(ctx, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const msGraphClient = yield ctx.msGraphClientFactory.getClient('3');
            const listOfTeamsResults = yield msGraphClient // eslint-disable-line @typescript-eslint/no-explicit-any
                .api(`/me/joinedTeams?$filter=startswith(displayName,'${query}')&$select=id,displayName`)
                .version("v1.0")
                .get();
            const listOfTeams = listOfTeamsResults.value; // eslint-disable-line @typescript-eslint/no-explicit-any
            const res = [];
            if (listOfTeams && listOfTeams.length > 0) {
                const batchRequests = [];
                listOfTeams.forEach((t) => {
                    batchRequests.push({
                        id: t.id,
                        method: 'GET',
                        url: `/groups/${t.id}/drive/root?$select=webUrl`
                    });
                });
                const batchResponses = yield batch(batchRequests, 'v1.0', ctx);
                for (const team of listOfTeams) {
                    const webUrl = batchResponses.filter(br => br.id === team.id)[0].body.webUrl;
                    res.push({ id: team.id, title: team.displayName, url: webUrl });
                }
            }
            return res;
        });
    }
}
//# sourceMappingURL=TeamsSearchService.js.map