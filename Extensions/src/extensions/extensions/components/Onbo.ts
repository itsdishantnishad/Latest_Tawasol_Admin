
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";

export interface IOnboConfig {
  homeUrl: string;      
  videoUrl: string;      
  onComplete?: () => void;
}



const playCircle: string = require("../assets/onboardingPlaycircle.png");

const arrowLeft: string = require("../assets/onboardingArrowleft.png");

const arrowRight: string = require("../assets/onboardingArrowright.png");

export default class Onbo {
  private static readonly LIST_TITLE: string = "TawasolOnboarding";

  private _context: ApplicationCustomizerContext;
  private _config: IOnboConfig;
  private _container: HTMLDivElement | null = null;
  private _buttonHandler: any;
  private _playHandler: any;
  private _videoEl: HTMLVideoElement | null = null;

  constructor(context: ApplicationCustomizerContext, config: IOnboConfig) {
    this._context = context;
    this._config = config;
  }

  // ========= LIST HELPERS =========


  public static async loadStateFromList(
    context: ApplicationCustomizerContext
  ): Promise<{ videoUrl: string; hasSeen: boolean }> {

    const webUrl: string = context.pageContext.web.absoluteUrl;
    const spHttpClient: SPHttpClient = context.spHttpClient;
    const listTitle: string = Onbo.LIST_TITLE;

    const userLogin: string = context.pageContext.user.loginName || "";
    const loginForFilter: string = userLogin.replace(/'/g, "''");

    let videoUrl: string = "";
    let hasSeen: boolean = false;

    // 1) row  VideoUrl filled 
    const cfgUrl: string =
      `${webUrl}/_api/web/lists/GetByTitle('${listTitle}')/items` +
      `?$select=Id,Title,VideoUrl&$filter=VideoUrl ne null and VideoUrl ne ''&$top=1`;

    try {
      const cfgResp: SPHttpClientResponse = await spHttpClient.get(
        cfgUrl,
        SPHttpClient.configurations.v1
      );
      if (cfgResp.ok) {
        const cfgJson: any = await cfgResp.json();
        if (cfgJson.value && cfgJson.value.length > 0) {
          videoUrl = cfgJson.value[0].VideoUrl || "";
        }
      }
    } catch {
      
    }

    // 2) UserIDName == current user?
    const userUrl: string =
      `${webUrl}/_api/web/lists/GetByTitle('${listTitle}')/items` +
      `?$select=Id,UserIDName&$filter=UserIDName eq '${loginForFilter}'&$top=1`;

    try {
      const userResp: SPHttpClientResponse = await spHttpClient.get(
        userUrl,
        SPHttpClient.configurations.v1
      );
      if (userResp.ok) {
        const userJson: any = await userResp.json();
        hasSeen = userJson.value && userJson.value.length > 0;
      }
    } catch {
      
    }

    return { videoUrl, hasSeen };
  }

  /**
   *for  Current user  creating item:
   * Title = loginName, UserIDName = loginName
   */
  public static async markSeenInList(context: ApplicationCustomizerContext): Promise<void> {
    const webUrl: string = context.pageContext.web.absoluteUrl;
    const spHttpClient: SPHttpClient = context.spHttpClient;
    const listTitle: string = Onbo.LIST_TITLE;

    const userLogin: string = context.pageContext.user.loginName || "";

    const body: string = JSON.stringify({
      Title: userLogin,
      UserIDName: userLogin
    });

    try {
      await spHttpClient.post(
        `${webUrl}/_api/web/lists/GetByTitle('${listTitle}')/items`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            accept: "application/json;odata=nometadata",
            "content-type": "application/json;odata=nometadata"
          },
          body
        }
      );
    } catch {
      
    }
  }

  // ========= RENDER / DISPOSE =========

  public render(): void {
    if (this._container) return;

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

  // ========= INTERNAL UI MARKUP =========

  private _getHtml(): string {
    const title: string = "Welcome to the All New Tawasol!";
    const subtitle: string =
      "Access company news, tasks, and support – all from one place. No more jumping between tools.";

    const videoUrl: string = this._config.videoUrl;

    return `
      <div class="tw-onboard-center">
        <div class="tw-onboard-card">
          <div class="tw-onboard-header">
            <h1 class="tw-onboard-title">${title}</h1>
            <p class="tw-onboard-subtitle">${subtitle}</p>
          </div>

          <div class="tw-onboard-video-wrapper">
            <div class="tw-onboard-video-frame">
              <video class="tw-onboard-video" src="${videoUrl}" playsinline></video>

              <!-- Play circle -->
              <div class="tw-onboard-video-overlay">
                <img src="${playCircle}" class="tw-onboard-play-img" alt="Play video" />
              </div>

              <!-- Caption + arrows -->
              <div class="tw-onboard-video-caption">
                <img src="${arrowLeft}" class="tw-onboard-caption-arrow" alt="" />
                <span class="tw-onboard-caption-text">Jumeirah Marsa Al Arab</span>
                <img src="${arrowRight}" class="tw-onboard-caption-arrow" alt="" />
              </div>
            </div>
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

  // ========= EVENTS =========

  private _attachEvents(): void {
    if (!this._container) return;

    const button = this._container.querySelector(
      ".tw-onboard-btn-primary"
    ) as HTMLButtonElement | null;

    if (button) {
      this._buttonHandler = this._onPrimaryClick.bind(this);
      button.addEventListener("click", this._buttonHandler);
    }

    this._videoEl = this._container.querySelector(
      ".tw-onboard-video"
    ) as HTMLVideoElement | null;

    const playImg = this._container.querySelector(
      ".tw-onboard-play-img"
    ) as HTMLImageElement | null;

    if (this._videoEl && playImg) {
      this._playHandler = () => {
        if (!this._videoEl) return;
        if (this._videoEl.paused) {
          void this._videoEl.play();
        } else {
          this._videoEl.pause();
        }
      };
      playImg.addEventListener("click", this._playHandler);
    }
  }

  private _detachEvents(): void {
    if (!this._container) return;

    const button = this._container.querySelector(
      ".tw-onboard-btn-primary"
    ) as HTMLButtonElement | null;

    if (button && this._buttonHandler) {
      button.removeEventListener("click", this._buttonHandler);
    }

    const playImg = this._container.querySelector(
      ".tw-onboard-play-img"
    ) as HTMLImageElement | null;

    if (playImg && this._playHandler) {
      playImg.removeEventListener("click", this._playHandler);
    }
  }


  private async _onPrimaryClick(ev: MouseEvent): Promise<void> {
    ev.preventDefault();

    try {
      await Onbo.markSeenInList(this._context);
    } catch {
      
    }

    if (this._config.onComplete) {
      this._config.onComplete();
    }

    this.dispose();

    // intranet home  redirect
    if (this._config.homeUrl) {
      window.location.href = this._config.homeUrl;
    }
  }





  // ========= INLINE CSS =========


    private _injectStylesIfNeeded(): void {
    const styleId: string = "tw-onboard-styles";
    if (document.getElementById(styleId)) return;

    const style: HTMLStyleElement = document.createElement("style");
    style.id = styleId;
    style.type = "text/css";

    style.innerHTML = `
      :root {
        --tw-onboard-bg: #FFF4EA;
        --tw-onboard-card-bg: #FFF4EA;
        --tw-onboard-video-bg: #FFFFFF66;
        --tw-onboard-text: #101820;
        --tw-onboard-muted: #4F4F4F;
        --tw-onboard-button-bg: #1F2D3A;
      }

      /* FULLSCREEN BACKDROP – scroll allowed */
      .tw-onboard-backdrop {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        background: var(--tw-onboard-bg);
        z-index: 999999;
        overflow-y: auto;             
      }

      .tw-onboard-center {
        min-height: 100vh;
        display: flex;
        align-items: center;          
        justify-content: center;
        padding: 40px 0;
        box-sizing: border-box;
      }

      /* MAIN CARD  */
      .tw-onboard-card {
        width: min(1440px, 100vw);     
        height: 860px;                
        background: var(--tw-onboard-card-bg);
        border-radius: 12px;
        box-sizing: border-box;
        padding: 60px 15 px 64px;       
        display: flex;
        flex-direction: column;
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.06);
      }

      /* HEADER */
      .tw-onboard-header {
        max-width: 807px;
        margin: 0 auto 32px;
        text-align: center;
        flex-shrink: 0;
      }

      .tw-onboard-title {
        margin: 0 0 16px 0;
        font-size: 32px;
        line-height: 40px;
        font-weight: 600;
        color: var(--tw-onboard-text);
      }

      .tw-onboard-subtitle {
        margin: 0;
        font-size: 16px;
        line-height: 24px;
        color: var(--tw-onboard-muted);
      }

      /* VIDEO AREA – bigger & wider */
      .tw-onboard-video-wrapper {
        height: 600px;                
        display: flex;
        justify-content: center;
        margin-bottom: 24px;
      }

      .tw-onboard-video-frame {
        width: 100%;                  
        height: 100%;
        background: var(--tw-onboard-video-bg);
        border-radius: 8px;
        padding: 0;                   
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
      }

      .tw-onboard-video {
        width: 100%;
        height: 100%;
        border-radius: 5px;
        object-fit: cover;
        display: block;
      }

      /* PLAY BUTTON center */
      .tw-onboard-video-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        onclick: hover ;
      }

      .tw-onboard-play-img {
        width: 114px;
        height: 114px;
        display: block;
        cursor: pointer;
      }

      /* CAPTION + ARROWS */
      .tw-onboard-video-caption {
        position: absolute;
        left: 50%;
        bottom: 56px;                  
        transform: translateX(-50%);
        display: inline-flex;
        align-items: center;
        gap: 16px;
        white-space: nowrap;
        pointer-events: none;
      }

      .tw-onboard-caption-text {
        font-size: 14px;
        line-height: 20px;
        font-weight: 500;
        color: #000000;
      }

      .tw-onboard-caption-arrow {
        height: 18px;
        width: auto;
        flex-shrink: 0;
        display: block;
       
      }

      /* FOOTER BUTTON  */
      .tw-onboard-footer {
        margin-top: auto;             
        display: flex;
        justify-content: center;
        flex-shrink: 0;
      }

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
        color: #FFFFFF;
        background: var(--tw-onboard-button-bg);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow:
          0px 4px 4px #768B9E inset,
          -4px -6px 4px #00000082 inset;
        transition: transform .1s ease, box-shadow .1s ease, opacity .1s ease;
      }

      .tw-onboard-btn-primary:hover {
        opacity: 0.96;
        transform: translateY(-1px);
      }

      .tw-onboard-btn-primary:active {
        transform: translateY(0);
      }





      /* --------- RESPONSIVE --------- */
      /* --------- RESPONSIVE (MOBILE) --------- */


@media (max-width: 768px) {

  /* Card overall */
  .tw-onboard-center {
    align-items: flex-start;
    padding: 24px 0;
  }

  .tw-onboard-card {
    width: 100vw;
    height: auto;
    padding: 24px 16px 24px;   /* left/right 16px (343 + 16 + 16 = 375) */
    border-radius: 24px;
  }

  /* Heading */
  .tw-onboard-header {
    margin: 0 auto 20px;
  }

  .tw-onboard-title {
    font-size: 20px;
    line-height: 28px;
    font-weight: 600;
  }

  /* Subheading */
  .tw-onboard-subtitle {
    font-size: 16px;
    line-height: 24px;
    color: #6C6C6C;
    text-align: center;
  }

  /* Video + arrows block */
  .tw-onboard-video-wrapper {
    height: 450px;              /* Figma: height 450 */
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
  }

  .tw-onboard-video-frame {
    width: 343px;               /* Figma: width 343 */
    max-width: 100%;
    height: 100%;
    border-radius: 8px;
    padding: 0;
  }

  .tw-onboard-video {
    border-radius: 8px;
  }

  /* Caption (arrows + text) – keep visible on mobile */
  .tw-onboard-video-caption {
    bottom: 32px;
  }

  /* Play icon slightly smaller on mobile */
  .tw-onboard-play-img {
    width: 80px;
    height: 80px;
  }

  /* Button */
  .tw-onboard-footer {
    margin-top: 24px;
  }

  .tw-onboard-btn-primary {
    width: 343px;               /* Figma: width 343 */
    max-width: 100%;
    height: 40px;               /* Figma: height 40 */
    border-radius: 167px;
    padding: 0 12px;
    font-size: 16px;

    /* Figma radial gradient */
    background: radial-gradient(
      245.31% 848.44% at 112.5% -164.06%,
      #101820 0%,
      #202D39 100%
    );
    box-shadow:
      0px 4px 4px #768B9E inset,
      -4px -6px 4px #00000082 inset;
  }
}  
  .tw-onboard-video-overlay {
  cursor: pointer;   /* pura circle area clickable feel */
}

.tw-onboard-play-img {
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease, filter 0.15s ease;
}

.tw-onboard-play-img:hover {
  transform: scale(1.06);  /* thoda zoom */
  opacity: 0.95;
  filter: drop-shadow(0 0 8px rgba(218, 41, 28, 0.35));
}


    `;

    document.head.appendChild(style);
    }
  }
