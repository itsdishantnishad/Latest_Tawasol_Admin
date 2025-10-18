// import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';
import { override } from '@microsoft/decorators';
import styles from './Extension.module.scss';
// import * as strings from 'ExtensionsApplicationCustomizerStrings';
require("../../styles/hideNav.css");




export interface IExtensionsApplicationCustomizerProperties {

  testMessage: string;
}

// ✅ Navbar icons
const homeIcon: string = require('./assests/HomeIconNavbar.svg');
const feedIcon: string = require('./assests/FeedIconNavbar.svg');
const tasksIcon: string = require('./assests/TaskIconNavbar.svg');
const offersIcon: string = require('./assests/OffersIconNavbar.svg');
const documentsIcon: string = require('./assests/DocumentIconNavbar.svg');



// ✅ Footer icons
// const instagramIcon: string = require('../assets/InstagramIcon.svg');
// const facebookIcon: string = require('../assets/FacebookIcon.svg');
const instagramIcon: string = ""
const facebookIcon: string = ""


/** A Custom Action which can be run during execution of a Client Side Application */
export default class ExtensionsApplicationCustomizer
  extends BaseApplicationCustomizer<IExtensionsApplicationCustomizerProperties> {

  private _host: HTMLDivElement | null = null;

  private _injectFont(): void {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }


  public static addClass = (selector: any, ...tokens: any[]) => document.querySelector(selector)?.classList.add(...tokens);

  public static hasClass = (selector: any, className: any) => document.querySelector(selector)?.classList.contains(className);

  public static removeClass = (selector: any, ...tokens: any[]) => document.querySelector(selector)?.classList.remove(...tokens);

  // public onInit(): Promise<void> {
  //   Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
  //   document.body.style.backgroundColor = "#FFF4EA";
  //   // const ele: any = document.getElementById("SuiteNavWrapper")
  //   // ele.classList.add('hide');
  //   ExtensionsApplicationCustomizer.addClass('#hide-ribbon-inner', 'ribbonClosed');
  //   ExtensionsApplicationCustomizer.addClass('#SuiteNavWrapper', 'hide');

  //   return Promise.resolve();
  // }


  public onInit(): Promise<void> {
    this._injectFont();
    document.body.style.backgroundColor = "#FFF4EA";
    const ele: any = document.getElementById("SuiteNavWrapper")
    ele.classList.add('hide');
    ExtensionsApplicationCustomizer.addClass('#hide-ribbon-inner', 'ribbonClosed');
    ExtensionsApplicationCustomizer.addClass('#SuiteNavWrapper', 'hide');
    this._host = document.createElement('div');
    this._host.id = 'floating-nav-footer-host';
    document.body.appendChild(this._host);

    // ✅ Navbar items
    const navItems = [
      { id: "home", label: "Home", icon: homeIcon, url: "/sites/IntranetRevampProjectTawasol/SitePages/Home.aspx" },
      { id: "feed", label: "Feed", icon: feedIcon, url: "/sites/IntranetRevampProjectTawasol/SitePages/Feed.aspx" },
      { id: "tasks", label: "Tasks", icon: tasksIcon, url: "/sites/IntranetRevampProjectTawasol/SitePages/Tasks.aspx" },
      { id: "offers", label: "Offers", icon: offersIcon, url: "/sites/IntranetRevampProjectTawasol/SitePages/Offers.aspx" },
      { id: "docs", label: "Documents", icon: documentsIcon, url: "/sites/IntranetRevampProjectTawasol/SitePages/Documents.aspx" }
    ];

    // ✅ Footer links
    const footerLinks = [
      { label: "Home", url: "/sites/IntranetRevampProjectTawasol/SitePages/Home.aspx" },
      { label: "News", url: "/sites/IntranetRevampProjectTawasol/SitePages/News.aspx" },
      { label: "Offers", url: "/sites/IntranetRevampProjectTawasol/SitePages/Offers.aspx" },
      { label: "Trainings", url: "/sites/IntranetRevampProjectTawasol/SitePages/Trainings.aspx" },
      { label: "Events", url: "/sites/IntranetRevampProjectTawasol/SitePages/Events.aspx" },
      { label: "Docs", url: "/sites/IntranetRevampProjectTawasol/SitePages/Documents.aspx" }
    ];

    // ✅ Build HTML
    let html = `
      <!-- Floating Nav -->
      <nav class="${styles.floatingNav}" role="navigation" aria-label="Primary">
        <div class="${styles.buttonGroup}">
    `;
    navItems.forEach(item => {
      html += `
        <a id="nav-${item.id}" class="${styles.navItem}" href="${item.url}">
          <img src="${item.icon}" class="${styles.icon}" alt="${item.label}" />
          <span class="${styles.label}">${item.label}</span>
        </a>`;
    });
    html += `
        </div>
      </nav>

      <!-- Footer -->
      <footer class="${styles.footer}">
        <h2 class="${styles.footerLogo}">Tawasol</h2>
        <nav class="${styles.footerNav}">
          ${footerLinks.map(link => `<a href="${link.url}" class="${styles.footerLink}">${link.label}</a>`).join("")}
        </nav>
        <hr class="${styles.footerLine}" />
        <div class="${styles.footerBottom}">
          <span>© 2025 Tawasol. All rights reserved</span>
          <div class="${styles.footerBottomMiddle}">Made with ❤️ by DHRE Technology Team</div>
          <div class="${styles.socials}">
            <a href="#"><img src="${instagramIcon}" alt="Instagram" /></a>
            <a href="#"><img src="${facebookIcon}" alt="Facebook" /></a>
          </div>
        </div>
      </footer>
    `;
    this._host.innerHTML = html;

    return Promise.resolve();
  }

  @override
  public onDispose(): void {
    if (this._host) {
      this._host.remove();
      this._host = null;
    }
  }
}

