// import { MSGraphClientFactory } from "@microsoft/sp-http";

// export type PhotoSize = "S" | "M" | "L";

// export class PhotoService {
//   private readonly webUrl: string;
//   private readonly currentUserUpn: string;
//   private readonly currentUserDisplayName: string;
//   private readonly graphFactory?: MSGraphClientFactory;
//   private readonly placeholderUrl?: string;

//   // Cache placeholder hash per size so we can detect SharePoint "silhouette" image
//   private static spPlaceholderHash: Record<string, string | null> = {};

//   constructor(
//     webUrl: string,
//     currentUserUpn: string,
//     currentUserDisplayName: string = "", // ✅ CHANGED: optional default
//     graphFactory?: MSGraphClientFactory,
//     placeholderUrl?: string
//   ) {
//     this.webUrl = (webUrl || "").replace(/\/+$/, "");
//     this.currentUserUpn = (currentUserUpn || "").trim();
//     this.currentUserDisplayName = (currentUserDisplayName || "").trim();
//     this.graphFactory = graphFactory;
//     this.placeholderUrl = placeholderUrl;
//   }

//   // -------------------------
//   // Public helpers
//   // -------------------------
//   public getSmall(upn?: string): string {
//     return this.buildSpUrl("S", upn);
//   }
//   public getMedium(upn?: string): string {
//     return this.buildSpUrl("M", upn);
//   }
//   public getLarge(upn?: string): string {
//     return this.buildSpUrl("L", upn);
//   }

//   /**
//    * Graph -> SharePoint userphoto -> Initials -> Placeholder
//    */
//   public async setPhoto(
//     img: HTMLImageElement,
//     size: PhotoSize,
//     upn?: string,
//     displayName?: string
//   ): Promise<void> {
//     const resolvedUpn = (upn || this.currentUserUpn || "").trim();
//     const resolvedName = (displayName || this.currentUserDisplayName || "").trim();

//     // Show initials immediately while loading (no flicker)
//     const initialsUri = this.getInitialsDataUri(resolvedName || resolvedUpn);
//     if (initialsUri) img.src = initialsUri;

//     // 1) Try Graph
//     const graphBlob = await this.tryGetGraphPhoto(resolvedUpn);
//     if (graphBlob) {
//       this.setObjectUrl(img, graphBlob);
//       return;
//     }

//     // 2) Try SharePoint userphoto.aspx
//     const spBlob = await this.tryGetSharePointPhoto(size, resolvedUpn);
//     if (spBlob) {
//       const isPlaceholder = await this.isSharePointPlaceholder(spBlob, size);
//       if (!isPlaceholder) {
//         this.setObjectUrl(img, spBlob);
//         return;
//       }
//     }

//     // 3) Initials
//     if (initialsUri) {
//       img.src = initialsUri;
//       return;
//     }

//     // 4) Placeholder (last option)
//     if (this.placeholderUrl) {
//       img.src = this.placeholderUrl;
//     }
//   }

//   // -------------------------
//   // Graph
//   // -------------------------
//   private async tryGetGraphPhoto(upn?: string): Promise<Blob | null> {
//     if (!this.graphFactory) return null;

//     try {
//       const client = await this.getGraphClient();
//       if (!client) return null;

//       const rawUpn = (upn || "").trim();
//       const targetUpn = rawUpn.toLowerCase();
//       const currentUpn = (this.currentUserUpn || "").trim().toLowerCase();

//       // ✅ CHANGED: use /me for current user (less permissions)
//       const apiPath =
//         !targetUpn || targetUpn === currentUpn
//           ? "/me/photo/$value"
//           : `/users/${encodeURIComponent(rawUpn)}/photo/$value`;

//       const blob = (await client.api(apiPath).responseType("blob").get()) as Blob;
//       if (blob && blob.size > 0) return blob;

//       return null;
//     } catch {
//       return null;
//     }
//   }

//   private async getGraphClient(): Promise<any | null> {
//     try {
//       return await (this.graphFactory as any).getClient("3");
//     } catch {
//       try {
//         return await (this.graphFactory as any).getClient();
//       } catch {
//         return null;
//       }
//     }
//   }

//   // -------------------------
//   // SharePoint userphoto.aspx
//   // -------------------------
//   private buildSpUrl(size: PhotoSize, upn?: string): string {
//     const email = (upn || this.currentUserUpn || "").trim();
//     const ver = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
//     const userParam = email ? `&username=${encodeURIComponent(email)}` : "";
//     return `${this.webUrl}/_layouts/15/userphoto.aspx?size=${size}${userParam}&ver=${ver}`;
//   }

//   private async tryGetSharePointPhoto(size: PhotoSize, upn?: string): Promise<Blob | null> {
//     try {
//       const url = this.buildSpUrl(size, upn);
//       const resp = await fetch(url, { credentials: "same-origin" });
//       if (!resp.ok) return null;
//       const blob = await resp.blob();
//       return blob && blob.size > 0 ? blob : null;
//     } catch {
//       return null;
//     }
//   }

//   private async isSharePointPlaceholder(blob: Blob, size: PhotoSize): Promise<boolean> {
//     const key = `sp_placeholder_${size}`;

//     if (!(key in PhotoService.spPlaceholderHash)) {
//       PhotoService.spPlaceholderHash[key] = await this.computeSharePointPlaceholderHash(size);
//     }

//     const placeholderHash = PhotoService.spPlaceholderHash[key];
//     if (!placeholderHash) return false;

//     const currentHash = await this.sha256Hex(await this.blobToArrayBuffer(blob));
//     return currentHash === placeholderHash;
//   }

//   private async computeSharePointPlaceholderHash(size: PhotoSize): Promise<string | null> {
//     try {
//       const fakeUpn = "__no_such_user__@__invalid__.com";
//       const url = this.buildSpUrl(size, fakeUpn);

//       const resp = await fetch(url, { credentials: "same-origin" });
//       if (!resp.ok) return null;

//       const blob = await resp.blob();
//       if (!blob || blob.size === 0) return null;

//       const hash = await this.sha256Hex(await this.blobToArrayBuffer(blob));
//       return hash || null;
//     } catch {
//       return null;
//     }
//   }

//   // -------------------------
//   // Initials SVG
//   // -------------------------
//   private getInitialsDataUri(nameOrEmail: string): string {
//     const initials = this.getInitials(nameOrEmail);
//     if (!initials) return "";

//     const svg = `
//       <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
//         <circle cx="32" cy="32" r="32" fill="#E9ECEF"/>
//         <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle"
//               font-family="Inter, Arial" font-size="22" font-weight="600" fill="#2B2B2B">
//           ${this.escapeXml(initials)}
//         </text>
//       </svg>
//     `.trim();

//     return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
//   }

//   private getInitials(value: string): string {
//     const v = (value || "").trim();
//     if (!v) return "";

//     const base = v.indexOf("@") > -1 ? v.split("@")[0] : v;

//     const parts = base
//       .replace(/[._-]+/g, " ")
//       .split(" ")
//       .map((p) => p.trim())
//       .filter(Boolean);

//     if (!parts.length) return "";

//     const first = parts[0].charAt(0);
//     const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
//     return (first + last).toUpperCase().slice(0, 2);
//   }

//   private escapeXml(s: string): string {
//     return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
//   }

//   // -------------------------
//   // Utilities
//   // -------------------------
//   private setObjectUrl(img: HTMLImageElement, blob: Blob): void {
//     const prev = img.getAttribute("data-objurl");
//     if (prev) {
//       try {
//         URL.revokeObjectURL(prev);
//       } catch {
//         // ignore
//       }
//     }

//     const url = URL.createObjectURL(blob);
//     img.src = url;
//     img.setAttribute("data-objurl", url);
//   }

//   private blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onerror = () => reject(new Error("Failed to read blob"));
//       reader.onload = () => resolve(reader.result as ArrayBuffer);
//       reader.readAsArrayBuffer(blob);
//     });
//   }

//   private async sha256Hex(buffer: ArrayBuffer): Promise<string> {
//     const cryptoObj = (window as any).crypto;
//     if (!cryptoObj?.subtle?.digest) return "";

//     const hashBuffer = (await cryptoObj.subtle.digest("SHA-256", buffer)) as ArrayBuffer;
//     const bytes = new Uint8Array(hashBuffer);

//     let hex = "";
//     for (let i = 0; i < bytes.length; i++) {
//       const h = bytes[i].toString(16);
//       hex += h.length === 1 ? "0" + h : h;
//     }
//     return hex;
//   }
// }

























import { MSGraphClientFactory } from "@microsoft/sp-http";

export type PhotoSize = "S" | "M" | "L";

export class PhotoService {
  private readonly webUrl: string;
  private readonly currentUserUpn: string;
  private readonly currentUserDisplayName: string;
  private readonly graphFactory?: MSGraphClientFactory;
  private readonly placeholderUrl?: string;

  // silhouette hash (one-time per size) to detect "no photo" from userphoto.aspx
  private static spSilhouetteHash: Partial<Record<PhotoSize, string | null>> = {};

  constructor(
    webUrl: string,
    currentUserUpn: string,
    graphFactory?: MSGraphClientFactory,
    currentUserDisplayName: string = "",
    placeholderUrl?: string
  ) {
    this.webUrl = (webUrl || "").replace(/\/+$/, "");
    this.currentUserUpn = (currentUserUpn || "").trim();
    this.currentUserDisplayName = (currentUserDisplayName || "").trim();
    this.graphFactory = graphFactory;
    this.placeholderUrl = placeholderUrl;
  }

  // keep existing helpers (used by Header for initial render)
  public getSmall(upn?: string): string {
    return this.buildSpUrl("S", upn);
  }
  public getMedium(upn?: string): string {
    return this.buildSpUrl("M", upn);
  }
  public getLarge(upn?: string): string {
    return this.buildSpUrl("L", upn);
  }

  /**
   * ✅ Apply best photo to an <img>:
   * Graph -> userphoto.aspx -> initials -> placeholder
   */
  public async setAvatar(
    img: HTMLImageElement,
    size: PhotoSize = "M",
    upn?: string,
    displayName?: string
  ): Promise<void> {
    const resolvedUpn = (upn || this.currentUserUpn || "").trim();
    const resolvedName = (displayName || this.currentUserDisplayName || "").trim();

    // Always start with SP url (fast, sync)
    img.src = this.buildSpUrl(size, resolvedUpn);

    // 1) Graph
    const graphBlob = await this.tryGetGraphPhoto();
    if (graphBlob) {
      this.setObjectUrl(img, graphBlob);
      return;
    }

    // 2) SharePoint userphoto.aspx (detect silhouette)
    const spBlob = await this.fetchBlob(img.src);
    if (spBlob) {
      const isSilhouette = await this.isSharePointSilhouette(spBlob, size);
      if (!isSilhouette) {
        // keep userphoto.aspx (already set as src)
        return;
      }
    }

    // 3) Initials (from displayName, fallback to upn)
    const initialsUri = this.initialsDataUri(resolvedName || resolvedUpn);
    if (initialsUri) {
      this.cleanup(img);
      img.src = initialsUri;
      return;
    }

    // 4) Placeholder (last option)
    if (this.placeholderUrl) {
      this.cleanup(img);
      img.src = this.placeholderUrl;
    }
  }

  /** Revoke previous Graph blob url if we set one */
  public cleanup(img: HTMLImageElement): void {
    const prev = img.getAttribute("data-objurl");
    if (prev) {
      try {
        URL.revokeObjectURL(prev);
      } catch {
        /* ignore */
      }
      img.removeAttribute("data-objurl");
    }
  }

  // --------------------
  // Graph (current user)
  // --------------------
  private async tryGetGraphPhoto(): Promise<Blob | null> {
    if (!this.graphFactory) return null;

    try {
      const client = await (this.graphFactory as any).getClient("3");
      const blob = (await client.api("/me/photo/$value").responseType("blob").get()) as Blob;
      return blob && blob.size > 0 ? blob : null;
    } catch {
      return null;
    }
  }

  // --------------------
  // SharePoint userphoto
  // --------------------
  private buildSpUrl(size: PhotoSize, upn?: string): string {
    const email = (upn || this.currentUserUpn || "").trim();
    const ver = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
    const userParam = email ? `&username=${encodeURIComponent(email)}` : "";
    return `${this.webUrl}/_layouts/15/userphoto.aspx?size=${size}${userParam}&ver=${ver}`;
  }

  private async fetchBlob(url: string): Promise<Blob | null> {
    try {
      const resp = await fetch(url, { credentials: "same-origin" });
      if (!resp.ok) return null;
      const blob = await resp.blob();
      return blob && blob.size > 0 ? blob : null;
    } catch {
      return null;
    }
  }

  private async isSharePointSilhouette(blob: Blob, size: PhotoSize): Promise<boolean> {
    const baseline = await this.getSilhouetteHash(size);
    if (!baseline) return false; // if we can't compute baseline, don't block userphoto
    const current = await this.sha256Hex(blob);
    return !!current && current === baseline;
  }

  private async getSilhouetteHash(size: PhotoSize): Promise<string | null> {
    if (PhotoService.spSilhouetteHash[size] !== undefined) {
      return PhotoService.spSilhouetteHash[size] || null;
    }

    // Use a fake UPN to get the "silhouette" response once
    const fakeUpn = "__no_such_user__@__invalid__.com";
    const url = this.buildSpUrl(size, fakeUpn);
    const blob = await this.fetchBlob(url);

    const hash = blob ? await this.sha256Hex(blob) : "";
    PhotoService.spSilhouetteHash[size] = hash || null;
    return PhotoService.spSilhouetteHash[size] || null;
  }

  private async sha256Hex(blob: Blob): Promise<string> {
    const cryptoObj = (window as any).crypto;
    if (!cryptoObj?.subtle?.digest) return "";

    const buf = await blob.arrayBuffer();
    const hashBuf = (await cryptoObj.subtle.digest("SHA-256", buf)) as ArrayBuffer;
    const bytes = new Uint8Array(hashBuf);

    let hex = "";
    for (let i = 0; i < bytes.length; i++) {
      const h = bytes[i].toString(16);
      hex += h.length === 1 ? "0" + h : h;
    }
    return hex;
  }

  // --------------------
  // Initials
  // --------------------
  private initialsDataUri(nameOrEmail: string): string | null {
    const initials = this.getInitials(nameOrEmail);
    if (!initials) return null;

    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">` +
      `<circle cx="32" cy="32" r="32" fill="#E9ECEF"/>` +
      `<text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" ` +
      `font-family="Inter, Arial" font-size="22" font-weight="600" fill="#2B2B2B">` +
      `${this.escapeXml(initials)}` +
      `</text></svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  private getInitials(value: string): string {
    const v = (value || "").trim();
    if (!v) return "";

    const base = v.indexOf("@") > -1 ? v.split("@")[0] : v;
    const parts = base
      .replace(/[._-]+/g, " ")
      .split(" ")
      .map((p) => p.trim())
      .filter(Boolean);

    if (!parts.length) return "";
    const first = parts[0].charAt(0);
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
    return (first + last).toUpperCase().slice(0, 2);
  }

  private escapeXml(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // --------------------
  // Blob URL helper (Graph)
  // --------------------
  private setObjectUrl(img: HTMLImageElement, blob: Blob): void {
    this.cleanup(img);
    const objUrl = URL.createObjectURL(blob);
    img.src = objUrl;
    img.setAttribute("data-objurl", objUrl);
  }
}
