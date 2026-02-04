/* eslint-disable @typescript-eslint/no-explicit-any */
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export interface IGalleryImage {
  id: string;
  url: string;
  alt?: string;
  folder?: string;
}

type IListFileItem = {
  Id: number;
  FileLeafRef: string; // file name
  FileRef: string;     // server relative url
  FileDirRef: string;  // folder path
  Modified: string;
  Created: string;
  UniqueId?: string;
};

export default class GalleryService {
  private readonly context: any;
  private readonly libraryTitle: string;

  // photo formats only (case-insensitive)
  private static readonly allowedExt = new Set([
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
    "tif",
    "tiff",
    "heic",
    "heif",
    "avif"
  ]);

  constructor(context: any, libraryTitle = "Image Gallery") {
    this.context = context;
    this.libraryTitle = libraryTitle;
  }

  /**
   * ✅ Correct logic:
   * 1) Find latest uploaded/modified IMAGE file anywhere in library (recursive)
   * 2) Get its folder (FileDirRef)
   * 3) Fetch up to 8 latest IMAGE files from that same folder
   */
  public async getLatestFolderImages(max = 8): Promise<IGalleryImage[]> {
    const sp = spfi().using(SPFx(this.context));

    const webUrl: string = (this.context?.pageContext?.web?.absoluteUrl || "").replace(/\/$/, "");
    const origin: string = webUrl ? new URL(webUrl).origin : "";

    // 1) Find latest image across entire library
    const latestImage = await this.getLatestImageAcrossLibrary(sp);
    if (!latestImage) return [];

    const folderPath = latestImage.FileDirRef;

    // 2) Fetch up to max latest images from that folder
    const folderImages = await this.getLatestImagesFromFolder(sp, folderPath, max);

    // 3) Map to UI model (absolute URLs)
    return folderImages.map((it) => ({
      id: it.UniqueId || String(it.Id),
      url: origin ? `${origin}${it.FileRef}` : it.FileRef,
      alt: it.FileLeafRef,
      folder: it.FileDirRef
    }));
  }

  private async getLatestImageAcrossLibrary(sp: any): Promise<IListFileItem | null> {
    const items = (await sp.web.lists
      .getByTitle(this.libraryTitle)
      .items.select("Id", "FileLeafRef", "FileRef", "FileDirRef", "Modified", "Created", "UniqueId")
      // FSObjType eq 0 => files only (recursive by default in list items)
      .filter("FSObjType eq 0")
      .orderBy("Modified", false)
      .top(200)()) as IListFileItem[];

    const latest = items.find((it) => this.isAllowedImage(it?.FileLeafRef));
    return latest || null;
  }

  private async getLatestImagesFromFolder(sp: any, folderPath: string, max: number): Promise<IListFileItem[]> {
    const safeFolder = folderPath.replace(/'/g, "''"); // escape for OData

    const items = (await sp.web.lists
      .getByTitle(this.libraryTitle)
      .items.select("Id", "FileLeafRef", "FileRef", "FileDirRef", "Modified", "Created", "UniqueId")
      .filter(`FSObjType eq 0 and FileDirRef eq '${safeFolder}'`)
      .orderBy("Modified", false)
      .top(Math.max(50, max * 5))()) as IListFileItem[];

    // keep only images, return max
    return items.filter((it) => this.isAllowedImage(it?.FileLeafRef)).slice(0, max);
  }

  private isAllowedImage(fileName: string | undefined): boolean {
    if (!fileName) return false;
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    return GalleryService.allowedExt.has(ext);
  }
}
