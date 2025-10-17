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
import { GeneralHelper } from "../helpers/GeneralHelper";
export class FileBrowserService {
    constructor(context, itemsToDownloadCount = 100) {
        /**
         * Gets files from current sites library
         * @param libraryName
         * @param folderPath
         * @param acceptedFilesExtensions
         */
        this.getListItems = (libraryName, folderPath, acceptedFilesExtensions, nextPageQueryStringParams) => __awaiter(this, void 0, void 0, function* () {
            let filesQueryResult = { items: [], nextHref: null };
            try {
                let restApi = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('${libraryName}')/RenderListDataAsStream`;
                // Do not pass FolderServerRelativeUrl as query parameter
                // Attach passed nextPageQueryStringParams values to REST URL
                if (nextPageQueryStringParams) {
                    restApi += `${nextPageQueryStringParams}`;
                    folderPath = null;
                }
                filesQueryResult = yield this._getListDataAsStream(restApi, folderPath, acceptedFilesExtensions);
            }
            catch (error) {
                filesQueryResult.items = null;
                console.error(error.message);
            }
            return filesQueryResult;
        });
        this.getListItemsByListId = (listId, folderPath, acceptedFilesExtensions, nextPageQueryStringParams, currentSortColumnName, isSortedDescending) => __awaiter(this, void 0, void 0, function* () {
            let filesQueryResult = { items: [], nextHref: null };
            try {
                let restApi = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists(guid'${listId}')/RenderListDataAsStream`;
                // Do not pass FolderServerRelativeUrl as query parameter
                // Attach passed nextPageQueryStringParams values to REST URL
                if (nextPageQueryStringParams) {
                    restApi += `${nextPageQueryStringParams}`;
                    folderPath = null;
                }
                filesQueryResult = yield this._getListDataAsStream(restApi, folderPath, acceptedFilesExtensions, currentSortColumnName, isSortedDescending);
            }
            catch (error) {
                filesQueryResult.items = null;
                console.error(error.message);
            }
            return filesQueryResult;
        });
        /**
         * Provides the URL for file preview.
         */
        this.getFileThumbnailUrl = (file, thumbnailWidth, thumbnailHeight) => {
            const thumbnailUrl = (file.spItemUrl && file.fileType === "aspx") // it's a SharePoint item, specifically a page
                ? `${this.context.pageContext.web.absoluteUrl}/_layouts/15/getpreview.ashx?path=${encodeURIComponent(file.absoluteUrl)}&resolution=0`
                : `${this.mediaBaseUrl}/transform/thumbnail?provider=spo&inputFormat=${file.fileType}&cs=${this.callerStack}&docid=${file.spItemUrl}&${this.driveAccessToken}&width=${thumbnailWidth}&height=${thumbnailHeight}`;
            return thumbnailUrl;
        };
        /**
         * Gets document and media libraries from the site
         */
        this.getSiteMediaLibraries = (includePageLibraries = false) => __awaiter(this, void 0, void 0, function* () {
            try {
                const absoluteUrl = this.context.pageContext.web.absoluteUrl;
                const restApi = `${absoluteUrl}/_api/SP.Web.GetDocumentAndMediaLibraries?webFullUrl='${encodeURIComponent(absoluteUrl)}'&includePageLibraries='${includePageLibraries}'`;
                const mediaLibrariesResult = yield this.context.spHttpClient.get(restApi, SPHttpClient.configurations.v1);
                if (!mediaLibrariesResult || !mediaLibrariesResult.ok) {
                    throw new Error(`Something went wrong when executing request. Status='${mediaLibrariesResult.status}'`);
                }
                const libResults = yield mediaLibrariesResult.json();
                if (!libResults || !libResults.value) {
                    throw new Error(`Cannot read data from the results.`);
                }
                const result = libResults.value.map((libItem) => { return this.parseLibItem(libItem); });
                return result;
            }
            catch (error) {
                console.error(`[FileBrowserService.getSiteMediaLibraries]: Err='${error.message}'`);
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
                return GeneralHelper.getFileFromBlob(blob, fileName);
            }
            catch (err) {
                console.error(`[FileBrowserService.fetchFileContent] Err='${err.message}'`);
                return null;
            }
        });
        /**
         * Executes query to load files with possible extension filtering
         * @param restApi
         * @param folderPath
         * @param acceptedFilesExtensions
         */
        this._getListDataAsStream = (restApi, folderPath, acceptedFilesExtensions, currentSortColumnName, isSortedDescending) => __awaiter(this, void 0, void 0, function* () {
            let filesQueryResult = { items: [], nextHref: null };
            try {
                const body = {
                    parameters: {
                        AllowMultipleValueFilterForTaxonomyFields: true,
                        // ContextInfo (1), ListData (2), ListSchema (4), ViewMetadata (1024), EnableMediaTAUrls (4096), ParentInfo (8192)
                        RenderOptions: 1 | 2 | 4 | 1024 | 4096 | 8192,
                        ViewXml: this.getFilesCamlQueryViewXml(acceptedFilesExtensions, currentSortColumnName, isSortedDescending)
                    }
                };
                if (folderPath) {
                    body.parameters["FolderServerRelativeUrl"] = folderPath; // eslint-disable-line dot-notation
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data = yield this.context.spHttpClient.fetch(restApi, SPHttpClient.configurations.v1, {
                    method: "POST",
                    body: JSON.stringify(body)
                });
                if (!data || !data.ok) {
                    throw new Error(`[FileBrowser._getListItems]: Something went wrong when executing request. Status='${data.statusMessage}'`);
                }
                const filesResult = yield data.json();
                if (!filesResult || !filesResult.ListData || !filesResult.ListData.Row) {
                    throw new Error(`[FileBrowser._getListItems]: No data is available. Status='${data.statusMessage}'`);
                }
                // Set additional information from the ListResponse
                this.processResponse(filesResult);
                const items = filesResult.ListData.Row.map(fileItem => this.parseFileItem(fileItem));
                filesQueryResult = {
                    items: items,
                    nextHref: filesResult.ListData.NextHref
                };
            }
            catch (error) {
                filesQueryResult.items = null;
                console.error(error.message);
            }
            return filesQueryResult;
        });
        /**
         * Generates Files CamlQuery ViewXml
         */
        this.getFilesCamlQueryViewXml = (accepts, currentSortColumnName, isSortedDescending) => {
            const fileFilter = this.getFileTypeFilter(accepts);
            let spSortColumnName = '';
            switch (currentSortColumnName) {
                case 'name':
                    spSortColumnName = 'FileLeafRef';
                    break;
                case 'modified':
                    spSortColumnName = 'Modified';
                    break;
                case 'fileSize':
                    spSortColumnName = 'File_x0020_Size';
                    break;
                case 'modifiedBy':
                    spSortColumnName = 'Editor';
                    break;
                default: break;
            }
            const queryCondition = fileFilter && fileFilter !== "" ?
                `<Query>
        <Where>
          <Or>
            <And>
              <Eq>
                <FieldRef Name="FSObjType" />
                <Value Type="Text">1</Value>
              </Eq>
              <Eq>
                <FieldRef Name="SortBehavior" />
                <Value Type="Text">1</Value>
              </Eq>
            </And>
            <In>
              <FieldRef Name="File_x0020_Type" />
              ${fileFilter}
            </In>
          </Or>
        </Where>
        ${spSortColumnName ? `<OrderBy><FieldRef Name="${spSortColumnName}" Ascending="${isSortedDescending ? "FALSE" : "TRUE"}"/></OrderBy>` : ''}
        </Query>`
                : // no query is specified, but a sort might be...
                    spSortColumnName ? `<Query><OrderBy><FieldRef Name="${spSortColumnName}" Ascending="${isSortedDescending ? "FALSE" : "TRUE"}"/></OrderBy></Query>`
                        : ''; // no query or sort specified 
            // Add files types condiiton
            const viewXml = `<View>
                      ${queryCondition}
                      <ViewFields>
                        <FieldRef Name="DocIcon"/>
                        <FieldRef Name="LinkFilename"/>
                        <FieldRef Name="Modified"/>
                        <FieldRef Name="Editor"/>
                        <FieldRef Name="FileSizeDisplay"/>
                        <FieldRef Name="SharedWith"/>
                        <FieldRef Name="MediaServiceFastMetadata"/>
                        <FieldRef Name="MediaServiceOCR"/>
                        <FieldRef Name="_ip_UnifiedCompliancePolicyUIAction"/>
                        <FieldRef Name="ItemChildCount"/>
                        <FieldRef Name="FolderChildCount"/>
                        <FieldRef Name="SMTotalFileCount"/>
                        <FieldRef Name="SMTotalSize"/>
                      </ViewFields>
                      <RowLimit Paged="TRUE">${this.itemsToDownloadCount}</RowLimit>
                    </View>`;
            return viewXml;
        };
        /**
         * Converts REST call results to IFile
         */
        this.parseFileItem = (fileItem) => {
            var _a;
            const modifiedFriendlyRaw = fileItem["Modified.FriendlyDisplay"];
            // Get the modified date
            const modifiedParts = modifiedFriendlyRaw.split('|');
            const modifiedFriendly = modifiedParts.length === 2 ? modifiedParts[1] : fileItem.Modified; // If there is a friendly modified date, use that
            const file = {
                name: fileItem.FileLeafRef,
                fileIcon: fileItem.DocIcon,
                serverRelativeUrl: fileItem.FileRef,
                modified: new Date((_a = fileItem["Modified."]) !== null && _a !== void 0 ? _a : fileItem.Modified),
                modifiedFriendly: modifiedFriendly,
                fileSize: parseInt(fileItem.File_x0020_Size),
                fileType: fileItem.File_x0020_Type,
                modifiedBy: fileItem.Editor[0].title,
                isFolder: fileItem.FSObjType === "1",
                absoluteUrl: this.buildAbsoluteUrl(fileItem.FileRef),
                // Required for item thumbnail
                supportsThumbnail: true,
                spItemUrl: fileItem[".spItemUrl"]
            };
            return file;
        };
        this.parseLibItem = (libItem) => {
            const library = {
                title: libItem.Title,
                id: libItem.Id,
                absoluteUrl: libItem.AbsoluteUrl,
                serverRelativeUrl: libItem.ServerRelativeUrl
            };
            return library;
        };
        /**
         * Creates an absolute URL
         */
        this.buildAbsoluteUrl = (relativeUrl) => {
            const siteUrl = GeneralHelper.getAbsoluteDomainUrl(this.context.pageContext.web.absoluteUrl);
            return `${siteUrl}${relativeUrl}`;
        };
        this.processResponse = (fileResponse) => {
            // Extract media base URL
            this.mediaBaseUrl = fileResponse.ListSchema[".mediaBaseUrl"];
            this.callerStack = fileResponse.ListSchema[".callerStack"];
            this.driveAccessToken = fileResponse.ListSchema[".driveAccessToken"];
        };
        this.context = context;
        this.itemsToDownloadCount = itemsToDownloadCount;
        this.driveAccessToken = null;
    }
    /**
     * Generates CamlQuery files filter.
     * @param accepts
     */
    getFileTypeFilter(accepts) {
        let fileFilter = "";
        if (accepts && accepts.length > 0) {
            fileFilter = "<Values>";
            accepts.forEach((fileType, index) => {
                fileType = fileType.replace(".", "");
                if (index >= 0) {
                    fileFilter = fileFilter + `<Value Type="Text">${fileType}</Value>`;
                }
            });
            fileFilter = fileFilter + "</Values>";
        }
        return fileFilter;
    }
}
//# sourceMappingURL=FileBrowserService.js.map