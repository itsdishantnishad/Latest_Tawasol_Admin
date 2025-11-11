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
import { IDS, HARD_NOTIFS, resolveUrls } from './shared/constants';

export interface IExtensionsApplicationCustomizerProperties {
  testMessage: string;
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

  public onInit(): Promise<void> {
    if (!this.shouldRender()) return Promise.resolve();

    this.injectFont();
    document.body.style.background = '#FFF4EA';

    this.search = new SearchService(this.webUrl, this.context.msGraphClientFactory, this.context.spHttpClient as SPHttpClient);
    this.nav = new NavigationService(this.context.spHttpClient as SPHttpClient, this.webUrl);
    this.notifications = new Notifications(HARD_NOTIFS);

    const urls = resolveUrls(this.webUrl);
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
      this.suggest = new SuggestBox(headerWrap, () => this.webUrl, (upn?) =>
        `${this.webUrl}/_layouts/15/userphoto.aspx?size=M&username=${encodeURIComponent(upn || '')}`
      );
    }

    this.refreshNavAndFooter();
    this.observer = new MutationObserver(() => this.refreshNavAndFooter());
    this.observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('scroll', this.updateSuggest, true);
    window.addEventListener('resize', this.updateSuggest);

    return Promise.resolve();
  }

  private async refreshNavAndFooter(): Promise<void> {
    const links = await this.nav.getNavLinks().catch(() => []);
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

  private updateSuggest = (): void => this.suggest?.updatePosition();

  private wireSearch(input: HTMLInputElement): void {
    input.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !this.suggest.moveActive('enter')) {
        const q = input.value.trim();
        const url = `${this.webUrl}/_layouts/15/search.aspx?q=${encodeURIComponent(q)}`;
        window.location.href = q ? url : `${this.webUrl}/_layouts/15/search.aspx`;
      } else if (e.key === 'ArrowDown') { e.preventDefault(); this.suggest.moveActive('down'); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); this.suggest.moveActive('up'); }
      else if (e.key === 'Escape') this.suggest.close();
    });

    input.addEventListener('input', () => {
      const val = input.value.trim();
      if (this.debounceId) clearTimeout(this.debounceId);
      if (val.length < 2) { this.suggest.close(); return; }

      this.debounceId = window.setTimeout(async () => {
        try {
          const [people, content] = await Promise.all([
            this.search.queryPeople(val, 3),
            this.search.queryContent(val, 5)
          ]);
          const results = [...people, ...content].slice(0, 8);
          this.suggest.open(val, results);
        } catch { this.suggest.open(val, []); }
      }, 250);
    });

    document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const host = document.querySelector(`.${styles.TIRSuggestHost}`);
      if (host && !host.contains(target) && target.id !== IDS.elems.search) this.suggest.close();
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
  }
}
