// GoogleAnalyticsService.ts

import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";

type GoogleAnalyticsProps = Record<string, string | number | boolean | null | undefined>;
type GtagFunction = (command: string, ...args: any[]) => void;

interface GoogleAnalyticsWindow extends Window {
  dataLayer?: unknown[];
  gtag?: GtagFunction;
}

export interface IGoogleAnalyticsConfig {
  /**
   * GA4 Measurement ID, for example: G-XXXXXXXXXX
   */
  measurementId: string;

  /**
   * Optional. Keep blank unless you need to override the Google tag URL.
   */
  scriptSrc?: string;

  /**
   * Optional. Turn on only while testing, then keep false in production.
   */
  debugMode?: boolean;
}

export class GoogleAnalyticsService {
  private readonly measurementId: string;
  private readonly scriptSrc: string;
  private readonly debugMode: boolean;
  private lastTrackedLocation: string = "";
  private readonly sessionId: string = this.createSessionId();
  private readonly sessionStartedAt: string = new Date().toISOString();
  private sessionEndHookRegistered: boolean = false;
  private sessionEndSent: boolean = false;

  constructor(config: IGoogleAnalyticsConfig) {
    this.measurementId = (config.measurementId || "").trim();
    this.scriptSrc = config.scriptSrc || `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(this.measurementId)}`;
    this.debugMode = Boolean(config.debugMode);
  }

  public init(context: ApplicationCustomizerContext): void {
    if (!this.measurementId) return;

    const win = window as unknown as GoogleAnalyticsWindow;

    win.dataLayer = win.dataLayer || [];
    if (!win.gtag) {
      win.gtag = (function gtag(): void {
        win.dataLayer?.push(arguments);
      }) as unknown as GtagFunction;
    }

    // Initialise the Google tag, but do not let it automatically send page_view.
    // We send page_view manually so SharePoint modern navigation is tracked correctly.
    win.gtag("js", new Date());
    win.gtag("config", this.measurementId, {
      send_page_view: false,
      debug_mode: this.debugMode
    });

    this.trackSessionStart();
    this.registerSessionEndTracking();

    const existing = document.getElementById("google-analytics-gtag");
    if (existing) {
      window.setTimeout((): void => { void this.trackPageView(context); }, 300);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-analytics-gtag";
    script.type = "text/javascript";
    script.async = true;
    script.src = this.scriptSrc;
    script.onload = (): void => { void this.trackPageView(context); };
    document.head.appendChild(script);
  }

  public async trackPageView(context: ApplicationCustomizerContext): Promise<void> {
    if (!this.measurementId) return;

    const win = window as unknown as GoogleAnalyticsWindow;
    if (!win.gtag) return;

    const safeUrl = this.getSafePageLocation();

    // Prevent duplicate page_view when SharePoint fires repeated DOM/navigation events for the same URL.
    if (safeUrl === this.lastTrackedLocation) return;
    this.lastTrackedLocation = safeUrl;

    const web = context.pageContext.web;
    const { pageType, contentTypeName } = await this.getPageTypeFromContentType(context);

    win.gtag("event", "page_view", {
      page_title: document.title,
      page_location: safeUrl,
      page_path: window.location.pathname,
      site_title: web.title,
      site_id: web.id.toString(),
      site_url: web.absoluteUrl,
      sp_page_type: pageType,
      sp_content_type: contentTypeName || "",
      debug_mode: this.debugMode
    });
  }

  public trackEvent(name: string, props?: GoogleAnalyticsProps): void {
    if (!this.measurementId || !name) return;

    const win = window as unknown as GoogleAnalyticsWindow;
    if (!win.gtag) return;

    win.gtag("event", name, {
      ...(props || {}),
      debug_mode: this.debugMode
    });
  }

  /**
   * Do not send query string or hash to GA.
   * Query strings can accidentally contain emails, names, search terms, or other PII.
   */

  private trackSessionStart(): void {
    this.trackEvent("sp_session_start", {
      sp_session_id: this.sessionId,
      sp_session_started_at: this.sessionStartedAt,
      page_location: this.getSafePageLocation(),
      page_path: window.location.pathname
    });
  }

  private registerSessionEndTracking(): void {
    if (this.sessionEndHookRegistered) return;
    this.sessionEndHookRegistered = true;

    const sendEndEvent = (): void => {
      if (this.sessionEndSent) return;
      this.sessionEndSent = true;

      this.trackEvent("sp_session_end", {
        sp_session_id: this.sessionId,
        sp_session_started_at: this.sessionStartedAt,
        sp_session_ended_at: new Date().toISOString(),
        page_location: this.getSafePageLocation(),
        page_path: window.location.pathname
      });
    };

    window.addEventListener("pagehide", sendEndEvent);

    document.addEventListener("visibilitychange", (): void => {
      if (document.visibilityState === "hidden") {
        sendEndEvent();
      }
    });
  }

  private createSessionId(): string {
    try {
      return crypto.randomUUID();
    } catch {
      return `spfx-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
  }

  private getSafePageLocation(): string {
    try {
      const url = new URL(window.location.href);
      return `${url.origin}${url.pathname}`;
    } catch {
      return window.location.href.split("?")[0].split("#")[0];
    }
  }

  private async getPageTypeFromContentType(
    context: ApplicationCustomizerContext
  ): Promise<{ pageType: string; contentTypeName?: string }> {
    try {
      const ctx: any = context.pageContext;
      if (!ctx.list || !ctx.listItem) return { pageType: "Page" };

      const listId = ctx.list.id.toString();
      const itemId = ctx.listItem.id;

      const apiUrl =
        `${ctx.web.absoluteUrl}/_api/web/lists(guid'${listId}')/items(${itemId})` +
        `?$select=ContentType/Name&$expand=ContentType`;

      const resp: SPHttpClientResponse = await context.spHttpClient.get(
        apiUrl,
        SPHttpClient.configurations.v1
      );

      if (!resp.ok) return { pageType: "Page" };

      const data = (await resp.json()) as { ContentType?: { Name?: string } };
      const rawName: string = data.ContentType?.Name || "";
      const ctName = rawName.toLowerCase();

      let pageType = "Page";
      if (ctName.includes("news")) pageType = "News";
      else if (ctName.includes("event")) pageType = "Event";
      else if (ctName.includes("training")) pageType = "Training";

      return { pageType, contentTypeName: rawName };
    } catch {
      return { pageType: "Page" };
    }
  }
}
