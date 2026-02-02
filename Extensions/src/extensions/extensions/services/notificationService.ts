// src/extensions/extensions/services/notificationService.ts

import { SPHttpClient } from "@microsoft/sp-http";
import { NotifKind } from "../shared/constants";

export interface INotificationItem {
  id: number;
  title: string;
  description: string;
  text: string;
  url: string;
  pageId: number | null;
  pageType: string;
  created: Date;

  // IMPORTANT: We'll use isNew as "unread" flag
  isNew: boolean;

  kind: NotifKind;
}

export type ITirNotification = INotificationItem;

export interface IUserStatus {
  itemId: number;
  lastSeenAt: Date;
  readKeys: Set<number>;
}

interface IRawNotifItem {
  Id: number;
  Title: string;
  TIRDescription?: string;
  URL?: { Url?: string } | string;
  TIRPageID?: number;
  TIRPageType?: string;
  TIRExpiresOn?: string;
  Created?: string;
}

interface IRawStatusItem {
  Id: number;
  TIRLastSeen?: string;
  TIRUserID?: string;
  TIRUserId?: number;
  TIRReadKeys?: string; // <-- NEW
}

const NOTIF_LIST_TITLE = "Notification Center";
const STATUS_LIST_TITLE = "User Notification Status";

const STATUS_FALLBACK_DATE = "2000-01-01T00:00:00Z";
const SERVER_FETCH_LIMIT = 100;

// Column internal names
const FIELD_LAST_SEEN = "TIRLastSeen";
const FIELD_USER_ID1 = "TIRUserID";
const FIELD_USER_ID2 = "TIRUserId";
const FIELD_READ_KEYS = "TIRReadKeys";

export class NotificationService {
  constructor(
    private readonly spHttpClient: SPHttpClient,
    private readonly webUrl: string
  ) {}

  public async getUserStatus(): Promise<IUserStatus> {
    const me = await this.getCurrentUserId();
    const status = await this.getStatusItem(me);

    const lastSeenAt = new Date(status?.TIRLastSeen || STATUS_FALLBACK_DATE);

    const readKeys = new Set<number>();
    const raw = (status?.TIRReadKeys || "").trim();
    if (raw) {
      raw.split(",").map(x => parseInt(x.trim(), 10)).filter(n => !Number.isNaN(n)).forEach(n => readKeys.add(n));
    }

    return {
      itemId: status?.Id || 0,
      lastSeenAt,
      readKeys
    };
  }

  private _htmlToPlainText(html: string): string {
    const raw = (html || "").trim();
    if (!raw) return "";

    try {
      // Replace some block tags with newlines before parsing
      const normalized = raw
        .replace(/<\s*br\s*\/?>/gi, "\n")
        .replace(/<\/\s*p\s*>/gi, "\n")
        .replace(/<\/\s*div\s*>/gi, "\n")
        .replace(/<\/\s*li\s*>/gi, "\n")
        .replace(/<\/\s*h[1-6]\s*>/gi, "\n");

      const doc = new DOMParser().parseFromString(normalized, "text/html");

      // Remove iframes/scripts/styles completely
      doc.querySelectorAll("script,style,iframe").forEach((n) => n.remove());

      // Prefer innerText if available (keeps newlines better)
      const text = (doc.body as any).innerText ?? doc.body.textContent ?? "";
      return this._cleanText(text);
    } catch {
      // Fallback: naive strip tags
      return this._cleanText(raw.replace(/<[^>]+>/g, " "));
    }
  }

  private _cleanText(text: string): string {
    return (text || "")
      .replace(/\u00a0/g, " ")        // nbsp
      .replace(/[ \t]+\n/g, "\n")     // trim end spaces before newline
      .replace(/\n{3,}/g, "\n\n")     // collapse many newlines
      .replace(/[ \t]{2,}/g, " ")     // collapse spaces
      .trim();
  }

  public async getLatest(count: number): Promise<INotificationItem[]> {
    const status = await this.getUserStatus();
    // const _me = await this.getCurrentUserId(); 

    const url = `${this.webUrl}/_api/web/lists/getbytitle('${encodeURIComponent(
      NOTIF_LIST_TITLE
    )}')/items?$top=${Math.min(SERVER_FETCH_LIMIT, Math.max(count, 10))}&$orderby=Created desc&$select=Id,Title,TIRDescription,URL,TIRPageID,TIRPageType,Created`;

    const r = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
    const j = await r.json();
    const rows: IRawNotifItem[] = (j?.value || []) as IRawNotifItem[];

    // isNew means unread: not in readKeys (persisted per-item)
    const items = rows.map((x) => this.mapItem(x, status.readKeys));
    return items.slice(0, count);
  }

  public async markAllRead(): Promise<void> {
    const me = await this.getCurrentUserId();
    const status = await this.getStatusItem(me);
    if (!status?.Id) return;

    // Store wildcard: we just write readKeys = all IDs currently fetched? Better approach:
    // but keeping current behaviour: add a marker by setting LastSeen to now and clearing keys.
    const nowIso = new Date().toISOString();
    await this.updateStatus(status.Id, {
      [FIELD_LAST_SEEN]: nowIso,
      [FIELD_READ_KEYS]: "" // clear keys
    });
  }

  public async markItemRead(itemId: number): Promise<void> {
    if (!itemId) return;

    const me = await this.getCurrentUserId();
    const status = await this.getStatusItem(me);
    if (!status?.Id) return;

    // merge existing keys
    const raw = (status?.TIRReadKeys || "").trim();
    const set = new Set<number>();
    if (raw) raw.split(",").map(x => parseInt(x.trim(), 10)).filter(n => !Number.isNaN(n)).forEach(n => set.add(n));

    set.add(itemId);

    const value = Array.from(set).sort((a, b) => a - b).join(",");
    await this.updateStatus(status.Id, {
      [FIELD_READ_KEYS]: value
    });
  }

  // ======================== internals ========================

  private mapItem(x: IRawNotifItem, readKeys: Set<number>): INotificationItem {
    const id = x.Id;
    const url =
      typeof x.URL === "string"
        ? x.URL
        : (x.URL as any)?.Url || "";

    const created = x.Created ? new Date(x.Created) : new Date();
    const isNew = !readKeys.has(id);
    const descRaw = x.TIRDescription || "";
    const descText = this._htmlToPlainText(descRaw);

    return {
      id,
      title: x.Title || "",
      description: descText,
      text: descText,
      url,
      pageId: typeof x.TIRPageID === "number" ? x.TIRPageID : null,
      pageType: x.TIRPageType || "",
      created,
      isNew,
      kind: "info"
    };
  }

  private async getCurrentUserId(): Promise<number> {
    const url = `${this.webUrl}/_api/web/currentuser?$select=Id`;
    const r = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
    const j = await r.json();
    return j?.Id || 0;
  }

  private async getStatusItem(userId: number): Promise<IRawStatusItem | null> {
    const filter = `${FIELD_USER_ID2} eq ${userId} or ${FIELD_USER_ID1} eq '${userId}'`;

    const url = `${this.webUrl}/_api/web/lists/getbytitle('${encodeURIComponent(
      STATUS_LIST_TITLE
    )}')/items?$top=1&$select=Id,${FIELD_LAST_SEEN},${FIELD_USER_ID1},${FIELD_USER_ID2},${FIELD_READ_KEYS}&$filter=${encodeURIComponent(
      filter
    )}`;

    const r = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
    const j = await r.json();
    const row = (j?.value && j.value[0]) as IRawStatusItem | undefined;
    return row || null;
  }

  private async updateStatus(itemId: number, body: any): Promise<void> {
    const url = `${this.webUrl}/_api/web/lists/getbytitle('${encodeURIComponent(
      STATUS_LIST_TITLE
    )}')/items(${itemId})`;

    await this.spHttpClient.post(url, SPHttpClient.configurations.v1, {
      headers: {
        "Content-Type": "application/json;odata=nometadata",
        "IF-MATCH": "*",
        "X-HTTP-Method": "MERGE"
      },
      body: JSON.stringify(body)
    });
  }
}
