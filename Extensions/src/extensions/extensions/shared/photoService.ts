// src/extensions/extensions/shared/photoService.ts

import type { MSGraphClientFactory } from '@microsoft/sp-http';
import { MSGraphClientV3 } from '@microsoft/sp-http';

/**
 * PhotoService
 * - Uses "meeting-style" Graph photo fetch logic (no responseType override)
 * - Returns a DATA URL for reliable avatar rendering (works for SuggestBox + Header)
 * - Falls back to SharePoint userphoto.aspx and finally initials SVG
 */
export class PhotoService {
  private readonly _webUrl: string;
  private readonly _currentUserUpn: string;
  private readonly _graphFactory?: MSGraphClientFactory;
  private readonly _currentUserDisplayName?: string;

  private _graph?: MSGraphClientV3;
  private readonly _cache = new Map<string, string>();

  constructor(
    webUrl: string,
    currentUserUpn: string,
    graphFactory?: MSGraphClientFactory,
    currentUserDisplayName?: string
  ) {
    this._webUrl = (webUrl || '').replace(/\/$/, '');
    this._currentUserUpn = (currentUserUpn || '').toLowerCase();
    this._graphFactory = graphFactory;
    this._currentUserDisplayName = currentUserDisplayName;
  }

  // =========================================================
  // Compatibility helpers (used by Header.ts / SuggestBox.ts)
  // =========================================================

  /** Back-compat: SharePoint userphoto.aspx URL (size=S). */
  public getSmall(userEmailOrUpn?: string): string {
    return this._spUserPhotoUrl("S", userEmailOrUpn);
  }

  /** Back-compat: SharePoint userphoto.aspx URL (size=M). */
  public getMedium(userEmailOrUpn?: string): string {
    return this._spUserPhotoUrl("M", userEmailOrUpn);
  }

  /** Back-compat: SharePoint userphoto.aspx URL (size=L). */
  public getLarge(userEmailOrUpn?: string): string {
    return this._spUserPhotoUrl("L", userEmailOrUpn);
  }


  public async setAvatar(
    img: HTMLImageElement,
    size: "S" | "M" | "L" = "M", 
    userEmailOrUpn?: string,
    displayName?: string
  ): Promise<void> {
    const upn = (userEmailOrUpn || this._currentUserUpn || "").trim();
    const name = (displayName || this._currentUserDisplayName || upn || "User").trim();

    // 1) initials immediately
    const initialsUrl = this.getDefaultAvatarDataUrl(name);
    img.src = initialsUrl;

    // keep initials if anything fails
    img.onerror = () => {
      img.onerror = null;
      img.src = initialsUrl;
    };

    // 2) Graph photo as DATA URL
    try {
      const dataUrl = await this.getUserPhotoDataUrl(upn, name);
      if (dataUrl) img.src = dataUrl;
    } catch {
      // do nothing ->
    }
  }

  /** Back-compat: free any object URLs if used elsewhere. */
  public cleanup(img: HTMLImageElement): void {
    try {
      const src = img?.src || "";
      if (src.startsWith("blob:")) URL.revokeObjectURL(src);
    } catch {
      // ignore
    }
  }

  private _spUserPhotoUrl(size: "S" | "M" | "L", userEmailOrUpn?: string): string {
    const account = (userEmailOrUpn || this._currentUserUpn || "").trim();
    const safe = encodeURIComponent(account);
    return `${this._webUrl}/_layouts/15/userphoto.aspx?size=${size}&accountname=${safe}`;
  }

  /** SharePoint-rendered photo URL (fast fallback; works without Graph permissions). */
  public getUserPhotoFallbackUrl(userEmailOrUpn?: string): string {
    const account = (userEmailOrUpn || this._currentUserUpn || '').trim();
    const safe = encodeURIComponent(account);
    return `${this._webUrl}/_layouts/15/userphoto.aspx?size=M&accountname=${safe}`;
  }

  /** Initials/avatar placeholder as a DATA URL (SVG). */
  public getDefaultAvatarDataUrl(nameOrUpn?: string): string {
    const label = (nameOrUpn || this._currentUserDisplayName || this._currentUserUpn || 'User').trim();
    const initials = this._initials(label);

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#e9ecef"/>
            <stop offset="1" stop-color="#dfe3e6"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="32" fill="url(#g)"/>
        <text x="32" y="38" text-anchor="middle" font-family="Segoe UI, Arial" font-size="22" font-weight="600" fill="#5a5a5a">${initials}</text>
      </svg>
    `.trim();

    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }

  /**
   * Returns a DATA URL for the user's photo.
   * - Uses in-memory cache
   * - Tries Graph: /users/{id}/photo/$value
   * - Falls back to initials SVG
   */
  public async getUserPhotoDataUrl(userEmailOrUpn?: string, displayName?: string): Promise<string> {
    const key = (userEmailOrUpn || this._currentUserUpn || "").toLowerCase();
    const initials = this.getDefaultAvatarDataUrl(displayName || key);

    if (!key) return initials;

    const cached = this._cache.get(key);
    if (cached) return cached;

    try {
      const dataUrl = await this._fetchGraphPhotoAsDataUrl(key);

      if (dataUrl && dataUrl.startsWith("data:image")) {
        this._cache.set(key, dataUrl);
        return dataUrl;
      }

      return initials;
    } catch {
      return initials;
    }
  }

  private async _ensureGraph(): Promise<MSGraphClientV3 | undefined> {
    if (this._graph) return this._graph;
    if (!this._graphFactory) return undefined;

    return new Promise((resolve) => {
      try {
        this._graphFactory!.getClient('3').then((client) => {
          this._graph = client;
          resolve(client);
        }).catch(() => resolve(undefined));
      } catch {
        resolve(undefined);
      }
    });
  }

  private async _fetchGraphPhotoAsDataUrl(userEmailOrUpn: string): Promise<string> {
    const graph = await this._ensureGraph();
    if (!graph) throw new Error('Graph client not available');

    const id = encodeURIComponent(userEmailOrUpn);
    const res: any = await graph.api(`/users/${id}/photo/$value`).get();

    let blob: Blob;
    if (res instanceof Blob) {
      blob = res;
    } else if (res && typeof res === 'object' && res.byteLength !== undefined) {
      blob = new Blob([res], { type: 'image/jpeg' });
    } else if (typeof res === 'string') {
      const fetched = await fetch(res);
      blob = await fetched.blob();
    } else {
      blob = new Blob([res], { type: 'image/jpeg' });
    }

    return await this._blobToDataUrl(blob);
  }

  private _blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read blob'));
      reader.onload = () => resolve(String(reader.result || ''));
      reader.readAsDataURL(blob);
    });
  }

  private _initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'U';
    const first = parts[0][0] || '';
    const last = parts.length > 1 ? (parts[parts.length - 1][0] || '') : '';
    const out = (first + last).toUpperCase();
    return out || 'U';
  }
}
