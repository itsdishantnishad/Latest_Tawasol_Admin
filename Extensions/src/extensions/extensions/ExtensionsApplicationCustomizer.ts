// src/extensions/extensions/ExtensionsApplicationCustomizer.ts

import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
require('../../styles/hideNav.css');

import styles from './Extension.module.scss';
import { SPHttpClient } from '@microsoft/sp-http';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FloatingNav } from './components/FloatingNav';
import { Notifications } from './shared/notifications';
import { SuggestBox } from './components/SuggestBox';
import { SearchService } from './services/searchService';
import { NavigationService } from './services/navigationService';
import { IDS, resolveUrls } from './shared/constants';
import { NotificationService } from './services/notificationService';
import { FooterService } from './services/FooterService';
import { AmplitudeService } from './services/AmplitudeService';
import Onbo from './components/Onbo';
import { IOnboConfig } from './components/Onbo';
import { HideSocialBarService } from './services/HideSocialBarService';
import { GlobalBreadcrumbs } from './components/GlobalBreadCrumbs';
import { PageMetaRelative } from './components/PageMetaRelative';
export interface IExtensionsApplicationCustomizerProperties {
  testMessage: string;
}

/**
 * Amplitude Keys (for now from code as requested)
 * NOTE: Secret key cannot be truly hidden in client-side SPFx.
 */
const AMPLITUDE_API_KEY: string = '2c3cf0da467f7f779d580f939e4082b9';
const AMPLITUDE_SECRET_KEY: string = '9865d4234176791ada4da1afca0f8080';

const MAX_NOTIFS: number = 100;

/**
 * IMPORTANT:
 * - Set PERMISSIONS_LIST_TITLE to the display name of the list you created.
 * - Internal column name for emails: UserPermission (you confirmed Field=UserPermission).
 */
// const PERMISSIONS_LIST_TITLE = 'PermissionList'; // <-- change this to your list's display name if different
// const PERMISSIONS_EMAIL_FIELD = 'UserPermission'; // internal field name you provided

export default class ExtensionsApplicationCustomizer
  extends BaseApplicationCustomizer<IExtensionsApplicationCustomizerProperties> {

  private header!: Header;
  private footer!: Footer;
  private floatingNav?: FloatingNav;
  private suggest!: SuggestBox;
  private search!: SearchService;
  private nav!: NavigationService;

  // Notifications
  private notifService!: NotificationService;
  private notifications?: Notifications;
  private isLoadingNotifications: boolean = false;

  // Onboarding instance
  private onboarding?: Onbo;

  // Footer service
  private footerService!: FooterService;

  //  Amplitude Service
  private amplitude!: AmplitudeService;

  private observer?: MutationObserver;
  private topBarObserver?: MutationObserver;
  private debounceId?: number;

  // Hide Social Bar
  private hideSocialBar?: HideSocialBarService;


  // breadcrumbs
  private breadcrumbs?: GlobalBreadcrumbs;

  private pageMeta?: PageMetaRelative;


  // // =========================================================
  // // Global BREADCRUMB IMPLEMENTATION - PRODUCTION READY

  // private _breadcrumbHostId = "tir-global-breadcrumb-host";
  // private _breadcrumbStylesInjected = false;

  // private readonly _breadcrumbCSS = `
  // .__gbc_row{display:inline-flex;align-items:center;gap:20px;height:22px;margin-bottom:20px;}
  // .__gbc_back{display:inline-flex;align-items:center;gap:6px;background:none;border:0;padding:0;cursor:pointer;font-family:Inter,Segoe UI,-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;letter-spacing:0;color:#000;font-weight:400;}
  // .__gbc_back:hover{opacity:.7;}
  // .__gbc_back svg{width:18px;height:18px;display:block}
  // .__gbc_divider{width:1px;height:16px;background:rgba(58,59,67,.35)}
  // .__gbc_wrap{display:inline-flex;align-items:center;gap:10px;height:22px;font-family:Inter,Segoe UI,-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;letter-spacing:0;color:#3A3B43;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
  // .__gbc_link{color:#A7A7A7;font-weight:400;text-decoration:none;cursor:pointer;font-size:14px;line-height:22px;}
  // .__gbc_link:hover{text-decoration:underline}
  // .__gbc_sep{color:#B9BCC3;opacity:1;margin:0 2px;user-select:none}
  // .__gbc_current{color:#3A3B43;font-weight:500;font-size:14px;line-height:22px;font-family:Inter,sans-serif;}
  // `;

  // private readonly _backSvg = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.25 19.25L7.75 12l6.5-7.25" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  // // Methods
  // private ensureBreadcrumbStyles(): void {
  //   if (this._breadcrumbStylesInjected) return;
  //   const s = document.createElement("style");
  //   s.setAttribute("data-global-breadcrumbs", "1");
  //   s.appendChild(document.createTextNode(this._breadcrumbCSS));
  //   document.head.appendChild(s);
  //   this._breadcrumbStylesInjected = true;
  // }

  // private isSitePagesUrl(): boolean {
  //   return (window.location.pathname || "").toLowerCase().includes("/sitepages/");
  // }

  // private isHomePage(): boolean {
  //   const p = (window.location.pathname || "").toLowerCase();
  //   return p.endsWith("/sitepages/home.aspx") || (!p.includes("/sitepages/") && p.endsWith("/"));
  // }

  // private getModernPageTitle(): string {
  //   const h1 = document.querySelector('h1[data-automation-id="pageHeaderTitle"]') ||
  //               document.querySelector("h1.od-TitleText") ||
  //               document.querySelector("h1");
  //   const t = (h1?.textContent || "").trim();
  //   if (t) return t;

  //   const docTitle = (document.title || "").trim();
  //   return docTitle ? (docTitle.split(" - ")[0] || docTitle).trim() : "Details";
  // }

  // private ensureBreadcrumbHost(): HTMLElement | null {
  //   let host = document.getElementById(this._breadcrumbHostId) as HTMLElement | null;

  //   // Find suitable container with fallback strategies
  //   let container = document.querySelector('[data-automation-id="TitleRegion"]') as HTMLElement | null;

  //   if (!container) {
  //     container = document.querySelector('[data-automation-id="contentScrollRegion"]') as HTMLElement | null;
  //   }
  //   if (!container) {
  //     container = document.querySelector('.CanvasZone') as HTMLElement | null;
  //   }
  //   if (!container) {
  //     container = document.querySelector('[data-automation-id="CanvasSection"]') as HTMLElement | null;
  //   }
  //   if (!container) {
  //     container = document.querySelector('main') as HTMLElement | null;
  //   }
  //   if (!container) {
  //     container = document.querySelector('[class*="Canvas"]') as HTMLElement | null;
  //   }

  //   if (!container) return null;

  //   if (!host) {
  //     host = document.createElement("div");
  //     host.id = this._breadcrumbHostId;
  //   }

  //   Object.assign(host.style, {
  //     display: "block",
  //     boxSizing: "border-box",
  //     width: "100%",
  //     maxWidth: "1200px",
  //     background: "transparent",
  //     padding: "0 32px",
  //     margin: "20px auto"
  //   });

  //   if (host.parentElement !== container) {
  //     container.prepend(host);
  //   } else if (container.firstElementChild !== host) {
  //     container.prepend(host);
  //   }

  //   return host;
  // }

  // private unmountBreadcrumb(): void {
  //   const host = document.getElementById(this._breadcrumbHostId);
  //   if (host) {
  //     try { host.remove(); } catch { /* ignore */ }
  //   }
  // }

  // private goBack = (ev?: Event): void => {
  //   try { ev?.preventDefault(); } catch {}
  //   window.history.back();
  // };

  // private onNavigated = (): void => {
  //   void this.renderBreadcrumbIfNeededSafe();
  // };

  // private async getCurrentSitePageInfo(): Promise<{ 
  //   title: string; 
  //   isNews: boolean;
  //   contentType?: string;
  // }> {
  //   try {
  //     const webUrl = (this.context?.pageContext?.web?.absoluteUrl || "").replace(/\/$/, "");
  //     let serverRel = window.location.pathname || "";
  //     try { serverRel = decodeURIComponent(serverRel); } catch {}
  //     serverRel = serverRel.replace(/'/g, "''");

  //     if (!webUrl || !serverRel) return { title: "", isNews: false };

  //     const api = `${webUrl}/_api/web/GetFileByServerRelativePath(decodedurl='${serverRel}')/ListItemAllFields?$select=Title,PromotedState,ContentType/Name&$expand=ContentType`;

  //     const res = await this.context.spHttpClient.get(api, SPHttpClient.configurations.v1);
  //     if (!res.ok) return { title: "", isNews: false };

  //     const data = (await res.json()) as any;
  //     const title = String(data?.Title || "").trim();
  //     const ctName = String(data?.ContentType?.Name || "").toLowerCase();
  //     const promoted = Number(data?.PromotedState);

  //     return { 
  //       title, 
  //       isNews: promoted === 2 || ctName.includes("news"),
  //       contentType: data?.ContentType?.Name
  //     };
  //   } catch {
  //     return { title: "", isNews: false };
  //   }
  // }

  // private buildBreadcrumbContent(host: HTMLElement, section: string, current: string): void {
  //   host.innerHTML = "";

  //   const row = document.createElement("div");
  //   row.className = "__gbc_row";

  //   const backBtn = document.createElement("button");
  //   backBtn.className = "__gbc_back";
  //   backBtn.type = "button";
  //   backBtn.addEventListener("click", this.goBack);

  //   const svgSpan = document.createElement("span");
  //   svgSpan.setAttribute("aria-hidden", "true");
  //   svgSpan.innerHTML = this._backSvg;

  //   const backText = document.createElement("span");
  //   backText.textContent = "Back";

  //   backBtn.appendChild(svgSpan);
  //   backBtn.appendChild(backText);

  //   const divider = document.createElement("span");
  //   divider.className = "__gbc_divider";
  //   divider.setAttribute("aria-hidden", "true");

  //   const nav = document.createElement("nav");
  //   nav.className = "__gbc_wrap";

  //   const sectionLink = document.createElement("a");
  //   sectionLink.href = "#";
  //   sectionLink.className = "__gbc_link";
  //   sectionLink.textContent = section;
  //   sectionLink.addEventListener("click", this.goBack);

  //   const sep = document.createElement("span");
  //   sep.className = "__gbc_sep";
  //   sep.textContent = "›";

  //   const currentSpan = document.createElement("span");
  //   currentSpan.className = "__gbc_current";
  //   currentSpan.textContent = current;

  //   nav.appendChild(sectionLink);
  //   nav.appendChild(sep);
  //   nav.appendChild(currentSpan);

  //   row.appendChild(backBtn);
  //   row.appendChild(divider);
  //   row.appendChild(nav);

  //   host.appendChild(row);
  // }

  // private renderBreadcrumbDom(section: string, current: string): void {
  //   this.ensureBreadcrumbStyles();
  //   const host = this.ensureBreadcrumbHost();

  //   if (!host) {
  //     // Retry after DOM ready
  //     setTimeout(() => {
  //       const retryHost = this.ensureBreadcrumbHost();
  //       if (retryHost) {
  //         this.buildBreadcrumbContent(retryHost, section, current);
  //       }
  //     }, 500);
  //     return;
  //   }

  //   this.buildBreadcrumbContent(host, section, current);
  // }

  // private async renderBreadcrumbIfNeededSafe(): Promise<void> {
  //   try {
  //     await this.renderBreadcrumbIfNeeded();
  //   } catch (e) {
  //     // Silently fail - breadcrumb is non-critical
  //   }
  // }

  // private async renderBreadcrumbIfNeeded(): Promise<void> {
  //   if (this.isHomePage() || !this.isSitePagesUrl()) {
  //     this.unmountBreadcrumb();
  //     return;
  //   }

  //   const info = await this.getCurrentSitePageInfo();
  //   let section = "Pages";
  //   const title = info.title || this.getModernPageTitle();

  //   if (info.isNews) {
  //     section = "News Story";
  //   } else if (info.contentType) {
  //     // Use contentType from getCurrentSitePageInfo instead
  //     const ctName = info.contentType.toLowerCase();
  //     if (ctName.includes("event")) {
  //       section = "Events";
  //     } else if (ctName.includes("training")) {
  //       section = "Training";
  //     }
  //   }

  //   this.renderBreadcrumbDom(section, title);
  // }

  private get webUrl(): string {
    return this.context.pageContext.web.absoluteUrl;
  }
  private get userEmail(): string {
    return (this.context.pageContext.user.email || '').toLowerCase();
  }

  private injectFont(): void {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }

  private isInternalClassicPage(): boolean {
    const url = window.location.href.toLowerCase();
    return (
      url.includes('/_layouts/') ||
      url.includes('settings.aspx') ||
      url.includes('editform.aspx') ||
      url.includes('dispform.aspx') ||
      url.includes('allitems.aspx') ||
      url.includes('viewlsts.aspx') ||
      url.includes('/forms/')
    );
  }

  private shouldRender(): boolean {
    if (this.isInternalClassicPage()) return false;
    if (window.self !== window.top) return false;
    return !!document.getElementById('spPageChromeAppDiv');
  }

  /** Hide the sharepoint left sitebar */
  private hideAppBar(): void {
    const appBar = document.getElementById('sp-appBar');
    if (appBar) {
      appBar.style.display = 'none';
    }
  }

  /**
   * Check if the current user email exists in the permissions list.
   * Returns true if an item with UserPermission eq userEmail exists.
   */
  // private async isUserInPermissionList(userEmail: string): Promise<boolean> {
  //   try {
  //     if (!PERMISSIONS_LIST_TITLE || !userEmail) return false;

  //     // Escape single quotes in email for OData filter
  //     const safeEmail = userEmail.replace(/'/g, "''");

  //     // Build REST endpoint (use encoded list title but raw email inside quotes)
  //     const safeListTitle = encodeURIComponent(PERMISSIONS_LIST_TITLE);
  //     const api = `${this.webUrl}/_api/web/lists/getbytitle('${safeListTitle}')/items?$select=Id&$filter=${PERMISSIONS_EMAIL_FIELD} eq '${safeEmail}'&$top=1`;

  //     const resp: SPHttpClientResponse = await this.context.spHttpClient.get(api, SPHttpClient.configurations.v1);
  //     if (!resp.ok) return false;
  //     const data = await resp.json() as { value?: any[] };
  //     return Array.isArray(data.value) && data.value.length > 0;
  //   } catch (e) {
  //     // safe default: treat as not allowed
  //     // console.error('isUserInPermissionList error', e);
  //     return false;
  //   }
  // }

  /**
   * Hide top command bar / edit controls for users who are NOT in the permissions list.
   * Logic:
   *  - If user is site admin => allow (do not hide)
   *  - Else if user email exists in PERMISSIONS_LIST_TITLE (UserPermission column) => allow
   *  - Else => hide header/actions
   */
  // private async hideTopBarForNonAdmins(): Promise<void> {
  //   // Detect if user is site collection admin / tenant admin (best-effort)
  //   const pageCtx: any = this.context.pageContext || {};
  //   const isSiteAdmin = Boolean(
  //     pageCtx.legacyPageContext?.isSiteAdmin ||
  //     pageCtx.user?.isSiteAdmin ||
  //     (pageCtx.legacyPageContext && (pageCtx.legacyPageContext as any).isSiteAdmin)
  //   );

  //   if (isSiteAdmin) {
  //     // Admins see everything
  //     return;
  //   }

  //   // Check if user is granted in permission list
  //   const email = this.userEmail || '';
  //   const allowed = await this.isUserInPermissionList(email);

  //   if (allowed) {
  //     // user present in list -> allow UI
  //     return;
  //   }

  //   // Otherwise hide command bar and edit controls (same logic as before)
  //   const hideFn = (): void => {
  //     try {
  //       const headerSelectors = [
  //         '[data-automationid="PageCommandBar"]',
  //         '[data-automationid="SiteHeader"]',
  //         '#spCommandBar',
  //         '.CanvasPageHeader-actions',
  //         '.sp-commandbar-commands',
  //         '.od-HeaderActions'
  //       ];
  //       headerSelectors.forEach((sel) => {
  //         const el = document.querySelector(sel) as HTMLElement | null;
  //         if (el && el.style.display !== 'none') {
  //           el.style.display = 'none';
  //         }
  //       });

  //       const editSelectors = [
  //         'button[aria-label="Edit"]',
  //         'button[title="Edit"]',
  //         'button[aria-label="Edit page"]',
  //         '[data-automationid="PageCommandBar_Edit"]',
  //         'button[aria-label*="Edit"]',
  //         'button[aria-label*="Page details"]',
  //         'button[aria-label*="Preview"]'
  //       ];
  //       editSelectors.forEach((sel) => {
  //         const btns = document.querySelectorAll(sel);
  //         btns.forEach((b) => {
  //           const be = b as HTMLElement;
  //           if (be && be.style.display !== 'none') {
  //             be.style.display = 'none';
  //           }
  //         });
  //       });

  //       const headerActionGroup = document.querySelector('.sp-commandbar-commands, .CanvasPageHeader-actions, .od-HeaderActions');
  //       if (headerActionGroup) {
  //         (headerActionGroup as HTMLElement).style.display = 'none';
  //       }
  //     } catch (e) {
  //       // ignore
  //     }
  //   };

  //   // Apply immediately
  //   hideFn();

  //   // Ensure it stays hidden on re-renders
  //   if (!this.topBarObserver) {
  //     this.topBarObserver = new MutationObserver(() => {
  //       hideFn();
  //     });
  //     try {
  //       this.topBarObserver.observe(document.body, { childList: true, subtree: true });
  //     } catch {
  //       // ignore observe errors
  //     }
  //   } else {
  //     hideFn();
  //   }
  // }

  public async onInit(): Promise<void> {

    console.log(">>> ExtensionsApplicationCustomizer LOADED <<<", window.location.href);
    if (!this.shouldRender()) return;

    // Hide SharePoint app bar (left)
    this.hideAppBar();


    // Hide Social Bar per page (Like/Comment/Views/Save)
    this.hideSocialBar = new HideSocialBarService({
      // Show ONLY comments (hide social bar + remove line)
      // ui: "commentsOnly",

      // Hide whole block (social bar + comments wrapper)
      // ui: "hideAll",

      mode: "hideOn",
      // ui: "commentsOnly",
      ui: "hideAll",
      webServerRelativeUrl: this.context.pageContext.web.serverRelativeUrl,
      pages: [
        "SitePages/Lets-Celebrate.aspx",
        "SitePages/Tasks.aspx",
        "SitePages/Events-And-Trainings.aspx",
        "SitePages/NewsView.aspx",
        "SitePages/DHRE-Gallery.aspx",
        "SitePages/Profile.aspx",
        "SitePages/About-DHRE.aspx",
        "SitePages/Help-Center.aspx",
        "SitePages/Offers-&-Benifits.aspx",
        "SitePages/Policies-and-Procedures.aspx",
        "SitePages/Beverages.aspx",
        "SitePages/Dashboards.aspx",
        "SitePages/Forms-Library.aspx"
      ],

      // VICE_VERSA
      // Show the social bar ONLY on the pages you list
      // All other pages → social bar is hidden

      // mode: "showOnly",
      // pages: [
      //   "SitePages/Policy.aspx",
      //   "SitePages/Confidential*"
      // ]
    });

    this.hideSocialBar.apply();
    // Hide top command bar & edit buttons from users who are not in permission list
    // await this.hideTopBarForNonAdmins();

    // Amplitude (moved to AmplitudeService.ts)
    this.amplitude = new AmplitudeService({
      apiKey: AMPLITUDE_API_KEY,
      secretKey: AMPLITUDE_SECRET_KEY // provided for future backend usage
    });
    this.amplitude.init(this.context);

    this.injectFont();
    document.body.style.background = '#FFF4EA';

    // Hide Viva Engage "View all" links
    this.hideVivaEngageViewAll();
    this.hideVivaEngageConversationsText();

    // EXISTING (keep same behavior for other urls)
    const urls = resolveUrls(this.webUrl);

    // NEW: resolve Help URL using site absolute url (tenant + site dynamic)
    const siteBaseUrl = this.context.pageContext.site.absoluteUrl || this.webUrl;
    const siteUrls = resolveUrls(siteBaseUrl);

    // Onboarding
    try {
      const qs = new URLSearchParams(window.location.search);
      const forceOnboarding =
        qs.get("onboarding") === "1" ||
        window.location.href.toLowerCase().includes("onboarding=1");

      const { OnboardingService } = await import("./services/OnboardingService");
      const svc = new OnboardingService(this.context);

      const state = await svc.loadState();

      if (forceOnboarding && !state.URL) {
        console.warn("[Onboarding] Forced via ?onboarding=1 but onboarding URL not found in list response.");
      }

      // force means ignore hasSeen
      const shouldShow = forceOnboarding ? true : (!state.hasSeen && !!state.URL);

      if (shouldShow && state.URL) {
        const cfg: IOnboConfig = {
          homeUrl: urls.home,
          URL: state.URL,
          title: state.title
        };

        this.onboarding?.dispose();
        this.onboarding = new Onbo(this.context, cfg);
        this.onboarding.render();
      }
    } catch (err) {
      console.error("Onboarding load failed", err);
    }


    // Services
    this.search = new SearchService(this.webUrl, this.context.msGraphClientFactory, this.context.spHttpClient as SPHttpClient);
    this.nav = new NavigationService(this.context.spHttpClient as SPHttpClient, this.webUrl);
    this.notifService = new NotificationService(
      this.context.spHttpClient as SPHttpClient,
      this.webUrl,
      this.context.pageContext.user.loginName,
      this.context.pageContext.user.email || '',
      this.context.pageContext.user.displayName
    );

    // Footer Service - Initialize once
    this.footerService = new FooterService(this.context.spHttpClient as SPHttpClient, this.webUrl);

    // Header
    this.header = new Header(
      this.webUrl,
      this.userEmail,
      () => (window.location.href = urls.home),
      () => void this.handleBellClick(),
      (input) => this.wireSearch(input),
      urls.profile,

      // NEW: Help Center uses tenant+site dynamic base
      siteUrls.help,

      this.context.msGraphClientFactory,
      this.context.pageContext.user.displayName
    );
    this.header.render(IDS.hosts.header);

    const headerWrap = document.querySelector(`.${styles.TIRHdrWrap}`) as HTMLElement;
    if (headerWrap) {
      this.suggest = new SuggestBox(
        headerWrap,
        () => this.webUrl,
        (upn?) => `${this.webUrl}/_layouts/15/userphoto.aspx?size=M&username=${encodeURIComponent(upn || '')}`
      );
    }

    // Initial render of footer and floating nav
    await this.refreshNavAndFooter();

    // Breadcrumb initialization
    // await this.renderBreadcrumbIfNeededSafe();
    // this.context.application.navigatedEvent.add(this, this.onNavigated);
    // setTimeout((): void => { void this.renderBreadcrumbIfNeededSafe(); }, 800);


    // Breadcrumb initialization (moved to component)
    this.breadcrumbs = new GlobalBreadcrumbs(this.context);
    this.breadcrumbs.init();

    this.context.application.navigatedEvent.add(this, () => {
      this.breadcrumbs?.onNavigated();
    });

    // optional: keep your 800ms safety retry
    setTimeout((): void => {
      this.breadcrumbs?.onNavigated();
    }, 800);

    // news read date time
    this.pageMeta = new PageMetaRelative(this.context);
    this.pageMeta.init();


    // Observe DOM changes for re-rendering
    this.context.application.navigatedEvent.add(this, () => {
      // give SP a moment to swap the canvas
      window.setTimeout((): void => {
        this.hideSocialBar?.apply(); // re-apply on modern navigation
        void this.refreshNavAndFooter();
        this.pageMeta?.onNavigated();
      }, 200);
    });

    window.addEventListener('scroll', this.updateSuggest, true);
    window.addEventListener('resize', this.updateSuggest);

    // Bootstrap notifications
    void this.bootstrapNotifications();
  }

  private async bootstrapNotifications(): Promise<void> {
    try {
      const status = await this.notifService.getUserStatus();
      const items = await this.notifService.getLatest(MAX_NOTIFS);

      // IMPORTANT: isNew now means "unread"
      const unread = items.filter(n => n.isNew).length;
      this.updateNotifBadge(unread);

      this.notifications = new Notifications(items, status.lastSeenAt, {
        onUnreadChange: (count) => this.updateNotifBadge(count),

        onMarkAllRead: async () => {
          await this.notifService.markAllRead();
          this.updateNotifBadge(0);
        },

        // IMPORTANT: per item read (NOT markSeenUpTo)
        onItemOpen: async (item) => {
          await this.notifService.markItemRead(item.id);
        }
      });
    } catch { /* ignore */ }
  }

  private async handleBellClick(): Promise<void> {
    const overlay = document.querySelector(`.${styles.TIRNotifOverlay}`);
    if (overlay) {
      this.notifications?.close();
      return;
    }

    if (!this.notifications && !this.isLoadingNotifications) {
      this.isLoadingNotifications = true;
      await this.bootstrapNotifications();
      this.isLoadingNotifications = false;
    }

    this.notifications?.open();
  }

  private updateNotifBadge(count: number): void {
    const bell = document.getElementById(IDS.elems.bell);
    if (bell) bell.setAttribute('data-count', count > 0 ? String(count) : '0');
  }

  private async refreshNavAndFooter(): Promise<void> {
    // Floating Navigation
    const links = await this.nav.getNavLinks().catch((): any[] => []);
    if (links.length) {
      if (!this.floatingNav) this.floatingNav = new FloatingNav();
      this.floatingNav.render(IDS.hosts.nav, links);
    }

    // Dynamic Footer from List
    await this.renderFooter();
  }

  // Renders footer using FooterService + smart split in Footer.ts
  private async renderFooter(): Promise<void> {
    try {
      const footerLinks = await this.footerService.getFooterLinks();

      this.footer = new Footer(this.webUrl, this.context.spHttpClient as SPHttpClient);
      await this.footer.render(IDS.hosts.footer, footerLinks);
    } catch (err) {
      console.error('Failed to render footer:', err);
    }
  }

  private updateSuggest = (): void => {
    this.suggest?.updatePosition();
  };

  private wireSearch(input: HTMLInputElement): void {
    input.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !this.suggest.moveActive('enter')) {
        const q = input.value.trim();
        const url = q
          ? `${this.webUrl}/_layouts/15/search.aspx?q=${encodeURIComponent(q)}`
          : `${this.webUrl}/_layouts/15/search.aspx`;
        window.location.href = url;
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.suggest.moveActive('down');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.suggest.moveActive('up');
      } else if (e.key === 'Escape') {
        this.suggest.close();
      }
    });

    input.addEventListener('input', () => {
      const val = input.value.trim();
      if (this.debounceId) clearTimeout(this.debounceId);
      if (val.length < 2) {
        this.suggest.close();
        return;
      }

      this.debounceId = window.setTimeout(async () => {
        try {
          const people = await this.search.queryPeople(val, 3);
          const content = await this.search.queryContent(val, 5);
          this.suggest.open(val, [...people, ...content].slice(0, 8));
        } catch {
          this.suggest.open(val, []);
        }
      }, 250);
    });

    document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const host = document.querySelector(`.${styles.TIRSuggestHost}`);
      if (host && !host.contains(target) && target.id !== IDS.elems.search) {
        this.suggest.close();
      }
    });
  }

  public onDispose(): void {
    this.suggest?.close();
    this.header?.dispose();
    this.notifications?.dispose();
    this.floatingNav?.dispose();
    this.footer?.dispose();
    this.hideSocialBar?.dispose();
    if (this.observer) {
      try { this.observer.disconnect(); } catch { /* ignore */ }
    }
    if (this.topBarObserver) {
      try { this.topBarObserver.disconnect(); } catch { /* ignore */ }
    }
    window.removeEventListener('scroll', this.updateSuggest, true);
    window.removeEventListener('resize', this.updateSuggest);
    this.onboarding?.dispose();

    // try {
    // this.context.application.navigatedEvent.remove(this, this.onNavigated);
    // } catch {}
    //  this.unmountBreadcrumb();
    this.breadcrumbs?.dispose();
  }

  /* Hide Viva Engage "View all" button only */
  private hideVivaEngageViewAll(): void {

    const hide = () => {
      const links = document.querySelectorAll('a:not(.hideViewAll)');

      links.forEach(link => {
        const text = link.textContent?.trim().toLowerCase();
        if (text !== 'view all') return;

        // Check if this element is part of Viva Engage
        if (!this.isVivaEngageElement(link)) return;

        // Hide the element
        (link as HTMLElement).style.setProperty('display', 'none', 'important');
        (link as HTMLElement).style.setProperty('visibility', 'hidden', 'important');
        link.classList.add('hideViewAll');
      });
    };

    hide();

    new MutationObserver(() => hide()).observe(document.body, {
      childList: true,
      subtree: true
    });

    setInterval(hide, 2000);
  }

  /* Only checks Viva Engage context */
  private isVivaEngageElement(element: Element): boolean {
    let node: Element | null = element;

    while (node && node !== document.body) {
      const cls = (node.className || '').toString().toLowerCase();
      const id = (node.id || '').toLowerCase();

      // Strong, clean indicators of Viva Engage
      if (
        cls.includes('viva') ||
        cls.includes('engage') ||
        cls.includes('yammer') ||
        id.includes('viva') ||
        id.includes('engage') ||
        id.includes('yammer')
      ) {
        return true;
      }
      node = node.parentElement;
    }

    return false;
  }

  /* find conversation id */
  private hideVivaEngageConversationsText(): void {

    const isHomePage = (): boolean => {
      const path = (window.location.pathname || "").toLowerCase();

      // Covers:
      // /sites/site
      // /sites/site/
      // /sites/site/default.aspx
      return (
        path === this.context.pageContext.web.serverRelativeUrl.toLowerCase() ||
        path === this.context.pageContext.web.serverRelativeUrl.toLowerCase() + "/" ||
        path.endsWith("/default.aspx")
      );
    };

    const hide = () => {
      if (!isHomePage()) return;

      const titles = document.querySelectorAll(
        'span[data-automation-id="webPartTitleReadMode"]'
      );

      titles.forEach((el) => {
        if (el.textContent?.trim() !== "Conversations") return;

        const webPartRoot = el.closest('[class^="webpartTitle"]');
        if (!webPartRoot) return;

        (el as HTMLElement).style.setProperty("display", "none", "important");
        (el as HTMLElement).style.setProperty("visibility", "hidden", "important");
        el.classList.add("hideConversations");
      });
    };

    hide();

    // Handle modern page navigation + async renders
    const observer = new MutationObserver(() => hide());
    observer.observe(document.body, { childList: true, subtree: true });
  }
}
