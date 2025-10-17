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
import { FileBrowserService } from "./FileBrowserService";
import { GeneralHelper } from "../helpers/GeneralHelper";
export class OneDriveService extends FileBrowserService {
    constructor(context, itemsToDownloadCount) {
        super(context, itemsToDownloadCount);
        /**
         * Gets files from OneDrive personal library
         */
        this.getListItems = (libraryName, folderPath, acceptedFilesExtensions, nextPageQueryStringParams) => __awaiter(this, void 0, void 0, function* () {
            let filesQueryResult = { items: [], nextHref: null };
            try {
                const oneDriveRootFolder = yield this.getOneDriveRootFolderFullUrl();
                const encodedListUrl = encodeURIComponent(oneDriveRootFolder);
                let queryStringParams = "";
                folderPath = folderPath ? folderPath : this.oneDriveRootFolderRelativeUrl;
                const encodedFolderPath = encodeURIComponent(folderPath);
                if (nextPageQueryStringParams) {
                    // Remove start ? from the query params
                    if (nextPageQueryStringParams.charAt(0) === "?") {
                        nextPageQueryStringParams = nextPageQueryStringParams.substring(1);
                    }
                    queryStringParams = nextPageQueryStringParams;
                }
                else {
                    queryStringParams = `RootFolder=${encodedFolderPath}`;
                }
                const restApi = `${this.context.pageContext.web.absoluteUrl}/_api/SP.List.GetListDataAsStream?listFullUrl='${encodedListUrl}'&${queryStringParams}`;
                filesQueryResult = yield this._getListDataAsStream(restApi, null, acceptedFilesExtensions);
            }
            catch (error) {
                filesQueryResult.items = null;
                console.error(error.message);
            }
            return filesQueryResult;
        });
        this.getListItemsByListId = (listId, folderPath, acceptedFilesExtensions, nextPageQueryStringParams) => __awaiter(this, void 0, void 0, function* () {
            let filesQueryResult = { items: [], nextHref: null };
            try {
                const oneDriveRootFolder = yield this.getOneDriveRootFolderFullUrl();
                const encodedListUrl = encodeURIComponent(oneDriveRootFolder);
                let queryStringParams = "";
                folderPath = folderPath ? folderPath : this.oneDriveRootFolderRelativeUrl;
                const encodedFolderPath = encodeURIComponent(folderPath);
                if (nextPageQueryStringParams) {
                    // Remove start ? from the query params
                    if (nextPageQueryStringParams.charAt(0) === "?") {
                        nextPageQueryStringParams = nextPageQueryStringParams.substring(1);
                    }
                    queryStringParams = nextPageQueryStringParams;
                }
                else {
                    queryStringParams = `RootFolder=${encodedFolderPath}`;
                }
                const restApi = `${this.context.pageContext.web.absoluteUrl}/_api/SP.List.GetListDataAsStream?listFullUrl='${encodedListUrl}'&${queryStringParams}`;
                filesQueryResult = yield this._getListDataAsStream(restApi, null, acceptedFilesExtensions);
            }
            catch (error) {
                filesQueryResult.items = null;
                console.error(error.message);
            }
            return filesQueryResult;
        });
        /**
         * Downloads document content from OneDrive location.
         */
        this.downloadSPFileContent = (absoluteFileUrl, fileName) => __awaiter(this, void 0, void 0, function* () {
            try {
                // replace url OneDrive site URL with current web url
                const urlTokens = absoluteFileUrl.split("/_api/");
                const fileUrl = `${this.context.pageContext.web.absoluteUrl}/_api/${urlTokens[1]}?`;
                const fileInfoResult = yield this.context.spHttpClient.get(fileUrl, SPHttpClient.configurations.v1);
                const fileInfo = yield fileInfoResult.json();
                const oneDrvieFileUrl = fileInfo["@content.downloadUrl"];
                const fileDownloadResult = yield this.context.httpClient.get(oneDrvieFileUrl, SPHttpClient.configurations.v1, {
                    headers: new Headers(),
                    method: 'GET',
                    mode: 'cors'
                });
                if (!fileDownloadResult || !fileDownloadResult.ok) {
                    throw new Error(`Something went wrong when downloading the file. Status='${fileDownloadResult.status}'`);
                }
                // Return file created from blob
                const blob = yield fileDownloadResult.blob();
                return GeneralHelper.getFileFromBlob(blob, fileName);
            }
            catch (err) {
                console.error(`[OneDriveService.fetchFileContent] Err='${err.message}'`);
                return null;
            }
        });
        /**
           * Gets users one drive personal documents library path
           */
        this.getOneDriveRootFolderFullUrl = () => __awaiter(this, void 0, void 0, function* () {
            try {
                // Return result if already obtained
                if (this.oneDriveRootFolderAbsoluteUrl) {
                    return this.oneDriveRootFolderAbsoluteUrl;
                }
                const oneDriveUrl = yield this.getOneDrivePersonalUrl();
                if (!oneDriveUrl) {
                    throw new Error(`Cannot obtain OneDrive personal URL.`);
                }
                const apiUrl = `${this.context.pageContext.web.absoluteUrl}/_api/SP.RemoteWeb(@a1)/Web/Lists?$filter=BaseTemplate eq 700 and BaseType eq 1&@a1='${encodeURIComponent(oneDriveUrl)}'`;
                const oneDriveFolderResult = yield this.context.spHttpClient.get(apiUrl, SPHttpClient.configurations.v1, {
                    headers: {
                        "accept": "application/json;odata=nometadata",
                        "content-type": "application/json;odata=nometadata",
                        "odata-version": ""
                    }
                });
                if (!oneDriveFolderResult || !oneDriveFolderResult.ok) {
                    throw new Error(`Something went wrong when executing oneDriveRootFolder retrieve request. Status='${oneDriveFolderResult.status}'`);
                }
                const oneDriveLibsData = yield oneDriveFolderResult.json();
                if (!oneDriveLibsData || !oneDriveLibsData.value || oneDriveLibsData.value.length === 0) {
                    throw new Error(`Cannot read one drive libs data.`);
                }
                const myDocumentsLibrary = oneDriveLibsData.value[0];
                this.oneDrivePersonalLibraryTitle = myDocumentsLibrary.Title;
                this.oneDrivePersonalLibraryId = myDocumentsLibrary.Id;
                this.oneDriveRootFolderRelativeUrl = `${myDocumentsLibrary.ParentWebUrl}/${myDocumentsLibrary.Title}`;
                this.oneDriveRootFolderAbsoluteUrl = `${this.oneDrivePersonalUrl}${myDocumentsLibrary.Title}`;
            }
            catch (error) {
                console.error(`[FileBrowserService.getOneDrivePersonalUrl] Err='${error.message}'`);
                this.oneDriveRootFolderAbsoluteUrl = null;
            }
            return this.oneDriveRootFolderAbsoluteUrl;
        });
        /**
         * Gets OneDrive RootFolder server relative URL.
         */
        this.getOneDriveRootFolderRelativeUrl = () => __awaiter(this, void 0, void 0, function* () {
            if (!this.oneDriveRootFolderRelativeUrl) {
                yield this.getOneDriveRootFolderFullUrl();
            }
            return this.oneDriveRootFolderRelativeUrl;
        });
        /**
         * Gets OneDrive personal library Title
         */
        this.getOneDrivePersonalLibraryTitle = () => __awaiter(this, void 0, void 0, function* () {
            if (!this.oneDrivePersonalLibraryTitle) {
                yield this.getOneDriveRootFolderFullUrl();
            }
            return this.oneDrivePersonalLibraryTitle;
        });
        /**
         * Gets OneDrive personal library Id
         * @returns OneDrive library Id
         */
        this.getOneDrivePersonalLibraryId = () => __awaiter(this, void 0, void 0, function* () {
            if (!this.oneDrivePersonalLibraryId) {
                yield this.getOneDriveRootFolderFullUrl();
            }
            return this.oneDrivePersonalLibraryId;
        });
        /**
         * Gets OneDrive library metadata
         */
        this.getOneDriveMetadata = () => __awaiter(this, void 0, void 0, function* () {
            if (!this.oneDriveRootFolderRelativeUrl) {
                yield this.getOneDriveRootFolderFullUrl();
            }
            return {
                folderPath: this.oneDriveRootFolderRelativeUrl,
                libraryAbsolutePath: this.oneDriveRootFolderAbsoluteUrl,
                libraryTitle: this.oneDrivePersonalLibraryTitle,
                libraryId: this.oneDrivePersonalLibraryId
            };
        });
        /**
         * Gets personal site path.
         */
        this.getOneDrivePersonalUrl = () => __awaiter(this, void 0, void 0, function* () {
            try {
                // Return result if already obtained
                if (this.oneDrivePersonalUrl) {
                    return this.oneDrivePersonalUrl;
                }
                const userProfileApi = `${this.context.pageContext.web.absoluteUrl}/_api/SP.UserProfiles.ProfileLoader.GetProfileLoader/GetUserProfile`;
                const userProfileResult = yield this.context.spHttpClient.post(userProfileApi, SPHttpClient.configurations.v1, {});
                if (!userProfileResult || !userProfileResult.ok) {
                    throw new Error(`Something went wrong when executing user profile request. Status='${userProfileResult.status}'`);
                }
                const profileData = yield userProfileResult.json();
                if (!profileData) {
                    throw new Error(`Cannot read user profile data.`);
                }
                this.oneDrivePersonalUrl = profileData.FollowPersonalSiteUrl;
            }
            catch (error) {
                console.error(`[FileBrowserService.getOneDrivePersonalUrl] Err='${error.message}'`);
                this.oneDrivePersonalUrl = null;
            }
            return this.oneDrivePersonalUrl;
        });
        /**
         * Creates an absolute URL
         */
        this.buildAbsoluteUrl = (relativeUrl) => {
            return `https://${this.oneDrivePersonalUrl.split("//")[1].split("/")[0]}${relativeUrl}`;
        };
        this.oneDrivePersonalUrl = null;
        this.oneDriveRootFolderRelativeUrl = null;
        this.oneDriveRootFolderAbsoluteUrl = null;
        this.oneDrivePersonalLibraryTitle = null;
        this.oneDrivePersonalLibraryId = null;
    }
}
//# sourceMappingURL=OneDriveService.js.map