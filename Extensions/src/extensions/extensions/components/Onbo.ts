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
    this._config = config;
    this._svc = new OnboardingService(context);
  }

  public render(): void {
    if (this._container) return;
    document.documentElement.classList.add("__onboLock");
    document.body.classList.add("__onboLock");

    this._container = document.createElement("div");
    this._container.className = styles.onboardingBackdrop;
    this._container.innerHTML = this._getHtml();
    document.body.appendChild(this._container);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._container?.classList.add(styles.onboardingBackdropReady);
      });
    });

    this._attachEvents();
  }

  private _getHtml(): string {
    return `
      <div class="${styles.onboardingWrapper}">
        <div class="${styles.onboardingHeader}">
          <h1 class="${styles.onboardingTitle}">Welcome to the All New Tawasol!</h1>
          <p class="${styles.onboardingSubtitle}">Access company news, tasks, and support – all from one place.</p>
        </div>

        <div class="${styles.onboardingVideoFrame}">
          <video
            class="${styles.onboardingVideo}"
            src="${this._config.URL}"
            muted
            playsinline
            autoplay
            loop
            preload="auto"
          ></video>

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

    this._videoEl = this._container.querySelector(
      `.${styles.onboardingVideo}`
    ) as HTMLVideoElement;

    const overlay = this._container.querySelector(
      `.${styles.onboardingVideoOverlay}`
    ) as HTMLDivElement;

    const btn = this._container.querySelector(
      `.${styles.onboardingPrimaryButton}`
    ) as HTMLButtonElement;

    const tryAutoPlay = async (): Promise<void> => {
      if (!this._videoEl) return;

      this._videoEl.muted = true;
      this._videoEl.loop = true;
      this._videoEl.playsInline = true;
      this._videoEl.preload = "auto";

      try {
        await this._videoEl.play();
        if (overlay) overlay.style.display = "none";
      } catch {
        if (overlay) overlay.style.display = "";
      }
    };

    window.setTimeout(() => void tryAutoPlay(), 50);

    overlay?.addEventListener("click", async () => {
      try {
        overlay.style.display = "none";
        if (this._videoEl) {
          this._videoEl.muted = true;
          this._videoEl.loop = true;
          await this._videoEl.play();
        }
      } catch {
        overlay.style.display = "";
      }
    });

    btn?.addEventListener("click", async () => {
      await this._svc.markSeen();
      this.dispose();
      window.location.href = this._config.homeUrl;
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.dispose();
        window.removeEventListener("keydown", onKeyDown, true);
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
  }

  public dispose(): void {
    try {
      this._container?.remove();
    } catch {}

    this._container = null;
    this._videoEl = null;

    // unlock page scroll
    document.documentElement.classList.remove("__onboLock");
    document.body.classList.remove("__onboLock");
  }
}
