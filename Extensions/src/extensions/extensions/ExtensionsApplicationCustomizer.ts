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

// Onboarding import
import Onbo from './components/Onbo';
import { IOnboConfig } from './components/Onbo';

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

  // ✅ Amplitude Service
  private amplitude!: AmplitudeService;

  private observer?: MutationObserver;
  private topBarObserver?: MutationObserver;
  private debounceId?: number;

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
    if (!this.shouldRender()) return;

    // 👉 Hide SharePoint app bar (left)
    this.hideAppBar();

    // 👉 Hide top command bar & edit buttons from users who are not in permission list
    // await this.hideTopBarForNonAdmins();

    // ✅ Amplitude (moved to AmplitudeService.ts)
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

    const urls = resolveUrls(this.webUrl);

    // Onboarding
    try {
      const state = await Onbo.loadStateFromList(this.context);
      if (!state.hasSeen && state.videoUrl) {
        const cfg: IOnboConfig = { homeUrl: urls.home, videoUrl: state.videoUrl };
        this.onboarding = new Onbo(this.context, cfg);
        this.onboarding.render();
      }
    } catch (err) {
      console.error('Onboarding load failed', err);
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

    // Observe DOM changes for re-rendering
    this.context.application.navigatedEvent.add(this, () => {
      // give SP a moment to swap the canvas
      window.setTimeout((): void => { void this.refreshNavAndFooter(); }, 200);
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
      const unread = items.filter(n => n.created > status.lastSeenAt).length;
      this.updateNotifBadge(unread);

      this.notifications = new Notifications(items, status.lastSeenAt, {
        onUnreadChange: (count) => this.updateNotifBadge(count),
        onMarkAllRead: async () => {
          await this.notifService.markAllRead();
          this.updateNotifBadge(0);
        },
        onItemOpen: async (item) => {
          if (item.created) await this.notifService.markSeenUpTo(item.created);
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
    if (this.observer) {
      try { this.observer.disconnect(); } catch { /* ignore */ }
    }
    if (this.topBarObserver) {
      try { this.topBarObserver.disconnect(); } catch { /* ignore */ }
    }
    window.removeEventListener('scroll', this.updateSuggest, true);
    window.removeEventListener('resize', this.updateSuggest);
    this.onboarding?.dispose();
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
    const hideConversations = () => {
      const allElements = document.querySelectorAll('*');

      allElements.forEach((element) => {
        const text = element.textContent?.trim();

        if (text === 'Conversations' && !element.classList.contains('hideConversations')) {
          (element as HTMLElement).style.display = 'none';
          (element as HTMLElement).style.visibility = 'hidden';
          element.classList.add('hideConversations');
        }
      });

      const observer = new MutationObserver(() => {
        const elements = document.querySelectorAll('*:not(.hideConversations)');
        elements.forEach((element) => {
          const text = element.textContent?.trim();
          if (text === 'Conversations') {
            (element as HTMLElement).style.display = 'none';
            (element as HTMLElement).style.visibility = 'hidden';
            element.classList.add('hideConversations');
          }
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    };

    hideConversations();

    setInterval(hideConversations, 3000);
  }

}
