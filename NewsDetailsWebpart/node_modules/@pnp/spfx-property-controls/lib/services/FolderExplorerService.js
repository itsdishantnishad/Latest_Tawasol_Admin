var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ServiceKey } from "@microsoft/sp-core-library";
import { PageContext } from "@microsoft/sp-page-context";
import { sp, Web } from "@pnp/sp";
export class FolderExplorerService {
    constructor(serviceScope) {
        /**
         * Get libraries within a given site
         * @param webAbsoluteUrl - the url of the target site
         */
        this.getDocumentLibraries = (webAbsoluteUrl) => __awaiter(this, void 0, void 0, function* () {
            return this._getDocumentLibraries(webAbsoluteUrl);
        });
        /**
         * Get libraries within a given site
         * @param webAbsoluteUrl - the url of the target site
         */
        this._getDocumentLibraries = (webAbsoluteUrl) => __awaiter(this, void 0, void 0, function* () {
            let results = [];
            try {
                const web = new Web(webAbsoluteUrl);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const libraries = yield web.lists.filter('BaseTemplate eq 101 and Hidden eq false').expand('RootFolder').select('Title', 'RootFolder/ServerRelativeUrl').orderBy('Title').get();
                results = libraries.map((library) => {
                    return { Name: library.Title, ServerRelativeUrl: library.RootFolder.ServerRelativeUrl };
                });
            }
            catch (error) {
                console.error('Error loading folders', error);
            }
            return results;
        });
        /**
       * Get folders within a given library or sub folder
       * @param webAbsoluteUrl - the url of the target site
       * @param folderRelativeUrl - the relative url of the folder
       */
        this.getFolders = (webAbsoluteUrl, folderRelativeUrl) => __awaiter(this, void 0, void 0, function* () {
            return this._getFolders(webAbsoluteUrl, folderRelativeUrl);
        });
        /**
         * Get folders within a given library or sub folder
         * @param webAbsoluteUrl - the url of the target site
         * @param folderRelativeUrl - the relative url of the folder
         */
        this._getFolders = (webAbsoluteUrl, folderRelativeUrl) => __awaiter(this, void 0, void 0, function* () {
            let results = [];
            try {
                const web = new Web(webAbsoluteUrl);
                folderRelativeUrl = folderRelativeUrl.replace(/'/ig, "''");
                const foldersResult = yield web.getFolderByServerRelativePath(encodeURIComponent(folderRelativeUrl)).folders.select('Name', 'ServerRelativeUrl').orderBy('Name').get();
                results = foldersResult.filter(f => f.Name !== "Forms");
            }
            catch (error) {
                console.error('Error loading folders', error);
            }
            return results;
        });
        /**
         * Create a new folder
         * @param webAbsoluteUrl - the url of the target site
         * @param folderRelativeUrl - the relative url of the base folder
         * @param name - the name of the folder to be created
         */
        this.addFolder = (webAbsoluteUrl, folderRelativeUrl, name) => __awaiter(this, void 0, void 0, function* () {
            return this._addFolder(webAbsoluteUrl, folderRelativeUrl, name);
        });
        /**
       * Create a new folder
       * @param webAbsoluteUrl - the url of the target site
       * @param folderRelativeUrl - the relative url of the base folder
       * @param name - the name of the folder to be created
       */
        this._addFolder = (webAbsoluteUrl, folderRelativeUrl, name) => __awaiter(this, void 0, void 0, function* () {
            let folder = null;
            try {
                const web = new Web(webAbsoluteUrl);
                folderRelativeUrl = folderRelativeUrl.replace(/'/ig, "''");
                const folderAddResult = yield web.getFolderByServerRelativePath(encodeURIComponent(folderRelativeUrl)).folders.addUsingPath(encodeURIComponent(name));
                if (folderAddResult && folderAddResult.data) {
                    folder = {
                        Name: folderAddResult.data.Name,
                        ServerRelativeUrl: folderAddResult.data.ServerRelativeUrl
                    };
                }
            }
            catch (error) {
                console.error('Error adding folder', error);
            }
            return folder;
        });
        serviceScope.whenFinished(() => {
            const pageContext = serviceScope.consume(PageContext.serviceKey);
            sp.setup({
                sp: {
                    baseUrl: pageContext.web.absoluteUrl
                }
            });
        });
    }
}
FolderExplorerService.serviceKey = ServiceKey.create('SPFx:SPService', FolderExplorerService);
//# sourceMappingURL=FolderExplorerService.js.map