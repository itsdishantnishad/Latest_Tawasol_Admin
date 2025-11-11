// import styles from '../Extension.module.scss';

// export interface INavItem { id: string; label: string; icon: string; url: string; }

// export class FloatingNav {
//   public render(hostId: string, items: INavItem[]): void {
//     if (document.getElementById(hostId)) return;
//     if (!items || !items.length) return; // no items => no UI

//     const html = `
//       <nav class="${styles.TIRFloatingNav}" role="navigation" aria-label="Primary">
//         <div class="${styles.TIRButtonGroup}">
//           ${items.map(i => `
//             <a class="${styles.TIRNavItem}" href="${i.url}">
//               ${i.icon ? `<img src="${i.icon}" class="${styles.TIRNavIcon}" alt="" aria-hidden="true" />` : ''}
//               <span class="${styles.TIRNavLabel}">${i.label}</span>
//             </a>
//           `).join('')}
//         </div>
//       </nav>`;

//     const host = document.createElement('div');
//     host.id = hostId;
//     host.innerHTML = html;

//     // mount inside modern canvas if present (avoids extra scroll host)
//     const mount =
//       (document.querySelector('#spPageCanvasContent') as HTMLElement) ||
//       (document.querySelector('#spPageChromeAppDiv') as HTMLElement) ||
//       document.body;
//     mount.appendChild(host);
//   }

//   public dispose(): void {
//     document.querySelector(`.${styles.TIRFloatingNav}`)?.parentElement?.remove();
//   }
// }





















import styles from '../Extension.module.scss';

export interface INavItem {
  id: string;
  label: string;
  icon: string;
  url: string;
}

export class FloatingNav {
  private hostElementId?: string;
  private floatingNavigationElement?: HTMLElement;
  private rAF?: number;
  private io?: IntersectionObserver;
  private ro?: ResizeObserver;
  private footerEl: HTMLElement | null = null;

  // ↓ tighter gap above footer
  private readonly gapAboveFooterPx = 8;

  private handleScrollOrResize = () => this.scheduleRecompute();

  public render(hostId: string, navigationItems: INavItem[]): void {
    if (document.getElementById(hostId)) return;
    if (!navigationItems?.length) return;

    const navigationHtml = `
      <nav class="${styles.TIRFloatingNav}" role="navigation" aria-label="Primary">
        <div class="${styles.TIRButtonGroup}">
          ${navigationItems.map(item => `
            <a class="${styles.TIRNavItem}" href="${item.url}">
              ${item.icon ? `<img src="${item.icon}" class="${styles.TIRNavIcon}" alt="" aria-hidden="true" />` : ''}
              <span class="${styles.TIRNavLabel}">${item.label}</span>
            </a>
          `).join('')}
        </div>
      </nav>`;

    const host = document.createElement('div');
    host.id = hostId;
    host.innerHTML = navigationHtml;

    const mount =
      (document.querySelector('#spPageCanvasContent') as HTMLElement) ||
      (document.querySelector('#spPageChromeAppDiv') as HTMLElement) ||
      document.body;

    mount.appendChild(host);

    this.hostElementId = hostId;
    this.floatingNavigationElement = host.querySelector(`.${styles.TIRFloatingNav}`) as HTMLElement;

    this.footerEl = this.resolveFooterElement();
    this.installObservers();
    this.recomputeLift();

    window.addEventListener('scroll', this.handleScrollOrResize, { passive: true });
    window.addEventListener('resize', this.handleScrollOrResize);
  }

  public dispose(): void {
    if (this.rAF) cancelAnimationFrame(this.rAF);
    window.removeEventListener('scroll', this.handleScrollOrResize);
    window.removeEventListener('resize', this.handleScrollOrResize);
    this.io?.disconnect();
    this.ro?.disconnect();
    if (this.hostElementId) document.getElementById(this.hostElementId)?.remove();
    this.floatingNavigationElement = undefined;
    this.hostElementId = undefined;
    this.footerEl = null;
    this.io = undefined;
    this.ro = undefined;
    this.rAF = undefined;
  }

  private installObservers(): void {
    if (this.footerEl && !this.io) {
      this.io = new IntersectionObserver(() => this.scheduleRecompute(), { root: null, threshold: [0, 1] });
      this.io.observe(this.footerEl);
    }
    if (this.footerEl && 'ResizeObserver' in window && !this.ro) {
      this.ro = new ResizeObserver(() => this.scheduleRecompute());
      this.ro.observe(this.footerEl);
    }
    const mo = new MutationObserver(() => {
      const f = this.resolveFooterElement();
      if (f && f !== this.footerEl) {
        this.footerEl = f;
        this.io?.disconnect(); this.ro?.disconnect();
        this.io = undefined; this.ro = undefined;
        this.installObservers();
        this.scheduleRecompute();
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => mo.disconnect(), 5000);
  }

  private scheduleRecompute(): void {
    if (this.rAF) cancelAnimationFrame(this.rAF);
    this.rAF = requestAnimationFrame(() => this.recomputeLift());
  }

  private recomputeLift(): void {
    if (!this.floatingNavigationElement) return;
    let raise = 0;
    if (this.footerEl) {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const rect = this.footerEl.getBoundingClientRect();
      const overlap = Math.max(0, vh - rect.top);
      if (overlap > 0) raise = overlap + this.gapAboveFooterPx;
    }
    this.floatingNavigationElement.style.setProperty('--float-raise', `${raise}px`);
  }

  private resolveFooterElement(): HTMLElement | null {
    return (
      (document.querySelector(`.${styles.TIRFooter}`) as HTMLElement) ||
      (document.querySelector('.simpleFooterContainer') as HTMLElement) ||
      (document.querySelector('[data-automationid="SimpleFooter"]') as HTMLElement) ||
      (document.querySelector('[data-feature-tag*="SiteFooter"]') as HTMLElement) ||
      (document.querySelector('footer.p_HGBX5_1x34n') as HTMLElement) ||
      null
    );
  }
}
