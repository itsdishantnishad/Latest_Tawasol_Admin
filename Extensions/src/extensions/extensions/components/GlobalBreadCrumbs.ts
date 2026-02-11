import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { SPHttpClient } from "@microsoft/sp-http";

export class GlobalBreadcrumbs {
    private readonly _ctx: ApplicationCustomizerContext;

    private _breadcrumbHostId = "tir-global-breadcrumb-host";
    private _breadcrumbBleedId = "tir-global-breadcrumb-bleed";
    private _breadcrumbStylesInjected = false;

    private readonly _breadcrumbCSS = `
.__gbc_row{display:inline-flex;align-items:center;gap:20px;height:22px;margin-bottom:0px; font-family:'Inter',sans-serif;}
.__gbc_back{display:inline-flex;align-items:center;gap:6px;background:none;border:0;padding:0;cursor:pointer; font-size:14px;line-height:24px;letter-spacing:0;color:#000;font-weight:400;}
.__gbc_back:hover{opacity:.7;}
.__gbc_back svg{width:18px;height:18px;display:block}
.__gbc_divider{width:1px;height:16px;background:rgba(58,59,67,.35)}
.__gbc_wrap{display:inline-flex;align-items:center;gap:10px;height:22px; font-size:14px;line-height:22px;letter-spacing:0;color:#3A3B43;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
.__gbc_link{color:#A7A7A7;font-weight:400;text-decoration:none;cursor:pointer;font-size:14px;line-height:22px;}
.__gbc_link:hover{text-decoration:underline}
.__gbc_sep{color:#B9BCC3;opacity:1;margin:0 2px;user-select:none}
.__gbc_current{color:#3A3B43;font-weight:500;font-size:14px;line-height:22px;}
`;

    private readonly _backSvg =
        `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.25 19.25L7.75 12l6.5-7.25" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    constructor(context: ApplicationCustomizerContext) {
        this._ctx = context;
    }

    /** call once from onInit */
    public init(): void {
        // optional: render immediately
        void this.renderIfNeededSafe();
    }

    /** call on every navigation */
    public onNavigated(): void {
        void this.renderIfNeededSafe();
    }

    /** call from onDispose */
    public dispose(): void {
        this.unmount();
    }

    // ------------------ internal ------------------

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
        let container =
            (document.querySelector('[data-automation-id="TitleRegion"]') as HTMLElement | null) ||
            (document.querySelector('[data-automation-id="contentScrollRegion"]') as HTMLElement | null) ||
            (document.querySelector(".CanvasZone") as HTMLElement | null) ||
            (document.querySelector('[data-automation-id="CanvasSection"]') as HTMLElement | null) ||
            (document.querySelector("main") as HTMLElement | null) ||
            (document.querySelector('[class*="Canvas"]') as HTMLElement | null);

        if (!container) return null;

        // full-bleed wrapper (only for breadcrumb)
        let bleed = document.getElementById(this._breadcrumbBleedId) as HTMLElement | null;
        if (!bleed) {
            bleed = document.createElement("div");
            bleed.id = this._breadcrumbBleedId;

            Object.assign(bleed.style, {
                width: "100vw",
                marginLeft: "calc(50% - 50vw)",
                marginRight: "calc(50% - 50vw)",
                boxSizing: "border-box",
                overflowX: "clip",
                background: "transparent"
            });
        }

        let host = document.getElementById(this._breadcrumbHostId) as HTMLElement | null;
        if (!host) {
            host = document.createElement("div");
            host.id = this._breadcrumbHostId;
        }

        // keep your same host sizing
        Object.assign(host.style, {
            display: "block",
            boxSizing: "border-box",
            width: "100%",
            maxWidth: "none",
            margin: "20px 0 0",
            padding: "0 60px",
            background: "transparent"
        });

        if (host.parentElement !== bleed) bleed.appendChild(host);

        if (bleed.parentElement !== container) {
            container.prepend(bleed);
        } else if (container.firstElementChild !== bleed) {
            container.prepend(bleed);
        }

        return host;
    }

    private unmount(): void {
        const bleed = document.getElementById(this._breadcrumbBleedId);
        if (bleed) {
            try { bleed.remove(); } catch { }
            return;
        }
        const host = document.getElementById(this._breadcrumbHostId);
        if (host) {
            try { host.remove(); } catch { }
        }
    }

    private goBack = (ev?: Event): void => {
        try { ev?.preventDefault(); } catch { }
        window.history.back();
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
        sectionLink.addEventListener("click", this.goBack);

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
        this.ensureStyles();
        const host = this.ensureHost();

        if (!host) {
            setTimeout(() => {
                const retry = this.ensureHost();
                if (retry) this.buildDom(retry, section, current);
            }, 500);
            return;
        }

        this.buildDom(host, section, current);
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
        if (this.isOfferBenefitsPage()) {
            this.unmount()
            return;
        }

        const info = await this.getCurrentSitePageInfo();
        let section = (this.isTasksPage() || this.isOfferBenefitsPage() || this.isBeverageMenuPage()
         || this.isLetsCelebratePage() || this.isDashboardPage() || this.isGalleryPage() || this.isFormsLibraryPage() || this.isAboutDhrePage()) ? "Home" : "Pages";
        let title = info.title || this.getModernPageTitle();

        if (this.isBeverageMenuPage()) {
            title = "BeverageMenu";
        }

        if (info.isNews) section = "News Story";
        else if (info.contentType) {
            const ct = info.contentType.toLowerCase();
            if (ct.includes("event")) section = "Events";
            else if (ct.includes("training")) section = "Trainings";
        }

        this.renderDom(section, title);
    }
}
