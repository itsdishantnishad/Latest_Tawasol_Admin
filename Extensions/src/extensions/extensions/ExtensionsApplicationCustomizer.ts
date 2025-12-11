// src/extensions/extensions/ExtensionsApplicationCustomizer.ts

import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
require('../../styles/hideNav.css');

import styles from './Extension.module.scss';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
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

// Onboarding import
import Onbo from './components/Onbo';
import { IOnboConfig } from './components/Onbo';

export interface IExtensionsApplicationCustomizerProperties {
  testMessage: string;
}

/** Amplitude API key (project key) */
const AMPLITUDE_API_KEY: string = 'c8c6db5639af77ddc99ca0e6a6b32f53';
const MAX_NOTIFS: number = 100;

type AmplitudeProps = Record<string, unknown>;

interface AmplitudeInstance {
  init(apiKey: string, userId?: string | null, config?: AmplitudeProps): void;
  setUserProperties(props: AmplitudeProps): void;
  logEvent(name: string, props?: AmplitudeProps): void;
}

interface AmplitudeWindow extends Window {
  amplitude?: {
    getInstance?: () => AmplitudeInstance;
  };
}

export default class ExtensionsApplicationCustomizer
  extends BaseApplicationCustomizer<IExtensionsApplicationCustomizerProperties> {

  private header!: Header;
  private footer!: Footer;
  private floatingNav!: FloatingNav;
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

  private observer?: MutationObserver;
  private debounceId?: number;

  private get webUrl(): string {
    return this.context.pageContext.web.absoluteUrl;
  }
  private get userEmail(): string {
    return this.context.pageContext.user.email || '';
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

  private async getPageTypeFromContentType(): Promise<{ pageType: string; contentTypeName?: string }> {
    try {
      const ctx = this.context.pageContext;
      if (!ctx.list || !ctx.listItem) return { pageType: 'Page' };

      const listId = ctx.list.id.toString();
      const itemId = ctx.listItem.id;

      const apiUrl = `${ctx.web.absoluteUrl}/_api/web/lists(guid'${listId}')/items(${itemId})?$select=ContentType/Name&$expand=ContentType`;

      const resp: SPHttpClientResponse = await this.context.spHttpClient.get(apiUrl, SPHttpClient.configurations.v1);
      if (!resp.ok) return { pageType: 'Page' };

      const data = (await resp.json()) as { ContentType?: { Name?: string } };
      const rawName: string = data.ContentType?.Name || '';
      const ctName = rawName.toLowerCase();

      let pageType = 'Page';
      if (ctName.includes('news')) pageType = 'News';
      else if (ctName.includes('event')) pageType = 'Event';
      else if (ctName.includes('training')) pageType = 'Training';

      return { pageType, contentTypeName: rawName };
    } catch {
      return { pageType: 'Page' };
    }
  }

  private initAmplitude(): void {
    if (!AMPLITUDE_API_KEY) return;

    const win = window as unknown as AmplitudeWindow;
    if (win.amplitude && win.amplitude.getInstance) {
      void this.configureAmplitude();
      return;
    }

    if (!document.getElementById('amplitude-js')) {
      const script = document.createElement('script');
      script.id = 'amplitude-js';
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://cdn.amplitude.com/libs/amplitude-8.21.2-min.gz.js';
      script.onload = () => void this.configureAmplitude();
      document.head.appendChild(script);
    } else {
      setTimeout(() => void this.configureAmplitude(), 1000);
    }
  }
  /** Hide the sharepoint left sitebar */
  private hideAppBar(): void {
    // document.getElementById('sp-appBar').style.display = 'none';
    const appBar = document.getElementById('sp-appBar');
    if (appBar) {
      appBar.style.display = 'none';
    }
  }
  /** Configure Amplitude user + log "SharePoint Page Viewed" with pageType from CT */
  private async configureAmplitude(): Promise<void> {
    const win = window as unknown as AmplitudeWindow;
    if (!win.amplitude?.getInstance) return;

    const instance = win.amplitude.getInstance();
    if (!instance) return;

    const user = this.context.pageContext.user;
    const web = this.context.pageContext.web;
    const userId = user.email || user.loginName;

    instance.init(AMPLITUDE_API_KEY, userId, { includeUtm: true, includeReferrer: true, saveEvents: true });
    instance.setUserProperties({
      spLogin: user.loginName,
      spDisplayName: user.displayName,
      spEmail: user.email,
      siteTitle: web.title,
      siteId: web.id.toString()
    });

    const { pageType, contentTypeName } = await this.getPageTypeFromContentType();
    instance.logEvent('SharePoint Page Viewed', {
      url: window.location.href,
      pagePath: window.location.pathname,
      title: document.title,
      siteTitle: web.title,
      siteUrl: web.absoluteUrl,
      pageType,
      contentTypeName
    });
  }
 
  public async onInit(): Promise<void> {
    if (!this.shouldRender()) return;
  // 👉 Hide SharePoint app bar
    this.hideAppBar();
    this.initAmplitude();
    this.injectFont();
    document.body.style.background = '#FFF4EA';
    // this.hideVivaEngageViewAll();
    this.hideVivaEngageConversationsText();
    // Amplitude tracking for every modern Site Page
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
      () => window.location.href = urls.home,
      () => void this.handleBellClick(),
      (input) => this.wireSearch(input)
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
    this.observer = new MutationObserver(() => void this.refreshNavAndFooter());
    this.observer.observe(document.body, { childList: true, subtree: true });

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
    const links = await this.nav.getNavLinks().catch(() => []);
    if (links.length) {
      this.floatingNav = new FloatingNav();
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
    this.observer?.disconnect();
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

