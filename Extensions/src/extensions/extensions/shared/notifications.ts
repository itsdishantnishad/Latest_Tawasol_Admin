// src/extensions/extensions/shared/notifications.ts

import styles from '../Extension.module.scss';
import { Icons } from './icons';
import { INotificationItem } from '../services/notificationService';
import { NotifKind } from './constants';

interface INotifView extends INotificationItem {
  unread: boolean;
}

interface INotificationCallbacks {
  onUnreadChange?: (count: number) => void;
  onMarkAllRead?: () => void;
  onItemOpen?: (item: INotifView) => void;
}

export class Notifications {
  private overlay: HTMLDivElement | null = null;
  private items: INotifView[];
  private callbacks: INotificationCallbacks;
  private visibleCount = 10;
  private readonly step = 10;
  private sectionsHost?: HTMLDivElement;

  private escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.close();
  };

  constructor(
    notifications: INotificationItem[],
    lastSeenAt: Date,
    callbacks?: INotificationCallbacks
  ) {
    const lastSeen = lastSeenAt || new Date('2000-01-01T00:00:00Z');
    this.callbacks = callbacks || {};
    this.items = notifications.map(n => ({
      ...n,
      unread: n.created > lastSeen
    }));
    this.notifyUnread();
  }

  public toggle(): void {
    this.overlay ? this.close() : this.open();
  }

  public open(): void {
    this.close(); // rebuild

    const overlay = document.createElement('div');
    overlay.className = styles.TIRNotifOverlay;

    const modal = document.createElement('div');
    modal.className = styles.TIRNotifModal;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Notifications');

    const header = document.createElement('div');
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

    const sections = document.createElement('div');
    sections.className = styles.TIRNotifSections;

    modal.appendChild(header);
    modal.appendChild(sections);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    (header.querySelector(`.${styles.TIRNotifClose}`) as HTMLButtonElement)
      .addEventListener('click', () => this.close());

    overlay.addEventListener('click', ev => {
      if (ev.target === overlay) this.close();
    });

    const markAll = header.querySelector(`.${styles.TIRMarkAllChk}`) as HTMLInputElement;
    markAll.addEventListener('change', () => {
      if (markAll.checked) {
        this.items = this.items.map(n => ({ ...n, unread: false }));
        this.notifyUnread();
        this.render();
        if (this.callbacks.onMarkAllRead) this.callbacks.onMarkAllRead();
      }
    });

    document.addEventListener('keydown', this.escHandler, true);

    this.overlay = overlay;
    this.sectionsHost = sections;
    this.render();
  }

  public close(): void {
    document.removeEventListener('keydown', this.escHandler, true);
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
      this.sectionsHost = undefined;
    }
  }

  public dispose(): void {
    this.close();
  }

  private render(): void {
    if (!this.sectionsHost) return;

    const container = this.sectionsHost;
    container.innerHTML = '';

    if (!this.items.length) {
      const empty = document.createElement('div');
      empty.className = styles.TIRNotifSectionCaption;
      empty.textContent = 'No notifications';
      container.appendChild(empty);
      return;
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const visible = this.items.slice(0, this.visibleCount);
    const today = visible.filter(n => n.created >= todayStart);
    const earlier = visible.filter(n => n.created < todayStart);

    if (today.length) container.appendChild(this.buildSection('Today', today));
    if (earlier.length) container.appendChild(this.buildSection('Earlier', earlier));

    if (this.visibleCount < this.items.length) {
      const more = document.createElement('button');
      more.type = 'button';
      more.className = styles.TIRSuggestFooter; // reuse style
      more.textContent = 'See more';
      more.addEventListener('click', () => {
        this.visibleCount = Math.min(this.visibleCount + this.step, this.items.length);
        this.render();
      });
      container.appendChild(more);
    }

    const unread = this.getUnreadCount();
    const markAll = document.querySelector(
      `.${styles.TIRMarkAllChk}`
    ) as HTMLInputElement | null;
    if (markAll) markAll.checked = unread === 0;
  }

  private buildSection(caption: string, items: INotifView[]): HTMLElement {
    const section = document.createElement('section');
    section.className = styles.TIRNotifSection;

    const heading = document.createElement('div');
    heading.className = styles.TIRNotifSectionCaption;
    heading.textContent = caption;

    const list = document.createElement('div');
    list.className = styles.TIRNotifList;

    items.forEach(n => {
      const row = document.createElement('div');
      row.className = styles.TIRNotifRow;

      const icon = document.createElement('div');
      icon.className = styles.TIRNotifIcon;

      const kindKey: NotifKind = n.kind || 'info';
      icon.innerHTML = Icons[kindKey];

      const body = document.createElement('div');
      body.className = styles.TIRNotifBody;

      const title = document.createElement('div');
      title.className = styles.TIRNotifRowTitle;
      title.textContent = n.title;

      const text = document.createElement('div');
      text.className = styles.TIRNotifRowText;
      text.textContent = n.text;

      body.appendChild(title);
      body.appendChild(text);

      const right = document.createElement('div');
      right.className = styles.TIRNotifRight;

      const time = document.createElement('div');
      time.className = styles.TIRNotifTime;
      time.textContent = this.formatRelative(n.created);
      right.appendChild(time);

      if (n.unread) {
        const dot = document.createElement('span');
        dot.className = styles.TIRNotifDot;
        right.appendChild(dot);
      }

      row.appendChild(icon);
      row.appendChild(body);
      row.appendChild(right);

      row.addEventListener('click', () => {
        if (n.unread) {
          n.unread = false;
          this.notifyUnread();
          this.render();
        }
        if (this.callbacks.onItemOpen) {
          this.callbacks.onItemOpen(n);
        }
        if (n.url) {
          window.location.href = n.url;
        }
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
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs} hours ago`;
    const days = Math.round(hrs / 24);
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  }

  private getUnreadCount(): number {
    return this.items.filter(n => n.unread).length;
  }

  private notifyUnread(): void {
    const count = this.getUnreadCount();
    if (this.callbacks.onUnreadChange) this.callbacks.onUnreadChange(count);
  }
}
