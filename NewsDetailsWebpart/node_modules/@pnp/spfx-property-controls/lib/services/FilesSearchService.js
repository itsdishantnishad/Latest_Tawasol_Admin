var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SPHttpClient } from "@microsoft/sp-http";
import { find } from "@fluentui/react/lib/Utilities";
import { GeneralHelper } from "../helpers/GeneralHelper";
/**
 * Maximum file size when searching
 */
const MAXFILESIZE = 52428800;
/**
 * Maximum number of search results
 */
const MAXRESULTS = 100;
export class FilesSearchService {
    constructor(context, bingAPIKey) {
        /**
         * Checks if file exists
         */
        this.checkFileExists = (fileUrl) => __awaiter(this, void 0, void 0, function* () {
            try {
                const fetchFileResult = yield this.context.httpClient.fetch(fileUrl, SPHttpClient.configurations.v1, {
                    headers: new Headers(),
                    method: 'HEAD',
                    mode: 'cors'
                });
                if (!fetchFileResult || !fetchFileResult.ok) {
                    throw new Error(`Something went wrong when executing search query. Status='${fetchFileResult.status}'`);
                }
                return true;
            }
            catch (err) {
                console.error(`[BingFilesService.fetchFile]: Err='${err.message}'`);
                return false;
            }
        });
        /**
         * Executes Recent files search.
         */
        this.executeRecentSearch = (accepts) => __awaiter(this, void 0, void 0, function* () {
            try {
                const webId = this.context.pageContext.web.id.toString();
                const siteId = this.context.pageContext.site.id.toString();
                const fileFilter = this._getFileFilter(accepts);
                const queryTemplate = `((SiteID:${siteId} OR SiteID:{${siteId}}) AND (WebId:${webId} OR WebId:{${webId}})) AND LastModifiedTime < {Today} AND -Title:OneNote_DeletedPages AND -Title:OneNote_RecycleBin${fileFilter}`;
                const queryData = {
                    __metadata: { "type": "Microsoft.Office.Server.Search.REST.SearchRequest" },
                    QueryTemplate: queryTemplate,
                    RowLimit: 20,
                    SelectProperties: {
                        results: [
                            "Title",
                            "Path",
                            "Filename",
                            "FileExtension",
                            "FileType",
                            "Created",
                            "Author",
                            "LastModifiedTime",
                            "EditorOwsUser",
                            "ModifiedBy",
                            "LinkingUrl",
                            "SiteTitle",
                            "ParentLink",
                            "DocumentPreviewMetadata",
                            "ListID",
                            "ListItemID",
                            "SPSiteURL",
                            "SiteID",
                            "WebId",
                            "UniqueID",
                            "SPWebUrl",
                            "DefaultEncodingURL",
                            "PictureThumbnailURL",
                        ]
                    },
                    SortList: {
                        results: [
                            {
                                "Property": "LastModifiedTime",
                                "Direction": 1
                            }
                        ]
                    }
                };
                const searchApi = `${this.context.pageContext.web.absoluteUrl}/_api/search/postquery`;
                const recentSearchDataResult = yield this.context.spHttpClient.post(searchApi, SPHttpClient.configurations.v1, {
                    headers: {
                        'accept': 'application/json;odata=nometadata',
                        'content-type': 'application/json;odata=verbose',
                        "odata-version": ""
                    },
                    body: JSON.stringify({
                        request: queryData
                    })
                });
                if (!recentSearchDataResult || !recentSearchDataResult.ok) {
                    throw new Error(`Something went wrong when executing search query. Status='${recentSearchDataResult.status}'`);
                }
                const recentSearchData = yield recentSearchDataResult.json();
                if (!recentSearchData || !recentSearchData.PrimaryQueryResult.RelevantResults.Table.Rows) {
                    throw new Error(`Cannot read JSON result`);
                }
                const recentFilesResult = recentSearchData.PrimaryQueryResult.RelevantResults.Table.Rows.map((row) => { return this.parseRecentSearchResult(row.Cells); });
                return recentFilesResult;
            }
            catch (err) {
                console.error(`[BingFilesService.executeRecentSearch]: Err='${err.message}'`);
                return null;
            }
        });
        /**
         * Executes bing search for a file.
         */
        this.executeBingSearch = (queryParams) => __awaiter(this, void 0, void 0, function* () {
            try {
                const aspect = queryParams.aspect ? queryParams.aspect : 'All';
                const size = queryParams.size ? queryParams.size : 'All';
                const license = queryParams.license ? queryParams.license : 'Any';
                const query = queryParams.query;
                const maxResults = queryParams.maxResults ? queryParams.maxResults : MAXRESULTS;
                const maxFileSize = queryParams.maxFileSize ? queryParams.maxFileSize : MAXFILESIZE;
                // No query
                if (query === undefined) {
                    return;
                }
                // Submit the request
                const apiUrl = `https://api.cognitive.microsoft.com/bing/v7.0/images/search?traffictype=Internal_monitor&q=${encodeURIComponent(query)}&count=${maxResults}&aspect=${aspect}&maxFileSize=${maxFileSize}&mkt=en-US&size=${size}&license=${license}`;
                const headers = new Headers({
                    'Ocp-Apim-Subscription-Key': this.bingAPIKey
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const searchDataResponse = yield this.context.httpClient.get(apiUrl, SPHttpClient.configurations.v1, {
                    headers: headers,
                    method: 'GET',
                    mode: 'cors'
                });
                if (!searchDataResponse || !searchDataResponse.ok) {
                    throw new Error(`Something went wrong when executing search query. Status='${searchDataResponse.statusMessage}'`);
                }
                const searchData = yield searchDataResponse.json();
                if (!searchData || !searchData.value) {
                    throw new Error(`Cannot read JSON result`);
                }
                const bingResults = searchData.value;
                const searchResults = bingResults.map(item => this.parseBingSearchResult(item));
                return searchResults;
            }
            catch (err) {
                console.error(`[BingFilesService.executeSearch]: Err='${err.message}'`);
                return null;
            }
        });
        /**
         * Downloads document content from SP location.
         */
        this.downloadSPFileContent = (absoluteFileUrl, fileName) => __awaiter(this, void 0, void 0, function* () {
            try {
                const fileDownloadResult = yield this.context.spHttpClient.get(absoluteFileUrl, SPHttpClient.configurations.v1);
                if (!fileDownloadResult || !fileDownloadResult.ok) {
                    throw new Error(`Something went wrong when downloading the file. Status='${fileDownloadResult.status}'`);
                }
                // Return file created from blob
                const blob = yield fileDownloadResult.blob();
                // Retrieve file from blob - method supports IE11
                return GeneralHelper.getFileFromBlob(blob, fileName);
            }
            catch (err) {
                console.error(`[FileSearchService.fetchFileContent] Err='${err.message}'`);
                return null;
            }
        });
        /**
         * Downloads document content from Remote location.
         */
        this.downloadBingContent = (absoluteFileUrl, fileName) => __awaiter(this, void 0, void 0, function* () {
            try {
                const fileDownloadResult = yield this.context.httpClient.get(absoluteFileUrl, SPHttpClient.configurations.v1, {
                    method: "GET",
                    mode: "cors"
                });
                if (!fileDownloadResult || !fileDownloadResult.ok) {
                    throw new Error(`Something went wrong when downloading the file. Status='${fileDownloadResult.status}'`);
                }
                // Return file created from blob
                const blob = yield fileDownloadResult.blob();
                return GeneralHelper.getFileFromBlob(blob, fileName);
            }
            catch (err) {
                console.error(`[FileSearchService.fetchFileContent] Err='${err.message}'`);
                return null;
            }
        });
        /**
         * Parses Recent Search results.
         */
        this.parseRecentSearchResult = (cells) => {
            const titleCell = find(cells, x => x.Key === "Title");
            const keyCell = find(cells, x => x.Key === "UniqueID");
            const fileUrlCell = find(cells, x => x.Key === "DefaultEncodingURL");
            const editedByCell = find(cells, x => x.Key === "ModifiedBy");
            const recentFile = {
                key: keyCell ? keyCell.Value : null,
                name: titleCell ? titleCell.Value : null,
                fileUrl: fileUrlCell ? fileUrlCell.Value : null,
                editedBy: editedByCell ? editedByCell.Value : null
            };
            return recentFile;
        };
        /**
         * Parses Bing search results.
         */
        this.parseBingSearchResult = (bingResult) => {
            // Get dimensions
            const width = bingResult.thumbnail.width ? bingResult.thumbnail.width : bingResult.width;
            const height = bingResult.thumbnail.height ? bingResult.thumbnail.height : bingResult.height;
            // Create a search result
            const searchResult = {
                thumbnailUrl: bingResult.thumbnailUrl,
                contentUrl: bingResult.contentUrl,
                displayUrl: this.getDisplayUrl(bingResult.hostPageDisplayUrl),
                key: bingResult.imageId,
                width: width,
                height: height,
            };
            return searchResult;
        };
        /**
         * Removes protocol and retrieves only the domain, just like Bing search results does
         * in the SharePoint file picker
         * @param url The display url as provided by Bing
         */
        this.getDisplayUrl = (url) => {
            // remove any protocols
            if (url.indexOf('://') > -1) {
                const urlParts = url.split('://');
                url = urlParts.pop();
            }
            // Split the URL on the first slash
            const splitUrl = url.split('/');
            return splitUrl[0];
        };
        this.context = context;
        this.bingAPIKey = bingAPIKey;
    }
    /**
     * Builds a file filter using the accepted file extensions
     */
    _getFileFilter(accepts) {
        let fileFilter = undefined;
        if (accepts && accepts.length) {
            fileFilter = " AND (";
            accepts.forEach((fileType, index) => {
                fileType = fileType.replace(".", "");
                if (index > 0) {
                    fileFilter = fileFilter + " OR ";
                }
                fileFilter = fileFilter + `FileExtension:${fileType} OR SecondaryFileExtension:${fileType}`;
            });
            fileFilter = fileFilter + ")";
        }
        return fileFilter;
    }
}
//# sourceMappingURL=FilesSearchService.js.map