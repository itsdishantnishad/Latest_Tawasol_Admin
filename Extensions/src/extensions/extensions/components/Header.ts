import styles from '../Extension.module.scss';
import { IDS } from '../shared/constants';
import { Icons } from '../shared/icons';
import { PhotoService } from '../shared/photoService';

const brandIcon = require('../assets/TawasolIcon.svg');
const helpIcon = require('../assets/Help.svg');
const bellIcon = require('../assets/Notification.svg');

export class Header {
  private photoService: PhotoService;

  constructor(
    webUrl: string,
    private readonly userUpn: string,
    private readonly onBrandClick: () => void,
    private readonly onBellClick: () => void,
    private readonly onSearchInit: (input: HTMLInputElement) => void
  ) {
    this.photoService = new PhotoService(webUrl, userUpn);
  }

  public render(hostId: string): void {
    if (document.getElementById(hostId)) return;

    const html = `
      <header class="${styles.TIRHdr}">
        <div class="${styles.TIRHdrWrap}">
          <div id="${IDS.elems.brand}" class="${styles.TIRBrand}" role="button" aria-label="Home">
            <img src="${brandIcon}" alt="Tawasol" class="${styles.TIRBrandLogo}" />
          </div>
          <div class="${styles.TIRSearch}">
            <span class="${styles.TIRSearchIcon}">${Icons.search}</span>
            <input id="${IDS.elems.search}" class="${styles.TIRSearchInput}" type="text"
              placeholder="Search" autocomplete="off" aria-label="Search" />
          </div>
          <div class="${styles.TIRRight}">
            <button id="tir-help" class="${styles.TIRIconBtn}" title="Help"><img src="${helpIcon}" alt="Help"/></button>
            <button id="${IDS.elems.bell}" class="${styles.TIRIconBtn} ${styles.TIRBadge}" data-count="4"
              title="Notifications"><img src="${bellIcon}" alt="Notifications"/></button>
            <div class="${styles.TIRAvatar}">
              <img src="${this.photoService.getMedium(this.userUpn)}" alt="User" />
            </div>
          </div>
        </div>
      </header>`;

    const host = document.createElement('div');
    host.id = hostId;
    host.innerHTML = html;

    const modernHost = document.querySelector('#spPageChromeAppDiv');
    if (modernHost && modernHost.parentElement) {
      modernHost.parentElement.insertBefore(host, modernHost);
    }

    document.getElementById(IDS.elems.brand)?.addEventListener('click', this.onBrandClick);
    document.getElementById(IDS.elems.bell)?.addEventListener('click', this.onBellClick);
    document.getElementById('tir-help')?.addEventListener('click', () => alert('Tawasol FAQ coming soon'));
    const searchInput = document.getElementById(IDS.elems.search) as HTMLInputElement | null;
    if (searchInput) this.onSearchInit(searchInput);
  }

  public dispose(): void {
    document.getElementById(IDS.hosts.header)?.remove();
  }
}
