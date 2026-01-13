// import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
// import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";

// export interface IOnboardingState {
//   URL: string;
//   title: string;
//   hasSeen: boolean;
// }

// export class OnboardingService {
//   private static readonly LIST_TITLE = "Onboarding";

//   private readonly _ctx: ApplicationCustomizerContext;

//   public constructor(ctx: ApplicationCustomizerContext) {
//     this._ctx = ctx;
//   }

//   private get webUrl(): string {
//     return (this._ctx.pageContext.web.absoluteUrl || "").replace(/\/$/, "");
//   }

//   /** Use email (most stable) with a safe fallback */
//   private get userKey(): string {
//     const email = (this._ctx.pageContext.user.email || "").trim().toLowerCase();
//     if (email) return email;

//     // fallback (rare): loginName
//     return (this._ctx.pageContext.user.loginName || "").trim().toLowerCase();
//   }

//   /** Local cache key per site+user */
//   private get localKey(): string {
//     const site = (this._ctx.pageContext.site.absoluteUrl || this.webUrl).toLowerCase();
//     return `tir_onboarding_seen_v1::${site}::${this.userKey}`;
//   }

//   private odataEscape(value: string): string {
//     return (value || "").replace(/'/g, "''");
//   }

//   public hasSeenLocally(): boolean {
//     try {
//       return localStorage.getItem(this.localKey) === "1";
//     } catch {
//       return false;
//     }
//   }

//   public markSeenLocally(): void {
//     try {
//       localStorage.setItem(this.localKey, "1");
//     } catch {
//       // ignore
//     }
//   }

//   /** Loads config (Title+URL) and seen state (list + local fallback) */
//   public async loadState(): Promise<IOnboardingState> {
//     // If already seen locally, never block the user
//     if (this.hasSeenLocally()) {
//       const cfg = await this.getConfig().catch(() => ({ URL: "", title: "" }));
//       return { ...cfg, hasSeen: true };
//     }

//     const [cfg, seen] = await Promise.all([
//       this.getConfig(),
//       this.hasUserSeenInList()
//     ]);

//     // If list says seen, also set local (future-proof)
//     if (seen) this.markSeenLocally();

//     return { ...cfg, hasSeen: seen };
//   }

//   /** Reads onboarding Title+URL from list top 1 item */
//   public async getConfig(): Promise<{ URL: string; title: string }> {
//     const api =
//       `${this.webUrl}/_api/web/lists/GetByTitle('${OnboardingService.LIST_TITLE}')/items` +
//       `?$select=Title,URL&$top=1`;

//     const res = await this._ctx.spHttpClient.get(api, SPHttpClient.configurations.v1);
//     if (!res.ok) return { URL: "", title: "" };

//     const json = await res.json();
//     const item = json?.value?.[0];

//     return {
//       title: String(item?.Title || ""),
//       URL: String(item?.URL?.Url || "")
//     };
//   }

//   /** Checks if current user exists in list by email/userKey */
//   public async hasUserSeenInList(): Promise<boolean> {
//     const key = this.userKey;
//     if (!key) return false;

//     const safeKey = this.odataEscape(key);

//     // IMPORTANT: use the SAME field you write into (TIRUserID)
//     const api =
//       `${this.webUrl}/_api/web/lists/GetByTitle('${OnboardingService.LIST_TITLE}')/items` +
//       `?$select=Id,TIRUserID&$filter=TIRUserID eq '${safeKey}'&$top=1`;

//     const res = await this._ctx.spHttpClient.get(api, SPHttpClient.configurations.v1);
//     if (!res.ok) return false;

//     const data = await res.json();
//     return Array.isArray(data?.value) && data.value.length > 0;
//   }

//   /**
//    * Writes "seen" to list.
//    * ALSO marks locally so user isn't blocked if list write fails.
//    */
//   public async markSeen(): Promise<boolean> {
//     this.markSeenLocally(); // never block user again even if list fails

//     const key = this.userKey;
//     if (!key) return true;

//     const body = {
//       Title: key,
//       TIRUserID: key
//     };

//     const api = `${this.webUrl}/_api/web/lists/GetByTitle('${OnboardingService.LIST_TITLE}')/items`;

//     try {
//       const resp: SPHttpClientResponse = await this._ctx.spHttpClient.post(
//         api,
//         SPHttpClient.configurations.v1,
//         {
//           headers: {
//             accept: "application/json;odata=nometadata",
//             "content-type": "application/json;odata=nometadata"
//           },
//           body: JSON.stringify(body)
//         }
//       );

//       // If POST fails (permissions/validation), we still allow user via local storage.
//       return resp.ok;
//     } catch {
//       return true;
//     }
//   }
// }





























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
    console.log("[OnboardingService] constructed");
  }

  private get webUrl(): string {
    return (this._ctx.pageContext.web.absoluteUrl || "").replace(/\/$/, "");
  }

  private get userKey(): string {
    const email = (this._ctx.pageContext.user.email || "").trim().toLowerCase();
    if (email) return email;
    return (this._ctx.pageContext.user.loginName || "").trim().toLowerCase();
  }

  private get localKey(): string {
    const site = (this._ctx.pageContext.site.absoluteUrl || this.webUrl).toLowerCase();
    return `tir_onboarding_seen_v1::${site}::${this.userKey}`;
  }

  private odataEscape(value: string): string {
    return (value || "").replace(/'/g, "''");
  }

  public hasSeenLocally(): boolean {
    try {
      const v = localStorage.getItem(this.localKey);
      console.log("[OnboardingService] localStorage read:", this.localKey, v);
      return v === "1";
    } catch (e) {
      console.warn("[OnboardingService] localStorage read failed:", e);
      return false;
    }
  }

  public markSeenLocally(): void {
    try {
      localStorage.setItem(this.localKey, "1");
      console.log("[OnboardingService] localStorage set:", this.localKey, "1");
    } catch (e) {
      console.warn("[OnboardingService] localStorage set failed:", e);
    }
  }

  public async loadState(): Promise<IOnboardingState> {
    console.log("[OnboardingService] loadState()", {
      webUrl: this.webUrl,
      userKey: this.userKey
    });

    const localSeen = this.hasSeenLocally();
    console.log("[OnboardingService] localSeen:", localSeen);

    if (localSeen) {
      const cfg = await this.getConfig().catch((e) => {
        console.error("[OnboardingService] getConfig failed (localSeen path):", e);
        return { URL: "", title: "" };
      });
      return { ...cfg, hasSeen: true };
    }

    const [cfg, seen] = await Promise.all([
      this.getConfig().catch((e) => {
        console.error("[OnboardingService] getConfig failed:", e);
        return { URL: "", title: "" };
      }),
      this.hasUserSeenInList().catch((e) => {
        console.error("[OnboardingService] hasUserSeenInList failed:", e);
        return false;
      })
    ]);

    console.log("[OnboardingService] cfg:", cfg, "seen(list):", seen);

    if (seen) this.markSeenLocally();

    return { ...cfg, hasSeen: seen };
  }

  public async getConfig(): Promise<{ URL: string; title: string }> {
    const api =
      `${this.webUrl}/_api/web/lists/GetByTitle('${OnboardingService.LIST_TITLE}')/items` +
      `?$select=Title,URL&$top=1`;

    console.log("[OnboardingService] getConfig api:", api);

    const res = await this._ctx.spHttpClient.get(api, SPHttpClient.configurations.v1);
    console.log("[OnboardingService] getConfig status:", res.status, res.statusText);

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.warn("[OnboardingService] getConfig not ok body:", txt);
      return { URL: "", title: "" };
    }

    const json = await res.json();
    console.log("[OnboardingService] getConfig json:", json);

    const item = json?.value?.[0];
    const title = String(item?.Title || "");
    const URL = String(item?.URL?.Url || "");

    console.log("[OnboardingService] getConfig parsed:", { title, URL });

    return { title, URL };
  }

  public async hasUserSeenInList(): Promise<boolean> {
    const key = this.userKey;
    console.log("[OnboardingService] hasUserSeenInList userKey:", key);

    if (!key) return false;

    const safeKey = this.odataEscape(key);

    const api =
      `${this.webUrl}/_api/web/lists/GetByTitle('${OnboardingService.LIST_TITLE}')/items` +
      `?$select=Id,TIRUserID&$filter=TIRUserID eq '${safeKey}'&$top=1`;

    console.log("[OnboardingService] hasUserSeenInList api:", api);

    const res = await this._ctx.spHttpClient.get(api, SPHttpClient.configurations.v1);
    console.log("[OnboardingService] hasUserSeenInList status:", res.status, res.statusText);

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.warn("[OnboardingService] hasUserSeenInList not ok body:", txt);
      return false;
    }

    const data = await res.json();
    console.log("[OnboardingService] hasUserSeenInList json:", data);

    const seen = Array.isArray(data?.value) && data.value.length > 0;
    console.log("[OnboardingService] hasUserSeenInList seen:", seen);
    return seen;
  }

  public async markSeen(): Promise<boolean> {
    console.log("[OnboardingService] markSeen() start");
    this.markSeenLocally();

    const key = this.userKey;
    if (!key) {
      console.warn("[OnboardingService] markSeen no userKey => skipping list write");
      return true;
    }

    const body = { Title: key, TIRUserID: key };
    const api = `${this.webUrl}/_api/web/lists/GetByTitle('${OnboardingService.LIST_TITLE}')/items`;

    console.log("[OnboardingService] markSeen POST api:", api, "body:", body);

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

      console.log("[OnboardingService] markSeen POST status:", resp.status, resp.statusText);

      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        console.warn("[OnboardingService] markSeen POST not ok body:", txt);
        return false;
      }

      const json = await resp.json().catch(() => null);
      console.log("[OnboardingService] markSeen POST json:", json);

      return true;
    } catch (e) {
      console.error("[OnboardingService] markSeen POST exception:", e);
      return true; // allow user (local is set)
    }
  }
}
