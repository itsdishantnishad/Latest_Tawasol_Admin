import styles from '../Extension.module.scss';

export interface SuggestItem {
  title: string;
  subtitle?: string;
  url: string;
  imageUrl?: string;
  kind: 'person' | 'page' | 'doc';
}

export class SuggestBox {
  private host: HTMLDivElement | null = null;
  private activeIndex = -1;

  constructor(
    private readonly attachUnder: HTMLElement, // usually the header wrap
    private readonly getWebUrl: () => string,
    private readonly photoSrcForPerson: (upn?: string) => string
  ) {}

  close(): void {
    this.activeIndex = -1;
    if (this.host) { this.host.remove(); this.host = null; }
  }

  open(query: string, items: SuggestItem[]): void {
    this.close();

    const host = document.createElement('div');
    host.className = styles.TIRSuggestHost;
    host.setAttribute('role', 'listbox');
    this.host = host;

    const list = document.createElement('div');
    list.className = styles.TIRSuggestList;

    if (!items.length) {
      const row = document.createElement('div');
      row.className = styles.TIRSuggestItem;
      row.setAttribute('aria-disabled', 'true');
      row.style.cursor = 'default';

      const thumb = document.createElement('div');
      thumb.className = styles.TIRSuggestThumb;
      thumb.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="11" cy="11" r="7.5" stroke="#C4C4C4" stroke-width="1.5"/>
        <path d="M16.5 16.5L21 21" stroke="#C4C4C4" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M7 7l8 8" stroke="#C4C4C4" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`;

      const textWrap = document.createElement('div');
      const t1 = document.createElement('div'); t1.className = styles.TIRSuggestTitle; t1.textContent = `No results for “${query}”`;
      const t2 = document.createElement('div'); t2.className = styles.TIRSuggestSub;   t2.textContent = 'Try a different keyword or check the spelling.';
      textWrap.appendChild(t1); textWrap.appendChild(t2);

      row.appendChild(thumb);
      row.appendChild(textWrap);
      list.appendChild(row);
    } else {
      items.forEach((it, idx) => {
        const row = document.createElement('div');
        row.className = styles.TIRSuggestItem;
        row.setAttribute('role', 'option');
        row.setAttribute('data-index', String(idx));
        row.setAttribute('data-url', it.url);
        row.setAttribute('data-kind', it.kind);

        const thumb = document.createElement('div');
        thumb.className = styles.TIRSuggestThumb;

        if (it.kind === 'person') {
          const img = document.createElement('img');
          img.src = it.imageUrl || this.photoSrcForPerson();
          img.alt = '';
          thumb.appendChild(img);
        } else if (it.imageUrl) {
          const img = document.createElement('img');
          img.src = it.imageUrl;
          img.alt = '';
          thumb.appendChild(img);
        } else {
          thumb.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="#C4C4C4" />
            <path d="M8 8h8v8H8z" fill="#EDEDED" stroke="#C4C4C4"/>
          </svg>`;
        }

        const textWrap = document.createElement('div');
        const t1 = document.createElement('div'); t1.className = styles.TIRSuggestTitle; t1.textContent = it.title;
        const t2 = document.createElement('div'); t2.className = styles.TIRSuggestSub;   t2.textContent = it.subtitle || '';
        textWrap.appendChild(t1); textWrap.appendChild(t2);

        row.appendChild(thumb);
        row.appendChild(textWrap);

        row.addEventListener('click', () => { window.location.href = it.url; });

        list.appendChild(row);
      });
    }

    const footer = document.createElement('div');
    footer.className = styles.TIRSuggestFooter;
    footer.textContent = items.length ? 'View all results' : `Search “${query}”`;
    footer.addEventListener('click', () => {
      const base = `${this.getWebUrl()}/_layouts/15/search.aspx`;
      window.location.href = `${base}?q=${encodeURIComponent(query)}`;
    });

    host.appendChild(list);
    host.appendChild(footer);

    this.attachUnder.appendChild(host);
    this.activeIndex = -1;
    this.updatePosition();
  }

  updatePosition(): void {
    if (!this.host) return;
    const input = document.getElementById('tir-search') as HTMLElement | null;
    if (!input) return;
    const rect = input.getBoundingClientRect();
    this.host.style.position = 'fixed';
    this.host.style.left = '50%';
    this.host.style.transform = 'translateX(-50%)';
    this.host.style.top = `${Math.round(rect.bottom + 8)}px`;
  }

  moveActive(action: 'up' | 'down' | 'enter'): boolean {
    if (!this.host) return false;
    const rows = Array.prototype.slice.call(
      this.host.querySelectorAll<HTMLElement>(`.${styles.TIRSuggestItem}[aria-disabled!="true"]`)
    ) as HTMLElement[];
    if (!rows.length) return false;

    if (action === 'enter') {
      if (this.activeIndex < 0 || this.activeIndex >= rows.length) return false;
      const url = rows[this.activeIndex].getAttribute('data-url') || '#';
      if (url && url !== '#') { window.location.href = url; return true; }
      return false;
    }

    if (this.activeIndex >= 0 && this.activeIndex < rows.length) {
      rows[this.activeIndex].setAttribute('aria-selected', 'false');
    }
    if (action === 'down') this.activeIndex = (this.activeIndex + 1) % rows.length;
    if (action === 'up')   this.activeIndex = (this.activeIndex - 1 + rows.length) % rows.length;

    rows[this.activeIndex].setAttribute('aria-selected', 'true');
    rows[this.activeIndex].scrollIntoView({ block: 'nearest' });
    return true;
  }
}
