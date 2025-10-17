var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SPHttpClient } from '@microsoft/sp-http';
/**
 * Service implementation to search sites in SharePoint
 */
export default class SPSiteSearchService {
    /**
     * Search sites from the SharePoint
     */
    searchSites(ctx, query, trimDuplicates, additionalQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            let rootUrl = ctx.pageContext.web.absoluteUrl;
            if (ctx.pageContext.web.serverRelativeUrl !== "/") {
                rootUrl = ctx.pageContext.web.absoluteUrl.replace(ctx.pageContext.web.serverRelativeUrl, '');
            }
            let queryText = `(contentclass:STS_Site contentclass:STS_Web Path:${rootUrl}* Title:${query}*)`;
            if (additionalQuery) {
                queryText += ` AND (${additionalQuery})`;
            }
            let startRow = 0;
            const rowLimit = 500;
            let totalRows = 0;
            const values = []; // eslint-disable-line @typescript-eslint/no-explicit-any
            const searchRequest = {
                QueryTemplate: queryText,
                RowLimit: rowLimit,
                TrimDuplicates: trimDuplicates,
                SelectProperties: ['SiteId', 'SiteID', 'WebId', 'DepartmentId', 'Title', 'Path'],
                StartRow: 0
            };
            const requestUrl = `${ctx.pageContext.web.absoluteUrl}/_api/search/postquery`;
            //
            // getting all sites
            //
            do {
                searchRequest.StartRow = startRow;
                const searchResponse = yield ctx.spHttpClient.post(requestUrl, SPHttpClient.configurations.v1, {
                    body: JSON.stringify({ request: searchRequest }),
                    headers: {
                        'Accept': 'application/json;odata=nometadata',
                        'Content-Type': 'application/json;charset=utf-8',
                        'odata-version': '3.0'
                    }
                });
                const sitesResponse = yield searchResponse.json();
                const relevantResults = sitesResponse.PrimaryQueryResult.RelevantResults;
                values.push(...relevantResults.Table.Rows);
                totalRows = relevantResults.TotalRows;
                startRow += rowLimit;
            } while (values.length < totalRows);
            // Do the call against the SP REST API search endpoint
            let res = [];
            res = values.map(element => {
                const site = {};
                element.Cells.forEach(cell => {
                    switch (cell.Key) {
                        case 'Title':
                            site.title = cell.Value;
                            break;
                        case 'Path':
                            site.url = cell.Value;
                            break;
                        case 'SiteId':
                        case 'SiteID':
                            site.id = cell.Value;
                            break;
                        case 'WebId':
                            site.webId = cell.Value;
                            break;
                        case 'DepartmentId':
                            if (cell.Value) {
                                if (cell.Value.indexOf('{') === 0) {
                                    site.hubSiteId = cell.Value.slice(1, -1);
                                }
                                else {
                                    site.hubSiteId = cell.Value;
                                }
                            }
                            break;
                    }
                });
                return site;
            });
            return res;
        });
    }
}
//# sourceMappingURL=SPSiteSearchService.js.map