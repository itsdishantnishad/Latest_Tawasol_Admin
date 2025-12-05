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
import { IDS, HARD_NOTIFS, resolveUrls } from './shared/constants';

// 🔹 Onboarding import
import Onbo from './components/Onbo';
import { IOnboConfig } from './components/Onbo';

export interface IExtensionsApplicationCustomizerProperties {
  testMessage: string;
}

/** Amplitude API key (project key) */
const AMPLITUDE_API_KEY: string = 'c8c6db5639af77ddc99ca0e6a6b32f53';

/** Types for window.amplitude so we don't use `any` */
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
  private notifications!: Notifications;
  private observer?: MutationObserver;
  private debounceId?: number;

  // 🔹 Onboarding instance
  private onboarding?: Onbo;

  private get webUrl(): string { return this.context.pageContext.web.absoluteUrl; }
  private get userEmail(): string { return this.context.pageContext.user.email || ''; }

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

  /**
   * Read current Site Page Content Type and map to a friendly pageType.
   * Any CT whose name contains:
   *  - "news"    -> "News"
   *  - "event"   -> "Event"
   *  - "training"-> "Training"
   *  else        -> "Page"
   */
  private async getPageTypeFromContentType():
    Promise<{ pageType: string; contentTypeName?: string }> {

    try {
      const ctx = this.context.pageContext;

      if (!ctx.list || !ctx.listItem) {
        return { pageType: 'Page' };
      }

      const listId = ctx.list.id.toString();
      const itemId = ctx.listItem.id;

      const apiUrl =
        `${ctx.web.absoluteUrl}/_api/web/lists(guid'${listId}')/items(${itemId})` +
        `?$select=ContentType/Name&$expand=ContentType`;

      const resp: SPHttpClientResponse = await this.context.spHttpClient.get(
        apiUrl,
        SPHttpClient.configurations.v1
      );

      if (!resp.ok) {
        return { pageType: 'Page' };
      }

      const data = await resp.json() as { ContentType?: { Name?: string } };
      const rawName: string = data.ContentType?.Name || '';
      const ctName = rawName.toLowerCase();

      let pageType = 'Page';

      if (ctName.indexOf('news') >= 0) {
        pageType = 'News';
      } else if (ctName.indexOf('event') >= 0) {
        pageType = 'Event';
      } else if (ctName.indexOf('training') >= 0) {
        pageType = 'Training';
      }

      return { pageType, contentTypeName: rawName };
    } catch {
      return { pageType: 'Page' };
    }
  }

  /** Initialise Amplitude SDK and log a page view for every modern Site Page */
  private initAmplitude(): void {
    if (!AMPLITUDE_API_KEY) return;

    const win = window as unknown as AmplitudeWindow;

    // If Amplitude is already available, configure directly
    if (win.amplitude && win.amplitude.getInstance) {
      void this.configureAmplitude();
      return;
    }

    // Inject script only once
    if (!document.getElementById('amplitude-js')) {
      const script = document.createElement('script');
      script.id = 'amplitude-js';
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://cdn.amplitude.com/libs/amplitude-8.21.2-min.gz.js';

      script.onload = () => {
        void this.configureAmplitude();
      };

      // Optional: silent error handler; no console noise
      script.onerror = () => { /* ignore */ };

      document.head.appendChild(script);
    } else {
      // Script tag exists; give it a moment then configure
      window.setTimeout(() => {
        void this.configureAmplitude();
      }, 1000);
    }
  }

  /** Configure Amplitude user + log "SharePoint Page Viewed" with pageType from CT */
  private async configureAmplitude(): Promise<void> {
    const win = window as unknown as AmplitudeWindow;
    if (!win.amplitude || !win.amplitude.getInstance) return;

    const instance = win.amplitude.getInstance();
    if (!instance) return;

    const user = this.context.pageContext.user;
    const web = this.context.pageContext.web;

    const userLogin: string = user.loginName;
    const userEmail: string = user.email || '';
    const userDisplayName: string = user.displayName;
    const siteTitle: string = web.title;
    const siteId: string = web.id.toString();

    const userId: string = userEmail || userLogin;

    instance.init(AMPLITUDE_API_KEY, userId, {
      includeUtm: true,
      includeReferrer: true,
      saveEvents: true
    });

    instance.setUserProperties({
      spLogin: userLogin,
      spDisplayName: userDisplayName,
      spEmail: userEmail,
      siteTitle,
      siteId
    });

    const { pageType, contentTypeName } = await this.getPageTypeFromContentType();

    instance.logEvent('SharePoint Page Viewed', {
      url: window.location.href,
      pagePath: window.location.pathname || '',
      title: document.title,
      siteTitle,
      siteUrl: web.absoluteUrl,
      pageType,          // "News" / "Event" / "Training" / "Page"
      contentTypeName    // e.g. "TIR News Story"
    });
  }

  // 🔹 ONINIT UPDATED FOR ONBOARDING + REST SAME
  public async onInit(): Promise<void> {
    if (!this.shouldRender()) return;

    // Amplitude tracking for every modern Site Page
    this.initAmplitude();

    this.injectFont();
    document.body.style.background = '#FFF4EA';

    const urls = resolveUrls(this.webUrl);

    // ---------- ONBOARDING FROM LIST ----------
    try {
      const state = await Onbo.loadStateFromList(this.context);

      if (!state.hasSeen && state.videoUrl) {
        const cfg: IOnboConfig = {
          homeUrl: urls.home,
          videoUrl: state.videoUrl
        };
        this.onboarding = new Onbo(this.context, cfg);
        this.onboarding.render();
      }
    } catch (err) {
      // Onboarding fail should NOT break rest of extension
      console.error('Onboarding load failed', err);
    }

        // ---------- TEMP: FORCE ONBOARDING FOR TEST ----------
   
    // ---- SEARCH SERVICE ----
    this.search = new SearchService(
      this.webUrl,
      this.context.msGraphClientFactory,
      this.context.spHttpClient as SPHttpClient
    );

    this.nav = new NavigationService(
      this.context.spHttpClient as SPHttpClient,
      this.webUrl
    );
    this.notifications = new Notifications(HARD_NOTIFS);

    this.header = new Header(
      this.webUrl,
      this.userEmail,
      () => (window.location.href = urls.home),
      () => {
        const open = document.querySelector(`.${styles.TIRNotifOverlay}`);
        open ? this.notifications.close() : this.notifications.open();
      },
      (input) => this.wireSearch(input)
    );
    this.header.render(IDS.hosts.header);

    const headerWrap = document.querySelector(`.${styles.TIRHdrWrap}`) as HTMLElement;
    if (headerWrap) {
      this.suggest = new SuggestBox(
        headerWrap,
        () => this.webUrl,
        (upn?) =>
          `${this.webUrl}/_layouts/15/userphoto.aspx?size=M&username=${encodeURIComponent(
            upn || ''
          )}`
      );
    }

    await this.refreshNavAndFooter();
    this.observer = new MutationObserver(() => {
      void this.refreshNavAndFooter();
    });
    this.observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('scroll', this.updateSuggest, true);
    window.addEventListener('resize', this.updateSuggest);
  }

  private async refreshNavAndFooter(): Promise<void> {
    const links = await this.nav.getNavLinks().catch((/*err*/): any[] => {
      return [];
    });

    if (links.length) {
      this.floatingNav = new FloatingNav();
      this.floatingNav.render(IDS.hosts.nav, links);
    }

    const urls = resolveUrls(this.webUrl);
    this.footer = new Footer();
    this.footer.render(IDS.hosts.footer, [
      { label: 'Home', url: urls.home },
      { label: 'News', url: urls.news },
      { label: 'Offers', url: urls.offers },
      { label: 'Trainings', url: urls.trainings },
      { label: 'Events', url: urls.events },
      { label: 'Docs', url: urls.docs },
      { label: 'About', url: urls.aboutDHRE }
    ]);
  }

  private updateSuggest = (): void => {
    this.suggest?.updatePosition();
  };

  /** Wire up search box with suggestions (people + content) */
  private wireSearch(input: HTMLInputElement): void {
    input.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !this.suggest.moveActive('enter')) {
        const q = input.value.trim();
        const url = `${this.webUrl}/_layouts/15/search.aspx?q=${encodeURIComponent(q)}`;
        window.location.href = q ? url : `${this.webUrl}/_layouts/15/search.aspx`;
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
      if (this.debounceId) {
        clearTimeout(this.debounceId);
      }
      if (val.length < 2) {
        this.suggest.close();
        return;
      }

      this.debounceId = window.setTimeout(async () => {
        try {
          const people = await this.search.queryPeople(val, 3);
          const content = await this.search.queryContent(val, 5);

          const results = [...people, ...content].slice(0, 8);
          this.suggest.open(val, results);
        } catch (err) {
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
    this.floatingNav?.dispose();
    this.footer?.dispose();
    this.observer?.disconnect();
    window.removeEventListener('scroll', this.updateSuggest, true);
    window.removeEventListener('resize', this.updateSuggest);

    // 🔹 clean onboarding overlay if still present
    this.onboarding?.dispose();
  }
}
