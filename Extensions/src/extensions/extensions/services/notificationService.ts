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
const FIELD_READ_KEYS = "TIRReadKeys";

export class NotificationService {
  private status?: IUserStatus;
  private currentUserId?: number;

  constructor(
    private readonly spHttpClient: SPHttpClient,
    private readonly webUrl: string,
    private readonly userLogin: string,
    private readonly userEmail: string,
    private readonly userDisplayName: string
  ) {}

  /** Load or create the per-user status row. */
  public async getUserStatus(): Promise<IUserStatus> {
    if (this.status) return this.status;

    const baseUrl = `${this.webUrl}/_api/web/lists/GetByTitle('${STATUS_LIST_TITLE}')/items`;

    const userId = await this.getCurrentUserId().catch(() => undefined);
    const userKey = (this.userEmail || this.userLogin || "").trim();
    const safeUserKey = userKey.replace(/'/g, "''");

    const filters: string[] = [];
    if (userId) filters.push(`TIRUserId eq ${userId}`);
    if (userKey) filters.push(`TIRUserID eq '${safeUserKey}'`);

    const filterClause = filters.length ? `&$filter=${filters.join(" or ")}` : "";

    const url =
      `${baseUrl}?$select=Id,${FIELD_LAST_SEEN},TIRUserID,TIRUserId,${FIELD_READ_KEYS}` +
      `${filterClause}` +
      `&$orderby=Id desc&$top=1`;

    const resp = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
    const json = await resp.json();

    const rows: IRawStatusItem[] = json?.value || [];
    if (rows.length) {
      const row = rows[0];
      const lastSeenRaw: string = row.TIRLastSeen || STATUS_FALLBACK_DATE;
      const lastSeenAt = new Date(lastSeenRaw);

      const readKeys = this.parseReadKeys(row.TIRReadKeys);

      this.status = { itemId: row.Id, lastSeenAt, readKeys };
      return this.status;
    }

    // No row yet – create one
    const body: any = {
      Title: this.userDisplayName || this.userEmail || this.userLogin,
      TIRUserID: userKey || this.userLogin,
      [FIELD_LAST_SEEN]: STATUS_FALLBACK_DATE,
      [FIELD_READ_KEYS]: "" // <-- NEW
    };

    if (userId) body.TIRUserId = userId;

    const createResp = await this.spHttpClient.post(baseUrl, SPHttpClient.configurations.v1, {
      headers: {
        Accept: "application/json;odata=nometadata",
        "Content-type": "application/json;odata=nometadata"
      },
      body: JSON.stringify(body)
    });

    const created = await createResp.json();

    this.status = {
      itemId: created.Id,
      lastSeenAt: new Date(STATUS_FALLBACK_DATE),
      readKeys: new Set<number>()
    };

    return this.status;
  }

  /** Get latest notifications. isNew === unread (based on lastSeen + readKeys). */
  public async getLatest(max: number = SERVER_FETCH_LIMIT): Promise<INotificationItem[]> {
    const status = await this.getUserStatus();

    const baseUrl = `${this.webUrl}/_api/web/lists/GetByTitle('${NOTIF_LIST_TITLE}')/items`;
    const url =
      `${baseUrl}` +
      `?$select=Id,Title,TIRDescription,URL,TIRPageID,TIRPageType,TIRExpiresOn,Created` +
      `&$orderby=Created desc` +
      `&$top=${Math.min(max, SERVER_FETCH_LIMIT)}`;

    const resp = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
    const json = await resp.json();

    const rows: IRawNotifItem[] = json?.value || [];
    const lastSeenAt = status.lastSeenAt;
    const readKeys = status.readKeys;

    return rows.map((r) => {
      const created = r.Created ? new Date(r.Created) : new Date();
      const descHtml = r.TIRDescription || "";
      const desc = descHtml.replace(/<[^>]+>/g, "").trim();

      const urlVal =
        typeof r.URL === "string"
          ? r.URL
          : r.URL && typeof (r.URL as any).Url === "string"
          ? (r.URL as any).Url
          : "";

      const pageType = r.TIRPageType || "";
      const kind = this.mapPageTypeToKind(pageType);

      // IMPORTANT:
      // unread only if created AFTER lastSeen AND not already in readKeys
      const unread = created > lastSeenAt && !readKeys.has(r.Id);

      return {
        id: r.Id,
        title: r.Title || "",
        description: desc,
        text: desc,
        url: urlVal,
        pageId: typeof r.TIRPageID === "number" ? r.TIRPageID : null,
        pageType,
        created,
        isNew: unread, // <-- we treat isNew as unread in UI
        kind
      };
    });
  }

  private mapPageTypeToKind(pageType: string): NotifKind {
    const pt = (pageType || "").toLowerCase();
    if (pt.indexOf("news") >= 0) return "megaphone";
    if (pt.indexOf("event") >= 0) return "party";
    if (pt.indexOf("training") >= 0) return "check";
    return "info";
  }

  /** Mark ALL read: set lastSeen=now and clear per-item keys. */
  public async markAllRead(): Promise<void> {
    const now = new Date();
    const status = await this.getUserStatus();

    await this.patchStatus(status.itemId, {
      [FIELD_LAST_SEEN]: now.toISOString(),
      [FIELD_READ_KEYS]: ""
    });

    // update cache
    status.lastSeenAt = now;
    status.readKeys = new Set<number>();
    this.status = status;
  }

  /** Mark SINGLE notification read by adding id to TIRReadKeys. */
  public async markItemRead(notificationId: number): Promise<void> {
    const status = await this.getUserStatus();

    // If it's already not in "new" window, treat as read anyway
    // (created <= lastSeen won't show dot)
    if (status.readKeys.has(notificationId)) return;

    const next = new Set(status.readKeys);
    next.add(notificationId);

    await this.patchStatus(status.itemId, {
      [FIELD_READ_KEYS]: this.serializeReadKeys(next)
    });

    status.readKeys = next;
    this.status = status;
  }

  // ---------- helpers ----------

  private parseReadKeys(raw?: string): Set<number> {
    const s = (raw || "").trim();
    if (!s) return new Set<number>();

    // supports "17;22;35" (also tolerates commas/spaces)
    const parts = s.split(/[;,\s]+/g).map(p => p.trim()).filter(Boolean);

    const set = new Set<number>();
    for (const p of parts) {
      const n = Number(p);
      if (Number.isFinite(n)) set.add(n);
    }
    return set;
  }

  private serializeReadKeys(set: Set<number>): string {
    // Keep it small + consistent
    return Array.from(set.values())
      .filter(n => Number.isFinite(n))
      .sort((a, b) => a - b)
      .join(";");
  }

  private async getCurrentUserId(): Promise<number> {
    if (this.currentUserId) return this.currentUserId;
    const url = `${this.webUrl}/_api/web/currentuser?$select=Id`;
    const resp = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
    const json = await resp.json();
    this.currentUserId = json.Id;
    return this.currentUserId!;
  }

  private async patchStatus(itemId: number, payload: Record<string, any>): Promise<void> {
    const doPatch = async (id: number): Promise<void> => {
      const url = `${this.webUrl}/_api/web/lists/GetByTitle('${STATUS_LIST_TITLE}')/items(${id})`;

      const res = await this.spHttpClient.post(url, SPHttpClient.configurations.v1, {
        headers: {
          Accept: "application/json;odata=nometadata",
          "Content-type": "application/json;odata=nometadata",
          "IF-MATCH": "*",
          "X-HTTP-Method": "MERGE"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`patchStatus failed: ${res.status} ${msg}`);
      }
    };

    try {
      await doPatch(itemId);
    } catch {
      // stale cache -> reload/create and retry once
      this.status = undefined;
      const fresh = await this.getUserStatus();
      await doPatch(fresh.itemId);
    }
  }
}
