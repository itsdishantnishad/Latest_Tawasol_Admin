import * as React from "react";
import styles from "./LeftSection.module.scss";
import NavSegment, { NavKey } from "../ProfileNavComp/NavSegComp";

export interface ILeftSectionProps {
  className?: string;
  navProps?: Record<string, unknown>;

  /**
   * Optional override routes (configurable endpoints)
   * - If value is absolute (https://...), it is used as-is
   * - If value is relative (/SitePages/...), it is resolved against current site
   */
  routes?: Partial<Record<NavKey, string>>;
}

interface ILeftSectionState {
  activeTab: NavKey;
  isLoading: boolean;
}

/**
 * Defaults are relative so they target CURRENT SITE automatically.
 * (No tenant/site hardcoding)
 */
const DEFAULT_ROUTE_PATHS: Record<NavKey, string> = {
  storyline: "/SitePages/Engage-%E2%80%93-Storyline.aspx",
  activities: "/SitePages/Engage-All-Activities.aspx",
  bookmarks: "https://engage.cloud.microsoft/my/saved",
};

export default class LeftSection extends React.Component<
  ILeftSectionProps,
  ILeftSectionState
> {
  private iframeRef: React.RefObject<HTMLIFrameElement>;

  constructor(props: ILeftSectionProps) {
    super(props);
    this.state = {
      activeTab: "storyline",
      isLoading: true,
    };
    this.iframeRef = React.createRef();
  }

  private isAbsoluteUrl(url: string): boolean {
    return /^https?:\/\//i.test(url || "");
  }

  /**
   * Build current site base URL:
   * - Uses current page URL
   * - Strips everything after /SitePages/ if present
   * - Keeps tenant + site path
   *
   * Example:
   * https://tenant.sharepoint.com/sites/MySite/SitePages/Page.aspx
   * -> https://tenant.sharepoint.com/sites/MySite
   */
  private getCurrentSiteBaseUrl(): string {
    try {
      const u = new URL(window.location.href);
      const lowerPath = u.pathname.toLowerCase();
      const idx = lowerPath.indexOf("/sitepages/");
      const sitePath = idx >= 0 ? u.pathname.substring(0, idx) : u.pathname.replace(/\/+$/, "");
      return `${u.origin}${sitePath}`.replace(/\/+$/, "");
    } catch {
      return window.location.origin;
    }
  }

  private getRoutes(): Record<NavKey, string> {
    return {
      ...DEFAULT_ROUTE_PATHS,
      ...(this.props.routes || {}),
    } as Record<NavKey, string>;
  }

  private resolveUrl(route: string): string {
    const r = (route || "").trim();
    if (!r) return "";
    if (this.isAbsoluteUrl(r)) return r;

    const base = this.getCurrentSiteBaseUrl();
    const path = r.startsWith("/") ? r : `/${r}`;
    return `${base}${path}`;
  }

  private handleTabChange = (value: NavKey) => {
    this.setState({ activeTab: value, isLoading: true });

    const routes = this.getRoutes();
    const target = this.resolveUrl(routes[value]);

    if (value === "bookmarks") {
      window.open(target, "_blank", "noopener,noreferrer");
    }
  };

  private handleIframeLoad = () => {
    this.setState({ isLoading: false });
    setTimeout(() => {
      try {
        const iframe = this.iframeRef.current;
        if (!iframe?.contentDocument) return;

        const doc = iframe.contentDocument;
        if (doc.getElementById("viva-custom-style")) return;

        const style = doc.createElement("style");
        style.id = "viva-custom-style";
        style.textContent = `
          [class*="rightRail"], [class*="RightRail"] { display: none !important; }
          [class*="mainContent"], [class*="contentArea"] { max-width: 100% !important; }
          [class*="actionButtons"], div[role="group"]:has(button[aria-label*="Discussion"]) { 
            display: flex !important; flex-direction: row !important; gap: 8px !important; 
            flex-wrap: wrap !important; margin-top: 12px !important; 
          }
          button[aria-label*="Discussion"], button[aria-label*="Question"], 
          button[aria-label*="Praise"], button[aria-label*="Poll"] { 
            flex: 1 1 calc(25% - 6px) !important; min-width: 100px !important; 
            justify-content: center !important; 
          }
        `;
        doc.head?.appendChild(style);
      } catch (e) {
        console.log(e);
      }
    }, 1000);
  };

  private renderIframe() {
    const { activeTab, isLoading } = this.state;

    if (activeTab === "bookmarks") {
      return (
        <div className={styles.placeholder}>
          <p>Opening your saved items in a new tab…</p>
        </div>
      );
    }

    const routes = this.getRoutes();
    const src = this.resolveUrl(routes[activeTab]);

    return (
      <>
        {isLoading && (
          <div className={styles.loaderWrapper}>
            <div className={styles.loader}></div>
            <p>
              Loading{" "}
              {activeTab === "storyline" ? "Storyline" : "All Activities"}…
            </p>
          </div>
        )}

        <iframe
          ref={this.iframeRef}
          src={src}
          title={activeTab}
          onLoad={this.handleIframeLoad}
          style={{
            width: "100%",
            height: "100vh",
            border: "none",
            display: isLoading ? "none" : "block",
          }}
        />
      </>
    );
  }

  public render(): React.ReactElement<ILeftSectionProps> {
    const { className, navProps } = this.props;
    const { activeTab } = this.state;

    return (
      <section
        className={[styles.leftWrap, className || ""].join(" ")}
        aria-label="Viva Engage navigation"
      >
        <div className={styles.block}>
          <NavSegment
            {...(navProps as any)}
            value={activeTab}
            onChange={this.handleTabChange}
          />
        </div>

        <div className={styles.block}>{this.renderIframe()}</div>
      </section>
    );
  }
}
