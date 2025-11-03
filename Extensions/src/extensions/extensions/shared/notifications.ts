// src/extensions/extensions/shared/notifications.ts
import styles from '../Extension.module.scss';
import { Icons } from './icons';
import { HARD_NOTIFS as CONST_NOTIFS } from '../shared/constants';

type NotifKind = 'party' | 'info' | 'alert' | 'megaphone' | 'check';
interface NotifItem {
  id: string; kind: NotifKind; title: string; text: string; time: string;
  unread: boolean; section: 'today' | 'yesterday';
}

export class Notifications {
  private overlay: HTMLDivElement | null = null;
  private list: NotifItem[];
  private escHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') this.close(); };

  constructor(items?: NotifItem[]) {
    const src = items && items.length ? items : CONST_NOTIFS;
    this.list = src.map(n => ({ ...n }));
  }

  public toggle(): void { this.overlay ? this.close() : this.open(); }
  public dispose(): void { this.close(); }

  public open(): void {
    this.close();

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
      </div>`;

    const sectionsWrap = document.createElement('div');
    sectionsWrap.className = styles.TIRNotifSections;

    const today = this.list.filter(n => n.section === 'today');
    const yesterday = this.list.filter(n => n.section === 'yesterday');

    sectionsWrap.appendChild(this.buildSection('Today, July 21', today));
    sectionsWrap.appendChild(this.buildSection('Yesterday, July 22', yesterday));

    modal.appendChild(header);
    modal.appendChild(sectionsWrap);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    (header.querySelector(`.${styles.TIRNotifClose}`) as HTMLButtonElement)
      .addEventListener('click', () => this.close());
    overlay.addEventListener('click', (ev) => { if (ev.target === overlay) this.close(); });

    (header.querySelector(`.${styles.TIRMarkAllChk}`) as HTMLInputElement)
      .addEventListener('change', (ev) => {
        if ((ev.target as HTMLInputElement).checked) {
          this.list = this.list.map(n => ({ ...n, unread: false }));
          this.rerender(sectionsWrap);
        }
      });

    document.addEventListener('keydown', this.escHandler, true);
    this.overlay = overlay;
  }

  public close(): void {
    document.removeEventListener('keydown', this.escHandler, true);
    if (this.overlay) { this.overlay.remove(); this.overlay = null; }
  }

  private rerender(container: HTMLElement): void {
    container.innerHTML = '';
    const today = this.list.filter(n => n.section === 'today');
    const yesterday = this.list.filter(n => n.section === 'yesterday');
    container.appendChild(this.buildSection('Today, July 21', today));
    container.appendChild(this.buildSection('Yesterday, July 22', yesterday));
  }

  private buildSection(caption: string, items: NotifItem[]): HTMLElement {
    const section = document.createElement('section');
    section.className = styles.TIRNotifSection;

    const heading = document.createElement('div');
    heading.className = styles.TIRNotifSectionCaption;
    heading.textContent = caption;

    const listEl = document.createElement('div');
    listEl.className = styles.TIRNotifList;

    items.forEach(n => {
      const row = document.createElement('div');
      row.className = styles.TIRNotifRow;

      const icon = document.createElement('div');
      icon.className = styles.TIRNotifIcon;
      // Using inline Icons set
      icon.innerHTML = Icons[n.kind];

      const body = document.createElement('div');
      body.className = styles.TIRNotifBody;
      const title = document.createElement('div'); title.className = styles.TIRNotifRowTitle; title.textContent = n.title;
      const text  = document.createElement('div'); text.className  = styles.TIRNotifRowText;  text.textContent  = n.text;
      body.appendChild(title); body.appendChild(text);

      const right = document.createElement('div');
      right.className = styles.TIRNotifRight;
      const time = document.createElement('div'); time.className = styles.TIRNotifTime; time.textContent = n.time;
      right.appendChild(time);
      if (n.unread) { const dot = document.createElement('span'); dot.className = styles.TIRNotifDot; right.appendChild(dot); }

      row.appendChild(icon);
      row.appendChild(body);
      row.appendChild(right);

      row.addEventListener('click', () => { n.unread = false; this.rerender(listEl.parentElement as HTMLElement); });

      listEl.appendChild(row);
    });

    section.appendChild(heading);
    section.appendChild(listEl);
    return section;
  }
}
