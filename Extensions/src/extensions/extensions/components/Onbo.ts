// Onbo.ts
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";

export interface IOnboConfig {
  homeUrl: string;       // Tawasol home page URL
  videoUrl: string;      // MP4 video URL
  onComplete?: () => void;
}

export default class Onbo {
  private static readonly STORAGE_KEY_PREFIX: string = "tawasol_onboarding_seen_";

  private _context: ApplicationCustomizerContext;
  private _config: IOnboConfig;
  private _container: HTMLDivElement | null = null;
  private _buttonHandler: any;

  constructor(context: ApplicationCustomizerContext, config: IOnboConfig) {
    this._context = context;
    this._config = config;
  }

  // ==== PUBLIC HELPERS FOR STORAGE ====

  public static hasSeen(context: ApplicationCustomizerContext): boolean {
    try {
      const key: string = this._getStorageKey(context);
      return window.localStorage.getItem(key) === "1";
    } catch (e) {
      // If localStorage is blocked, just show onboarding
      return false;
    }
  }

  public static markSeen(context: ApplicationCustomizerContext): void {
    try {
      const key: string = this._getStorageKey(context);
      window.localStorage.setItem(key, "1");
    } catch (e) {
      // ignore
    }
  }

  private static _getStorageKey(context: ApplicationCustomizerContext): string {
    const userLogin: string =
      (context.pageContext.user && context.pageContext.user.loginName) ||
      "anonymous";
    return this.STORAGE_KEY_PREFIX + encodeURIComponent(userLogin.toLowerCase());
  }

  // ==== RENDER / DISPOSE ====

  public render(): void {
    if (this._container) {
      return;
    }

    this._injectStylesIfNeeded();

    this._container = document.createElement("div");
    this._container.className = "tw-onboard-backdrop";
    this._container.innerHTML = this._getHtml();
    document.body.appendChild(this._container);

    this._attachEvents();
  }

  public dispose(): void {
    if (this._container && this._container.parentNode) {
      this._detachEvents();
      this._container.parentNode.removeChild(this._container);
      this._container = null;
    }
  }

  // ==== INTERNAL ====

  private _getHtml(): string {
    // Static heading / subheading as per your requirement
    const title: string = "Welcome to Tawasol";
    const subtitle: string =
      "Here’s a quick walkthrough to help you explore all the features of your new intranet.";

    // You can use a static thumbnail image if you want a “fake” player,
    // but here I’m using a normal HTML5 video element with controls.
    const videoUrl: string = this._config.videoUrl;

    return `
      <div class="tw-onboard-center">
        <div class="tw-onboard-card">
          <div class="tw-onboard-header">
            <h1 class="tw-onboard-title">${title}</h1>
            <p class="tw-onboard-subtitle">${subtitle}</p>
          </div>

          <div class="tw-onboard-video-wrapper">
            <video class="tw-onboard-video" controls>
              <source src="${videoUrl}" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div class="tw-onboard-footer">
            <button type="button" class="tw-onboard-btn-primary">
              <span>Let’s Get Started</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _attachEvents(): void {
    if (!this._container) {
      return;
    }

    const button: HTMLButtonElement | null = this._container.querySelector(
      ".tw-onboard-btn-primary"
    ) as HTMLButtonElement;

    if (button) {
      this._buttonHandler = this._onPrimaryClick.bind(this);
      button.addEventListener("click", this._buttonHandler);
    }
  }

  private _detachEvents(): void {
    if (!this._container || !this._buttonHandler) {
      return;
    }

    const button: HTMLButtonElement | null = this._container.querySelector(
      ".tw-onboard-btn-primary"
    ) as HTMLButtonElement;

    if (button) {
      button.removeEventListener("click", this._buttonHandler);
    }
  }

  private _onPrimaryClick(ev: MouseEvent): void {
    ev.preventDefault();

    // mark as seen
    Onbo.markSeen(this._context);

    // callback for any extra logic from ApplicationCustomizer
    if (this._config.onComplete) {
      this._config.onComplete();
    }

    // remove overlay
    this.dispose();

    // redirect to home page
    if (this._config.homeUrl) {
      window.location.href = this._config.homeUrl;
    }
  }

  private _injectStylesIfNeeded(): void {
    const styleId: string = "tw-onboard-styles";
    if (document.getElementById(styleId)) {
      return;
    }

    const style: HTMLStyleElement = document.createElement("style");
    style.id = styleId;
    style.type = "text/css";

    style.innerHTML = `
      /* BACKDROP */
      .tw-onboard-backdrop {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.6);
        z-index: 999999; /* above everything */
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .tw-onboard-center {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* MAIN CARD: 1440 x 860, radius 12px */
      .tw-onboard-card {
        width: min(1440px, 96vw);
        height: min(860px, 94vh);
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.25);
        padding: 32px 40px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
      }

      .tw-onboard-header {
        margin-bottom: 24px;
      }

      .tw-onboard-title {
        margin: 0 0 8px 0;
        font-size: 32px;
        line-height: 40px;
        font-weight: 600;
        color: #101820;
      }

      .tw-onboard-subtitle {
        margin: 0;
        font-size: 16px;
        line-height: 24px;
        color: #4f4f4f;
      }

      /* VIDEO AREA: 1320 x 572, radius 8px */
      .tw-onboard-video-wrapper {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .tw-onboard-video {
        width: min(1320px, 100%);
        height: 100%;
        max-height: 572px;
        border-radius: 8px;
        background: #000;
        object-fit: cover;
      }

      .tw-onboard-footer {
        margin-top: 24px;
        display: flex;
        justify-content: center;
      }

      /* BUTTON: 180 x 48, radius 167px */
      .tw-onboard-btn-primary {
        min-width: 180px;
        height: 48px;
        padding: 0 12px;
        border-radius: 167px;
        border: none;
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
        line-height: 24px;
        background: #da291c; /* your primary red, adjust if needed */
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(218, 41, 28, 0.35);
        transition: transform 0.1s ease, box-shadow 0.1s ease, opacity 0.1s ease;
      }

      .tw-onboard-btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(218, 41, 28, 0.4);
        opacity: 0.96;
      }

      .tw-onboard-btn-primary:active {
        transform: translateY(0px);
        box-shadow: 0 2px 8px rgba(218, 41, 28, 0.35);
      }

      @media (max-width: 768px) {
        .tw-onboard-card {
          padding: 24px 16px;
        }

        .tw-onboard-title {
          font-size: 24px;
          line-height: 32px;
        }

        .tw-onboard-subtitle {
          font-size: 14px;
          line-height: 20px;
        }

        .tw-onboard-video {
          max-height: 260px;
        }
      }
    `;

    document.head.appendChild(style);
  }
}
