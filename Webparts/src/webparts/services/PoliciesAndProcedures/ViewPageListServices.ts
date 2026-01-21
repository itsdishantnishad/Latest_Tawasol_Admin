// ViewPageListServices.ts
// SPFx-friendly utility service for ViewPageList.tsx
// Keeps URL/category/favourite/icon/csv/download logic out of the React component.

import type { FavouriteIndex, IPoliciesAndProceduresItem } from "./ViewPageListTypes";

import {
  ICON_FOLDER,
  ICON_PDF,
  ICON_WORD,
  ICON_POWERPOINT,
  ICON_JPG,
  ICON_ZIP,
  ICON_TEXT,
} from "../../assets/constants";

export type RowMeta = {
  fileIcon: string;
  categoryLabel: string;
  isFavourite: boolean;
  downloadUrl?: string | null;
};

export default class ViewPageListServices {
  private _dmsLibraryRoot: string = "";

  /**
   * Set the library root (server-relative) to calculate Category
   * Example: "/sites/Tawasol/Shared Documents/Policies & Procedures"
   */
  public setLibraryRoot(root?: string): void {
    this._dmsLibraryRoot = (root || "").trim().replace(/\/$/, "");
  }

  /** Safe decode URL segment */
  private safeDecode(seg: string): string {
    try {
      return decodeURIComponent(seg);
    } catch {
      return seg;
    }
  }

  /** Convert server-relative URL to absolute URL */
  private toAbsUrl(urlOrRel: string): string {
    if (!urlOrRel) return "";
    if (/^https?:\/\//i.test(urlOrRel)) return urlOrRel;

    const rel = urlOrRel.startsWith("/") ? urlOrRel : `/${urlOrRel}`;
    return `${window.location.origin}${rel}`;
  }

  /**
   * Icon mapping for file rows/cards
   */
  public getFileIcon(item: IPoliciesAndProceduresItem): string {
    if (item.isFolder) return ICON_FOLDER;

    const e = (item.ext || "").toLowerCase();
    if (e === "pdf") return ICON_PDF;
    if (e === "docx") return ICON_WORD;
    if (e === "pptx") return ICON_POWERPOINT;
    if (e === "jpg") return ICON_JPG;
    if (e === "zip") return ICON_ZIP;
    if (e === "xlsx" || e === "txt") return ICON_TEXT;
    return ICON_TEXT;
  }

  /**
   * Favourite key normalized for lookup
   */
  public getFavouriteKey(item: IPoliciesAndProceduresItem): string {
    return (item.serverRelativeUrl || "").toLowerCase();
  }

  /**
   * Favourite check (handles index=0 case correctly)
   */
  public isFavourited(item: IPoliciesAndProceduresItem, favouriteIndex?: FavouriteIndex): boolean {
    const key = this.getFavouriteKey(item);
    if (!key) return false;
    const idx = favouriteIndex?.[key];
    return typeof idx !== "undefined";
  }

  /**
   * Category label (folder name just under the library root)
   * If root isn't provided, falls back to item.tag or "Documents"
   */
  public getCategoryLabel(item: IPoliciesAndProceduresItem): string {
    const fallback = item.tag || "Documents";

    const url = (item.serverRelativeUrl || item.previewUrl || "").trim();
    if (!url) return fallback;

    const rootRel = this._dmsLibraryRoot;
    if (!rootRel) return fallback;

    try {
      const abs = this.toAbsUrl(url);
      const u = new URL(abs);

      const pathParts = (u.pathname || "")
        .split("/")
        .filter(Boolean)
        .map((p) => this.safeDecode(p));

      const rootParts = rootRel
        .split("/")
        .filter(Boolean)
        .map((p) => this.safeDecode(p));

      const match = rootParts.every(
        (rp, i) => (pathParts[i] || "").toLowerCase() === rp.toLowerCase()
      );

      if (!match) {
        return pathParts.length >= 2 ? pathParts[pathParts.length - 2] : fallback;
      }

      const idxAfterRoot = rootParts.length;
      if (idxAfterRoot >= pathParts.length - 1) return fallback;

      return pathParts[idxAfterRoot] || fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * SharePoint OOTB download link (download.aspx)
   * Uses serverRelativeUrl when possible (most reliable)
   */
  public getDownloadUrl(item: IPoliciesAndProceduresItem): string | null {
    if (item.isFolder) return null;

    const rel = (item.serverRelativeUrl || "").trim();
    const url = (rel || item.previewUrl || "").trim();
    if (!url) return null;

    const origin = window.location.origin;

    // Prefer server-relative SourceUrl
    if (rel) {
      return `${origin}/_layouts/15/download.aspx?SourceUrl=${encodeURIComponent(rel)}`;
    }

    // Fallback for absolute urls
    const abs = this.toAbsUrl(url);
    try {
      const u = new URL(abs);
      return `${u.origin}/_layouts/15/download.aspx?SourceUrl=${encodeURIComponent(u.pathname)}`;
    } catch {
      return `${origin}/_layouts/15/download.aspx?SourceUrl=${encodeURIComponent(url)}`;
    }
  }

  /**
   * Export selected items to CSV (client-side)
   */
  public exportSelectedToCsv(selectedItems: IPoliciesAndProceduresItem[], fileName = "documents.csv"): void {
    if (!selectedItems?.length) return;

    const header = ["Name", "Type", "Modified by", "Modified on", "Tag", "Department"];
    const esc = (v: string) => `"${(v || "").replace(/"/g, '""')}"`;

    const rows = selectedItems.map((item) =>
      [
        esc(item.name || ""),
        item.ext || "",
        esc(item.modifiedBy || ""),
        item.modifiedOn ? item.modifiedOn.toLocaleDateString() : "",
        esc(item.tag || ""),
        item.department || "",
      ].join(",")
    );

    const csv = header.join(",") + "\r\n" + rows.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const dlUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = dlUrl;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(dlUrl);
  }

  /**
   * One-call helper for View row rendering
   */
  public getRowMeta(item: IPoliciesAndProceduresItem, favouriteIndex?: FavouriteIndex): RowMeta {
    return {
      fileIcon: this.getFileIcon(item),
      categoryLabel: this.getCategoryLabel(item),
      isFavourite: this.isFavourited(item, favouriteIndex),
      downloadUrl: this.getDownloadUrl(item),
    };
  }
}
