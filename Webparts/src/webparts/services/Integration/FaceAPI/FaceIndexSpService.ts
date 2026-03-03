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
  constructor(private context: any, private cfg: IFaceConfig) {}

  private get webAbs(): string {
    return this.context?.pageContext?.web?.absoluteUrl || window.location.origin;
  }

  private listItemsUrl(): string {
    return `${this.webAbs}/_api/web/lists/getbytitle('${escapeODataString(this.cfg.faceIndexListTitle)}')/items`;
  }

  async hasAnyForAlbum(albumId: string): Promise<boolean> {
    const fAlbum = this.cfg.faceIndexFields.albumId;
    const url = `${this.listItemsUrl()}?$select=Id&$top=1&$filter=${encodeURIComponent(`${fAlbum} eq '${escapeODataString(albumId)}'`)}`;

    const res = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    if (!res.ok) return false;

    const json = await res.json();
    return (json?.value?.length || 0) > 0;
  }

  async deleteRowsForFile(albumId: string, fileRef: string): Promise<void> {
    const fAlbum = this.cfg.faceIndexFields.albumId;
    const fFile = this.cfg.faceIndexFields.fileRef;

    const filter = `${fAlbum} eq '${escapeODataString(albumId)}' and ${fFile} eq '${escapeODataString(fileRef)}'`;
    const url = `${this.listItemsUrl()}?$select=Id&$top=5000&$filter=${encodeURIComponent(filter)}`;

    const res = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    if (!res.ok) return;

    const json = await res.json();
    const ids: number[] = (json?.value || []).map((x: any) => x.Id);

    for (const id of ids) {
      const delUrl = `${this.listItemsUrl()}(${id})`;
      await this.context.spHttpClient.post(delUrl, SPHttpClient.configurations.v1, {
        headers: {
          "IF-MATCH": "*",
          "X-HTTP-Method": "DELETE",
        },
      });
    }
  }

  async addRow(row: IFaceIndexRow): Promise<void> {
    const body: any = {};
    body[this.cfg.faceIndexFields.albumId] = row.albumId;
    body[this.cfg.faceIndexFields.fileRef] = row.fileRef;
    body[this.cfg.faceIndexFields.largeFaceListId] = row.largeFaceListId;
    body[this.cfg.faceIndexFields.persistedFaceId] = row.persistedFaceId;

    await this.context.spHttpClient.post(this.listItemsUrl(), SPHttpClient.configurations.v1, {
      headers: { "Content-Type": "application/json;odata=nometadata" },
      body: JSON.stringify(body),
    });
  }

  async getFileRefsByPersistedIds(albumId: string, persistedFaceIds: string[]): Promise<string[]> {
    if (!persistedFaceIds.length) return [];

    const fAlbum = this.cfg.faceIndexFields.albumId;
    const fPersist = this.cfg.faceIndexFields.persistedFaceId;
    const fFile = this.cfg.faceIndexFields.fileRef;

    // SharePoint doesn't support "in", so we build OR chains in chunks.
    const chunkSize = 15; // keep URL manageable
    const results = new Set<string>();

    for (let i = 0; i < persistedFaceIds.length; i += chunkSize) {
      const chunk = persistedFaceIds.slice(i, i + chunkSize);
      const orPart = chunk.map(id => `${fPersist} eq '${escapeODataString(id)}'`).join(" or ");
      const filter = `${fAlbum} eq '${escapeODataString(albumId)}' and (${orPart})`;

      const url =
        `${this.listItemsUrl()}?$select=${fFile},${fPersist}&$top=5000&$filter=${encodeURIComponent(filter)}`;

      const res = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
      if (!res.ok) continue;

      const json = await res.json();
      for (const it of (json?.value || [])) {
        if (it?.[fFile]) results.add(String(it[fFile]));
      }
    }

    return Array.from(results);
  }
}