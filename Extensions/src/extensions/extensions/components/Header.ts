import styles from "../Extension.module.scss";
import { IDS } from "../shared/constants";
import { Icons } from "../shared/icons";
import { PhotoService } from "../shared/photoService";
import { MSGraphClientFactory } from "@microsoft/sp-http";

const brandIcon = require("../assets/TawasolIcon.svg");
const helpIcon = require("../assets/Help.svg");
const bellIcon = require("../assets/Notification.svg");

export class Header {
  private photoService: PhotoService;

  constructor(
    webUrl: string,
    private readonly userUpn: string,
    private readonly onBrandClick: () => void,
    private readonly onBellClick: () => void,
    private readonly onSearchInit: (input: HTMLInputElement) => void,
    private readonly profileUrl: string,
    private readonly helpUrl: string,
    graphFactory?: MSGraphClientFactory,
    private readonly userDisplayName: string = "",
    sharedPhotoService?: PhotoService
  ) {
    this.photoService = sharedPhotoService ?? new PhotoService(webUrl, userUpn, graphFactory, userDisplayName);
  }

  private navigateToProfile = (): void => {
    if (!this.profileUrl) return;
    window.location.href = this.profileUrl;
  };

  //  NEW
  private navigateToHelp = (): void => {
    if (!this.helpUrl) return;
    window.location.href = this.helpUrl;
  };

  private wireAvatar(): void {
    const avatar = document.getElementById(IDS.elems.avatar);
    if (!avatar) return;

    avatar.addEventListener("click", this.navigateToProfile);
    avatar.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.navigateToProfile();
      }
    });
  }

  private applyAvatarPhoto(): void {
    const img = document.querySelector(
      `#${IDS.elems.avatar} img`
    ) as HTMLImageElement | null;

    if (!img) return;

    void this.photoService.setAvatar(img, "M", this.userUpn, this.userDisplayName);
  }

  public render(hostId: string): void {
    if (document.getElementById(hostId)) return;

    const html = `
      <header class="${styles.TIRHdr}">
        <div class="${styles.TIRHdrWrap}">
          <div id="${IDS.elems.brand}" class="${styles.TIRBrand}" role="button" aria-label="Home">
            <img src="${brandIcon}" alt="Tawasol" class="${styles.TIRBrandLogo}" />
          </div>

           <!-- commented Global Search

         <div class="${styles.TIRSearch}">
         <span class="${styles.TIRSearchIcon}">${Icons.search}</span>
         <input id="${IDS.elems.search}" class="${styles.TIRSearchInput}" type="text"
         placeholder="Search" autocomplete="off" aria-label="Search" />
         </div>
         
          -->

          <div class="${styles.TIRSearch}">
         <span class="${styles.TIRSearchIcon}">${Icons.search}</span>
         <input id="${IDS.elems.search}" class="${styles.TIRSearchInput}" type="text"
         placeholder="Search" autocomplete="off" aria-label="Search" />
         </div>

          <div class="${styles.TIRRight}">
            <button id="tir-help" class="${styles.TIRIconBtn}" title="Help" aria-label="Help">
              <img src="${helpIcon}" alt="Help"/>
            </button>

            <button id="${IDS.elems.bell}" class="${styles.TIRIconBtn} ${styles.TIRBadge}" data-count="0"
              title="Notifications">
              <img src="${bellIcon}" alt="Notifications"/>
            </button>

            <div
              id="${IDS.elems.avatar}"
              class="${styles.TIRAvatar}"
              role="button"
              tabindex="0"
              aria-label="Profile"
              title="Profile"
            >
              <img src="${this.photoService.getMedium(this.userUpn)}" alt="User" />
            </div>
          </div>
        </div>
      </header>`;

    const host = document.createElement("div");
    host.id = hostId;
    host.innerHTML = html;

    const modernHost = document.querySelector("#spPageChromeAppDiv");
    if (modernHost && modernHost.parentElement) {
      modernHost.parentElement.insertBefore(host, modernHost);
    }

    const brandEl = document.getElementById(IDS.elems.brand);
    if (brandEl) {
      brandEl.addEventListener("click", this.onBrandClick);
      brandEl.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.onBrandClick();
        }
      });
      // make it focusable for keyboard users
      brandEl.setAttribute("tabindex", "0");
    }
    document.getElementById(IDS.elems.bell)?.addEventListener("click", this.onBellClick);

    //  CHANGED: open Help Center (dynamic tenant+site, hard-coded page name)
    document.getElementById("tir-help")?.addEventListener("click", this.navigateToHelp);

    const searchInput = document.getElementById(IDS.elems.search) as HTMLInputElement | null;
    if (searchInput) this.onSearchInit(searchInput);

    this.wireAvatar();
    this.applyAvatarPhoto();
  }

  public dispose(): void {
    const img = document.querySelector(
      `#${IDS.elems.avatar} img`
    ) as HTMLImageElement | null;

    if (img) this.photoService.cleanup(img);

    document.getElementById(IDS.hosts.header)?.remove();
  }
}
