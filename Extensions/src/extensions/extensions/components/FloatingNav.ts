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

  private urlWatcherWired = false;
  private readonly handleUrlChange = () => this.refreshActiveState();

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

  private escapeHtml(v: string): string {
    return (v || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  private toAbsoluteUrl(rawUrl: string): string {
    if (!rawUrl) return "";
    try {
      // Resolve against current page URL (handles relative, site-relative, absolute)
      return new URL(rawUrl, window.location.href).href;
    } catch {
      if (rawUrl.startsWith("/")) return rawUrl;
      return `/${rawUrl}`;
    }
  }

  private isActiveUrl(targetUrl: string): boolean {
    if (!targetUrl) return false;

    try {
      const current = new URL(window.location.href);
      const target = new URL(targetUrl, current.href);

      const cPath = this.normalizePath(current.pathname);
      const tPath = this.normalizePath(target.pathname);

      return cPath === tPath;
    } catch {
      const c = this.normalizePath(window.location.pathname);
      const t = this.normalizePath(targetUrl);
      return c === t;
    }
  }

  private buildSig(items: INavItem[]): string {
    const path = this.normalizePath(window.location.pathname);
    const itemsSig = items.map((i) => `${i.id}|${i.label}|${i.url}|${i.icon}`).join("||");
    return `${path}::${itemsSig}`;
  }

  private buildButtonsHtml(items: INavItem[]): string {
    return items
      .map((item) => {
        const href = this.toAbsoluteUrl(item.url);
        const active = this.isActiveUrl(href);
        const activeClass = active ? ` ${styles.TIRNavItemActive}` : "";
        const safeLabel = this.escapeHtml(item.label);

        // IMPORTANT: disables SharePoint soft navigation -> forces full load (prevents shimmer stuck)
        const ariaCurrent = active ? ' aria-current="page"' : "";

        return `
          <a class="${styles.TIRNavItem}${activeClass}"
             href="${href}"
             data-interception="off"${ariaCurrent}>
            ${
              item.icon
                ? `<img src="${this.escapeHtml(item.icon)}" class="${styles.TIRNavIcon}" alt="" aria-hidden="true" />`
                : ""
            }
            <span class="${styles.TIRNavLabel}">${safeLabel}</span>
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

    document.body.classList.add("tir-has-floating-nav");

    const sig = this.buildSig(navigationItems);
    const existingHost = document.getElementById(hostId);

    if (existingHost) {
      this.neutralizeHost(existingHost);

      const prevSig = existingHost.getAttribute("data-tir-nav-sig") || "";

      this.hostElementId = hostId;
      this.floatingNavigationElement = existingHost.querySelector(
        `.${styles.TIRFloatingNav}`
      ) as HTMLElement;

      if (prevSig !== sig) {
        const group = existingHost.querySelector(`.${styles.TIRButtonGroup}`) as HTMLElement | null;

        if (group) group.innerHTML = this.buildButtonsHtml(navigationItems);
        else existingHost.innerHTML = this.buildNavHtml(navigationItems);

        existingHost.setAttribute("data-tir-nav-sig", sig);

        this.floatingNavigationElement = existingHost.querySelector(
          `.${styles.TIRFloatingNav}`
        ) as HTMLElement;
      }

      if (this.floatingNavigationElement) {
        this.floatingNavigationElement.style.pointerEvents = "auto";
      }

      this.footerEl = this.resolveFooterElement();
      this.installObservers();
      this.ensureListeners();
      this.ensureUrlWatcher();
      return;
    }

    const host = document.createElement("div");
    host.id = hostId;
    host.innerHTML = this.buildNavHtml(navigationItems);
    host.setAttribute("data-tir-nav-sig", sig);

    this.neutralizeHost(host);
    document.body.appendChild(host);

    this.hostElementId = hostId;
    this.floatingNavigationElement = host.querySelector(`.${styles.TIRFloatingNav}`) as HTMLElement;

    host.style.pointerEvents = "none";
    if (this.floatingNavigationElement) this.floatingNavigationElement.style.pointerEvents = "auto";

    this.footerEl = this.resolveFooterElement();
    this.installObservers();
    this.ensureListeners();
    this.ensureUrlWatcher();
  }

  public dispose(): void {
    if (this.rAF) cancelAnimationFrame(this.rAF);

    if (this.listenersWired) {
      window.removeEventListener("scroll", this.handleScrollOrResize);
      window.removeEventListener("resize", this.handleScrollOrResize);
      this.listenersWired = false;
    }

    if (this.urlWatcherWired) {
      window.removeEventListener("popstate", this.handleUrlChange);
      window.removeEventListener("hashchange", this.handleUrlChange);
      this.urlWatcherWired = false;
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

    document.body.classList.remove("tir-has-floating-nav");
  }

  private ensureListeners(): void {
    if (this.listenersWired) return;
    window.addEventListener("scroll", this.handleScrollOrResize, { passive: true });
    window.addEventListener("resize", this.handleScrollOrResize);
    this.listenersWired = true;
  }

  private ensureUrlWatcher(): void {
    if (this.urlWatcherWired) return;

    window.addEventListener("popstate", this.handleUrlChange);
    window.addEventListener("hashchange", this.handleUrlChange);

    // Patch history to detect SPA URL changes
    const w = window as any;
    if (!w.__tir_history_patched__) {
      w.__tir_history_patched__ = true;

      const origPush = history.pushState;
      history.pushState = function (...args: any[]) {
        const ret = origPush.apply(this, args as any);
        window.dispatchEvent(new Event("popstate"));
        return ret;
      } as any;

      const origReplace = history.replaceState;
      history.replaceState = function (...args: any[]) {
        const ret = origReplace.apply(this, args as any);
        window.dispatchEvent(new Event("popstate"));
        return ret;
      } as any;
    }

    this.urlWatcherWired = true;
  }

  private refreshActiveState(): void {
    const hostId = this.hostElementId;
    if (!hostId) return;

    const host = document.getElementById(hostId);
    if (!host) return;

    const links = Array.from(host.querySelectorAll(`a.${styles.TIRNavItem}`)) as HTMLAnchorElement[];
    const current = window.location.href;

    links.forEach((a) => {
      const href = a.getAttribute("href") || "";
      let abs = href;
      try {
        abs = new URL(href, current).href;
      } catch {
        // ignore
      }

      const active = this.isActiveUrl(abs);

      if (active) {
        a.classList.add(styles.TIRNavItemActive);
        a.setAttribute("aria-current", "page");
      } else {
        a.classList.remove(styles.TIRNavItemActive);
        a.removeAttribute("aria-current");
      }
    });
  }

  private neutralizeHost(host: HTMLElement): void {
    host.style.position = "fixed";
    host.style.left = "0";
    host.style.top = "0";
    host.style.width = "0";
    host.style.height = "0";
    host.style.zIndex = "10000";
    host.style.pointerEvents = "none";
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
    // lift logic intentionally disabled
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
