// src/extensions/extensions/services/notificationService.ts

import { SPHttpClient } from '@microsoft/sp-http';
import { NotifKind } from '../shared/constants';

export interface INotificationItem {
  id: number;
  title: string;
  /** Plain-text description (RTE stripped) */
  description: string;
  /** Alias used by the UI */
  text: string;
  url: string;
  pageId: number | null;
  pageType: string;
  created: Date;
  /** Whether this item is new compared to the user's last seen time */
  isNew: boolean;
  /** Kind used for icon rendering */
  kind: NotifKind;
}

/** Backwards compatibility alias if you used this type elsewhere */
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

const NOTIF_LIST_TITLE = 'Notification Center';
const STATUS_LIST_TITLE = 'User Notification Status';
const STATUS_FALLBACK_DATE = '2000-01-01T00:00:00Z';
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

  /** Load or create the per-user status row (LastSeenAt). */
  public async getUserStatus(): Promise<IUserStatus> {
    if (this.status) return this.status;

    const baseUrl = `${this.webUrl}/_api/web/lists/GetByTitle('${STATUS_LIST_TITLE}')/items`;
    const safeLogin = this.userLogin.replace(/'/g, "''");
    const url =
      `${baseUrl}?$select=Id,TIRLastSeenAt` +
      `&$filter=TIRUserLogin eq '${safeLogin}'` +
      `&$orderby=Id desc&$top=1`;

    const resp = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
    const json = await resp.json();

    if (json.value && json.value.length) {
      const row = json.value[0];
      const lastSeenRaw: string = row.TIRLastSeenAt || STATUS_FALLBACK_DATE;
      const lastSeenAt = new Date(lastSeenRaw);
      this.status = { itemId: row.Id, lastSeenAt };
      return this.status;
    }

    // No row yet – create one with a very old LastSeenAt
    const userId = await this.getCurrentUserId().catch(() => undefined);

    const body: any = {
      Title: this.userDisplayName || this.userEmail || this.userLogin,
      TIRUserLogin: this.userLogin,
      TIRLastSeenAt: STATUS_FALLBACK_DATE
    };

    // Fill TIRUser (Person) if we managed to resolve current user id
    if (userId) {
      body.TIRUserId = userId;
    }

    const createResp = await this.spHttpClient.post(
      baseUrl,
      SPHttpClient.configurations.v1,
      {
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-type': 'application/json;odata=nometadata'
        },
        body: JSON.stringify(body)
      }
    );

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

    const rows: IRawNotifItem[] = json.value || [];
    const lastSeenAt = status.lastSeenAt;

    return rows.map((r) => {
      const created = r.Created ? new Date(r.Created) : new Date();
      const descHtml = r.TIRDescription || '';
      const desc = descHtml.replace(/<[^>]+>/g, '').trim(); // strip RTE markup

      const urlVal =
        typeof r.URL === 'string'
          ? r.URL
          : r.URL && typeof r.URL.Url === 'string'
          ? r.URL.Url
          : '';

      const pageType = r.TIRPageType || '';

      const kind = this.mapPageTypeToKind(pageType);

      const item: INotificationItem = {
        id: r.Id,
        title: r.Title || '',
        description: desc,
        text: desc,
        url: urlVal,
        pageId: typeof r.TIRPageID === 'number' ? r.TIRPageID : null,
        pageType,
        created,
        isNew: created > lastSeenAt,
        kind
      };

      return item;
    });
  }

  /** Map page type / custom type to a NotifKind for icon selection. */
  private mapPageTypeToKind(pageType: string): NotifKind {
    const pt = (pageType || '').toLowerCase();

    if (pt.indexOf('news') >= 0) {
      return 'megaphone';
    }
    if (pt.indexOf('event') >= 0) {
      return 'party';
    }
    if (pt.indexOf('training') >= 0) {
      return 'check';
    }

    // default icon
    return 'info';
  }

  /** Mark *all* notifications as read – set LastSeenAt = now. */
  public async markAllRead(): Promise<void> {
    const now = new Date();
    const status = await this.getUserStatus();
    await this.updateStatus(status.itemId, now);
  }

  /**
   * Mark all notifications up to a specific Created date as read.
   * Used when user opens a single notification.
   */
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

    await this.spHttpClient.post(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-type': 'application/json;odata=nometadata',
          'IF-MATCH': '*',
          'X-HTTP-Method': 'MERGE'
        },
        body: JSON.stringify({ TIRLastSeenAt: newDate.toISOString() })
      }
    );

    if (this.status) {
      this.status.lastSeenAt = newDate;
    }
  }
}

























// // src/extensions/extensions/services/notificationService.ts

// import { SPHttpClient } from '@microsoft/sp-http';
// import { NotifKind } from '../shared/constants';

// export interface INotificationItem {
//   id: number;
//   title: string;
//   /** Plain-text description (RTE stripped) */
//   description: string;
//   /** Alias used by the UI */
//   text: string;
//   url: string;
//   pageId: number | null;
//   pageType: string;
//   created: Date;
//   /** Whether this item is new compared to the user's last seen time */
//   isNew: boolean;
//   /** Kind used for icon rendering */
//   kind: NotifKind;
// }

// /** Backwards compatibility alias if you used this type elsewhere */
// export type ITirNotification = INotificationItem;

// export interface IUserStatus {
//   itemId: number;
//   lastSeenAt: Date;
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

// const NOTIF_LIST_TITLE = 'Notification Center';
// const STATUS_LIST_TITLE = 'User Notification Status';
// const STATUS_FALLBACK_DATE = '2000-01-01T00:00:00Z';
// const SERVER_FETCH_LIMIT = 100;

// export class NotificationService {
//   private status?: IUserStatus;
//   private currentUserId?: number;

//   constructor(
//     private readonly spHttpClient: SPHttpClient,
//     private readonly webUrl: string,
//     private readonly userLogin: string,
//     private readonly userEmail: string,
//     private readonly userDisplayName: string
//   ) {}

//   /** Load or create the per-user status row (LastSeenAt). */
//   public async getUserStatus(): Promise<IUserStatus> {
//     if (this.status) return this.status;

//     const baseUrl = `${this.webUrl}/_api/web/lists/GetByTitle('${STATUS_LIST_TITLE}')/items`;
//     const safeLogin = this.userLogin.replace(/'/g, "''");
//     const url =
//       `${baseUrl}?$select=Id,TIRLastSeenAt` +
//       `&$filter=TIRUserLogin eq '${safeLogin}'` +
//       `&$orderby=Id desc&$top=1`;

//     const resp = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
//     const json = await resp.json();

//     if (json.value && json.value.length) {
//       const row = json.value[0];
//       const lastSeenRaw: string = row.TIRLastSeenAt || STATUS_FALLBACK_DATE;
//       const lastSeenAt = new Date(lastSeenRaw);
//       this.status = { itemId: row.Id, lastSeenAt };
//       return this.status;
//     }

//     // No row yet – create one with a very old LastSeenAt
//     const userId = await this.getCurrentUserId().catch(() => undefined);

//     const body: any = {
//       Title: this.userDisplayName || this.userEmail || this.userLogin,
//       TIRUserLogin: this.userLogin,
//       TIRLastSeenAt: STATUS_FALLBACK_DATE
//     };

//     // Fill TIRUser (Person) if we managed to resolve current user id
//     if (userId) {
//       body.TIRUserId = userId;
//     }

//     const createResp = await this.spHttpClient.post(
//       baseUrl,
//       SPHttpClient.configurations.v1,
//       {
//         headers: {
//           Accept: 'application/json;odata=nometadata',
//           'Content-type': 'application/json;odata=nometadata'
//         },
//         body: JSON.stringify(body)
//       }
//     );

//     const created = await createResp.json();
//     const status: IUserStatus = {
//       itemId: created.Id,
//       lastSeenAt: new Date(STATUS_FALLBACK_DATE)
//     };
//     this.status = status;
//     return status;
//   }

//   /** Get latest notifications (read + unread), max 100, sorted desc by Created. */
//   public async getLatest(max: number = SERVER_FETCH_LIMIT): Promise<INotificationItem[]> {
//     const status = await this.getUserStatus();

//     const baseUrl = `${this.webUrl}/_api/web/lists/GetByTitle('${NOTIF_LIST_TITLE}')/items`;
//     const url =
//       `${baseUrl}` +
//       `?$select=Id,Title,TIRDescription,URL,TIRPageID,TIRPageType,TIRExpiresOn,Created` +
//       `&$orderby=Created desc` +
//       `&$top=${Math.min(max, SERVER_FETCH_LIMIT)}`;

//     const resp = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
//     const json = await resp.json();

//     const rows: IRawNotifItem[] = json.value || [];
//     const lastSeenAt = status.lastSeenAt;

//     return rows.map((r) => {
//       const created = r.Created ? new Date(r.Created) : new Date();
//       const descHtml = r.TIRDescription || '';
//       const desc = descHtml.replace(/<[^>]+>/g, '').trim(); // strip RTE markup

//       const urlVal =
//         typeof r.URL === 'string'
//           ? r.URL
//           : r.URL && typeof r.URL.Url === 'string'
//           ? r.URL.Url
//           : '';

//       const pageType = r.TIRPageType || '';

//       const kind = this.mapPageTypeToKind(pageType);

//       const item: INotificationItem = {
//         id: r.Id,
//         title: r.Title || '',
//         description: desc,
//         text: desc,
//         url: urlVal,
//         pageId: typeof r.TIRPageID === 'number' ? r.TIRPageID : null,
//         pageType,
//         created,
//         isNew: created > lastSeenAt,
//         kind
//       };

//       return item;
//     });
//   }

//   /** Map page type / custom type to a NotifKind for icon selection. */
//   private mapPageTypeToKind(pageType: string): NotifKind {
//     const pt = (pageType || '').toLowerCase();

//     if (pt.indexOf('news') >= 0) {
//       return 'megaphone';
//     }
//     if (pt.indexOf('event') >= 0) {
//       return 'party';
//     }
//     if (pt.indexOf('training') >= 0) {
//       return 'check';
//     }

//     // default icon
//     return 'info';
//   }

//   /** Mark *all* notifications as read – set LastSeenAt = now. */
//   public async markAllRead(): Promise<void> {
//     const now = new Date();
//     const status = await this.getUserStatus();
//     await this.updateStatus(status.itemId, now);
//   }

//   /**
//    * Mark all notifications up to a specific Created date as read.
//    * Used when user opens a single notification.
//    */
//   public async markSeenUpTo(created: Date): Promise<void> {
//     const status = await this.getUserStatus();
//     if (created <= status.lastSeenAt) return;
//     await this.updateStatus(status.itemId, created);
//   }

//   public async markSeenNow(): Promise<void> {
//     const status = await this.getUserStatus();
//     const now = new Date();
//     if (now <= status.lastSeenAt) return;
//     await this.updateStatus(status.itemId, now);
//   }

//   // ---------- private helpers ----------

//   private async getCurrentUserId(): Promise<number> {
//     if (this.currentUserId) return this.currentUserId;

//     const url = `${this.webUrl}/_api/web/currentuser?$select=Id`;
//     const resp = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
//     const json = await resp.json();
//     this.currentUserId = json.Id;
//     return this.currentUserId!;
//   }

//   private async updateStatus(itemId: number, newDate: Date): Promise<void> {
//     const url = `${this.webUrl}/_api/web/lists/GetByTitle('${STATUS_LIST_TITLE}')/items(${itemId})`;

//     await this.spHttpClient.post(
//       url,
//       SPHttpClient.configurations.v1,
//       {
//         headers: {
//           Accept: 'application/json;odata=nometadata',
//           'Content-type': 'application/json;odata=nometadata',
//           'IF-MATCH': '*',
//           'X-HTTP-Method': 'MERGE'
//         },
//         body: JSON.stringify({ TIRLastSeenAt: newDate.toISOString() })
//       }
//     );

//     if (this.status) {
//       this.status.lastSeenAt = newDate;
//     }
//   }
// }
