// src/extensions/extensions/shared/notifications.ts

import styles from "../Extension.module.scss";
import { Icons } from "./icons";
import { INotificationItem } from "../services/notificationService";
import { NotifKind } from "./constants";

interface INotifView extends INotificationItem {
  unread: boolean;
}

interface INotificationCallbacks {
  onUnreadChange?: (count: number) => void;
  onMarkAllRead?: () => Promise<void> | void;
  onItemOpen?: (item: INotifView) => Promise<void> | void;
}

export class Notifications {
  private overlay: HTMLDivElement | null = null;
  private sectionsHost?: HTMLDivElement;

  private items: INotifView[];
  private callbacks: INotificationCallbacks;

  private visibleCount = 10;
  private readonly step = 10;

  private _savingAll = false;
  private _savingItemIds = new Set<number>();

  private markAllChk?: HTMLInputElement;

  private escHandler = (e: KeyboardEvent) => {
    if (e.key === "Escape") this.close();
  };

  constructor(
    notifications: INotificationItem[],
    _lastSeenAt: Date, // kept for signature compatibility (not used now)
    callbacks?: INotificationCallbacks
  ) {
    this.callbacks = callbacks || {};

    // IMPORTANT: unread now comes from service logic (isNew already considers ReadKeys etc.)
    this.items = notifications.map((n) => ({
      ...n,
      unread: !!n.isNew
    }));

    this.notifyUnread();
  }

  public toggle(): void {
    this.overlay ? this.close() : this.open();
  }

  public open(): void {
    this.close(); // rebuild fresh

    const overlay = document.createElement("div");
    overlay.className = styles.TIRNotifOverlay;

    const modal = document.createElement("div");
    modal.className = styles.TIRNotifModal;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Notifications");

    const header = document.createElement("div");
    header.className = styles.TIRNotifHeader;
    header.innerHTML = `
      <div class="${styles.TIRNotifTitle}">Notifications</div>
      <div class="${styles.TIRNotifHeaderRight}">
        <label class="${styles.TIRMarkAll}">
          <input type="checkbox" class="${styles.TIRMarkAllChk}" />
          <span>Mark all as read</span>
        </label>
        <button class="${styles.TIRNotifClose}" aria-label="Close">×</button>
      </div>
    `;

    const sections = document.createElement("div");
    sections.className = styles.TIRNotifSections;

    modal.appendChild(header);
    modal.appendChild(sections);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // close button
    (header.querySelector(`.${styles.TIRNotifClose}`) as HTMLButtonElement).addEventListener(
      "click",
      () => this.close()
    );

    // click outside closes
    overlay.addEventListener("click", (ev) => {
      if (ev.target === overlay) this.close();
    });

    // mark-all
    const markAll = header.querySelector(`.${styles.TIRMarkAllChk}`) as HTMLInputElement;
    this.markAllChk = markAll;

    markAll.addEventListener("change", async () => {
      // only handle turning ON
      if (!markAll.checked) return;
      if (this._savingAll) return;

      this._savingAll = true;
      markAll.disabled = true;

      try {
        // wait for SharePoint save
        await this.callbacks.onMarkAllRead?.();

        // update UI
        this.items = this.items.map((n) => ({ ...n, unread: false }));
        this.notifyUnread();
        this.render();
      } finally {
        this._savingAll = false;
        markAll.disabled = false;

        // ensure correct checkbox state after operation
        markAll.checked = this.getUnreadCount() === 0;
      }
    });

    document.addEventListener("keydown", this.escHandler, true);

    this.overlay = overlay;
    this.sectionsHost = sections;
    this.render();
  }

  public close(): void {
    document.removeEventListener("keydown", this.escHandler, true);

    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
      this.sectionsHost = undefined;
      this.markAllChk = undefined;
      this._savingAll = false;
      this._savingItemIds.clear();
    }
  }

  public dispose(): void {
    this.close();
  }

  private render(): void {
    if (!this.sectionsHost) return;

    const container = this.sectionsHost;
    container.innerHTML = "";

    if (!this.items.length) {
      const empty = document.createElement("div");
      empty.className = styles.TIRNotifSectionCaption;
      empty.textContent = "No notifications";
      container.appendChild(empty);
      this.syncMarkAllCheckbox();
      return;
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const visible = this.items.slice(0, this.visibleCount);
    const today = visible.filter((n) => n.created >= todayStart);
    const earlier = visible.filter((n) => n.created < todayStart);

    if (today.length) container.appendChild(this.buildSection("Today", today));
    if (earlier.length) container.appendChild(this.buildSection("Earlier", earlier));

    if (this.visibleCount < this.items.length) {
      const more = document.createElement("button");
      more.type = "button";
      more.className = styles.TIRSuggestFooter; // reuse style
      more.textContent = "See more";
      more.addEventListener("click", () => {
        this.visibleCount = Math.min(this.visibleCount + this.step, this.items.length);
        this.render();
      });
      container.appendChild(more);
    }

    this.syncMarkAllCheckbox();
  }

  private syncMarkAllCheckbox(): void {
    if (!this.markAllChk) return;
    if (this._savingAll) return; // don't fight user interaction while saving
    this.markAllChk.checked = this.getUnreadCount() === 0;
  }

  private buildSection(caption: string, items: INotifView[]): HTMLElement {
    const section = document.createElement("section");
    section.className = styles.TIRNotifSection;

    const heading = document.createElement("div");
    heading.className = styles.TIRNotifSectionCaption;
    heading.textContent = caption;

    const list = document.createElement("div");
    list.className = styles.TIRNotifList;

    items.forEach((n) => {
      const row = document.createElement("div");
      row.className = styles.TIRNotifRow;

      const icon = document.createElement("div");
      icon.className = styles.TIRNotifIcon;

      const kindKey: NotifKind = n.kind || "info";
      icon.innerHTML = Icons[kindKey];

      const body = document.createElement("div");
      body.className = styles.TIRNotifBody;

      const title = document.createElement("div");
      title.className = styles.TIRNotifRowTitle;
      title.textContent = n.title;

      const text = document.createElement("div");
      text.className = styles.TIRNotifRowText;
      text.textContent = n.text;

      body.appendChild(title);
      body.appendChild(text);

      const right = document.createElement("div");
      right.className = styles.TIRNotifRight;

      const time = document.createElement("div");
      time.className = styles.TIRNotifTime;
      time.textContent = this.formatRelative(n.created);
      right.appendChild(time);

      if (n.unread) {
        const dot = document.createElement("span");
        dot.className = styles.TIRNotifDot;
        right.appendChild(dot);
      }

      row.appendChild(icon);
      row.appendChild(body);
      row.appendChild(right);

      row.addEventListener("click", async () => {
        if (this._savingAll) return;
        if (this._savingItemIds.has(n.id)) return;

        const targetUrl = (n.url || "").trim();
        if (!targetUrl) {
          // no navigation target
          return;
        }

        // ✅ UI FIRST (so dot + bell count updates immediately)
        const wasUnread = n.unread;
        if (wasUnread) {
          n.unread = false;
          this.notifyUnread();
          this.render();
        }

        // ✅ then persist (if callback exists)
        if (wasUnread && this.callbacks.onItemOpen) {
          this._savingItemIds.add(n.id);
          try {
            await this.callbacks.onItemOpen(n);
          } catch (e) {
            // if save fails, you can revert UI by uncommenting below
            // n.unread = true; this.notifyUnread(); this.render();
            console.warn("onItemOpen (save) failed for notification:", n.id, e);
          } finally {
            this._savingItemIds.delete(n.id);
          }
        }

        // navigate
        this.close();
        window.location.assign(targetUrl);
      });

      list.appendChild(row);
    });

    section.appendChild(heading);
    section.appendChild(list);
    return section;
  }

  private formatRelative(d: Date): string {
    const diffMs = new Date().getTime() - d.getTime();
    const mins = Math.round(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs} hours ago`;
    const days = Math.round(hrs / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  }

  private getUnreadCount(): number {
    return this.items.filter((n) => n.unread).length;
  }

  private notifyUnread(): void {
    const count = this.getUnreadCount();
    this.callbacks.onUnreadChange?.(count);
  }
}
