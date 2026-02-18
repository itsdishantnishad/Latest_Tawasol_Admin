import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";

export interface IOnboardingState {
  URL: string;
  title: string;
  hasSeen: boolean;
}

export class OnboardingService {
  private static readonly LIST_TITLE = "Onboarding";
  private readonly _ctx: ApplicationCustomizerContext;

  public constructor(ctx: ApplicationCustomizerContext) {
    this._ctx = ctx;
  }

  private get webUrl(): string {
    return (this._ctx.pageContext.web.absoluteUrl || "").replace(/\/$/, "");
  }

  /** Use email (most stable) with a safe fallback */
  private get userKey(): string {
    const email = (this._ctx.pageContext.user.email || "").trim().toLowerCase();
    if (email) return email;

    // fallback (rare): loginName
    return (this._ctx.pageContext.user.loginName || "").trim().toLowerCase();
  }

  /** Local cache key per site+user */
  private get localKey(): string {
    const site = (this._ctx.pageContext.site.absoluteUrl || this.webUrl).toLowerCase();
    return `tir_onboarding_seen_v1::${site}::${this.userKey}`;
  }

  private odataEscape(value: string): string {
    return (value || "").replace(/'/g, "''");
  }

  public hasSeenLocally(): boolean {
    try {
      return localStorage.getItem(this.localKey) === "1";
    } catch {
      return false;
    }
  }

  public markSeenLocally(): void {
    try {
      localStorage.setItem(this.localKey, "1");
    } catch {
      // ignore
    }
  }

  /** Loads config (Title+URL) and seen state (list + local fallback) */
  public async loadState(): Promise<IOnboardingState> {
    // If already seen locally, never block the user
    if (this.hasSeenLocally()) {
      const cfg = await this.getConfig().catch(() => ({ URL: "", title: "" }));
      return { ...cfg, hasSeen: true };
    }

    const [cfg, seen] = await Promise.all([
      this.getConfig(),
      this.hasUserSeenInList()
    ]);

    // If list says seen, also set local (future-proof)
    if (seen) this.markSeenLocally();

    return { ...cfg, hasSeen: seen };
  }

  public async getConfig(): Promise<{ URL: string; title: string }> {
    const extractUrl = (v: any): string => {
      if (!v) return "";
      if (typeof v === "string") return v.trim();
      if (typeof v === "object") return String(v.Url || v.url || "").trim();
      return "";
    };

    // Attempt #1 (fast): fetch only items that have URL filled (config rows)
    const api1 =
      `${this.webUrl}/_api/web/lists/GetByTitle('${OnboardingService.LIST_TITLE}')/items` +
      `?$select=Title,URL,Modified` +
      `&$filter=(URL/Url ne null) and (URL/Url ne '')` +
      `&$orderby=Modified desc` +
      `&$top=1`;

    try {
      const res1 = await this._ctx.spHttpClient.get(api1, SPHttpClient.configurations.v1);
      if (res1.ok) {
        const json1 = await res1.json();
        const first = Array.isArray(json1?.value) ? json1.value[0] : undefined;
        const url1 = extractUrl(first?.URL);
        if (url1) {
          return { title: String(first?.Title || ""), URL: url1 };
        }
      }
    } catch {
      // ignore; fallback below
    }

    // Attempt #2 (robust fallback): read more items and pick the first item that has URL.
    const api2 =
      `${this.webUrl}/_api/web/lists/GetByTitle('${OnboardingService.LIST_TITLE}')/items` +
      `?$select=Title,URL,Modified` +
      `&$orderby=Modified desc` +
      `&$top=5000`;

    const res2 = await this._ctx.spHttpClient.get(api2, SPHttpClient.configurations.v1);
    if (!res2.ok) return { URL: "", title: "" };

    const json2 = await res2.json();
    const items: any[] = Array.isArray(json2?.value) ? json2.value : [];

    const cfgItem = items.find(i => !!extractUrl(i?.URL));
    return {
      title: String(cfgItem?.Title || ""),
      URL: extractUrl(cfgItem?.URL)
    };
  }

  /** Checks if current user exists in list by email/userKey */
  public async hasUserSeenInList(): Promise<boolean> {
    const key = this.userKey;
    if (!key) return false;

    const safeKey = this.odataEscape(key);

    // IMPORTANT: use the SAME field you write into (TIRUserID)
    const api =
      `${this.webUrl}/_api/web/lists/GetByTitle('${OnboardingService.LIST_TITLE}')/items` +
      `?$select=Id,TIRUserID&$filter=TIRUserID eq '${safeKey}'&$top=1`;

    const res = await this._ctx.spHttpClient.get(api, SPHttpClient.configurations.v1);
    if (!res.ok) return false;

    const data = await res.json();
    return Array.isArray(data?.value) && data.value.length > 0;
  }

  /**
   * Writes "seen" to list.
   * ALSO marks locally so user isn't blocked if list write fails.
   */
  public async markSeen(): Promise<boolean> {
    this.markSeenLocally(); // never block user again even if list fails

    const key = this.userKey;
    if (!key) return true;

    const body = {
      Title: key,
      TIRUserID: key
    };

    const api = `${this.webUrl}/_api/web/lists/GetByTitle('${OnboardingService.LIST_TITLE}')/items`;

    try {
      const resp: SPHttpClientResponse = await this._ctx.spHttpClient.post(
        api,
        SPHttpClient.configurations.v1,
        {
          headers: {
            accept: "application/json;odata=nometadata",
            "content-type": "application/json;odata=nometadata"
          },
          body: JSON.stringify(body)
        }
      );

      // If POST fails (permissions/validation), we still allow user via local storage.
      return resp.ok;
    } catch {
      return true;
    }
  }
}
