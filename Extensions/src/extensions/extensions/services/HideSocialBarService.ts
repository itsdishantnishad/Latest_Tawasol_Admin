// src/extensions/extensions/services/HideSocialBarService.ts

export type HideSocialBarMode = "hideOn" | "showOnly";
export type SocialUiMode = "commentsOnly" | "hideAll";

export interface IHideSocialBarConfig {
  mode: HideSocialBarMode;

  /** "commentsOnly" = hide social bar but keep comments
   *  "hideAll"      = hide social bar + comments wrapper (no divider/space)
   */
  ui: SocialUiMode;

  /** Pages rules (relative to current web OR absolute/server-relative). Supports "*" at end. */
  pages: string[];

  /** Current web base server-relative url, e.g. "/sites/Tawasol" or "/" */
  webServerRelativeUrl: string;

  /** CSS classes applied to <body> */
  hideSocialClass?: string;  // default: "tir-hide-socialbar"
  hideCommentsClass?: string; // default: "tir-hide-comments"
}

export class HideSocialBarService {
  private readonly hideSocialClass: string;
  private readonly hideCommentsClass: string;

  constructor(private config: IHideSocialBarConfig) {
    this.hideSocialClass = config.hideSocialClass || "tir-hide-socialbar";
    this.hideCommentsClass = config.hideCommentsClass || "tir-hide-comments";
  }

  public apply(): void {
    const shouldApplyHide = this.shouldApplyHideForCurrentUrl();

    if (!shouldApplyHide) {
      document.body.classList.remove(this.hideSocialClass);
      document.body.classList.remove(this.hideCommentsClass);
      return;
    }

    // Always hide social bar when rule matches (both ui modes)
    document.body.classList.add(this.hideSocialClass);

    // Hide entire comments wrapper only when requested
    if (this.config.ui === "hideAll") {
      document.body.classList.add(this.hideCommentsClass);
    } else {
      document.body.classList.remove(this.hideCommentsClass);
    }
  }

  public dispose(): void {
    document.body.classList.remove(this.hideSocialClass);
    document.body.classList.remove(this.hideCommentsClass);
  }

  private shouldApplyHideForCurrentUrl(): boolean {
    const fullPath = this.normalize(window.location.pathname);
    const base = this.normalize(this.config.webServerRelativeUrl);
    const currentWebRelative = this.toWebRelative(fullPath, base);

    const matches = this.config.pages.some((rule) => {
      const normRulePath = this.normalize(this.extractPath(rule));
      const ruleWebRelative = this.toWebRelative(normRulePath, base);
      if (!ruleWebRelative) return false;

      if (ruleWebRelative.endsWith("*")) {
        return currentWebRelative.startsWith(ruleWebRelative.slice(0, -1));
      }
      return currentWebRelative === ruleWebRelative;
    });

    // hideOn   => apply hide on matching pages
    // showOnly => apply hide on NON-matching pages (i.e. show only on matching)
    return this.config.mode === "hideOn" ? matches : !matches;
  }

  private toWebRelative(path: string, base: string): string {
    let p = this.normalize(path);
    let b = this.normalize(base);

    p = p.startsWith("/") ? p.slice(1) : p;
    b = b.startsWith("/") ? b.slice(1) : b;

    if (!b) return p; // root web

    if (p.startsWith(b + "/")) return p.slice(b.length + 1);
    return p; // already web-relative
  }

  private extractPath(input: string): string {
    try {
      if (/^https?:\/\//i.test(input)) return new URL(input).pathname;
      return input;
    } catch {
      return input;
    }
  }

  private normalize(v: string): string {
    if (!v) return "";
    let s = v.trim().toLowerCase();
    if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
    return s;
  }
}
