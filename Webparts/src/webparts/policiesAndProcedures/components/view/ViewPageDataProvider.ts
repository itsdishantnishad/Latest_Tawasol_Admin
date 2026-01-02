



import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPFI, spfi } from '@pnp/sp';
import { SPFx } from '@pnp/sp/behaviors/spfx';

import '@pnp/sp/webs';
import '@pnp/sp/folders';
import '@pnp/sp/files';
import '@pnp/sp/site-users/web';

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
      { id: 'folder-real-pdf', name: 'real pdf', isFolder: true, serverRelativeUrl: 'real-pdf' },
    ];
  }

  async getFolderChildren(functionDisplayName: string, folderServerRelativeUrl: string): Promise<IPoliciesAndProceduresItem[]> {
    const d = new Date(2024, 3, 30);

    if (/real[\s\-_]?pdf/i.test(folderServerRelativeUrl)) {
      return [
        {
          id: 'doc-real-pdf',
          name: REAL_PDF_FILE_NAME,
          ext: 'pdf',
          previewUrl: `${REAL_PDF_URL}?web=1`,
        }
      ];
    }

    if (/Employee Handbook/i.test(folderServerRelativeUrl)) {
      return [
        { id: 'doc-311-a', name: 'Dubai Holding Group Policy Manual 3.11. (A)', ext: 'pdf', modifiedBy: 'Hina Sheikh', modifiedOn: d, department: 'HC', tag: 'Awareness Sessions', previewUrl: 'about:blank' },
        { id: 'doc-311-b', name: 'Dubai Holding Group Policy Manual 3.11. (B)', ext: 'docx', modifiedBy: 'Hina Sheikh', modifiedOn: d, department: 'HC', tag: 'Self service Links', previewUrl: 'about:blank' },
        { id: 'doc-311-c', name: 'Dubai Holding Group Policy Manual 3.11. (C)', ext: 'pdf', modifiedBy: 'Hina Sheikh', modifiedOn: d, department: 'HC', tag: 'Self service Links', previewUrl: 'about:blank' },
      ];
    }

    return [
      { id: 'doc-section-a', name: 'Section A Overview', ext: 'pdf', modifiedBy: 'Hina Sheikh', modifiedOn: d, department: 'HC', tag: 'Policy', previewUrl: 'about:blank' },
      { id: 'doc-templates', name: 'Templates.docx', ext: 'docx', modifiedBy: 'Hina Sheikh', modifiedOn: d, department: 'HC', tag: 'Template', previewUrl: 'about:blank' },
    ];
  }
}

/** -------- Real SharePoint provider -------- */
export class PoliciesAndProceduresSharePointProvider implements IPoliciesAndProceduresDataProvider {
  private sp: SPFI;
  private dmsLibraryRoot: string;
  private userTitleCache: Map<number, string> = new Map<number, string>();

  constructor(context: WebPartContext, dmsLibraryServerRelativeUrl: string) {
    this.sp = spfi().using(SPFx(context));
    this.dmsLibraryRoot = dmsLibraryServerRelativeUrl;
  }

  // Encode each segment (keeps slashes). This fixes spaces and "&" etc.
  private encodeServerRelativePath(path: string): string {
    return path.split('/').map(seg => encodeURIComponent(seg)).join('/');
  }

  private getExt(name: string): any {
    const ext = (name.split('.').pop() || '').toLowerCase();
    return ext as any;
  }

  private async getUserTitleById(editorId?: number): Promise<string> {
    if (!editorId || editorId <= 0) return '';
    const cached = this.userTitleCache.get(editorId);
    if (cached !== undefined) return cached;

    try {
      const u = await this.sp.web.siteUsers.getById(editorId).select('Title')();
      const title = (u?.Title || '').trim();
      this.userTitleCache.set(editorId, title);
      return title;
    } catch {
      this.userTitleCache.set(editorId, '');
      return '';
    }
  }

  private buildFunctionRootPath(functionDisplayName: string): string {
    const safe = functionDisplayName.replace(/\/+/g, ' ').trim();
    return `${this.dmsLibraryRoot}/${safe}`;
  }

  private mapSpFolderToItem(spFolder: any): IPoliciesAndProceduresItem {
    return {
      id: String(spFolder.ServerRelativeUrl || spFolder.Name),
      name: spFolder.Name,
      isFolder: true,
      serverRelativeUrl: spFolder.ServerRelativeUrl,
    };
  }

  private async mapSpFileToItem(spFile: any): Promise<IPoliciesAndProceduresItem> {
    const li = spFile?.ListItemAllFields;

    const titleFromField: string = (li?.Title || '').trim();
    const fileName: string = spFile?.Name || '';
    const displayName: string = titleFromField || fileName;

    const editorId: number | undefined = li?.EditorId;
    const modifiedBy: string = await this.getUserTitleById(editorId);

    return {
      id: String(spFile.ServerRelativeUrl || spFile.Name),
      name: displayName,
      ext: this.getExt(fileName),
      modifiedBy,
      modifiedOn: spFile?.TimeLastModified ? new Date(spFile.TimeLastModified) : undefined,
      department: '',
      tag: '',
      previewUrl: spFile?.ServerRelativeUrl ? `${spFile.ServerRelativeUrl}?web=1` : undefined,
      serverRelativeUrl: spFile?.ServerRelativeUrl,
    };
  }

  async getRootItems(functionDisplayName: string): Promise<IPoliciesAndProceduresItem[]> {
    const rootPath = this.buildFunctionRootPath(functionDisplayName);
    const encRootPath = this.encodeServerRelativePath(rootPath);

    try {
      const rootFolder = this.sp.web.getFolderByServerRelativePath(encRootPath);

      const [spFolders, spFiles] = await Promise.all([
        rootFolder.folders.select('Name,ServerRelativeUrl')(),
        rootFolder.files
          .select(
            'Name,ServerRelativeUrl,TimeLastModified,' +
            'ListItemAllFields/Title,ListItemAllFields/EditorId'
          )
          .expand('ListItemAllFields')()
      ]);

      const folders = (spFolders || []).map((f: any) => this.mapSpFolderToItem(f));
      const files = await Promise.all((spFiles || []).map((f: any) => this.mapSpFileToItem(f)));

      return [...folders, ...files];
    } catch (e) {
      // IMPORTANT: show error in console so you can see why it failed
      // (folder not found / path mismatch / permissions)
      // eslint-disable-next-line no-console
      console.error('[Policies] getRootItems failed:', { rootPath, encRootPath, e });
      return [];
    }
  }

  async getFolderChildren(functionDisplayName: string, folderServerRelativeUrl: string): Promise<IPoliciesAndProceduresItem[]> {
    const encFolderUrl = this.encodeServerRelativePath(folderServerRelativeUrl);

    try {
      const folder = this.sp.web.getFolderByServerRelativePath(encFolderUrl);

      const [spFolders, spFiles] = await Promise.all([
        folder.folders.select('Name,ServerRelativeUrl')(),
        folder.files
          .select(
            'Name,ServerRelativeUrl,TimeLastModified,' +
            'ListItemAllFields/Title,ListItemAllFields/EditorId'
          )
          .expand('ListItemAllFields')()
      ]);

      const folders = (spFolders || []).map((f: any) => this.mapSpFolderToItem(f));
      const files = await Promise.all((spFiles || []).map((f: any) => this.mapSpFileToItem(f)));

      return [...folders, ...files];
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[Policies] getFolderChildren failed:', { folderServerRelativeUrl, encFolderUrl, e });
      return [];
    }
  }
}
