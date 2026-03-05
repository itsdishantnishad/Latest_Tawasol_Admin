// services/FaceIndexSpService.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { SPHttpClient } from "@microsoft/sp-http";
import { IFaceConfig } from "./FaceConfig";

function escapeODataString(v: string): string {
  return (v || "").replace(/'/g, "''");
}

export interface IFaceIndexRow {
  albumId: string;
  fileRef: string;
  largeFaceListId: string;
  persistedFaceId: string;
}

export class FaceIndexSpService {
  private resolvedListTitle?: string;

  constructor(private context: any, private cfg: IFaceConfig) {}

  private get webAbs(): string {
    return this.context?.pageContext?.web?.absoluteUrl || window.location.origin;
  }

  private listRootUrl(title: string): string {
    return `${this.webAbs}/_api/web/lists/getbytitle('${escapeODataString(title)}')`;
  }

  private async listExists(title: string): Promise<boolean> {
    const url = `${this.listRootUrl(title)}?$select=Id,Title`;
    const res = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    if (res.ok) return true;

    // Title mismatch or list not created
    if (res.status === 404) return false;

    // Permissions / other errors → surface
    const txt = await res.text().catch(() => "");
    throw new Error(
      `FaceIndex list check failed (${res.status}). Make sure you have permission to read the list and the title is correct. Details: ${txt}`
    );
  }

  private async getResolvedListTitle(): Promise<string> {
    if (this.resolvedListTitle) return this.resolvedListTitle;

    // Try configured title first
    const candidates: string[] = [
      this.cfg.faceIndexListTitle,
      // Common variations seen across tenants (case/typo differences)
      "DHRE Gallery FaceIndex row",
    ].filter(Boolean);

    // Keep unique order
    const seen = new Set<string>();
    const uniq = candidates.filter((t) => {
      const key = String(t).trim();
      if (!key || seen.has(key.toLowerCase())) return false;
      seen.add(key.toLowerCase());
      return true;
    });

    for (const title of uniq) {
      // eslint-disable-next-line no-await-in-loop
      const ok = await this.listExists(title);
      if (ok) {
        this.resolvedListTitle = title;
        return title;
      }
    }

    throw new Error(
      `FaceIndex list not found. Tried titles: ${uniq.join(", ")}. Create the list (with required columns) or set Postman variable 'faceindex_list_title' to the exact list title in the tenant.`
    );
  }

  private async listItemsUrl(): Promise<string> {
    const title = await this.getResolvedListTitle();
    return `${this.listRootUrl(title)}/items`;
  }

  /** Call once before indexing/search to fail fast when list is missing or permission is not there */
  async ensureListAccessible(): Promise<void> {
    await this.getResolvedListTitle();
  }

  private async throwIfNotOk(res: Response, action: string): Promise<void> {
    if (res.ok) return;
    const txt = await res.text().catch(() => "");
    throw new Error(`FaceIndex list ${action} failed (${res.status}): ${txt}`);
  }

  async hasAnyForAlbum(albumId: string): Promise<boolean> {
    const fAlbum = this.cfg.faceIndexFields.albumId;
    const itemsUrl = await this.listItemsUrl();
    const filter = `${fAlbum} eq '${escapeODataString(albumId)}'`;
    const url = `${itemsUrl}?$select=Id&$top=1&$filter=${encodeURIComponent(filter)}`;

    const res = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    await this.throwIfNotOk(res, "read");

    const json = await res.json();
    return (json?.value?.length || 0) > 0;
  }

  async deleteRowsForFile(albumId: string, fileRef: string): Promise<void> {
    const fAlbum = this.cfg.faceIndexFields.albumId;
    const fFile = this.cfg.faceIndexFields.fileRef;
    const itemsUrl = await this.listItemsUrl();

    const filter = `${fAlbum} eq '${escapeODataString(albumId)}' and ${fFile} eq '${escapeODataString(fileRef)}'`;
    const url = `${itemsUrl}?$select=Id&$top=5000&$filter=${encodeURIComponent(filter)}`;

    const res = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    await this.throwIfNotOk(res, "read");

    const json = await res.json();
    const ids: number[] = (json?.value || []).map((x: any) => x.Id);

    for (const id of ids) {
      const delUrl = `${itemsUrl}(${id})`;
      const delRes = await this.context.spHttpClient.post(delUrl, SPHttpClient.configurations.v1, {
        headers: {
          "IF-MATCH": "*",
          "X-HTTP-Method": "DELETE",
        },
      });
      await this.throwIfNotOk(delRes, "delete");
    }
  }

  async addRow(row: IFaceIndexRow): Promise<void> {
    const body: any = {};
    body[this.cfg.faceIndexFields.albumId] = row.albumId;
    body[this.cfg.faceIndexFields.fileRef] = row.fileRef;
    body[this.cfg.faceIndexFields.largeFaceListId] = row.largeFaceListId;
    body[this.cfg.faceIndexFields.persistedFaceId] = row.persistedFaceId;

    const itemsUrl = await this.listItemsUrl();
    const res = await this.context.spHttpClient.post(itemsUrl, SPHttpClient.configurations.v1, {
      headers: { "Content-Type": "application/json;odata=nometadata" },
      body: JSON.stringify(body),
    });
    await this.throwIfNotOk(res, "create");
  }

  async getFileRefsByPersistedIds(albumId: string, persistedFaceIds: string[]): Promise<string[]> {
    if (!persistedFaceIds.length) return [];

    const fAlbum = this.cfg.faceIndexFields.albumId;
    const fPersist = this.cfg.faceIndexFields.persistedFaceId;
    const fFile = this.cfg.faceIndexFields.fileRef;

    // SharePoint doesn't support "in", so we build OR chains in chunks.
    const chunkSize = 15; // keep URL manageable
    const results = new Set<string>();

    const itemsUrl = await this.listItemsUrl();

    for (let i = 0; i < persistedFaceIds.length; i += chunkSize) {
      const chunk = persistedFaceIds.slice(i, i + chunkSize);
      const orPart = chunk.map((id) => `${fPersist} eq '${escapeODataString(id)}'`).join(" or ");
      const filter = `${fAlbum} eq '${escapeODataString(albumId)}' and (${orPart})`;

      const url = `${itemsUrl}?$select=${fFile},${fPersist}&$top=5000&$filter=${encodeURIComponent(filter)}`;
      // eslint-disable-next-line no-await-in-loop
      const res = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
      await this.throwIfNotOk(res, "read");

      // eslint-disable-next-line no-await-in-loop
      const json = await res.json();
      for (const it of json?.value || []) {
        if (it?.[fFile]) results.add(String(it[fFile]));
      }
    }

    return Array.from(results);
  }
}