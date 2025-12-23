// import styles from "../Extension.module.scss";
// import { IDS } from "../shared/constants";
// import { Icons } from "../shared/icons";
// import { PhotoService } from "../shared/photoService";

// const brandIcon = require("../assets/TawasolIcon.svg");
// const helpIcon = require("../assets/Help.svg");
// const bellIcon = require("../assets/Notification.svg");

// export class Header {
//   private photoService: PhotoService;

//   constructor(
//     webUrl: string,
//     private readonly userUpn: string,
//     private readonly userDisplayName: string,
//     private readonly onBrandClick: () => void,
//     private readonly onBellClick: () => void,
//     private readonly onSearchInit: (input: HTMLInputElement) => void,
//     private readonly profileUrl: string,
//     graphFactory: any // MSGraphClientFactory passed from ApplicationCustomizer
//   ) {
//     this.photoService = new PhotoService(webUrl, userUpn, userDisplayName, graphFactory);
//   }

//   private navigateToProfile = (): void => {
//     if (!this.profileUrl) return;
//     window.location.href = this.profileUrl;
//   };

//   private wireAvatar(): void {
//     const avatar = document.getElementById(IDS.elems.avatar);
//     if (!avatar) return;

//     avatar.addEventListener("click", this.navigateToProfile);

//     avatar.addEventListener("keydown", (e: KeyboardEvent) => {
//       if (e.key === "Enter" || e.key === " ") {
//         e.preventDefault();
//         this.navigateToProfile();
//       }
//     });
//   }

//   private loadAvatarPhoto(): void {
//     const img = document.querySelector(
//       `#${IDS.elems.avatar} img`
//     ) as HTMLImageElement | null;

//     if (!img) return;

//     // ✅ Graph -> userphoto -> initials -> placeholder
//     void this.photoService.setPhoto(img, "M", this.userUpn, this.userDisplayName);
//   }

//   public render(hostId: string): void {
//     if (document.getElementById(hostId)) return;

//     const html = `
//       <header class="${styles.TIRHdr}">
//         <div class="${styles.TIRHdrWrap}">
//           <div id="${IDS.elems.brand}" class="${styles.TIRBrand}" role="button" aria-label="Home">
//             <img src="${brandIcon}" alt="Tawasol" class="${styles.TIRBrandLogo}" />
//           </div>

//           <div class="${styles.TIRSearch}">
//             <span class="${styles.TIRSearchIcon}">${Icons.search}</span>
//             <input id="${IDS.elems.search}" class="${styles.TIRSearchInput}" type="text"
//               placeholder="Search" autocomplete="off" aria-label="Search" />
//           </div>

//           <div class="${styles.TIRRight}">
//             <button id="tir-help" class="${styles.TIRIconBtn}" title="Help">
//               <img src="${helpIcon}" alt="Help"/>
//             </button>

//             <button id="${IDS.elems.bell}" class="${styles.TIRIconBtn} ${styles.TIRBadge}" data-count="4"
//               title="Notifications">
//               <img src="${bellIcon}" alt="Notifications"/>
//             </button>

//             <div
//               id="${IDS.elems.avatar}"
//               class="${styles.TIRAvatar}"
//               role="button"
//               tabindex="0"
//               aria-label="Open profile"
//               title="Open profile"
//             >
//               <img alt="User" />
//             </div>
//           </div>
//         </div>
//       </header>`;

//     const host = document.createElement("div");
//     host.id = hostId;
//     host.innerHTML = html;

//     const modernHost = document.querySelector("#spPageChromeAppDiv");
//     if (modernHost && modernHost.parentElement) {
//       modernHost.parentElement.insertBefore(host, modernHost);
//     }

//     document.getElementById(IDS.elems.brand)?.addEventListener("click", this.onBrandClick);
//     document.getElementById(IDS.elems.bell)?.addEventListener("click", this.onBellClick);
//     document.getElementById("tir-help")?.addEventListener("click", () => alert("Tawasol FAQ coming soon"));

//     const searchInput = document.getElementById(IDS.elems.search) as HTMLInputElement | null;
//     if (searchInput) this.onSearchInit(searchInput);

//     this.wireAvatar();
//     this.loadAvatarPhoto(); // ✅ load photo after DOM insert
//   }

//   public dispose(): void {
//     document.getElementById(IDS.hosts.header)?.remove();
//   }
// }



















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
    graphFactory?: MSGraphClientFactory, 
    private readonly userDisplayName: string = ""
  ) {
    this.photoService = new PhotoService(webUrl, userUpn, graphFactory, userDisplayName);
  }

  private navigateToProfile = (): void => {
    if (!this.profileUrl) return;
    window.location.href = this.profileUrl;
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

          <div class="${styles.TIRSearch}">
            <span class="${styles.TIRSearchIcon}">${Icons.search}</span>
            <input id="${IDS.elems.search}" class="${styles.TIRSearchInput}" type="text"
              placeholder="Search" autocomplete="off" aria-label="Search" />
          </div>

          <div class="${styles.TIRRight}">
            <button id="tir-help" class="${styles.TIRIconBtn}" title="Help">
              <img src="${helpIcon}" alt="Help"/>
            </button>

            <button id="${IDS.elems.bell}" class="${styles.TIRIconBtn} ${styles.TIRBadge}" data-count="4"
              title="Notifications">
              <img src="${bellIcon}" alt="Notifications"/>
            </button>

            <div
              id="${IDS.elems.avatar}"
              class="${styles.TIRAvatar}"
              role="button"
              tabindex="0"
              aria-label="Open profile"
              title="Open profile"
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

    document.getElementById(IDS.elems.brand)?.addEventListener("click", this.onBrandClick);
    document.getElementById(IDS.elems.bell)?.addEventListener("click", this.onBellClick);
    document.getElementById("tir-help")?.addEventListener("click", () => alert("Tawasol FAQ coming soon"));

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
