// src/extensions/extensions/components/Header.ts
import styles from '../Extension.module.scss';
import { IDS } from '../shared/constants';
import { Icons } from '../shared/icons';
import { PhotoService } from '../shared/photoService';

const brandIcon: string = require('../assets/TawasolIcon.svg');
const helpIcon:  string = require('../assets/Help.svg');
const bellIcon:  string = require('../assets/Notification.svg');

export class Header {
  private suggestHost: HTMLDivElement | null = null;
  private photo: PhotoService;

  constructor(
    webUrl: string, // not stored as a field (keeps TS happy)
    private readonly currentUserUpn: string,
    private readonly onBrandClick: () => void,
    private readonly onBellClick: () => void,
    private readonly onSearchReady: (input: HTMLInputElement) => void
  ) {
    this.photo = new PhotoService(webUrl, currentUserUpn);
  }

  public render(hostId: string): void {
    if (document.getElementById(hostId)) return;

    const html = `
      <header class="${styles.TIRHdr}">
        <div class="${styles.TIRHdrWrap}">
          <div id="${IDS.elems.brand}" class="${styles.TIRBrand}" role="button" aria-label="Go to Home">
            <img src="${brandIcon}" alt="Tawasol" class="${styles.TIRBrandLogo}" />
          </div>

          <div class="${styles.TIRSearch}" role="search" aria-label="Search">
            <span class="${styles.TIRSearchIcon}" aria-hidden="true">${Icons.search}</span>
            <input id="${IDS.elems.search}" class="${styles.TIRSearchInput}" type="text"
                   placeholder="Search" aria-label="Search input" autocomplete="off" />
          </div>

          <div class="${styles.TIRRight}">
            <button id="tir-help" class="${styles.TIRIconBtn}" title="Help" aria-label="Help">
              <img src="${helpIcon}" alt="" />
            </button>
            <button id="${IDS.elems.bell}" class="${styles.TIRIconBtn} ${styles.TIRBadge}" data-count="4"
                    title="Notifications" aria-label="Notifications">
              <img src="${bellIcon}" alt="" />
            </button>
            <div class="${styles.TIRAvatar}">
              <img src="${this.photo.getMedium(this.currentUserUpn)}" alt="User"
                   onerror="this.onerror=null;this.src='${this.photo.getMedium(this.currentUserUpn)}';" />
            </div>
          </div>
        </div>
      </header>`;

    const host = document.createElement('div');
    host.id = hostId;
    host.innerHTML = html;
    document.body.insertBefore(host, document.body.firstChild);

    // brand & bell
    document.getElementById(IDS.elems.brand)?.addEventListener('click', this.onBrandClick);
    document.getElementById(IDS.elems.bell)?.addEventListener('click', this.onBellClick);

    // ✅ Help → simple "coming soon" prompt
    document.getElementById('tir-help')?.addEventListener('click', () => {
      window.alert('Tawasol FAQ is coming soon.');
    });

    // pass search input back so customizer wires SuggestBox/SearchService
    const input = document.getElementById(IDS.elems.search) as HTMLInputElement | null;
    if (input) this.onSearchReady(input);
  }

  public dispose(): void {
    this.closeSuggestions();
    document.getElementById(IDS.hosts.header)?.remove();
  }

  private closeSuggestions(): void {
    if (this.suggestHost) { this.suggestHost.remove(); this.suggestHost = null; }
  }
}
