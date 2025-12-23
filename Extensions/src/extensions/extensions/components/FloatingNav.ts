// import styles from '../Extension.module.scss';

// export interface INavItem {
//   id: string;
//   label: string;
//   icon: string;
//   url: string;
// }

// export class FloatingNav {
//   private hostElementId?: string;
//   private floatingNavigationElement?: HTMLElement;
//   private rAF?: number;
//   private io?: IntersectionObserver;
//   private ro?: ResizeObserver;
//   private footerEl: HTMLElement | null = null;

//   // ↓ tighter gap above footer
//   private readonly gapAboveFooterPx = 8;

//   private handleScrollOrResize = () => this.scheduleRecompute();

//   /**
//    * Decide whether a given nav item's URL should be considered "active"
//    * for the current page.
//    */
//   private isActiveUrl(targetUrl: string): boolean {
//     if (!targetUrl) return false;

//     try {
//       const current = new URL(window.location.href);
//       const currentPath = current.pathname.replace(/\/$/, '').toLowerCase();

//       const target = new URL(targetUrl, current.origin);
//       const targetPath = target.pathname.replace(/\/$/, '').toLowerCase();
//       if (targetPath === currentPath) return true;
//       const currentAbs = (current.origin + current.pathname).toLowerCase();
//       const targetAbs = (target.origin + target.pathname).toLowerCase();
//       return currentAbs === targetAbs;
//     } catch {
//       const normCurrent = window.location.href.split('#')[0].toLowerCase();
//       const normTarget = targetUrl.split('#')[0].toLowerCase();
//       return normCurrent.indexOf(normTarget) >= 0;
//     }
//   }

//   public render(hostId: string, navigationItems: INavItem[]): void {
//     if (document.getElementById(hostId)) return;
//     if (!navigationItems?.length) return;

//     const navigationHtml = `
//       <nav class="${styles.TIRFloatingNav}" role="navigation" aria-label="Primary">
//         <div class="${styles.TIRButtonGroup}">
//           ${navigationItems
//             .map(item => {
//               const isActive = this.isActiveUrl(item.url);
//               const activeClass = isActive ? ` ${styles.TIRNavItemActive}` : '';

//               return `
//             <a class="${styles.TIRNavItem}${activeClass}" href="${item.url}">
//               ${item.icon ? `<img src="${item.icon}" class="${styles.TIRNavIcon}" alt="" aria-hidden="true" />` : ''}
//               <span class="${styles.TIRNavLabel}">${item.label}</span>
//             </a>`;
//             })
//             .join('')}
//         </div>
//       </nav>`;

//     const host = document.createElement('div');
//     host.id = hostId;
//     host.innerHTML = navigationHtml;

//     const mount =
//       (document.querySelector('#spPageCanvasContent') as HTMLElement) ||
//       (document.querySelector('#spPageChromeAppDiv') as HTMLElement) ||
//       document.body;

//     mount.appendChild(host);

//     this.hostElementId = hostId;
//     this.floatingNavigationElement = host.querySelector(`.${styles.TIRFloatingNav}`) as HTMLElement;

//     this.footerEl = this.resolveFooterElement();
//     this.installObservers();
//     this.recomputeLift();

//     window.addEventListener('scroll', this.handleScrollOrResize, { passive: true });
//     window.addEventListener('resize', this.handleScrollOrResize);
//   }

//   public dispose(): void {
//     if (this.rAF) cancelAnimationFrame(this.rAF);
//     window.removeEventListener('scroll', this.handleScrollOrResize);
//     window.removeEventListener('resize', this.handleScrollOrResize);
//     this.io?.disconnect();
//     this.ro?.disconnect();
//     if (this.hostElementId) document.getElementById(this.hostElementId)?.remove();
//     this.floatingNavigationElement = undefined;
//     this.hostElementId = undefined;
//     this.footerEl = null;
//     this.io = undefined;
//     this.ro = undefined;
//     this.rAF = undefined;
//   }

//   private installObservers(): void {
//     if (this.footerEl && !this.io) {
//       this.io = new IntersectionObserver(() => this.scheduleRecompute(), { root: null, threshold: [0, 1] });
//       this.io.observe(this.footerEl);
//     }
//     if (this.footerEl && 'ResizeObserver' in window && !this.ro) {
//       this.ro = new ResizeObserver(() => this.scheduleRecompute());
//       this.ro.observe(this.footerEl);
//     }
//     const mo = new MutationObserver(() => {
//       const f = this.resolveFooterElement();
//       if (f && f !== this.footerEl) {
//         this.footerEl = f;
//         this.io?.disconnect(); this.ro?.disconnect();
//         this.io = undefined; this.ro = undefined;
//         this.installObservers();
//         this.scheduleRecompute();
//       }
//     });
//     mo.observe(document.body, { childList: true, subtree: true });
//     setTimeout(() => mo.disconnect(), 5000);
//   }

//   private scheduleRecompute(): void {
//     if (this.rAF) cancelAnimationFrame(this.rAF);
//     this.rAF = requestAnimationFrame(() => this.recomputeLift());
//   }

//   private recomputeLift(): void {
//     if (!this.floatingNavigationElement) return;
//     let raise = 0;
//     if (this.footerEl) {
//       const vh = window.innerHeight || document.documentElement.clientHeight;
//       const rect = this.footerEl.getBoundingClientRect();
//       const overlap = Math.max(0, vh - rect.top);
//       if (overlap > 0) raise = overlap + this.gapAboveFooterPx;
//     }
//     this.floatingNavigationElement.style.setProperty('--float-raise', `${raise}px`);
//   }

//   private resolveFooterElement(): HTMLElement | null {
//     return (
//       (document.querySelector(`.${styles.TIRFooter}`) as HTMLElement) ||
//       (document.querySelector('.simpleFooterContainer') as HTMLElement) ||
//       (document.querySelector('[data-automationid="SimpleFooter"]') as HTMLElement) ||
//       (document.querySelector('[data-feature-tag*="SiteFooter"]') as HTMLElement) ||
//       (document.querySelector('footer.p_HGBX5_1x34n') as HTMLElement) ||
//       null
//     );
//   }
// }


























import styles from "../Extension.module.scss";

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

  private listenersWired = false;

  private footerMO?: MutationObserver;

  // tighter gap above footer
  private readonly gapAboveFooterPx = 8;

  private handleScrollOrResize = () => this.scheduleRecompute();

  private normalizePath(p: string): string {
    if (!p) return "/";
    try {
      p = decodeURIComponent(p);
    } catch {
      // ignore
    }
    p = p.toLowerCase();
    p = p.split("?")[0].split("#")[0];
    p = p.replace(/\.aspx$/, "");
    p = p.length > 1 ? p.replace(/\/$/, "") : p;
    return p || "/";
  }

  /** Robust active check (works with full URL / relative URL / SPA navigation) */
  private isActiveUrl(targetUrl: string): boolean {
    if (!targetUrl) return false;

    try {
      const current = new URL(window.location.href);
      const target = new URL(targetUrl, current.origin);

      const cPath = this.normalizePath(current.pathname);
      const tPath = this.normalizePath(target.pathname);

      return cPath === tPath;
    } catch {
      const c = this.normalizePath(window.location.pathname);
      const t = this.normalizePath(targetUrl);
      return c === t;
    }
  }

  /** Signature to prevent MutationObserver feedback loops */
  private buildSig(items: INavItem[]): string {
    const path = this.normalizePath(window.location.pathname);
    const itemsSig = items
      .map((i) => `${i.id}|${i.label}|${i.url}|${i.icon}`)
      .join("||");
    return `${path}::${itemsSig}`;
  }

  private buildButtonsHtml(items: INavItem[]): string {
    return items
      .map((item) => {
        const active = this.isActiveUrl(item.url);
        const activeClass = active ? ` ${styles.TIRNavItemActive}` : "";
        return `
          <a class="${styles.TIRNavItem}${activeClass}" href="${item.url}">
            ${
              item.icon
                ? `<img src="${item.icon}" class="${styles.TIRNavIcon}" alt="" aria-hidden="true" />`
                : ""
            }
            <span class="${styles.TIRNavLabel}">${item.label}</span>
          </a>`;
      })
      .join("");
  }

  private buildNavHtml(items: INavItem[]): string {
    return `
      <nav class="${styles.TIRFloatingNav}" role="navigation" aria-label="Primary">
        <div class="${styles.TIRButtonGroup}">
          ${this.buildButtonsHtml(items)}
        </div>
      </nav>`;
  }

  public render(hostId: string, navigationItems: INavItem[]): void {
    if (!navigationItems?.length) return;

    const sig = this.buildSig(navigationItems);

    const existingHost = document.getElementById(hostId);

    // If host exists, do NOT touch DOM unless signature changed
    if (existingHost) {
      this.neutralizeHost(existingHost);

      const prevSig = existingHost.getAttribute("data-tir-nav-sig") || "";

      this.hostElementId = hostId;
      this.floatingNavigationElement = existingHost.querySelector(
        `.${styles.TIRFloatingNav}`
      ) as HTMLElement;

      // Only update markup if nav actually needs change (prevents infinite loops)
      if (prevSig !== sig) {
        const group = existingHost.querySelector(
          `.${styles.TIRButtonGroup}`
        ) as HTMLElement | null;

        if (group) group.innerHTML = this.buildButtonsHtml(navigationItems);
        else existingHost.innerHTML = this.buildNavHtml(navigationItems);

        existingHost.setAttribute("data-tir-nav-sig", sig);

        // re-grab in case nav was re-rendered
        this.floatingNavigationElement = existingHost.querySelector(
          `.${styles.TIRFloatingNav}`
        ) as HTMLElement;
      }

      // pointer safety
      if (this.floatingNavigationElement) {
        (this.floatingNavigationElement as HTMLElement).style.pointerEvents = "auto";
      }

      this.footerEl = this.resolveFooterElement();
      this.installObservers();
      this.ensureListeners();
      this.recomputeLift();
      return;
    }

    // Create new
    const host = document.createElement("div");
    host.id = hostId;
    host.innerHTML = this.buildNavHtml(navigationItems);
    host.setAttribute("data-tir-nav-sig", sig);

    this.neutralizeHost(host);
    document.body.appendChild(host);

    this.hostElementId = hostId;
    this.floatingNavigationElement = host.querySelector(`.${styles.TIRFloatingNav}`) as HTMLElement;

    // pointer safety
    host.style.pointerEvents = "none";
    if (this.floatingNavigationElement) {
      this.floatingNavigationElement.style.pointerEvents = "auto";
    }

    this.footerEl = this.resolveFooterElement();
    this.installObservers();
    this.ensureListeners();
    this.recomputeLift();
  }

  public dispose(): void {
    if (this.rAF) cancelAnimationFrame(this.rAF);

    if (this.listenersWired) {
      window.removeEventListener("scroll", this.handleScrollOrResize);
      window.removeEventListener("resize", this.handleScrollOrResize);
      this.listenersWired = false;
    }

    this.io?.disconnect();
    this.ro?.disconnect();
    this.footerMO?.disconnect();
    this.footerMO = undefined;

    if (this.hostElementId) document.getElementById(this.hostElementId)?.remove();

    this.floatingNavigationElement = undefined;
    this.hostElementId = undefined;
    this.footerEl = null;
    this.io = undefined;
    this.ro = undefined;
    this.rAF = undefined;
  }

  private ensureListeners(): void {
    if (this.listenersWired) return;
    window.addEventListener("scroll", this.handleScrollOrResize, { passive: true });
    window.addEventListener("resize", this.handleScrollOrResize);
    this.listenersWired = true;
  }

  private neutralizeHost(host: HTMLElement): void {
    host.style.position = "fixed";
    host.style.left = "0";
    host.style.top = "0";
    host.style.width = "0";
    host.style.height = "0";
    host.style.zIndex = "10000";
    host.style.pointerEvents = "none"; // IMPORTANT: never block page clicks
  }

  private installObservers(): void {
    if (this.footerEl && !this.io) {
      this.io = new IntersectionObserver(() => this.scheduleRecompute(), {
        root: null,
        threshold: [0, 1],
      });
      this.io.observe(this.footerEl);
    }

    if (this.footerEl && "ResizeObserver" in window && !this.ro) {
      this.ro = new ResizeObserver(() => this.scheduleRecompute());
      this.ro.observe(this.footerEl);
    }

    // Keep only ONE footer mutation observer (avoid leaks)
    if (!this.footerMO) {
      this.footerMO = new MutationObserver(() => {
        const f = this.resolveFooterElement();
        if (f && f !== this.footerEl) {
          this.footerEl = f;
          this.io?.disconnect();
          this.ro?.disconnect();
          this.io = undefined;
          this.ro = undefined;
          this.installObservers();
          this.scheduleRecompute();
        }
      });

      this.footerMO.observe(document.body, { childList: true, subtree: true });
    }
  }

  private scheduleRecompute(): void {
    if (this.rAF) cancelAnimationFrame(this.rAF);
    this.rAF = requestAnimationFrame(() => this.recomputeLift());
  }

  /**
   * Lift ONLY when footer would collide with nav (not when footer becomes visible).
   */
  private recomputeLift(): void {
    if (!this.floatingNavigationElement) return;

    let raise = 0;

    if (this.footerEl) {
      const footerRect = this.footerEl.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;

      const cs = window.getComputedStyle(this.floatingNavigationElement);
      const bottomRaw = cs.bottom || "0";
      const bottom = parseFloat(bottomRaw);
      const bottomPx = Number.isFinite(bottom) ? bottom : 0;

      const navBottomY = vh - bottomPx; // baseline nav bottom line at raise=0

      const needed = (navBottomY + this.gapAboveFooterPx) - footerRect.top;
      if (needed > 0) raise = needed;
    }

    this.floatingNavigationElement.style.setProperty("--float-raise", `${Math.ceil(raise)}px`);
  }

  private resolveFooterElement(): HTMLElement | null {
    return (
      (document.querySelector(`.${styles.TIRFooter}`) as HTMLElement) ||
      (document.querySelector(".simpleFooterContainer") as HTMLElement) ||
      (document.querySelector('[data-automationid="SimpleFooter"]') as HTMLElement) ||
      (document.querySelector('[data-feature-tag*="SiteFooter"]') as HTMLElement) ||
      (document.querySelector("footer.p_HGBX5_1x34n") as HTMLElement) ||
      null
    );
  }
}
