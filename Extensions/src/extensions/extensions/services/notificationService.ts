// // src/extensions/extensions/services/notificationService.ts

// import { SPHttpClient } from "@microsoft/sp-http";
// import { NotifKind } from "../shared/constants";

// export interface INotificationItem {
//   id: number;
//   title: string;
//   description: string;
//   text: string;
//   url: string;
//   pageId: number | null;
//   pageType: string;
//   created: Date;

//   // IMPORTANT: We'll use isNew as "unread" flag
//   isNew: boolean;

//   kind: NotifKind;
// }

// export type ITirNotification = INotificationItem;

// export interface IUserStatus {
//   itemId: number;
//   lastSeenAt: Date;
//   readKeys: Set<number>;
// }

// interface IRawNotifItem {
//   Id: number;
//   Title: string;
//   TIRDescription?: string;
//   URL?: { Url?: string } | string;
//   TIRPageID?: number;
//   TIRPageType?: string;
//   TIRExpiresOn?: string;
//   Created?: string;
// }

// interface IRawStatusItem {
//   Id: number;
//   TIRLastSeen?: string;
//   TIRUserID?: string;
//   TIRUserId?: number;
//   TIRReadKeys?: string; // <-- NEW
// }

// const NOTIF_LIST_TITLE = "Notification Center";
// const STATUS_LIST_TITLE = "User Notification Status";

// const STATUS_FALLBACK_DATE = "2000-01-01T00:00:00Z";
// const SERVER_FETCH_LIMIT = 100;

// // Column internal names
// const FIELD_LAST_SEEN = "TIRLastSeen";
// const FIELD_USER_ID1 = "TIRUserID";
// const FIELD_USER_ID2 = "TIRUserId";
// const FIELD_READ_KEYS = "TIRReadKeys";

// export class NotificationService {
//   constructor(
//     private readonly spHttpClient: SPHttpClient,
//     private readonly webUrl: string
//   ) {}

//   public async getUserStatus(): Promise<IUserStatus> {
//     const me = await this.getCurrentUserId();
//     const status = await this.getStatusItem(me);

//     const lastSeenAt = new Date(status?.TIRLastSeen || STATUS_FALLBACK_DATE);

//     const readKeys = new Set<number>();
//     const raw = (status?.TIRReadKeys || "").trim();
//     if (raw) {
//       raw.split(",").map(x => parseInt(x.trim(), 10)).filter(n => !Number.isNaN(n)).forEach(n => readKeys.add(n));
//     }

//     return {
//       itemId: status?.Id || 0,
//       lastSeenAt,
//       readKeys
//     };
//   }

//   private _htmlToPlainText(html: string): string {
//     const raw = (html || "").trim();
//     if (!raw) return "";

//     try {
//       // Replace some block tags with newlines before parsing
//       const normalized = raw
//         .replace(/<\s*br\s*\/?>/gi, "\n")
//         .replace(/<\/\s*p\s*>/gi, "\n")
//         .replace(/<\/\s*div\s*>/gi, "\n")
//         .replace(/<\/\s*li\s*>/gi, "\n")
//         .replace(/<\/\s*h[1-6]\s*>/gi, "\n");

//       const doc = new DOMParser().parseFromString(normalized, "text/html");

//       // Remove iframes/scripts/styles completely
//       doc.querySelectorAll("script,style,iframe").forEach((n) => n.remove());

//       // Prefer innerText if available (keeps newlines better)
//       const text = (doc.body as any).innerText ?? doc.body.textContent ?? "";
//       return this._cleanText(text);
//     } catch {
//       // Fallback: naive strip tags
//       return this._cleanText(raw.replace(/<[^>]+>/g, " "));
//     }
//   }

//   private _cleanText(text: string): string {
//     return (text || "")
//       .replace(/\u00a0/g, " ")        // nbsp
//       .replace(/[ \t]+\n/g, "\n")     // trim end spaces before newline
//       .replace(/\n{3,}/g, "\n\n")     // collapse many newlines
//       .replace(/[ \t]{2,}/g, " ")     // collapse spaces
//       .trim();
//   }

//   public async getLatest(count: number): Promise<INotificationItem[]> {
//     const status = await this.getUserStatus();
//     // const _me = await this.getCurrentUserId(); 

//     const url = `${this.webUrl}/_api/web/lists/getbytitle('${encodeURIComponent(
//       NOTIF_LIST_TITLE
//     )}')/items?$top=${Math.min(SERVER_FETCH_LIMIT, Math.max(count, 10))}&$orderby=Created desc&$select=Id,Title,TIRDescription,URL,TIRPageID,TIRPageType,Created`;

//     const r = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
//     const j = await r.json();
//     const rows: IRawNotifItem[] = (j?.value || []) as IRawNotifItem[];

//     // isNew means unread: not in readKeys (persisted per-item)
//     const items = rows.map((x) => this.mapItem(x, status.lastSeenAt, status.readKeys));
//     return items.slice(0, count);
//   }

//   public async markAllRead(): Promise<void> {
//     const me = await this.getCurrentUserId();
//     const status = await this.getStatusItem(me);
//     if (!status?.Id) return;

//     // Store wildcard: we just write readKeys = all IDs currently fetched? Better approach:
//     // but keeping current behaviour: add a marker by setting LastSeen to now and clearing keys.
//     const nowIso = new Date().toISOString();
//     await this.updateStatus(status.Id, {
//       [FIELD_LAST_SEEN]: nowIso,
//       [FIELD_READ_KEYS]: "" // clear keys
//     });
//   }

//   public async markItemRead(itemId: number): Promise<void> {
//     if (!itemId) return;

//     const me = await this.getCurrentUserId();
//     const status = await this.getStatusItem(me);
//     if (!status?.Id) return;

//     // merge existing keys
//     const raw = (status?.TIRReadKeys || "").trim();
//     const set = new Set<number>();
//     if (raw) raw.split(",").map(x => parseInt(x.trim(), 10)).filter(n => !Number.isNaN(n)).forEach(n => set.add(n));

//     set.add(itemId);

//     const value = Array.from(set).sort((a, b) => a - b).join(",");
//     await this.updateStatus(status.Id, {
//       [FIELD_READ_KEYS]: value
//     });
//   }

//   // ======================== internals ========================

//   private mapItem(x: IRawNotifItem, lastSeenAt: Date, readKeys: Set<number>): INotificationItem {
//     const id = x.Id;
//     const url =
//       typeof x.URL === "string"
//         ? x.URL
//         : (x.URL as any)?.Url || "";

//     const created = x.Created ? new Date(x.Created) : new Date();
//     const isNew = created > lastSeenAt && !readKeys.has(id);
//     const descRaw = x.TIRDescription || "";
//     const descText = this._htmlToPlainText(descRaw);

//     return {
//       id,
//       title: x.Title || "",
//       description: descText,
//       text: descText,
//       url,
//       pageId: typeof x.TIRPageID === "number" ? x.TIRPageID : null,
//       pageType: x.TIRPageType || "",
//       created,
//       isNew,
//       kind: "info"
//     };
//   }

//   private async getCurrentUserId(): Promise<number> {
//     const url = `${this.webUrl}/_api/web/currentuser?$select=Id`;
//     const r = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
//     const j = await r.json();
//     return j?.Id || 0;
//   }

//   private async getStatusItem(userId: number): Promise<IRawStatusItem | null> {
//     const filter = `${FIELD_USER_ID2} eq ${userId} or ${FIELD_USER_ID1} eq '${userId}'`;

//     const url = `${this.webUrl}/_api/web/lists/getbytitle('${encodeURIComponent(
//       STATUS_LIST_TITLE
//     )}')/items?$top=1&$select=Id,${FIELD_LAST_SEEN},${FIELD_USER_ID1},${FIELD_USER_ID2},${FIELD_READ_KEYS}&$filter=${encodeURIComponent(
//       filter
//     )}`;

//     const r = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
//     const j = await r.json();
//     const row = (j?.value && j.value[0]) as IRawStatusItem | undefined;
//     return row || null;
//   }

//   private async updateStatus(itemId: number, body: any): Promise<void> {
//     const url = `${this.webUrl}/_api/web/lists/getbytitle('${encodeURIComponent(
//       STATUS_LIST_TITLE
//     )}')/items(${itemId})`;

//     await this.spHttpClient.post(url, SPHttpClient.configurations.v1, {
//       headers: {
//         "Content-Type": "application/json;odata=nometadata",
//         "IF-MATCH": "*",
//         "X-HTTP-Method": "MERGE"
//       },
//       body: JSON.stringify(body)
//     });
//   }
// }












































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
  isNew: boolean;
  kind: NotifKind;
}

export interface IUserStatus {
  itemId: number;
  lastSeenAt: Date;
  readKeys: Set<number>;
}

interface IMe {
  id: number;
  email: string;
  title: string;
  loginName: string;
}

interface IRawNotifItem {
  Id: number;
  Title: string;
  TIRDescription?: string;
  URL?: { Url?: string } | string;
  TIRPageID?: number;
  TIRPageType?: string;
  Created?: string;
}

interface IRawStatusItem {
  Id: number;
  TIRLastSeen?: string;
  TIRUserID?: string;
  TIRUserId?: number;
  TIRReadKeys?: string;
}

const NOTIF_LIST_TITLE = "Notification Center";
const STATUS_LIST_TITLE = "User Notification Status";

const STATUS_FALLBACK_DATE = "2000-01-01T00:00:00Z";
const SERVER_FETCH_LIMIT = 100;

// Column internal names
const FIELD_LAST_SEEN = "TIRLastSeen";
// Indexed text column -> store email/UPN
const FIELD_USER_ID_TEXT = "TIRUserID";
// Person field lookup id property (when Person column internal name is TIRUser)
const FIELD_USER_LOOKUP_ID = "TIRUserId";
const FIELD_READ_KEYS = "TIRReadKeys";

// Existing data sometimes uses "," and sometimes ";".
const READ_KEY_SPLIT_RE = /[;,]/g;
const READ_KEY_JOIN = ";";

const JSON_HEADERS_NOMETA = {
  Accept: "application/json;odata=nometadata",
  "Content-Type": "application/json;odata=nometadata"
};

export class NotificationService {
  constructor(
    private readonly spHttpClient: SPHttpClient,
    private readonly webUrl: string
  ) {}

  public async getUserStatus(): Promise<IUserStatus> {
    const safeFallback: IUserStatus = {
      itemId: 0,
      lastSeenAt: new Date(STATUS_FALLBACK_DATE),
      readKeys: new Set<number>()
    };

    try {
      const me = await this.getCurrentUser();
      const status = await this.ensureStatusItem(me);

      const lastSeenAt = new Date(status?.TIRLastSeen || STATUS_FALLBACK_DATE);
      const readKeys = new Set<number>();

      const raw = (status?.TIRReadKeys || "").trim();
      if (raw) {
        raw
          .split(READ_KEY_SPLIT_RE)
          .map((x) => parseInt(x.trim(), 10))
          .filter((n) => !Number.isNaN(n))
          .forEach((n) => readKeys.add(n));
      }

      return {
        itemId: status?.Id || 0,
        lastSeenAt,
        readKeys
      };
    } catch {
      // Do not break notification popup if status list has a transient issue
      return safeFallback;
    }
  }

  public async getLatest(count: number): Promise<INotificationItem[]> {
    const status = await this.getUserStatus();

    const url = `${this.webUrl}/_api/web/lists/getbytitle('${encodeURIComponent(
      NOTIF_LIST_TITLE
    )}')/items?$top=${Math.min(
      SERVER_FETCH_LIMIT,
      Math.max(count, 10)
    )}&$orderby=Created desc&$select=Id,Title,TIRDescription,URL,TIRPageID,TIRPageType,Created`;

    const r = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`Failed to load notifications: ${r.status} ${r.statusText} ${t}`);
    }

    const j = await r.json();
    const rows: IRawNotifItem[] = (j?.value || []) as IRawNotifItem[];

    const items = rows.map((x) => this.mapItem(x, status.lastSeenAt, status.readKeys));
    return items.slice(0, count);
  }

  /** Mark all notifications read by moving LastSeen forward and clearing per-item overrides. */
  public async markAllRead(): Promise<void> {
    const me = await this.getCurrentUser();
    const nowIso = new Date().toISOString();

    const existing = await this.getStatusItem(me);
    if (!existing?.Id) {
      // Create row already marked as read
      await this.createStatusItem(me, {
        [FIELD_LAST_SEEN]: nowIso,
        [FIELD_READ_KEYS]: ""
      });
      return;
    }

    await this.updateStatus(existing.Id, {
      [FIELD_LAST_SEEN]: nowIso,
      [FIELD_READ_KEYS]: ""
    });
  }

  public async markItemRead(itemId: number): Promise<void> {
    if (!itemId) return;

    const me = await this.getCurrentUser();
    const status = await this.ensureStatusItem(me);
    if (!status?.Id) return;

    const raw = (status?.TIRReadKeys || "").trim();
    const set = new Set<number>();
    if (raw) {
      raw
        .split(READ_KEY_SPLIT_RE)
        .map((x) => parseInt(x.trim(), 10))
        .filter((n) => !Number.isNaN(n))
        .forEach((n) => set.add(n));
    }

    set.add(itemId);

    const value = Array.from(set)
      .sort((a, b) => a - b)
      .join(READ_KEY_JOIN);

    await this.updateStatus(status.Id, {
      [FIELD_READ_KEYS]: value
    });
  }

  // ======================== internals ========================

  private _htmlToPlainText(html: string): string {
    const raw = (html || "").trim();
    if (!raw) return "";

    try {
      const normalized = raw
        .replace(/<\s*br\s*\/?>/gi, "\n")
        .replace(/<\/\s*p\s*>/gi, "\n")
        .replace(/<\/\s*div\s*>/gi, "\n")
        .replace(/<\/\s*li\s*>/gi, "\n")
        .replace(/<\/\s*h[1-6]\s*>/gi, "\n");

      const doc = new DOMParser().parseFromString(normalized, "text/html");
      doc.querySelectorAll("script,style,iframe").forEach((n) => n.remove());

      const text = (doc.body as any).innerText ?? doc.body.textContent ?? "";
      return this._cleanText(text);
    } catch {
      return this._cleanText(raw.replace(/<[^>]+>/g, " "));
    }
  }

  private _cleanText(text: string): string {
    return (text || "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
  }

  private mapItem(x: IRawNotifItem, lastSeenAt: Date, readKeys: Set<number>): INotificationItem {
    const id = x.Id;
    const url = typeof x.URL === "string" ? x.URL : (x.URL as any)?.Url || "";

    const created = x.Created ? new Date(x.Created) : new Date();
    const isNew = created > lastSeenAt && !readKeys.has(id);

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

  private async getCurrentUser(): Promise<IMe> {
    const url = `${this.webUrl}/_api/web/currentuser?$select=Id,Email,Title,LoginName`;
    const r = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`Failed to fetch current user: ${r.status} ${r.statusText} ${t}`);
    }

    const j = await r.json();

    const id = Number(j?.Id || 0);
    const loginName = String(j?.LoginName || "");
    const email = (String(j?.Email || "") || this.extractEmailFromLogin(loginName)).toLowerCase();
    const title = String(j?.Title || "");

    return { id, email, title, loginName };
  }

  private extractEmailFromLogin(loginName: string): string {
    const s = String(loginName || "");
    const idx = s.lastIndexOf("|");
    const candidate = idx >= 0 ? s.slice(idx + 1) : s;
    return candidate.includes("@") ? candidate : "";
  }

  private escapeODataString(v: string): string {
    return String(v || "").replace(/'/g, "''");
  }

  private async getStatusItem(me: IMe): Promise<IRawStatusItem | null> {
    const parts: string[] = [];
    if (me.email) parts.push(`${FIELD_USER_ID_TEXT} eq '${this.escapeODataString(me.email)}'`);
    if (me.id) parts.push(`${FIELD_USER_LOOKUP_ID} eq ${me.id}`);

    const filter = parts.join(" or ");
    if (!filter) return null;

    const url = `${this.webUrl}/_api/web/lists/getbytitle('${encodeURIComponent(
      STATUS_LIST_TITLE
    )}')/items?$top=1&$select=Id,${FIELD_LAST_SEEN},${FIELD_USER_ID_TEXT},${FIELD_USER_LOOKUP_ID},${FIELD_READ_KEYS}&$filter=${encodeURIComponent(
      filter
    )}`;

    const r = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`Failed to read status item: ${r.status} ${r.statusText} ${t}`);
    }

    const j = await r.json();
    const row = (j?.value && j.value[0]) as IRawStatusItem | undefined;
    return row || null;
  }

  private async ensureStatusItem(me: IMe): Promise<IRawStatusItem> {
    const existing = await this.getStatusItem(me);
    if (existing?.Id) return existing;

    // If create fails, throw up so caller can fallback or show error (getUserStatus catches it)
    return this.createStatusItem(me);
  }

  private async createStatusItem(me: IMe, overrides?: Record<string, any>): Promise<IRawStatusItem> {
    const url = `${this.webUrl}/_api/web/lists/getbytitle('${encodeURIComponent(
      STATUS_LIST_TITLE
    )}')/items`;

    const baseBody: any = {
      Title: me.title || me.email || `User ${me.id}`,
      [FIELD_USER_ID_TEXT]: me.email,
      [FIELD_LAST_SEEN]: STATUS_FALLBACK_DATE,
      [FIELD_READ_KEYS]: ""
    };

    // Set Person field (lookup id)
    if (me.id) baseBody[FIELD_USER_LOOKUP_ID] = me.id;

    const body = { ...baseBody, ...(overrides || {}) };

    const r = await this.spHttpClient.post(url, SPHttpClient.configurations.v1, {
      headers: JSON_HEADERS_NOMETA,
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      const t = await r.text();
      throw new Error(`Failed to create status item: ${r.status} ${r.statusText} ${t}`);
    }

    return (await r.json()) as IRawStatusItem;
  }

  private async updateStatus(itemId: number, body: any): Promise<void> {
    const url = `${this.webUrl}/_api/web/lists/getbytitle('${encodeURIComponent(
      STATUS_LIST_TITLE
    )}')/items(${itemId})`;

    // IMPORTANT: use a plain object for headers (more reliable than new Headers() in SPHttpClient)
    const headers: any = {
      ...JSON_HEADERS_NOMETA,
      "IF-MATCH": "*",
      "X-HTTP-Method": "MERGE"
    };

    const r = await this.spHttpClient.fetch(url, SPHttpClient.configurations.v1, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      const t = await r.text();
      // Workaround: some tenants respond 406 but still apply MERGE
      if (r.status === 406 && /ACCEPT/i.test(t)) return;
      throw new Error(`Failed to update status item ${itemId}: ${r.status} ${r.statusText} ${t}`);
    }
  }
}
