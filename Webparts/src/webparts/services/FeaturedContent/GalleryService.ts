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
   * ✅ Required behavior:
   * - Determine "latest folder" by finding the latest image in the whole library
   * - Take images from that folder (latest first)
   * - If not enough images, take from next latest folder (based on latest image inside it)
   * - Continue until `max` images are collected
   */
  public async getLatestFolderImages(max = 8): Promise<IGalleryImage[]> {
    const sp = spfi().using(SPFx(this.context));

    const webUrl: string = (this.context?.pageContext?.web?.absoluteUrl || "").replace(/\/$/, "");
    const origin: string = webUrl ? new URL(webUrl).origin : "";

    // Pull a big pool so we can fill 8 images even if many files are non-images
    const poolSize = Math.max(300, max * 60);

    const items = (await sp.web.lists
      .getByTitle(this.libraryTitle)
      .items.select("Id", "FileLeafRef", "FileRef", "FileDirRef", "Modified", "Created", "UniqueId")
      .filter("FSObjType eq 0") // files only
      .orderBy("Modified", false)
      .top(poolSize)()) as IListFileItem[];

    // Filter only image files
    const imageItems = items.filter((it) => this.isAllowedImage(it?.FileLeafRef));
    if (!imageItems.length) return [];

    /**
     * Group images by folder, but keep folder order by recency:
     * Since imageItems are already ordered by Modified desc,
     * the first time we see a folder => that's the latest image in that folder.
     */
    const folderOrder: string[] = [];
    const byFolder = new Map<string, IListFileItem[]>();

    for (const it of imageItems) {
      const folder = it.FileDirRef || "";
      if (!byFolder.has(folder)) {
        byFolder.set(folder, []);
        folderOrder.push(folder);
      }
      byFolder.get(folder)!.push(it);
    }

    // Collect images: folder1 -> folder2 -> folder3 ... until max
    const result: IGalleryImage[] = [];
    for (const folder of folderOrder) {
      if (result.length >= max) break;

      const files = byFolder.get(folder) || [];
      for (const file of files) {
        if (result.length >= max) break;

        result.push({
          id: file.UniqueId || String(file.Id),
          url: origin ? `${origin}${file.FileRef}` : file.FileRef,
          alt: file.FileLeafRef,
          folder: file.FileDirRef
        });
      }
    }

    return result.slice(0, max);
  }

  private isAllowedImage(fileName: string | undefined): boolean {
    if (!fileName) return false;
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    return GalleryService.allowedExt.has(ext);
  }
}
