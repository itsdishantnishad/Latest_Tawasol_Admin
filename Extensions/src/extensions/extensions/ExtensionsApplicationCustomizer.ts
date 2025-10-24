// import { Log } from '@microsoft/sp-core-library';
import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
import { override } from '@microsoft/decorators';
import styles from './Extension.module.scss';
// import * as strings from 'ExtensionsApplicationCustomizerStrings';
require("../../styles/hideNav.css");

export interface IExtensionsApplicationCustomizerProperties { testMessage: string; }

// ---- Assets (folder name MUST be 'assets') ----
const brandIcon: string = require('./assets/TawasolIcon.svg');
const helpIcon:  string = require('./assets/Help.svg');
const bellIcon:  string = require('./assets/Notification.svg');

const homeIcon:      string = require('./assets/HomeIconNavbar.svg');
const feedIcon:      string = require('./assets/FeedIconNavbar.svg');
const tasksIcon:     string = require('./assets/TaskIconNavbar.svg');
const offersIcon:    string = require('./assets/OffersIconNavbar.svg');
const documentsIcon: string = require('./assets/DocumentIconNavbar.svg');

// const instagramIcon: string = require('../assets/InstagramIcon.svg');
// const facebookIcon:  string = require('../assets/FacebookIcon.svg');
const instagramIcon: string = "";
const facebookIcon:  string = "";

/** A Custom Action which can be run during execution of a Client Side Application */
export default class ExtensionsApplicationCustomizer
  extends BaseApplicationCustomizer<IExtensionsApplicationCustomizerProperties> {

  private _headerHost: HTMLDivElement | null = null;
  private _navHost: HTMLDivElement | null = null;
  private _footerHost: HTMLDivElement | null = null;

  private _injectFont(): void {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }

  public static addClass = (selector: any, ...tokens: any[]) =>
    document.querySelector(selector)?.classList.add(...tokens);

  // public onInit(): Promise<void> {
  //   // keep your commented example lines
  //   return Promise.resolve();
  // }

  public onInit(): Promise<void> {
    this._injectFont();
    document.body.style.backgroundColor = "#FFF4EA";

    // Hide native Suite/Title bits (CSS also handles it)
    const ele: any = document.getElementById("SuiteNavWrapper");
    if (ele) ele.classList.add('hide');
    ExtensionsApplicationCustomizer.addClass('#hide-ribbon-inner', 'ribbonClosed');
    ExtensionsApplicationCustomizer.addClass('#SuiteNavWrapper', 'hide');

    this._renderHeader();
    this._renderFloatingNav();
    this._renderFooter();
    return Promise.resolve();
  }

  // ───────────── Render helpers ─────────────
  private _insertAt(containerId: string, html: string, atTop = false): HTMLDivElement {
    const host = document.createElement('div');
    host.id = containerId;
    atTop ? document.body.insertBefore(host, document.body.firstChild) : document.body.appendChild(host);
    host.innerHTML = html;
    return host;
  }

  private _webUrl(): string { return this.context.pageContext?.web?.absoluteUrl || ""; }
  private _upn(): string { return this.context.pageContext?.user?.email || ""; }
  private _photoUrl(): string {
    const u = this._upn(); const w = this._webUrl();
    return u ? `${w}/_layouts/15/userphoto.aspx?size=L&username=${encodeURIComponent(u)}`
             : `${w}/_layouts/15/userphoto.aspx?size=L`;
  }

  // ───────────── Header ─────────────
  private _renderHeader(): void {
    if (this._headerHost) return;

    const homeUrl = "/sites/IntranetRevampTawasol";
    const headerHtml = `
      <header class="${styles.TIRHdr}">
        <div class="${styles.TIRHdrWrap}">
          <div id="tir-brand" class="${styles.TIRBrand}" role="button" aria-label="Go to Home">
            <img src="${brandIcon}" alt="Tawasol" />
          </div>
          <div class="${styles.TIRSearch}">
            <input id="tir-search" class="${styles.TIRSearchInput}" type="text" placeholder="Search" aria-label="Search" />
          </div>
          <div class="${styles.TIRRight}">
            <button id="tir-help"   class="${styles.TIRIconBtn}" title="Help" aria-label="Help">
              <img src="${helpIcon}"  alt="" class="${styles.TIRIcon}" />
            </button>
            <button id="tir-bell"   class="${styles.TIRIconBtn} ${styles.TIRBadge}" data-count="4" title="Notifications" aria-label="Notifications">
              <img src="${bellIcon}"  alt="" class="${styles.TIRIcon}" />
            </button>
            <div class="${styles.TIRAvatar}" title="${this.context.pageContext?.user?.displayName || ''}">
              <img src="${this._photoUrl()}" alt="User" />
            </div>
          </div>
        </div>
      </header>`;

    this._headerHost = this._insertAt('tir-header-host', headerHtml, true);
    document.body.classList.add(styles.TIRBodyWithHdr);

    // lightweight events
    const brand = document.getElementById('tir-brand');
    if (brand) brand.addEventListener('click', () => { window.location.href = homeUrl; });

    const search = document.getElementById('tir-search') as HTMLInputElement | null;
    if (search) search.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const q = (search.value || '').trim();
        const base = `${this._webUrl()}/_layouts/15/search.aspx`;
        window.location.href = q ? `${base}?q=${encodeURIComponent(q)}` : base;
      }
    });
  }

  // ───────────── Floating Nav ─────────────
  private _renderFloatingNav(): void {
    if (this._navHost) return;

    const navItems = [
      { id: "home",   label: "Home",      icon: homeIcon,      url: "/sites/IntranetRevampTawasol" },
      { id: "feed",   label: "Feed",      icon: feedIcon,      url: "/sites/IntranetRevampTawasol/SitePages/Feed.aspx" },
      { id: "tasks",  label: "Tasks",     icon: tasksIcon,     url: "/sites/IntranetRevampTawasol/SitePages/Tasks.aspx" },
      { id: "offers", label: "Offers",    icon: offersIcon,    url: "/sites/IntranetRevampTawasol/SitePages/Offers.aspx" },
      { id: "docs",   label: "Documents", icon: documentsIcon, url: "/sites/IntranetRevampTawasol/SitePages/Documents.aspx" }
    ];

    const items = navItems.map(i => `
      <a id="nav-${i.id}" class="${styles.TIRNavItem}" href="${i.url}">
        <img src="${i.icon}" class="${styles.TIRNavIcon}" alt="${i.label}" />
        <span class="${styles.TIRNavLabel}">${i.label}</span>
      </a>`).join("");

    const navHtml = `
      <nav class="${styles.TIRFloatingNav}" role="navigation" aria-label="Primary">
        <div class="${styles.TIRButtonGroup}">${items}</div>
      </nav>`;

    this._navHost = this._insertAt('tir-nav-host', navHtml);
  }

  // ───────────── Footer ─────────────
  private _renderFooter(): void {
    if (this._footerHost) return;

    const links = [
      { label: "Home",      url: "/sites/IntranetRevampTawasol" },
      { label: "News",      url: "/sites/IntranetRevampTawasol/SitePages/News.aspx" },
      { label: "Offers",    url: "/sites/IntranetRevampTawasol/SitePages/Offers.aspx" },
      { label: "Trainings", url: "/sites/IntranetRevampTawasol/SitePages/Trainings.aspx" },
      { label: "Events",    url: "/sites/IntranetRevampTawasol/SitePages/Events.aspx" },
      { label: "Docs",      url: "/sites/IntranetRevampTawasol/SitePages/Documents.aspx" }
    ];

    const footerHtml = `
      <footer class="${styles.TIRFooter}">
        <h2 class="${styles.TIRFooterLogo}">Tawasol</h2>
        <nav class="${styles.TIRFooterNav}">
          ${links.map(l => `<a href="${l.url}" class="${styles.TIRFooterLink}">${l.label}</a>`).join('')}
        </nav>
        <hr class="${styles.TIRFooterLine}" />
        <div class="${styles.TIRFooterBottom}">
          <span>© 2025 Tawasol. All rights reserved</span>
          <div class="${styles.TIRFooterBottomCenter}">Made with ❤️ by DHRE Technology Team</div>
          <div class="${styles.TIRSocials}">
            <a href="#"><img src="${instagramIcon}" alt="Instagram" /></a>
            <a href="#"><img src="${facebookIcon}"  alt="Facebook"  /></a>
          </div>
        </div>
      </footer>`;

    this._footerHost = this._insertAt('tir-footer-host', footerHtml);
  }

  @override
  public onDispose(): void {
    if (this._headerHost) { this._headerHost.remove(); this._headerHost = null; }
    if (this._navHost)    { this._navHost.remove();    this._navHost = null; }
    if (this._footerHost) { this._footerHost.remove(); this._footerHost = null; }
  }
}
