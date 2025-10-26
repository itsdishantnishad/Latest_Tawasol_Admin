import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
import { override } from '@microsoft/decorators';
require('../../styles/hideNav.css');

import styles from './Extension.module.scss';
import { SPHttpClient } from '@microsoft/sp-http';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FloatingNav } from './components/FloatingNav';
import { Notifications } from './shared/notifications';
import { SuggestBox } from './components/SuggestBox';

import { SearchService } from './services/searchService';
import { IDS, URLS, HARD_NOTIFS } from './shared/constants';

// assets for nav
const homeIcon: string      = require('./assets/HomeIconNavbar.svg');
const feedIcon: string      = require('./assets/FeedIconNavbar.svg');
const tasksIcon: string     = require('./assets/TaskIconNavbar.svg');
const offersIcon: string    = require('./assets/OffersIconNavbar.svg');
const documentsIcon: string = require('./assets/DocumentIconNavbar.svg');

export interface IExtensionsApplicationCustomizerProperties {
  testMessage: string;
}

export default class ExtensionsApplicationCustomizer
  extends BaseApplicationCustomizer<IExtensionsApplicationCustomizerProperties> {

  private header!: Header;
  private nav!: FloatingNav;
  private footer!: Footer;

  private suggest!: SuggestBox;
  private search!: SearchService;
  private notifications!: Notifications;

  private debounceHandle: number | null = null;

  private injectInterFont(): void {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }

  private webUrl(): string { return this.context.pageContext?.web?.absoluteUrl || ''; }
  private upn(): string { return this.context.pageContext?.user?.email || ''; }

  @override
  public onInit(): Promise<void> {
    this.injectInterFont();
    document.body.style.backgroundColor = '#FFF4EA';

    const suite = document.getElementById('SuiteNavWrapper');
    if (suite) suite.classList.add('hide');
    document.querySelector('#hide-ribbon-inner')?.classList.add('ribbonClosed');

    // services
    this.search = new SearchService(
      this.webUrl(),
      this.context.msGraphClientFactory,
      this.context.spHttpClient as SPHttpClient
    );

    // components
    this.notifications = new Notifications(HARD_NOTIFS);

    this.header = new Header(
      this.webUrl(),
      this.upn(),
      () => { window.location.href = URLS.home; },      // brand click
      () => {                                           // bell click
        const anyOpen = document.querySelector(`.${styles.TIRNotifOverlay}`) as HTMLElement | null;
        if (anyOpen) this.notifications.close(); else this.notifications.open();
      },
      (inputEl) => this.wireSearchInput(inputEl)        // search ready
    );
    this.header.render(IDS.hosts.header);

    this.nav = new FloatingNav();
    this.nav.render(IDS.hosts.nav, [
      { id: 'home',   label: 'Home',      icon: homeIcon,      url: URLS.home },
      { id: 'feed',   label: 'Feed',      icon: feedIcon,      url: URLS.feed },
      { id: 'tasks',  label: 'Tasks',     icon: tasksIcon,     url: URLS.tasks },
      { id: 'offers', label: 'Offers',    icon: offersIcon,    url: URLS.offers },
      { id: 'docs',   label: 'Documents', icon: documentsIcon, url: URLS.docs }
    ]);

    this.footer = new Footer();
    this.footer.render(IDS.hosts.footer, [
      { label: 'Home',      url: URLS.home },
      { label: 'News',      url: '/sites/IntranetRevampTawasol/SitePages/News.aspx' },
      { label: 'Offers',    url: URLS.offers },
      { label: 'Trainings', url: '/sites/IntranetRevampTawasol/SitePages/Trainings.aspx' },
      { label: 'Events',    url: '/sites/IntranetRevampTawasol/SitePages/Events.aspx' },
      { label: 'Docs',      url: URLS.docs }
    ]);

    // suggestion box
    const headerWrap = document.querySelector(`.${styles.TIRHdrWrap}`) as HTMLElement;
    this.suggest = new SuggestBox(
      headerWrap,
      () => this.webUrl(),
      (upn?) => `${this.webUrl()}/_layouts/15/userphoto.aspx?size=M${upn ? `&username=${encodeURIComponent(upn)}` : ''}`
    );

    // keep suggestions aligned during scroll/resize
    window.addEventListener('scroll', this.updateSuggestPosition, true);
    window.addEventListener('resize', this.updateSuggestPosition);

    return Promise.resolve();
  }

  private updateSuggestPosition = (): void => {
    if (this.suggest) this.suggest.updatePosition();
  };

  private wireSearchInput(input: HTMLInputElement): void {
    input.addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' && !this.suggest.moveActive('enter')) {
        const text = (input.value || '').trim();
        const base = `${this.webUrl()}/_layouts/15/search.aspx`;
        window.location.href = text ? `${base}?q=${encodeURIComponent(text)}` : base;
      } else if (ev.key === 'ArrowDown') {
        ev.preventDefault(); this.suggest.moveActive('down');
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault(); this.suggest.moveActive('up');
      } else if (ev.key === 'Escape') {
        this.suggest.close();
      }
    });

    input.addEventListener('input', () => {
      const text = (input.value || '').trim();
      if (this.debounceHandle) window.clearTimeout(this.debounceHandle);
      if (text.length < 2) { this.suggest.close(); return; }

      this.debounceHandle = window.setTimeout(async () => {
        try {
          const [people, content] = await Promise.all([
            this.search.queryPeople(text, 3).catch(() => []),
            this.search.queryContent(text, 5).catch(() => [])
          ]);

          // inject avatar url for person results (via userphoto.aspx M)
          const peopleWithPhotos = people.map(p => ({
            ...p,
            imageUrl: `${this.webUrl()}/_layouts/15/userphoto.aspx?size=M&username=${encodeURIComponent((p.subtitle || '').split(' ').pop() || '')}`
          }));

          const merged = [...peopleWithPhotos, ...content].slice(0, 8);
          this.suggest.open(text, merged);
        } catch {
          this.suggest.open(text, []);
        }
      }, 220);
    });

    document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const host = document.querySelector(`.${styles.TIRSuggestHost}`) as HTMLElement | null;
      if (host && !host.contains(target) && target.id !== IDS.elems.search) this.suggest.close();
    });
  }

  @override
  public onDispose(): void {
    this.suggest?.close();
    this.header?.dispose();
    this.nav?.dispose();
    this.footer?.dispose();

    window.removeEventListener('scroll', this.updateSuggestPosition, true);
    window.removeEventListener('resize', this.updateSuggestPosition);
  }
}
