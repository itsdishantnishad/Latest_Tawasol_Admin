import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle,
  PropertyPaneDropdown,
} from "@microsoft/sp-property-pane";

import * as strings from "ProfilePageRightPanelWebPartStrings";

import ProfilePageRightPanel from "./components/ProfilePageRightPanel";
import { IProfilePageRightPanelProps } from "./components/IProfilePageRightPanelProps";

export interface IProfilePageRightPanelWebPartProps {
  description: string;
  applyLeaveUrl?: string;
  hrLetterUrl?: string;
  hrLetterHeroUrl?: string;
  eventsTrainingViewAllUrl?: string;
  sticky?: boolean;
  stickyTop?: string;
  eventsTrainingTab?: "events" | "training";
  /** If true, hide this webpart when viewing someone else's profile (uid/accountname in URL). */
  hideOnOtherProfiles?: boolean;
}

export default class ProfilePageRightPanelWebPart extends BaseClientSideWebPart<IProfilePageRightPanelWebPartProps> {
  private _isHiddenByRule: boolean = false;

  public render(): void {
    // ✅ Hide on "other user's profile" pages
    if (this.properties.hideOnOtherProfiles !== false && !this._isViewingSelfProfile()) {
      this._hideWebPartHost();
      return;
    }

    // if it was hidden before, show again
    this._showWebPartHost();

    const stickyTopNum = this._parseNumber(this.properties.stickyTop, 16);

    const element: React.ReactElement<IProfilePageRightPanelProps> =
      React.createElement(ProfilePageRightPanel, {
        context: this.context,
        applyLeaveUrl: (this.properties.applyLeaveUrl || "").trim(),
        hrLetterUrl: (this.properties.hrLetterUrl || "").trim(),
        hrLetterHeroUrl: this._sanitizeUrl(this.properties.hrLetterHeroUrl),
        eventsTrainingViewAllUrl: (this.properties.eventsTrainingViewAllUrl || "").trim(),
        sticky: this.properties.sticky !== false,
        stickyTop: stickyTopNum,
        eventsTrainingTab: this.properties.eventsTrainingTab || "events",
      });

    ReactDom.render(element, this.domElement);
  }

  private _normalizeKey(v: string): string {
    return (v || "").trim().toLowerCase();
  }

  private _getTargetFromUrl(): { userKey: string; accountname: string } {
    try {
      const params = new URLSearchParams(window.location.search || "");
      const uid = (params.get("uid") || "").trim();
      const accountname = (params.get("accountname") || "").trim();
      const userKey = uid || accountname;
      return { userKey, accountname };
    } catch {
      return { userKey: "", accountname: "" };
    }
  }

  /** Extracts UPN/email from login like: i:0#.f|membership|user@contoso.com */
  private _extractAccountFromLogin(loginName: string): string {
    const raw = String(loginName || "").trim();
    if (!raw) return "";
    const parts = raw.split("|").filter(Boolean);
    return (parts[parts.length - 1] || raw).trim();
  }

  /** True when the opened profile is current user's own profile */
  private _isViewingSelfProfile(): boolean {
    const { userKey } = this._getTargetFromUrl();

    // No uid/accountname => own profile
    if (!userKey) return true;

    const loginName = this.context?.pageContext?.user?.loginName || "";
    const ctxEmail = this.context?.pageContext?.user?.email || "";
    const currentAccount = ctxEmail || this._extractAccountFromLogin(loginName);

    // If userKey is GUID (uid), it'll never match => treat as other profile (hide)
    return this._normalizeKey(userKey) === this._normalizeKey(currentAccount);
  }

  /** Collapses the full webpart host so it doesn't leave blank space */
  private _hideWebPartHost(): void {
    if (this._isHiddenByRule) return;
    this._isHiddenByRule = true;

    ReactDom.unmountComponentAtNode(this.domElement);
    this.domElement.innerHTML = "";

    const host =
      (this.domElement.closest('[data-automation-id="CanvasControl"]') as HTMLElement) ||
      (this.domElement.closest('[data-sp-feature-tag="WebPart"]') as HTMLElement) ||
      (this.domElement.closest(".ControlZone") as HTMLElement) ||
      this.domElement;

    host.style.display = "none";
    host.style.height = "0";
    host.style.minHeight = "0";
    host.style.margin = "0";
    host.style.padding = "0";
  }

  private _showWebPartHost(): void {
    if (!this._isHiddenByRule) return;
    this._isHiddenByRule = false;

    const host =
      (this.domElement.closest('[data-automation-id="CanvasControl"]') as HTMLElement) ||
      (this.domElement.closest('[data-sp-feature-tag="WebPart"]') as HTMLElement) ||
      (this.domElement.closest(".ControlZone") as HTMLElement) ||
      this.domElement;

    host.style.display = "";
    host.style.height = "";
    host.style.minHeight = "";
    host.style.margin = "";
    host.style.padding = "";
  }

  private _parseNumber(value: string | undefined, fallback: number): number {
    const n = parseInt((value || "").trim(), 10);
    return isNaN(n) ? fallback : n;
  }

  private _sanitizeUrl(value?: string): string | undefined {
    const v = (value || "").trim();
    return v ? v : undefined;
  }

  private _validateImageUrl = (value: string): string => {
    const v = (value || "").trim();
    if (!v) return "";

    const isHttp = /^https?:\/\/\S+$/i.test(v);
    const isSiteRelative = v.startsWith("/") || v.startsWith("./") || v.startsWith("../");

    if (!isHttp && !isSiteRelative) {
      return "Enter a valid URL (https://...) or a site-relative path (/sites/.../SiteAssets/...).";
    }
    return "";
  };

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneToggle("hideOnOtherProfiles", {
                  label: "Hide on other users' profiles",
                  onText: "Hide",
                  offText: "Show",
                }),
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
                PropertyPaneTextField("eventsTrainingViewAllUrl", {
                  label: "Events/Training View All URL",
                }),
                PropertyPaneTextField("applyLeaveUrl", { label: "Apply Leave URL" }),
                PropertyPaneTextField("hrLetterUrl", { label: "HR Letter URL" }),
                PropertyPaneTextField("hrLetterHeroUrl", {
                  label: "HR Letter Hero Image URL",
                  placeholder: "https://.../SiteAssets/HR-Letter-Image.svg",
                  description:
                    "Paste an image hyperlink (Site Assets or anywhere). Leave blank to use default image.",
                  onGetErrorMessage: this._validateImageUrl,
                }),

                PropertyPaneToggle("sticky", {
                  label: "Sticky Right Panel",
                  onText: "On",
                  offText: "Off",
                }),
                PropertyPaneTextField("stickyTop", {
                  label: "Sticky Top (px)",
                  description: "Default: 16",
                }),

                PropertyPaneDropdown("eventsTrainingTab", {
                  label: "Default Events/Training Tab",
                  options: [
                    { key: "events", text: "Events" },
                    { key: "training", text: "Training" },
                  ],
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
