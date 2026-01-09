import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { SPHttpClient } from "@microsoft/sp-http";

export interface IOnboConfig {
  homeUrl: string;
  URL: string;
  title: string;
}

const playCircle: string = require("../assets/onboardingPlaycircle.png");
const arrowLeft: string = require("../assets/onboardingArrowleft.png");
const arrowRight: string = require("../assets/onboardingArrowright.png");

export default class Onbo {
  private static readonly LIST_TITLE = "Onboarding";

  private _context: ApplicationCustomizerContext;
  private _config: IOnboConfig;
  private _container: HTMLDivElement | null = null;
  private _videoEl: HTMLVideoElement | null = null;

  constructor(context: ApplicationCustomizerContext, config: IOnboConfig) {
    this._context = context;
    this._config = config;
  }

  /* ======================================================
     READ SHAREPOINT LIST
     ====================================================== */

  public static async loadStateFromList(
    context: ApplicationCustomizerContext
  ): Promise<{ URL: string; title: string; hasSeen: boolean }> {

    const webUrl = context.pageContext.web.absoluteUrl;
    const sp = context.spHttpClient;

    const userLogin = context.pageContext.user.loginName || "";
    const safeLogin = userLogin.replace(/'/g, "''");

    let URL = "";
    let title = "";
    let hasSeen = false;

    // 🔹 Fetch Title + URL
    const cfgResp = await sp.get(
      `${webUrl}/_api/web/lists/GetByTitle('${Onbo.LIST_TITLE}')/items?$select=Title,URL&$top=1`,
      SPHttpClient.configurations.v1
    );

    if (cfgResp.ok) {
      const json = await cfgResp.json();
      if (json.value?.length) {
        title = json.value[0].Title || "";
        URL = json.value[0].URL?.Url || "";
      }
    }

    // 🔹 Check if user already completed onboarding
    const userResp = await sp.get(
      `${webUrl}/_api/web/lists/GetByTitle('${Onbo.LIST_TITLE}')/items?$select=TIRUserID&$filter=TIRUserID eq '${safeLogin}'&$top=1`,
      SPHttpClient.configurations.v1
    );

    if (userResp.ok) {
      const json = await userResp.json();
      hasSeen = json.value?.length > 0;
    }

    return { URL, title, hasSeen };
  }

  /* ======================================================
     MARK AS SEEN
     ====================================================== */

  private async _markSeen(): Promise<void> {
    const webUrl = this._context.pageContext.web.absoluteUrl;
    const sp = this._context.spHttpClient;
    const userLogin = this._context.pageContext.user.loginName || "";

    await sp.post(
      `${webUrl}/_api/web/lists/GetByTitle('${Onbo.LIST_TITLE}')/items`,
      SPHttpClient.configurations.v1,
      {
        headers: {
          accept: "application/json;odata=nometadata",
          "content-type": "application/json;odata=nometadata"
        },
        body: JSON.stringify({
          Title: userLogin,
          TIRUserID: userLogin
        })
      }
    );
  }

  /* ======================================================
     RENDER
     ====================================================== */

  public render(): void {
    if (this._container) return;

    this._injectStyles();

    this._container = document.createElement("div");
    this._container.className = "tw-onboard-backdrop";
    this._container.innerHTML = this._getHtml();

    document.body.appendChild(this._container);
    this._attachEvents();
  }

  private _getHtml(): string {
    return `
      <div class="tw-onboard-wrapper">

        <div class="tw-onboard-header">
          <h1>Welcome to the All New Tawasol!</h1>
          <p>Access company news, tasks, and support – all from one place.</p>
        </div>

        <div class="tw-onboard-video-frame">
          <video class="tw-onboard-video" src="${this._config.URL}" muted playsinline></video>

          <div class="tw-onboard-video-overlay">
            <img src="${playCircle}" class="tw-onboard-play-img" />
          </div>

          <div class="tw-onboard-caption">
            <img src="${arrowLeft}" />
            <span>${this._config.title}</span>
            <img src="${arrowRight}" />
          </div>
        </div>

        <div class="tw-onboard-footer">
          <button class="tw-onboard-btn-primary">Let’s Get Started</button>
        </div>

      </div>
    `;
  }

  private _attachEvents(): void {
    if (!this._container) return;

    this._videoEl = this._container.querySelector(".tw-onboard-video") as HTMLVideoElement;
    const overlay = this._container.querySelector(".tw-onboard-video-overlay") as HTMLDivElement;
    const btn = this._container.querySelector(".tw-onboard-btn-primary") as HTMLButtonElement;

    overlay?.addEventListener("click", async () => {
      overlay.style.display = "none";
      await this._videoEl?.play();
    });

    btn?.addEventListener("click", async () => {
      await this._markSeen();
      this.dispose();
      window.location.href = this._config.homeUrl;
    });
  }

  public dispose(): void {
    this._container?.remove();
    this._container = null;
  }

  /* ======================================================
     INLINE CSS (FIGMA-MATCH)
     ====================================================== */

  private _injectStyles(): void {
    if (document.getElementById("tw-onboard-style")) return;

    const s = document.createElement("style");
    s.id = "tw-onboard-style";
    s.innerHTML = `
      .tw-onboard-backdrop {
        position: fixed;
        inset: 0;
        background: #FFF4EA;
        overflow-y: auto;
        z-index: 999999;
      }

      .tw-onboard-wrapper {
        max-width: 1440px;
        margin: 0 auto;
        padding: 80px 40px;
        text-align: center;
      }

      .tw-onboard-video-frame {
        position: relative;
        height: 520px;
        border-radius: 12px;
        overflow: hidden;
      }

      .tw-onboard-video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .tw-onboard-video-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
      }

      .tw-onboard-caption {
        position: absolute;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 16px;
        font-weight: 500;
      }

      .tw-onboard-footer {
        margin-top: 40px;
      }

      .tw-onboard-btn-primary {
        padding: 12px 32px;
        border-radius: 999px;
        background: #1F2D3A;
        color: #fff;
        border: none;
        font-size: 16px;
        cursor: pointer;
      }
    `;
    document.head.appendChild(s);
  }
}
