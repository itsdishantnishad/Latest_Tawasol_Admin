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

export type ITirNotification = INotificationItem;

export interface IUserStatus {
  itemId: number;
  lastSeenAt: Date;
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
  TIRLastSeen?: string; // <-- your DateTime internal name
  TIRUserID?: string;   // <-- your text internal name
  TIRUserId?: number;   // <-- person field id accessor
}

const NOTIF_LIST_TITLE = "Notification Center";
const STATUS_LIST_TITLE = "User Notification Status";
const STATUS_FALLBACK_DATE = "2000-01-01T00:00:00Z";
const SERVER_FETCH_LIMIT = 100;

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

  /** Load or create the per-user status row (TIRLastSeen). */
  public async getUserStatus(): Promise<IUserStatus> {
    if (this.status) return this.status;

    const baseUrl = `${this.webUrl}/_api/web/lists/GetByTitle('${STATUS_LIST_TITLE}')/items`;

    // Prefer Person field matching (TIRUser), fallback to text match (TIRUserID)
    const userId = await this.getCurrentUserId().catch(() => undefined);
    const userKey = (this.userEmail || this.userLogin || "").trim();
    const safeUserKey = userKey.replace(/'/g, "''");

    const filters: string[] = [];
    if (userId) filters.push(`TIRUserId eq ${userId}`);
    if (userKey) filters.push(`TIRUserID eq '${safeUserKey}'`);

    // If for some reason both are empty, do not break OData
    const filterClause = filters.length ? `&$filter=${filters.join(" or ")}` : "";

    const url =
      `${baseUrl}?$select=Id,TIRLastSeen,TIRUserID,TIRUserId` +
      `${filterClause}` +
      `&$orderby=Id desc&$top=1`;

    const resp = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
    const json = await resp.json();

    const rows: IRawStatusItem[] = json?.value || [];
    if (rows.length) {
      const row = rows[0];
      const lastSeenRaw: string = row.TIRLastSeen || STATUS_FALLBACK_DATE;
      const lastSeenAt = new Date(lastSeenRaw);
      this.status = { itemId: row.Id, lastSeenAt };
      return this.status;
    }

    // No row yet – create one with a very old last-seen date
    const body: any = {
      Title: this.userDisplayName || this.userEmail || this.userLogin,
      TIRUserID: userKey || this.userLogin,      // <-- text column
      TIRLastSeen: STATUS_FALLBACK_DATE          // <-- DateTime column
    };

    // Fill Person field (TIRUser) if we have userId
    if (userId) {
      body.TIRUserId = userId;                  // <-- Person field set via <InternalName>Id
    }

    const createResp = await this.spHttpClient.post(baseUrl, SPHttpClient.configurations.v1, {
      headers: {
        Accept: "application/json;odata=nometadata",
        "Content-type": "application/json;odata=nometadata"
      },
      body: JSON.stringify(body)
    });

    const created = await createResp.json();
    const status: IUserStatus = {
      itemId: created.Id,
      lastSeenAt: new Date(STATUS_FALLBACK_DATE)
    };

    this.status = status;
    return status;
  }

  /** Get latest notifications (read + unread), max 100, sorted desc by Created. */
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

      return {
        id: r.Id,
        title: r.Title || "",
        description: desc,
        text: desc,
        url: urlVal,
        pageId: typeof r.TIRPageID === "number" ? r.TIRPageID : null,
        pageType,
        created,
        isNew: created > lastSeenAt,
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

  public async markAllRead(): Promise<void> {
    const now = new Date();
    const status = await this.getUserStatus();
    await this.updateStatus(status.itemId, now);
  }

  public async markSeenUpTo(created: Date): Promise<void> {
    const status = await this.getUserStatus();
    if (created <= status.lastSeenAt) return;
    await this.updateStatus(status.itemId, created);
  }

  // ---------- private helpers ----------

  private async getCurrentUserId(): Promise<number> {
    if (this.currentUserId) return this.currentUserId;
    const url = `${this.webUrl}/_api/web/currentuser?$select=Id`;
    const resp = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
    const json = await resp.json();
    this.currentUserId = json.Id;
    return this.currentUserId!;
  }

  private async updateStatus(itemId: number, newDate: Date): Promise<void> {
    const url = `${this.webUrl}/_api/web/lists/GetByTitle('${STATUS_LIST_TITLE}')/items(${itemId})`;

    await this.spHttpClient.post(url, SPHttpClient.configurations.v1, {
      headers: {
        Accept: "application/json;odata=nometadata",
        "Content-type": "application/json;odata=nometadata",
        "IF-MATCH": "*",
        "X-HTTP-Method": "MERGE"
      },
      body: JSON.stringify({
        TIRLastSeen: newDate.toISOString() // <-- your DateTime internal name
      })
    });

    if (this.status) this.status.lastSeenAt = newDate;
  }
}
