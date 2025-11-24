import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPFI, spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/folders';
import '@pnp/sp/files';
import { IPoliciesAndProceduresItem } from './ViewPageList';
import { REAL_PDF_FILE_NAME, REAL_PDF_URL } from '../../../assets/constants';

export interface IPoliciesAndProceduresDataProvider {
  getRootItems(functionDisplayName: string): Promise<IPoliciesAndProceduresItem[]>;
  getFolderChildren(functionDisplayName: string, folderServerRelativeUrl: string): Promise<IPoliciesAndProceduresItem[]>;
}

/** -------- Development stub (dummy) -------- */
export class PoliciesAndProceduresDummyProvider implements IPoliciesAndProceduresDataProvider {
  async getRootItems(functionDisplayName: string): Promise<IPoliciesAndProceduresItem[]> {
    return [
      { id: 'folder-hc-ppm', name: 'HC P&P Manual', isFolder: true, serverRelativeUrl: '/DMS/Human Capital/HC P&P Manual' },
      { id: 'folder-employee-handbook', name: 'Employee Handbook', isFolder: true, serverRelativeUrl: '/DMS/Human Capital/Employee Handbook' },
      // Folder that holds the Site Assets PDF
      { id: 'folder-real-pdf', name: 'real pdf', isFolder: true, serverRelativeUrl: 'real-pdf' },
    ];
  }

  async getFolderChildren(functionDisplayName: string, folderServerRelativeUrl: string): Promise<IPoliciesAndProceduresItem[]> {
    const d = new Date(2024, 3, 30);

    // Children for the "real pdf" folder (matches "real pdf" or "real-pdf")
    if (/real[\s\-_]?pdf/i.test(folderServerRelativeUrl)) {
      return [
        {
          id: 'doc-real-pdf',
          name: REAL_PDF_FILE_NAME,  // "Major Project File.pdf"
          ext: 'pdf',
          previewUrl: `${REAL_PDF_URL}?web=1`,
        }
      ];
    }

    if (/Employee Handbook/i.test(folderServerRelativeUrl)) {
      return [
        { id: 'doc-311-a', name: 'Dubai Holding Group Policy Manual 3.11. (A)', ext: 'pdf',  modifiedBy: 'Hina Sheikh', modifiedOn: d, department: 'HC', tag: 'Awareness Sessions', previewUrl: 'about:blank' },
        { id: 'doc-311-b', name: 'Dubai Holding Group Policy Manual 3.11. (B)', ext: 'docx', modifiedBy: 'Hina Sheikh', modifiedOn: d, department: 'HC', tag: 'Self service Links', previewUrl: 'about:blank' },
        { id: 'doc-311-c', name: 'Dubai Holding Group Policy Manual 3.11. (C)', ext: 'pdf',  modifiedBy: 'Hina Sheikh', modifiedOn: d, department: 'HC', tag: 'Self service Links', previewUrl: 'about:blank' },
      ];
    }

    return [
      { id: 'doc-section-a', name: 'Section A Overview', ext: 'pdf',  modifiedBy: 'Hina Sheikh', modifiedOn: d, department: 'HC', tag: 'Policy',   previewUrl: 'about:blank' },
      { id: 'doc-templates', name: 'Templates.docx',     ext: 'docx', modifiedBy: 'Hina Sheikh', modifiedOn: d, department: 'HC', tag: 'Template', previewUrl: 'about:blank' },
    ];
  }
}

/** -------- Real SharePoint DMS provider -------- */
export class PoliciesAndProceduresSharePointProvider implements IPoliciesAndProceduresDataProvider {
  private sp: SPFI;
  private dmsLibraryRoot: string;

  constructor(context: WebPartContext, dmsLibraryServerRelativeUrl: string) {
    this.sp = spfi().using(SPFx(context));
    this.dmsLibraryRoot = dmsLibraryServerRelativeUrl; // e.g. "/sites/Intranet/DMS"
  }

  private mapSpFileToItem = (spFile: any): IPoliciesAndProceduresItem => ({
    id: String(spFile.UniqueId || spFile.Name),
    name: spFile.Name,
    ext: (spFile.Name.split('.').pop() || '').toLowerCase() as any,
    // Use Editor→Title first, then Author→Title as fallback
    modifiedBy:
      spFile?.ListItemAllFields?.Editor?.Title ||
      spFile?.ListItemAllFields?.Author?.Title ||
      '',
    modifiedOn: spFile?.TimeLastModified ? new Date(spFile.TimeLastModified) : undefined,
    department: '',
    tag: '',
    previewUrl: `${spFile.ServerRelativeUrl}?web=1`,
  });

  private mapSpFolderToItem = (spFolder: any): IPoliciesAndProceduresItem => ({
    id: String(spFolder.UniqueId || spFolder.Name),
    name: spFolder.Name,
    isFolder: true,
    serverRelativeUrl: spFolder.ServerRelativeUrl,
  });

  private buildFunctionRootPath(functionDisplayName: string): string {
    const safeFunctionName = functionDisplayName.replace(/\/+/g, ' ').trim();
    return `${this.dmsLibraryRoot}/${safeFunctionName}`;
  }

  async getRootItems(functionDisplayName: string): Promise<IPoliciesAndProceduresItem[]> {
    const rootPath = this.buildFunctionRootPath(functionDisplayName);
    const rootFolder = await this.sp.web.getFolderByServerRelativePath(rootPath);

    // Select & expand to pull Editor/Author for modifiedBy
    const [spFolders, spFiles] = await Promise.all([
      rootFolder.folders(),
      rootFolder.files
        .select(
          'UniqueId,Name,ServerRelativeUrl,TimeLastModified,' +
          'ListItemAllFields/Editor/Title,ListItemAllFields/Author/Title'
        )
        .expand('ListItemAllFields, ListItemAllFields/Editor, ListItemAllFields/Author')()
    ]);

    return [...spFolders.map(this.mapSpFolderToItem), ...spFiles.map(this.mapSpFileToItem)];
  }

  async getFolderChildren(functionDisplayName: string, folderServerRelativeUrl: string): Promise<IPoliciesAndProceduresItem[]> {
    const folder = await this.sp.web.getFolderByServerRelativePath(folderServerRelativeUrl);

    // Select & expand to pull Editor/Author for modifiedBy
    const [spFolders, spFiles] = await Promise.all([
      folder.folders(),
      folder.files
        .select(
          'UniqueId,Name,ServerRelativeUrl,TimeLastModified,' +
          'ListItemAllFields/Editor/Title,ListItemAllFields/Author/Title'
        )
        .expand('ListItemAllFields, ListItemAllFields/Editor, ListItemAllFields/Author')()
    ]);

    return [...spFolders.map(this.mapSpFolderToItem), ...spFiles.map(this.mapSpFileToItem)];
  }
}
