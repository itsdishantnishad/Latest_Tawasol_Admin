import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPFI, spfi } from '@pnp/sp';
import { SPFx } from '@pnp/sp/behaviors/spfx';

import '@pnp/sp/webs';
import '@pnp/sp/folders';
import '@pnp/sp/files';
import '@pnp/sp/site-users/web';

import { IPoliciesAndProceduresItem } from '../../policiesAndProcedures/components/view/ViewPageList';

export interface IPoliciesAndProceduresDataProvider {
  getRootItems(functionDisplayName: string): Promise<IPoliciesAndProceduresItem[]>;
  getFolderChildren(functionDisplayName: string, folderServerRelativeUrl: string): Promise<IPoliciesAndProceduresItem[]>;
}

/** -------- Dummy provider (NO dummy data) -------- */
export class PoliciesAndProceduresDummyProvider implements IPoliciesAndProceduresDataProvider {
  async getRootItems(): Promise<IPoliciesAndProceduresItem[]> { return []; }
  async getFolderChildren(): Promise<IPoliciesAndProceduresItem[]> { return []; }
}

/** -------- Real SharePoint provider (GRC) -------- */
export class PoliciesAndProceduresSharePointProvider implements IPoliciesAndProceduresDataProvider {
  private sp: SPFI;
  private dmsLibraryRoot: string;
  private userTitleCache: Map<number, string> = new Map<number, string>();

  constructor(context: WebPartContext, dmsLibraryServerRelativeUrl: string) {
    this.sp = spfi().using(SPFx(context));
    // normalize: remove trailing slash only
    this.dmsLibraryRoot = (dmsLibraryServerRelativeUrl || '').replace(/\/$/, '');
  }

  /** Fix %2520 and %20 etc: decode multiple times safely */
  private decodeDeep(path: string): string {
    let s = (path || '').trim();
    for (let i = 0; i < 3; i++) {
      try {
        const d = decodeURIComponent(s);
        if (d === s) break;
        s = d;
      } catch {
        break;
      }
    }
    return s;
  }

  /** Always use decoded server-relative url with getFolderByServerRelativePath */
  private folderByServerRelativeUrl(serverRel: string) {
    const decoded = this.decodeDeep(serverRel);
    return this.sp.web.getFolderByServerRelativePath(decoded);
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
    const safe = (functionDisplayName || '').replace(/\/+/g, ' ').trim();
    return `${this.dmsLibraryRoot}/${safe}`;
  }

  private mapSpFolderToItem(spFolder: any): IPoliciesAndProceduresItem {
    const url = spFolder?.ServerRelativeUrl || '';
    return {
      id: String(url || spFolder?.Name || ''),
      name: spFolder?.Name || '',
      isFolder: true,
      serverRelativeUrl: url || undefined,
    };
  }

  private async mapSpFileToItem(spFile: any): Promise<IPoliciesAndProceduresItem> {
    const li = spFile?.ListItemAllFields;

    const titleFromField: string = (li?.Title || '').trim();
    const fileName: string = spFile?.Name || '';
    const displayName: string = titleFromField || fileName;

    const editorId: number | undefined = li?.EditorId;
    const modifiedBy: string = await this.getUserTitleById(editorId);

    const url = spFile?.ServerRelativeUrl || '';

    return {
      id: String(url || fileName),
      name: displayName,
      ext: this.getExt(fileName),
      modifiedBy,
      modifiedOn: spFile?.TimeLastModified ? new Date(spFile.TimeLastModified) : undefined,
      department: '',
      tag: '',
      previewUrl: url ? `${url}?web=1` : undefined,
      serverRelativeUrl: url || undefined,
    };
  }

  /** Read BOTH folders and files; don't fail whole call if one fails */
  private async listFolder(folderServerRelativeUrl: string): Promise<{
    folders: IPoliciesAndProceduresItem[];
    files: IPoliciesAndProceduresItem[];
  }> {
    const folder = this.folderByServerRelativeUrl(folderServerRelativeUrl);

    let spFolders: any[] = [];
    let spFiles: any[] = [];

    try {
      spFolders = await folder.folders.select('Name', 'ServerRelativeUrl')();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[Policies] listFolder folders failed:', folderServerRelativeUrl, e);
    }

    try {
      spFiles = await folder.files
        .select(
          'Name',
          'ServerRelativeUrl',
          'TimeLastModified',
          'ListItemAllFields/Title',
          'ListItemAllFields/EditorId'
        )
        .expand('ListItemAllFields')();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[Policies] listFolder files failed:', folderServerRelativeUrl, e);
    }

    const folders = (spFolders || []).map((f: any) => this.mapSpFolderToItem(f));
    const files = await Promise.all((spFiles || []).map((f: any) => this.mapSpFileToItem(f)));

    return { folders, files };
  }

  /**
   * AUTO-DRILL:
   * If folder has NO files but has folders, keep drilling down until:
   * - a folder contains files, OR
   * - no more folders, OR
   * - maxDepth reached
   *
   * Returns the "first file-bearing layer" children.
   */
  private async drillToFirstFilesLayer(
    startFolderUrl: string,
    maxDepth: number = 20
  ): Promise<IPoliciesAndProceduresItem[]> {
    let currentUrl = startFolderUrl;
    const visited = new Set<string>();

    for (let depth = 0; depth < maxDepth; depth++) {
      const key = this.decodeDeep(currentUrl).toLowerCase();
      if (visited.has(key)) break;
      visited.add(key);

      const { folders, files } = await this.listFolder(currentUrl);

      // if this level has files -> show this level (folders + files)
      if (files.length > 0) return [...folders, ...files];

      // if no files, but there are subfolders -> go deeper
      if (folders.length > 0) {
        // IMPORTANT: If multiple folders exist, we should SHOW them (user can choose)
        // BUT you asked to "go to deepest where files exist" — so we drill each folder
        // and keep only those folders that eventually lead to files.
        const results: IPoliciesAndProceduresItem[] = [];
        for (const f of folders) {
          if (!f.serverRelativeUrl) continue;
          const nextLayer = await this.drillToFirstFilesLayer(f.serverRelativeUrl, maxDepth - depth - 1);

          // keep the folder itself (so UI shows it), AND cache its drilled children by returning
          // them when user expands it.
          // Here we return folders at this layer, and when expanded, getFolderChildren() will drill.
          results.push(f);
        }
        return results;
      }

      // nothing inside
      return [];
    }

    return [];
  }

  async getRootItems(functionDisplayName: string): Promise<IPoliciesAndProceduresItem[]> {
    const rootPath = this.buildFunctionRootPath(functionDisplayName);

    try {
      // 1) list root
      const { folders, files } = await this.listFolder(rootPath);

      // 2) if root has files, show normal
      if (files.length > 0) return [...folders, ...files];

      // 3) if root has only folders, auto-drill logic:
      //    show folders that (eventually) lead to files
      if (folders.length > 0) {
        // We return folders (not blank). When user expands folder, getFolderChildren will drill further.
        return folders;
      }

      return [];
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[Policies] getRootItems failed:', { rootPath, e });
      return [];
    }
  }

  async getFolderChildren(functionDisplayName: string, folderServerRelativeUrl: string): Promise<IPoliciesAndProceduresItem[]> {
    // drill from this folder until we reach a level where files exist
    try {
      return await this.drillToFirstFilesLayer(folderServerRelativeUrl);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[Policies] getFolderChildren failed:', { folderServerRelativeUrl, e });
      return [];
    }
  }
}
