import { BaseComponentContext } from '@microsoft/sp-component-base';
import { FileBrowserService } from "./FileBrowserService";
import { FilesQueryResult } from "./FileBrowserService.types";
export declare class OneDriveService extends FileBrowserService {
    protected oneDrivePersonalUrl: string;
    protected oneDriveRootFolderRelativeUrl: string;
    protected oneDriveRootFolderAbsoluteUrl: string;
    protected oneDrivePersonalLibraryTitle: string;
    protected oneDrivePersonalLibraryId: string;
    constructor(context: BaseComponentContext, itemsToDownloadCount?: number);
    /**
     * Gets files from OneDrive personal library
     */
    getListItems: (libraryName: string, folderPath?: string, acceptedFilesExtensions?: string[], nextPageQueryStringParams?: string) => Promise<FilesQueryResult>;
    getListItemsByListId: (listId: string, folderPath: string, acceptedFilesExtensions?: string[], nextPageQueryStringParams?: string) => Promise<FilesQueryResult>;
    /**
     * Downloads document content from OneDrive location.
     */
    downloadSPFileContent: (absoluteFileUrl: string, fileName: string) => Promise<File>;
    /**
       * Gets users one drive personal documents library path
       */
    getOneDriveRootFolderFullUrl: () => Promise<string>;
    /**
     * Gets OneDrive RootFolder server relative URL.
     */
    getOneDriveRootFolderRelativeUrl: () => Promise<string>;
    /**
     * Gets OneDrive personal library Title
     */
    getOneDrivePersonalLibraryTitle: () => Promise<string>;
    /**
     * Gets OneDrive personal library Id
     * @returns OneDrive library Id
     */
    getOneDrivePersonalLibraryId: () => Promise<string>;
    /**
     * Gets OneDrive library metadata
     */
    getOneDriveMetadata: () => Promise<{
        folderPath: string;
        libraryAbsolutePath: string;
        libraryTitle: string;
        libraryId: string;
    }>;
    /**
     * Gets personal site path.
     */
    private getOneDrivePersonalUrl;
    /**
     * Creates an absolute URL
     */
    protected buildAbsoluteUrl: (relativeUrl: string) => string;
}
//# sourceMappingURL=OneDriveService.d.ts.map