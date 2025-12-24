// src/extensions/extensions/services/AmplitudeService.ts

import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";

type AmplitudeProps = Record<string, unknown>;

interface AmplitudeInstance {
  init(apiKey: string, userId?: string | null, config?: AmplitudeProps): void;
  setUserProperties(props: AmplitudeProps): void;
  logEvent(name: string, props?: AmplitudeProps): void;
}

interface AmplitudeWindow extends Window {
  amplitude?: { getInstance?: () => AmplitudeInstance };
}

export interface IAmplitudeKeys {
  apiKey: string;

  /**
   * IMPORTANT:
   * Secret Key MUST NOT be used in SPFx (browser) code.
   * If client wants Secret Key usage, do it via a backend (Azure Function/API) + KeyVault.
   */
  secretKey?: string;
}

export class AmplitudeService {
  private readonly keys: IAmplitudeKeys;
  private readonly scriptSrc: string;

  constructor(keys: IAmplitudeKeys, scriptSrc?: string) {
    this.keys = keys;
    this.scriptSrc = scriptSrc || "https://cdn.amplitude.com/libs/amplitude-8.21.2-min.gz.js";
  }

  public init(context: ApplicationCustomizerContext): void {
    const apiKey = (this.keys.apiKey || "").trim();
    if (!apiKey) return;

    const win = window as unknown as AmplitudeWindow;

    // Already loaded
    if (win.amplitude?.getInstance) {
      void this.configure(context);
      return;
    }

    // Load once
    const existing = document.getElementById("amplitude-js");
    if (existing) {
      setTimeout((): void => { void this.configure(context); }, 500);
      return;
    }

    const script = document.createElement("script");
    script.id = "amplitude-js";
    script.type = "text/javascript";
    script.async = true;
    script.src = this.scriptSrc;
    script.onload = (): void => { void this.configure(context); };
    document.head.appendChild(script);
  }

  private async configure(context: ApplicationCustomizerContext): Promise<void> {
    const win = window as unknown as AmplitudeWindow;
    const instance = win.amplitude?.getInstance?.();
    if (!instance) return;

    const user = context.pageContext.user;
    const web = context.pageContext.web;

    const userId = user.email || user.loginName;

    instance.init(this.keys.apiKey, userId, {
      includeUtm: true,
      includeReferrer: true,
      saveEvents: true
    });

    instance.setUserProperties({
      spLogin: user.loginName,
      spDisplayName: user.displayName,
      spEmail: user.email,
      siteTitle: web.title,
      siteId: web.id.toString()
    });

    const { pageType, contentTypeName } = await this.getPageTypeFromContentType(context);

    instance.logEvent("SharePoint Page Viewed", {
      url: window.location.href,
      pagePath: window.location.pathname,
      title: document.title,
      siteTitle: web.title,
      siteUrl: web.absoluteUrl,
      pageType,
      contentTypeName
    });
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
