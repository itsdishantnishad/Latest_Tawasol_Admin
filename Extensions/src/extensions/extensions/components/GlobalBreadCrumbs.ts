// import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
// import { SPHttpClient } from "@microsoft/sp-http";

// export class GlobalBreadcrumbs {
//     private readonly _ctx: ApplicationCustomizerContext;

//     private _breadcrumbHostId = "tir-global-breadcrumb-host";
//     private _breadcrumbBleedId = "tir-global-breadcrumb-bleed";
//     private _breadcrumbStylesInjected = false;

//     private readonly _breadcrumbCSS = `
// .__gbc_row{display:inline-flex;align-items:center;gap:20px;height:22px;margin-bottom:0px; font-family:'Inter',sans-serif;}
// .__gbc_back{display:inline-flex;align-items:center;gap:6px;background:none;border:0;padding:0;cursor:pointer; font-size:14px;line-height:24px;letter-spacing:0;color:#000;font-weight:400;}
// .__gbc_back:hover{opacity:.7;}
// .__gbc_back svg{width:18px;height:18px;display:block}
// .__gbc_divider{width:1px;height:16px;background:rgba(58,59,67,.35)}
// .__gbc_wrap{display:inline-flex;align-items:center;gap:10px;height:22px; font-size:14px;line-height:22px;letter-spacing:0;color:#3A3B43;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
// .__gbc_link{color:#A7A7A7;font-weight:400;text-decoration:none;cursor:pointer;font-size:14px;line-height:22px;}
// .__gbc_link:hover{text-decoration:underline}
// .__gbc_sep{color:#B9BCC3;opacity:1;margin:0 2px;user-select:none}
// .__gbc_current{color:#3A3B43;font-weight:500;font-size:14px;line-height:22px;}
// `;

//     private readonly _backSvg =
//         `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.25 19.25L7.75 12l6.5-7.25" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

//     constructor(context: ApplicationCustomizerContext) {
//         this._ctx = context;
//     }

//     /** call once from onInit */
//     public init(): void {
//         // optional: render immediately
//         void this.renderIfNeededSafe();
//     }

//     /** call on every navigation */
//     public onNavigated(): void {
//         void this.renderIfNeededSafe();
//     }

//     /** call from onDispose */
//     public dispose(): void {
//         this.unmount();
//     }

//     // ------------------ internal ------------------

//     private ensureStyles(): void {
//         if (this._breadcrumbStylesInjected) return;
//         if (document.querySelector('style[data-global-breadcrumbs="1"]')) {
//             this._breadcrumbStylesInjected = true;
//             return;
//         }

//         const s = document.createElement("style");
//         s.setAttribute("data-global-breadcrumbs", "1");
//         s.appendChild(document.createTextNode(this._breadcrumbCSS));
//         document.head.appendChild(s);
//         this._breadcrumbStylesInjected = true;
//     }

//     private isSitePagesUrl(): boolean {
//         return (window.location.pathname || "").toLowerCase().includes("/sitepages/");
//     }

//     private isHomePage(): boolean {
//         const p = (window.location.pathname || "").toLowerCase();
//         return p.endsWith("/sitepages/home.aspx") || (!p.includes("/sitepages/") && p.endsWith("/"));
//     }

//     private isHelpCenterPage(): boolean {
//         let p = window.location.pathname || "";
//         try { p = decodeURIComponent(p); } catch { }
//         p = p.toLowerCase();
//         return p.endsWith("/sitepages/help-center.aspx")
//             || p.endsWith("/sitepages/tirhelpcenter.aspx");
//     }

//     private isOfferBenefitsPage(): boolean {
//         let p = window.location.pathname || "";
//         try { p = decodeURIComponent(p); } catch { }
//         p = p.toLowerCase();

//         return p.endsWith("/sitepages/offers-&-benifits.aspx");
//     }

//     private isBeverageMenuPage(): boolean {
//         let p = window.location.pathname || "";
//         try { p = decodeURIComponent(p); } catch { }
//         p = p.toLowerCase();

//         return p.endsWith("/sitepages/beverages.aspx");
//     }



//     private isTasksPage(): boolean {
//         let p = window.location.pathname || "";
//         try { p = decodeURIComponent(p); } catch { }
//         p = p.toLowerCase();
//         return p.endsWith("/sitepages/tasks.aspx") || p.endsWith("/sitepages/taskapproval.aspx");
//     }
//     private isPolicyProcedurePage(): boolean {
//         let p = window.location.pathname || "";
//         try { p = decodeURIComponent(p); } catch { }
//         p = p.toLowerCase();
//         return p.endsWith("/sitepages/policies-and-procedures.aspx");
//     }

//     private isLetsCelebratePage(): boolean {
//         let p = window.location.pathname || "";
//         try { p = decodeURIComponent(p); } catch { }
//         p = p.toLowerCase();
//         return p.includes("/sitepages/lets-celebrate.aspx");
//     }

//     private isDashboardPage(): boolean {
//         let p = window.location.pathname || "";
//         try { p = decodeURIComponent(p); } catch { }
//         p = p.toLowerCase();
//         return p.includes("/sitepages/dashboards.aspx"); 
//     }

//     private isGalleryPage(): boolean {
//         let p = window.location.pathname || "";
//         try { p = decodeURIComponent(p); } catch { }
//         p = p.toLowerCase();
//         return p.endsWith("/sitepages/dhre-gallery.aspx");
//     }

//      private isFormsLibraryPage(): boolean {
//         let p = window.location.pathname || "";
//         try { p = decodeURIComponent(p); } catch { }
//         p = p.toLowerCase();
//         return p.includes("/sitepages/forms-library.aspx");
//     }

//      private isAboutDhrePage(): boolean {
//         let p = window.location.pathname || "";
//         try { p = decodeURIComponent(p); } catch { }
//         p = p.toLowerCase();
//         return p.includes("/sitepages/about-dhre.aspx");
//     }

//     private isProfilePage():boolean {
//         let p = window.location.pathname || "";
//         try { p = decodeURIComponent(p); } catch { }
//         p = p.toLowerCase();
//         return p.includes("/sitepages/profile.aspx");
//     }


//     private getModernPageTitle(): string {
//         const h1 =
//             document.querySelector('h1[data-automation-id="pageHeaderTitle"]') ||
//             document.querySelector("h1.od-TitleText") ||
//             document.querySelector("h1");

//         const t = (h1?.textContent || "").trim();
//         if (t) return t;

//         const docTitle = (document.title || "").trim();
//         return docTitle ? (docTitle.split(" - ")[0] || docTitle).trim() : "Details";
//     }

//     private ensureHost(): HTMLElement | null {
//         let container =
//             (document.querySelector('[data-automation-id="TitleRegion"]') as HTMLElement | null) ||
//             (document.querySelector('[data-automation-id="contentScrollRegion"]') as HTMLElement | null) ||
//             (document.querySelector(".CanvasZone") as HTMLElement | null) ||
//             (document.querySelector('[data-automation-id="CanvasSection"]') as HTMLElement | null) ||
//             (document.querySelector("main") as HTMLElement | null) ||
//             (document.querySelector('[class*="Canvas"]') as HTMLElement | null);

//         if (!container) return null;

//         // full-bleed wrapper (only for breadcrumb)
//         let bleed = document.getElementById(this._breadcrumbBleedId) as HTMLElement | null;
//         if (!bleed) {
//             bleed = document.createElement("div");
//             bleed.id = this._breadcrumbBleedId;

//             Object.assign(bleed.style, {
//                 width: "100vw",
//                 marginLeft: "calc(50% - 50vw)",
//                 marginRight: "calc(50% - 50vw)",
//                 boxSizing: "border-box",
//                 overflowX: "clip",
//                 background: "transparent"
//             });
//         }

//         let host = document.getElementById(this._breadcrumbHostId) as HTMLElement | null;
//         if (!host) {
//             host = document.createElement("div");
//             host.id = this._breadcrumbHostId;
//         }

//         // keep your same host sizing
//         Object.assign(host.style, {
//             display: "block",
//             boxSizing: "border-box",
//             width: "100%",
//             maxWidth: "none",
//             margin: "20px 0 0",
//             padding: "0 60px",
//             background: "transparent"
//         });

//         if (host.parentElement !== bleed) bleed.appendChild(host);

//         if (bleed.parentElement !== container) {
//             container.prepend(bleed);
//         } else if (container.firstElementChild !== bleed) {
//             container.prepend(bleed);
//         }

//         return host;
//     }

//     private unmount(): void {
//         const bleed = document.getElementById(this._breadcrumbBleedId);
//         if (bleed) {
//             try { bleed.remove(); } catch { }
//             return;
//         }
//         const host = document.getElementById(this._breadcrumbHostId);
//         if (host) {
//             try { host.remove(); } catch { }
//         }
//     }

//     private goBack = (ev?: Event): void => {
//         try { ev?.preventDefault(); } catch { }
//         window.history.back();
//     };

//     private async getCurrentSitePageInfo(): Promise<{ title: string; isNews: boolean; contentType?: string; }> {
//         try {
//             const webUrl = (this._ctx?.pageContext?.web?.absoluteUrl || "").replace(/\/$/, "");
//             let serverRel = window.location.pathname || "";
//             try { serverRel = decodeURIComponent(serverRel); } catch { }
//             serverRel = serverRel.replace(/'/g, "''");

//             if (!webUrl || !serverRel) return { title: "", isNews: false };

//             const api =
//                 `${webUrl}/_api/web/GetFileByServerRelativePath(decodedurl='${serverRel}')/ListItemAllFields` +
//                 `?$select=Title,PromotedState,ContentType/Name&$expand=ContentType`;

//             const res = await this._ctx.spHttpClient.get(api, SPHttpClient.configurations.v1);
//             if (!res.ok) return { title: "", isNews: false };

//             const data = (await res.json()) as any;
//             const title = String(data?.Title || "").trim();
//             const ctName = String(data?.ContentType?.Name || "").toLowerCase();
//             const promoted = Number(data?.PromotedState);

//             return {
//                 title,
//                 isNews: promoted === 2 || ctName.includes("news"),
//                 contentType: data?.ContentType?.Name
//             };
//         } catch {
//             return { title: "", isNews: false };
//         }
//     }

//     private buildDom(host: HTMLElement, section: string, current: string): void {
//         host.innerHTML = "";

//         const row = document.createElement("div");
//         row.className = "__gbc_row";

//         const backBtn = document.createElement("button");
//         backBtn.className = "__gbc_back";
//         backBtn.type = "button";
//         backBtn.addEventListener("click", this.goBack);

//         const svgSpan = document.createElement("span");
//         svgSpan.setAttribute("aria-hidden", "true");
//         svgSpan.innerHTML = this._backSvg;

//         const backText = document.createElement("span");
//         backText.textContent = "Back";

//         backBtn.appendChild(svgSpan);
//         backBtn.appendChild(backText);

//         const divider = document.createElement("span");
//         divider.className = "__gbc_divider";
//         divider.setAttribute("aria-hidden", "true");

//         const nav = document.createElement("nav");
//         nav.className = "__gbc_wrap";

//         const sectionLink = document.createElement("a");
//         sectionLink.href = "#";
//         sectionLink.className = "__gbc_link";
//         sectionLink.textContent = section;
//         sectionLink.addEventListener("click", this.goBack);

//         const sep = document.createElement("span");
//         sep.className = "__gbc_sep";
//         sep.textContent = "›";

//         const currentSpan = document.createElement("span");
//         currentSpan.className = "__gbc_current";
//         currentSpan.textContent = current;

//         nav.appendChild(sectionLink);
//         nav.appendChild(sep);
//         nav.appendChild(currentSpan);

//         row.appendChild(backBtn);
//         row.appendChild(divider);
//         row.appendChild(nav);

//         host.appendChild(row);
//     }

//     private renderDom(section: string, current: string): void {
//         this.ensureStyles();
//         const host = this.ensureHost();

//         if (!host) {
//             setTimeout(() => {
//                 const retry = this.ensureHost();
//                 if (retry) this.buildDom(retry, section, current);
//             }, 500);
//             return;
//         }

//         this.buildDom(host, section, current);
//     }

//     private async renderIfNeededSafe(): Promise<void> {
//         try {
//             await this.renderIfNeeded();
//         } catch {
//             // non-critical
//         }
//     }

//     private async renderIfNeeded(): Promise<void> {
//         if (this.isHomePage() || !this.isSitePagesUrl()) {
//             this.unmount();
//             return;
//         }
//         if (this.isHelpCenterPage()) {
//             this.unmount();
//             return;
//         }
//         if (this.isPolicyProcedurePage()) {
//             this.unmount();
//             return;
//         }
//         if (this.isOfferBenefitsPage()) {
//             this.unmount()
//             return;
//         }

//         if(this.isDashboardPage()){
//             this.unmount()
//             return;
//         }

//         const info = await this.getCurrentSitePageInfo();
//         let section = (this.isTasksPage() || this.isOfferBenefitsPage() || this.isBeverageMenuPage()
//          || this.isLetsCelebratePage() || this.isDashboardPage() || this.isGalleryPage() || this.isFormsLibraryPage() || this.isAboutDhrePage() || this.isProfilePage()) ? "Home" : "Pages";
//         let title = info.title || this.getModernPageTitle();

//         if (this.isBeverageMenuPage()) {
//             title = "BeverageMenu";
//         }

//         if (info.isNews) section = "News Story";
//         else if (info.contentType) {
//             const ct = info.contentType.toLowerCase();
//             if (ct.includes("event")) section = "Events";
//             else if (ct.includes("training")) section = "Trainings";
//         }

//         this.renderDom(section, title);
//     }
// }




import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { SPHttpClient } from "@microsoft/sp-http";

export class GlobalBreadcrumbs {
    private readonly _ctx: ApplicationCustomizerContext;

    private _breadcrumbHostId = "tir-global-breadcrumb-host";
    private _breadcrumbBleedId = "tir-global-breadcrumb-bleed";
    private _breadcrumbStylesInjected = false;

    private _breadcrumbObserver: MutationObserver | null = null;
    private _recoverTimer: number | undefined;
    private _lastSection: string = "";
    private _lastCurrent: string = "";
    private _scrollSyncAttached: boolean = false;
    private _lastBackTap: number = 0;

    private readonly _breadcrumbCSS = `
.__gbc_row{
  display:inline-flex;
  align-items:center;
  gap:20px;
  height:22px;
  margin-bottom:0px;
  font-family:'Inter',sans-serif;
  max-width:100%;
}

.__gbc_back{
  display:inline-flex;
  align-items:center;
  gap:6px;
  background:none;
  border:0;
  padding:0;
  cursor:pointer;
  font-family:'Inter',sans-serif;
  font-size:14px;
  line-height:22px;
  letter-spacing:-0.5px;
  color:#000;
  font-weight:400;
  white-space:nowrap;
}

.__gbc_back:hover{opacity:.7;}

.__gbc_back svg{
  width:16px;
  height:16px;
  display:block;
  flex:0 0 16px;
}

.__gbc_divider{
  width:1px;
  height:16px;
  background:rgba(58,59,67,.35);
  flex:0 0 1px;
}

.__gbc_wrap{
  display:inline-flex;
  align-items:center;
  gap:10px;
  height:22px;
  min-width:0;
  font-family:'Inter',sans-serif;
  font-size:14px;
  line-height:22px;
  letter-spacing:-0.5px;
  color:#3A3B43;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}

.__gbc_link{
  color:#A7A7A7;
  font-weight:400;
  text-decoration:none;
  cursor:pointer;
  font-size:14px;
  line-height:22px;
  letter-spacing:-0.5px;
  white-space:nowrap;
}

.__gbc_link:hover{text-decoration:underline}

.__gbc_sep{
  color:#B9BCC3;
  opacity:1;
  margin:0 2px;
  user-select:none;
  flex:0 0 auto;
}

.__gbc_current{
  color:#3A3B43;
  font-weight:500;
  font-size:14px;
  line-height:22px;
  letter-spacing:0;
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  max-width:180px;
}

@media (max-width: 768px){
  body.__gbc_mobile_active #spPageCanvasContent,
  body.__gbc_mobile_active [data-automation-id="pageCanvas"],
  body.__gbc_mobile_active main{
    padding-top:66px !important;
  }
#tir-global-breadcrumb-bleed{
    position:fixed !important;
    top:58px !important;
    left:0 !important;
    width:100vw !important;
    height:22px !important;
    z-index:999999 !important;
    display:block !important;
    overflow:visible !important;
    background:transparent !important;
    pointer-events:auto !important;
    transition:none !important;
    will-change:transform !important;
    -webkit-transform:translateZ(0);
    transform:translateZ(0);
  }

  #tir-global-breadcrumb-host{
    width:339px !important;
    max-width:calc(100vw - 32px) !important;
    height:22px !important;
    margin:0 0 0 16px !important;
    padding:0 !important;
    box-sizing:border-box !important;
    overflow:hidden !important;
    pointer-events:auto !important;
    background:transparent !important;
  }

  .__gbc_row{
    width:100% !important;
    height:22px !important;
    gap:16px !important;
    overflow:hidden !important;
  }

 .__gbc_back{
    font-family:'Inter',sans-serif !important;
    font-weight:400 !important;
    font-size:14px !important;
    line-height:22px !important;
    letter-spacing:-0.5px !important;
    position:relative !important;
    z-index:2 !important;
    pointer-events:auto !important;
    touch-action:manipulation !important;
    -webkit-tap-highlight-color:transparent !important;
    -webkit-user-select:none !important;
    user-select:none !important;
  }

  .__gbc_back svg{
    width:16px !important;
    height:16px !important;
    flex:0 0 16px !important;
  }

  .__gbc_link{
    font-family:'Inter',sans-serif !important;
    font-weight:400 !important;
    font-size:14px !important;
    line-height:22px !important;
    letter-spacing:-0.5px !important;
  }

  .__gbc_current{
    font-family:'Inter',sans-serif !important;
    font-weight:500 !important;
    font-size:14px !important;
    line-height:22px !important;
    letter-spacing:0 !important;
    max-width:135px !important;
    overflow:hidden !important;
    text-overflow:ellipsis !important;
    white-space:nowrap !important;
  }
}
`;

    private handleResize = (): void => {
        window.setTimeout(() => void this.renderIfNeededSafe(), 100);
    };

    private readonly _backSvg =
        `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.25 19.25L7.75 12l6.5-7.25" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    constructor(context: ApplicationCustomizerContext) {
        this._ctx = context;
    }

    public init(): void {

        window.addEventListener("resize", this.handleResize);
        void this.renderIfNeededSafe();

        window.setTimeout(() => void this.renderIfNeededSafe(), 300);
        window.setTimeout(() => void this.renderIfNeededSafe(), 800);
        window.setTimeout(() => void this.renderIfNeededSafe(), 1500);

        this.startBreadcrumbRecovery();
        this.startScrollSync();
    }

    public onNavigated(): void {
        void this.renderIfNeededSafe();

        window.setTimeout(() => void this.renderIfNeededSafe(), 300);
        window.setTimeout(() => void this.renderIfNeededSafe(), 800);

        window.setTimeout(this.syncBreadcrumbWithScroll, 300);
        window.setTimeout(this.syncBreadcrumbWithScroll, 800);
    }

    public dispose(): void {
        if (this._breadcrumbObserver) {
            try { this._breadcrumbObserver.disconnect(); } catch { }
            this._breadcrumbObserver = null;
        }

        if (this._recoverTimer) {
            window.clearInterval(this._recoverTimer);
            this._recoverTimer = undefined;
        }

        if (this._scrollSyncAttached) {
            document.removeEventListener("scroll", this.syncBreadcrumbWithScroll, true);
            window.removeEventListener("scroll", this.syncBreadcrumbWithScroll, true);
            window.removeEventListener("resize", this.syncBreadcrumbWithScroll);
            this._scrollSyncAttached = false;
        }
        window.removeEventListener("resize", this.handleResize);
        this.unmount();
    }

    private ensureStyles(): void {
        if (this._breadcrumbStylesInjected) return;
        if (document.querySelector('style[data-global-breadcrumbs="1"]')) {
            this._breadcrumbStylesInjected = true;
            return;
        }

        const s = document.createElement("style");
        s.setAttribute("data-global-breadcrumbs", "1");
        s.appendChild(document.createTextNode(this._breadcrumbCSS));
        document.head.appendChild(s);
        this._breadcrumbStylesInjected = true;
    }

    private isMobile(): boolean {
        return window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
    }

    private getMobileScrollTop(): number {
        const candidates: Array<HTMLElement | null> = [
            document.querySelector('[data-automation-id="contentScrollRegion"]') as HTMLElement | null,
            document.querySelector('[data-automation-id="pageCanvas"]') as HTMLElement | null,
            document.querySelector('[class*="contentScrollRegion"]') as HTMLElement | null,
            document.querySelector('[class*="scrollRegion"]') as HTMLElement | null,
            document.querySelector('[class*="ScrollRegion"]') as HTMLElement | null,
            document.scrollingElement as HTMLElement | null,
            document.documentElement,
            document.body
        ];

        let maxTop = 0;

        candidates.forEach((el) => {
            if (!el) return;
            const top = Number(el.scrollTop || 0);
            if (top > maxTop) maxTop = top;
        });

        return maxTop;
    }

    private syncBreadcrumbWithScroll = (): void => {
        if (!this.isMobile()) return;

        const bleed = document.getElementById(this._breadcrumbBleedId) as HTMLElement | null;
        if (!bleed) return;

        const scrollTop = this.getMobileScrollTop();

        bleed.style.position = "fixed";
        bleed.style.top = "58px";
        bleed.style.transform = `translateY(-${scrollTop}px)`;
    };

    private startScrollSync(): void {
        if (this._scrollSyncAttached) return;
        this._scrollSyncAttached = true;

        document.addEventListener("scroll", this.syncBreadcrumbWithScroll, true);
        window.addEventListener("scroll", this.syncBreadcrumbWithScroll, true);
        window.addEventListener("resize", this.syncBreadcrumbWithScroll);

        window.setTimeout(this.syncBreadcrumbWithScroll, 300);
        window.setTimeout(this.syncBreadcrumbWithScroll, 800);
        window.setTimeout(this.syncBreadcrumbWithScroll, 1500);
    }

    private isSitePagesUrl(): boolean {
        return (window.location.pathname || "").toLowerCase().includes("/sitepages/");
    }

    private isHomePage(): boolean {
        const p = (window.location.pathname || "").toLowerCase();
        return p.endsWith("/sitepages/home.aspx") || (!p.includes("/sitepages/") && p.endsWith("/"));
    }

    private isHelpCenterPage(): boolean {
        let p = window.location.pathname || "";
        try { p = decodeURIComponent(p); } catch { }
        p = p.toLowerCase();
        return p.endsWith("/sitepages/help-center.aspx")
            || p.endsWith("/sitepages/tirhelpcenter.aspx");
    }

    private isOfferBenefitsPage(): boolean {
        let p = window.location.pathname || "";
        try { p = decodeURIComponent(p); } catch { }
        p = p.toLowerCase();
        return p.endsWith("/sitepages/offers-&-benifits.aspx");
    }

    private isBeverageMenuPage(): boolean {
        let p = window.location.pathname || "";
        try { p = decodeURIComponent(p); } catch { }
        p = p.toLowerCase();
        return p.endsWith("/sitepages/beverages.aspx");
    }

    private isTasksPage(): boolean {
        let p = window.location.pathname || "";
        try { p = decodeURIComponent(p); } catch { }
        p = p.toLowerCase();
        return p.endsWith("/sitepages/tasks.aspx") || p.endsWith("/sitepages/taskapproval.aspx");
    }

    private isPolicyProcedurePage(): boolean {
        let p = window.location.pathname || "";
        try { p = decodeURIComponent(p); } catch { }
        p = p.toLowerCase();
        return p.endsWith("/sitepages/policies-and-procedures.aspx");
    }

    private isLetsCelebratePage(): boolean {
        let p = window.location.pathname || "";
        try { p = decodeURIComponent(p); } catch { }
        p = p.toLowerCase();
        return p.includes("/sitepages/lets-celebrate.aspx");
    }

    private isDashboardPage(): boolean {
        let p = window.location.pathname || "";
        try { p = decodeURIComponent(p); } catch { }
        p = p.toLowerCase();
        return p.includes("/sitepages/dashboards.aspx");
    }

    private isGalleryPage(): boolean {
        let p = window.location.pathname || "";
        try { p = decodeURIComponent(p); } catch { }
        p = p.toLowerCase();
        return p.endsWith("/sitepages/dhre-gallery.aspx");
    }

    private isFormsLibraryPage(): boolean {
        let p = window.location.pathname || "";
        try { p = decodeURIComponent(p); } catch { }
        p = p.toLowerCase();
        return p.includes("/sitepages/forms-library.aspx");
    }

    private isAboutDhrePage(): boolean {
        let p = window.location.pathname || "";
        try { p = decodeURIComponent(p); } catch { }
        p = p.toLowerCase();
        return p.includes("/sitepages/about-dhre.aspx");
    }

    private isProfilePage(): boolean {
        let p = window.location.pathname || "";
        try { p = decodeURIComponent(p); } catch { }
        p = p.toLowerCase();
        return p.includes("/sitepages/profile.aspx");
    }

    private getModernPageTitle(): string {
        const h1 =
            document.querySelector('h1[data-automation-id="pageHeaderTitle"]') ||
            document.querySelector("h1.od-TitleText") ||
            document.querySelector("h1");

        const t = (h1?.textContent || "").trim();
        if (t) return t;

        const docTitle = (document.title || "").trim();
        return docTitle ? (docTitle.split(" - ")[0] || docTitle).trim() : "Details";
    }

    private ensureHost(): HTMLElement | null {
        const isMobileView = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;

        let container: HTMLElement | null = null;

        if (isMobileView) {
            container = document.body;
        } else {
            container =
                (document.querySelector('[data-automation-id="TitleRegion"]') as HTMLElement | null) ||
                (document.querySelector('[data-automation-id="contentScrollRegion"]') as HTMLElement | null) ||
                (document.querySelector(".CanvasZone") as HTMLElement | null) ||
                (document.querySelector('[data-automation-id="CanvasSection"]') as HTMLElement | null) ||
                (document.querySelector("main") as HTMLElement | null) ||
                (document.querySelector('[class*="Canvas"]') as HTMLElement | null);
        }

        if (!container) return null;

        let bleed = document.getElementById(this._breadcrumbBleedId) as HTMLElement | null;
        if (!bleed) {
            bleed = document.createElement("div");
            bleed.id = this._breadcrumbBleedId;
        }

        let host = document.getElementById(this._breadcrumbHostId) as HTMLElement | null;
        if (!host) {
            host = document.createElement("div");
            host.id = this._breadcrumbHostId;
        }

        if (isMobileView) {
            document.body.classList.add("__gbc_mobile_active");

            Object.assign(bleed.style, {
                position: "fixed",
                top: "58px",
                left: "0px",
                width: "100vw",
                height: "22px",
                zIndex: "999999",
                display: "block",
                overflow: "visible",
                background: "transparent",
                pointerEvents: "auto",
                boxSizing: "border-box",
                transition: "none",
                willChange: "transform"
            });

            Object.assign(host.style, {
                display: "block",
                boxSizing: "border-box",
                width: "339px",
                maxWidth: "calc(100vw - 32px)",
                height: "22px",
                margin: "0 0 0 16px",
                padding: "0",
                overflow: "hidden",
                background: "transparent",
                pointerEvents: "auto"
            });
        } else {
            document.body.classList.remove("__gbc_mobile_active");

            Object.assign(bleed.style, {
                width: "100vw",
                marginLeft: "calc(50% - 50vw)",
                marginRight: "calc(50% - 50vw)",
                boxSizing: "border-box",
                overflowX: "clip",
                background: "transparent",
                transform: ""
            });

            Object.assign(host.style, {
                display: "block",
                boxSizing: "border-box",
                width: "100%",
                maxWidth: "none",
                margin: "20px 0 0",
                padding: "0 60px",
                background: "transparent"
            });
        }

        if (host.parentElement !== bleed) {
            bleed.appendChild(host);
        }

        if (bleed.parentElement !== container) {
            if (isMobileView) {
                container.appendChild(bleed);
            } else {
                container.prepend(bleed);
            }
        } else if (!isMobileView && container.firstElementChild !== bleed) {
            container.prepend(bleed);
        }

        if (isMobileView) {
            this.syncBreadcrumbWithScroll();
        }

        return host;
    }

    private unmount(): void {
        document.body.classList.remove("__gbc_mobile_active");

        const bleed = document.getElementById(this._breadcrumbBleedId) as HTMLElement | null;
        if (bleed) {
            bleed.style.transform = "";
            try { bleed.remove(); } catch { }
            return;
        }

        const host = document.getElementById(this._breadcrumbHostId);
        if (host) {
            try { host.remove(); } catch { }
        }
    }

    private startBreadcrumbRecovery(): void {
        if (this._breadcrumbObserver) return;

        this._breadcrumbObserver = new MutationObserver(() => {
            if (this.isHomePage() || !this.isSitePagesUrl()) return;

            const bleed = document.getElementById(this._breadcrumbBleedId);
            const host = document.getElementById(this._breadcrumbHostId);

            if (!bleed || !host || !document.body.contains(bleed)) {
                void this.renderIfNeededSafe();
                return;
            }

            if (this.isMobile()) {
                document.body.classList.add("__gbc_mobile_active");

                if (bleed.parentElement !== document.body) {
                    document.body.appendChild(bleed);
                }
                bleed.style.position = "fixed";
                bleed.style.top = "58px";
                bleed.style.pointerEvents = "auto";
                this.syncBreadcrumbWithScroll();
            }
        });

        this._breadcrumbObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        this._recoverTimer = window.setInterval(() => {
            if (this.isHomePage() || !this.isSitePagesUrl()) return;

            const bleed = document.getElementById(this._breadcrumbBleedId);
            const host = document.getElementById(this._breadcrumbHostId);

            if (!bleed || !host || !document.body.contains(bleed)) {
                void this.renderIfNeededSafe();
                return;
            }

            if (this.isMobile()) {
                document.body.classList.add("__gbc_mobile_active");

                if (bleed.parentElement !== document.body) {
                    document.body.appendChild(bleed);
                }

                bleed.style.position = "fixed";
                bleed.style.top = "58px";
                bleed.style.pointerEvents = "auto";
                this.syncBreadcrumbWithScroll();
            } else {
                document.body.classList.remove("__gbc_mobile_active");
                bleed.style.transform = "";
            }

            if (this._lastSection && this._lastCurrent && host.childElementCount === 0) {
                this.buildDom(host, this._lastSection, this._lastCurrent);
            }
        }, 400);
    }

    private goBack = (ev?: Event): void => {
        try { ev?.preventDefault(); } catch { }
        try { ev?.stopPropagation(); } catch { }

        const now = Date.now();
        if (now - this._lastBackTap < 500) return;
        this._lastBackTap = now;

        window.setTimeout(() => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = this._ctx.pageContext.web.absoluteUrl;
            }
        }, 0);
    };

    private async getCurrentSitePageInfo(): Promise<{ title: string; isNews: boolean; contentType?: string; }> {
        try {
            const webUrl = (this._ctx?.pageContext?.web?.absoluteUrl || "").replace(/\/$/, "");
            let serverRel = window.location.pathname || "";
            try { serverRel = decodeURIComponent(serverRel); } catch { }
            serverRel = serverRel.replace(/'/g, "''");

            if (!webUrl || !serverRel) return { title: "", isNews: false };

            const api =
                `${webUrl}/_api/web/GetFileByServerRelativePath(decodedurl='${serverRel}')/ListItemAllFields` +
                `?$select=Title,PromotedState,ContentType/Name&$expand=ContentType`;

            const res = await this._ctx.spHttpClient.get(api, SPHttpClient.configurations.v1);
            if (!res.ok) return { title: "", isNews: false };

            const data = (await res.json()) as any;
            const title = String(data?.Title || "").trim();
            const ctName = String(data?.ContentType?.Name || "").toLowerCase();
            const promoted = Number(data?.PromotedState);

            return {
                title,
                isNews: promoted === 2 || ctName.includes("news"),
                contentType: data?.ContentType?.Name
            };
        } catch {
            return { title: "", isNews: false };
        }
    }

    private buildDom(host: HTMLElement, section: string, current: string): void {
        host.innerHTML = "";

        const row = document.createElement("div");
        row.className = "__gbc_row";

        const backBtn = document.createElement("button");
        backBtn.className = "__gbc_back";
        backBtn.type = "button";
        backBtn.addEventListener("click", this.goBack);
        backBtn.addEventListener("touchend", this.goBack, { passive: false, capture: true } as AddEventListenerOptions);
        backBtn.addEventListener("pointerup", this.goBack, { passive: false, capture: true } as AddEventListenerOptions);
        const svgSpan = document.createElement("span");
        svgSpan.setAttribute("aria-hidden", "true");
        svgSpan.innerHTML = this._backSvg;

        const backText = document.createElement("span");
        backText.textContent = "Back";

        backBtn.appendChild(svgSpan);
        backBtn.appendChild(backText);

        const divider = document.createElement("span");
        divider.className = "__gbc_divider";
        divider.setAttribute("aria-hidden", "true");

        const nav = document.createElement("nav");
        nav.className = "__gbc_wrap";

        const sectionLink = document.createElement("a");
        sectionLink.href = "#";
        sectionLink.className = "__gbc_link";
        sectionLink.textContent = section;
        backBtn.addEventListener("click", this.goBack);
        backBtn.addEventListener("touchend", this.goBack, { passive: false, capture: true } as AddEventListenerOptions);
        backBtn.addEventListener("pointerup", this.goBack, { passive: false, capture: true } as AddEventListenerOptions);

        const sep = document.createElement("span");
        sep.className = "__gbc_sep";
        sep.textContent = "›";

        const currentSpan = document.createElement("span");
        currentSpan.className = "__gbc_current";
        currentSpan.textContent = current;

        nav.appendChild(sectionLink);
        nav.appendChild(sep);
        nav.appendChild(currentSpan);

        row.appendChild(backBtn);
        row.appendChild(divider);
        row.appendChild(nav);

        host.appendChild(row);
    }

    private renderDom(section: string, current: string): void {
        this._lastSection = section;
        this._lastCurrent = current;

        this.ensureStyles();

        if (this.isMobile()) {
            document.body.classList.add("__gbc_mobile_active");
        } else {
            document.body.classList.remove("__gbc_mobile_active");
        }

        const host = this.ensureHost();

        if (!host) {
            window.setTimeout(() => {
                const retry = this.ensureHost();
                if (retry) this.buildDom(retry, section, current);
                this.syncBreadcrumbWithScroll();
            }, 500);
            return;
        }

        this.buildDom(host, section, current);
        this.syncBreadcrumbWithScroll();
    }

    private async renderIfNeededSafe(): Promise<void> {
        try {
            await this.renderIfNeeded();
        } catch {
            // non-critical
        }
    }

    private async renderIfNeeded(): Promise<void> {
        if (this.isHomePage() || !this.isSitePagesUrl()) {
            this.unmount();
            return;
        }

        if (this.isHelpCenterPage()) {
            this.unmount();
            return;
        }

        if (this.isPolicyProcedurePage()) {
            this.unmount();
            return;
        }

        if (this.isOfferBenefitsPage() && !this.isMobile()) {
            this.unmount();
            return;
        }

        if (this.isDashboardPage()) {
            this.unmount();
            return;
        }
        if (this.isProfilePage() && this.isMobile()) {
            this.unmount();
            return;
        }
        const info = await this.getCurrentSitePageInfo();

        let section =
            (
                this.isTasksPage() ||
                this.isOfferBenefitsPage() ||
                this.isBeverageMenuPage() ||
                this.isLetsCelebratePage() ||
                this.isDashboardPage() ||
                this.isGalleryPage() ||
                this.isFormsLibraryPage() ||
                this.isAboutDhrePage() ||
                this.isProfilePage()
            )
                ? "Home"
                : "Pages";

        let title = info.title || this.getModernPageTitle();

        if (this.isBeverageMenuPage()) {
            title = "BeverageMenu";
        }

        if (info.isNews) {
            section = "News Story";
        } else if (info.contentType) {
            const ct = info.contentType.toLowerCase();
            if (ct.includes("event")) section = "Events";
            else if (ct.includes("training")) section = "Trainings";
        }

        this.renderDom(section, title);
    }
}