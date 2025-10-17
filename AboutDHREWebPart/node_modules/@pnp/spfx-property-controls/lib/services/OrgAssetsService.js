var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FileBrowserService } from "./FileBrowserService";
import { SPHttpClient } from "@microsoft/sp-http";
export class OrgAssetsService extends FileBrowserService {
    constructor(context, itemsToDownloadCount) {
        super(context, itemsToDownloadCount);
        this._orgAssetsLibraryServerRelativeSiteUrl = null;
        this.getListItems = (listUrl, folderPath, acceptedFilesExtensions, nextPageQueryStringParams) => __awaiter(this, void 0, void 0, function* () {
            let filesQueryResult = { items: [], nextHref: null };
            try {
                // Retrieve Lib path from folder path
                if (folderPath.charAt(0) !== "/") {
                    folderPath = `/${folderPath}`;
                }
                // Remove all the rest of the folder path
                let libName = folderPath.replace(`${this._orgAssetsLibraryServerRelativeSiteUrl}/`, "");
                libName = libName.split("/")[0];
                // Buil absolute library URL
                const libFullUrl = this.buildAbsoluteUrl(`${this._orgAssetsLibraryServerRelativeSiteUrl}/${libName}`);
                let queryStringParams = "";
                // Do not pass FolderServerRelativeUrl as query parameter
                // Attach passed nextPageQueryStringParams values to REST URL
                if (nextPageQueryStringParams) {
                    // Remove start ? from the query params
                    if (nextPageQueryStringParams.charAt(0) === "?") {
                        nextPageQueryStringParams = nextPageQueryStringParams.substring(1);
                    }
                    queryStringParams = nextPageQueryStringParams;
                }
                else {
                    queryStringParams = `RootFolder=${folderPath}`;
                }
                const restApi = `${this.context.pageContext.web.absoluteUrl}/_api/SP.List.GetListDataAsStream?listFullUrl='${libFullUrl}'&${queryStringParams}`;
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
                let orgAssetLibraryServerRelativeUrlWithoutTrailingSlash = this._orgAssetsLibraryServerRelativeSiteUrl;
                if (orgAssetLibraryServerRelativeUrlWithoutTrailingSlash.charAt(orgAssetLibraryServerRelativeUrlWithoutTrailingSlash.length - 1) === '/') {
                    orgAssetLibraryServerRelativeUrlWithoutTrailingSlash = orgAssetLibraryServerRelativeUrlWithoutTrailingSlash.slice(0, -1);
                }
                // Retrieve Lib path from folder path
                if (folderPath.charAt(0) !== "/") {
                    folderPath = `/${folderPath}`;
                }
                // Remove all the rest of the folder path
                let libName = folderPath.replace(`${orgAssetLibraryServerRelativeUrlWithoutTrailingSlash}/`, "");
                libName = libName.split("/")[0]; // Get only library name, if navigated to sub folder in the picker
                // Build absolute library URL
                const libFullUrl = this.buildAbsoluteUrl(`${orgAssetLibraryServerRelativeUrlWithoutTrailingSlash}/${libName}`);
                let queryStringParams = "";
                // Do not pass FolderServerRelativeUrl as query parameter
                // Attach passed nextPageQueryStringParams values to REST URL
                if (nextPageQueryStringParams) {
                    // Remove start ? from the query params
                    if (nextPageQueryStringParams.charAt(0) === "?") {
                        nextPageQueryStringParams = nextPageQueryStringParams.substring(1);
                    }
                    queryStringParams = nextPageQueryStringParams;
                }
                else {
                    queryStringParams = `RootFolder=${folderPath}`;
                }
                const restApi = `${this.context.pageContext.web.absoluteUrl}/_api/SP.List.GetListDataAsStream?listFullUrl='${libFullUrl}'&${queryStringParams}`;
                filesQueryResult = yield this._getListDataAsStream(restApi, null, acceptedFilesExtensions);
            }
            catch (error) {
                filesQueryResult.items = null;
                console.error(error.message);
            }
            return filesQueryResult;
        });
        this.getSiteMediaLibraries = (includePageLibraries = false) => __awaiter(this, void 0, void 0, function* () {
            try {
                const restApi = `${this.context.pageContext.web.absoluteUrl}/_api/SP.Publishing.SitePageService.FilePickerTabOptions`;
                const orgAssetsResult = yield this.context.spHttpClient.get(restApi, SPHttpClient.configurations.v1);
                if (!orgAssetsResult || !orgAssetsResult.ok) {
                    throw new Error(`Something went wrong when executing request. Status='${orgAssetsResult.status}'`);
                }
                const orgAssetsData = yield orgAssetsResult.json();
                if (!orgAssetsData || !orgAssetsData.OrgAssets || !orgAssetsData.OrgAssets.OrgAssetsLibraries || !orgAssetsData.OrgAssets.OrgAssetsLibraries.Items || orgAssetsData.OrgAssets.OrgAssetsLibraries.Items.length <= 0) {
                    return null;
                }
                this._orgAssetsLibraryServerRelativeSiteUrl = orgAssetsData ? orgAssetsData.OrgAssets.Url.DecodedUrl : null;
                const libs = orgAssetsData && orgAssetsData.OrgAssets ? orgAssetsData.OrgAssets.OrgAssetsLibraries.Items.map((libItem) => { return this._parseOrgAssetsLibraryItem(libItem); }) : [];
                return libs;
            }
            catch (error) {
                console.error(`[OrgAssetsService.getOrganisationAssetsLibraries]: Err='${error.message}'`);
                return null;
            }
        });
        this._parseOrgAssetsLibraryItem = (libItem) => {
            const orgAssetsLibrary = {
                absoluteUrl: this.buildAbsoluteUrl(`/${libItem.LibraryUrl.DecodedUrl}`),
                title: libItem.DisplayName,
                id: libItem.ListId,
                serverRelativeUrl: libItem.LibraryUrl.DecodedUrl,
                iconPath: libItem.ThumbnailUrl && libItem.ThumbnailUrl.DecodedUrl ? this.buildAbsoluteUrl(`${this._orgAssetsLibraryServerRelativeSiteUrl}/${libItem.ThumbnailUrl.DecodedUrl}`) : null
            };
            return orgAssetsLibrary;
        };
    }
}
//# sourceMappingURL=OrgAssetsService.js.map