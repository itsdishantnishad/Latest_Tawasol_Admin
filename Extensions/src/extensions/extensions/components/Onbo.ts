// import styles from "../Extension.module.scss";
// import { OnboardingService } from "../services/OnboardingService";
// import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";

// export interface IOnboConfig {
//   homeUrl: string;
//   URL: string;
//   title: string;
// }

// const playCircle: string = require("../assets/onboardingPlaycircle.png");
// const arrowLeft: string = require("../assets/onboardingArrowleft.png");
// const arrowRight: string = require("../assets/onboardingArrowright.png");

// export default class Onbo {
//   private _config: IOnboConfig;
//   private _container: HTMLDivElement | null = null;
//   private _videoEl: HTMLVideoElement | null = null;

//   private _svc: OnboardingService;

//   constructor(context: ApplicationCustomizerContext, config: IOnboConfig) {
//     this._config = config;
//     this._svc = new OnboardingService(context);
//   }

//   public render(): void {
//     if (this._container) return;

//     this._container = document.createElement("div");
//     this._container.className = styles.onboardingBackdrop;
//     this._container.innerHTML = this._getHtml();

//     document.body.appendChild(this._container);
//     this._attachEvents();
//   }

//   private _getHtml(): string {
//     return `
//       <div class="${styles.onboardingWrapper}">
//         <div class="${styles.onboardingHeader}">
//           <h1 class="${styles.onboardingTitle}">Welcome to the All New Tawasol!</h1>
//           <p class="${styles.onboardingSubtitle}">Access company news, tasks, and support – all from one place.</p>
//         </div>

//         <div class="${styles.onboardingVideoFrame}">
//           <video class="${styles.onboardingVideo}" src="${this._config.URL}" muted playsinline></video>

//           <div class="${styles.onboardingVideoOverlay}">
//             <img src="${playCircle}" class="${styles.onboardingPlayImg}" />
//           </div>

//           <div class="${styles.onboardingCaption}">
//             <img src="${arrowLeft}" />
//             <span>${this._config.title}</span>
//             <img src="${arrowRight}" />
//           </div>
//         </div>

//         <div class="${styles.onboardingFooter}">
//           <button class="${styles.onboardingPrimaryButton}" type="button">Let’s Get Started</button>
//         </div>
//       </div>
//     `;
//   }

//   private _attachEvents(): void {
//     if (!this._container) return;

//     this._videoEl = this._container.querySelector(`.${styles.onboardingVideo}`) as HTMLVideoElement;
//     const overlay = this._container.querySelector(`.${styles.onboardingVideoOverlay}`) as HTMLDivElement;
//     const btn = this._container.querySelector(`.${styles.onboardingPrimaryButton}`) as HTMLButtonElement;

//     overlay?.addEventListener("click", async () => {
//       try {
//         overlay.style.display = "none";
//         await this._videoEl?.play();
//       } catch {
//         // ignore play errors
//       }
//     });

//     btn?.addEventListener("click", async () => {
//       await this._svc.markSeen();
//       this.dispose();
//       window.location.href = this._config.homeUrl;
//     });

//     const onKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") {
//         this.dispose();
//         window.removeEventListener("keydown", onKeyDown, true);
//       }
//     };
//     window.addEventListener("keydown", onKeyDown, true);
//   }

//   public dispose(): void {
//     try { this._container?.remove(); } catch {}
//     this._container = null;
//     this._videoEl = null;
//   }
// }




















import styles from "../Extension.module.scss";
import { OnboardingService } from "../services/OnboardingService";
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";

export interface IOnboConfig {
  homeUrl: string;
  URL: string;
  title: string;
}

const playCircle: string = require("../assets/onboardingPlaycircle.png");
const arrowLeft: string = require("../assets/onboardingArrowleft.png");
const arrowRight: string = require("../assets/onboardingArrowright.png");

export default class Onbo {
  private _config: IOnboConfig;
  private _container: HTMLDivElement | null = null;
  private _videoEl: HTMLVideoElement | null = null;
  private _svc: OnboardingService;

  constructor(context: ApplicationCustomizerContext, config: IOnboConfig) {
    console.log("[Onbo] constructor config:", config);
    this._config = config;
    this._svc = new OnboardingService(context);
  }

  public render(): void {
    console.log("[Onbo] render() called");

    if (this._container) {
      console.log("[Onbo] render() skipped - container already exists");
      return;
    }

    this._container = document.createElement("div");
    this._container.className = styles.onboardingBackdrop;
    this._container.innerHTML = this._getHtml();

    document.body.appendChild(this._container);

    console.log("[Onbo] container appended", this._container);

    this._attachEvents();
  }

  private _getHtml(): string {
    console.log("[Onbo] _getHtml()", { URL: this._config.URL, title: this._config.title });

    return `
      <div class="${styles.onboardingWrapper}">
        <div class="${styles.onboardingHeader}">
          <h1 class="${styles.onboardingTitle}">Welcome to the All New Tawasol!</h1>
          <p class="${styles.onboardingSubtitle}">Access company news, tasks, and support – all from one place.</p>
        </div>

        <div class="${styles.onboardingVideoFrame}">
          <video class="${styles.onboardingVideo}" src="${this._config.URL}" muted playsinline></video>

          <div class="${styles.onboardingVideoOverlay}">
            <img src="${playCircle}" class="${styles.onboardingPlayImg}" />
          </div>

          <div class="${styles.onboardingCaption}">
            <img src="${arrowLeft}" />
            <span>${this._config.title}</span>
            <img src="${arrowRight}" />
          </div>
        </div>

        <div class="${styles.onboardingFooter}">
          <button class="${styles.onboardingPrimaryButton}" type="button">Let’s Get Started</button>
        </div>
      </div>
    `;
  }

  private _attachEvents(): void {
    if (!this._container) return;

    console.log("[Onbo] _attachEvents()");

    this._videoEl = this._container.querySelector(`.${styles.onboardingVideo}`) as HTMLVideoElement;
    const overlay = this._container.querySelector(`.${styles.onboardingVideoOverlay}`) as HTMLDivElement;
    const btn = this._container.querySelector(`.${styles.onboardingPrimaryButton}`) as HTMLButtonElement;

    console.log("[Onbo] elements found:", {
      video: !!this._videoEl,
      overlay: !!overlay,
      btn: !!btn
    });

    overlay?.addEventListener("click", async () => {
      console.log("[Onbo] overlay click");
      try {
        overlay.style.display = "none";
        await this._videoEl?.play();
        console.log("[Onbo] video play success");
      } catch (e) {
        console.warn("[Onbo] video play failed", e);
      }
    });

    btn?.addEventListener("click", async () => {
      console.log("[Onbo] Let’s Get Started click");
      const ok = await this._svc.markSeen();
      console.log("[Onbo] markSeen result:", ok);

      this.dispose();
      console.log("[Onbo] disposed -> navigating:", this._config.homeUrl);

      window.location.href = this._config.homeUrl;
    });
  }

  public dispose(): void {
    console.log("[Onbo] dispose()");
    try { this._container?.remove(); } catch {}
    this._container = null;
    this._videoEl = null;
  }
}
