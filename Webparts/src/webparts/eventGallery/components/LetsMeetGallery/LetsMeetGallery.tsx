// LetsMeetGallery.tsx

import * as React from "react";
import styles from "./LetsMeetGallery.module.scss";
import type { ILetsMeetGalleryProps } from "./ILetsMeetGalleryProps";
import { SPHttpClient } from "@microsoft/sp-http";

const LetsMeetArrowIcon_URL = require("../../../assets/ArrowIcon.svg");
const FALLBACK_IMAGE: string = require("../../../assets/PlaceHolderImage.png");

type UrlFieldValue = { Url?: string; Description?: string };

type PageItem = {
  Id: number;
  Title: string;
  FileRef: string;

  TIRSortOrder?: number;
  URL?: UrlFieldValue | string;

  Modified?: string;
  ContentTypeId?: string;
};

type CardVM = {
  id: number;
  title: string;
  pageUrl: string;
  thumbMax: string;
  thumbHQ: string;
};

export interface ILetsMeetGalleryState {
  loading: boolean;
  error: string | null;
  items: CardVM[];
}

export default class LetsMeetGallery extends React.Component<
  ILetsMeetGalleryProps,
  ILetsMeetGalleryState
> {
  public state: ILetsMeetGalleryState = {
    loading: true,
    error: null,
    items: [],
  };

  private _ctIdCache: string | null | undefined;

  private readonly listTitle = () => this.props.sitePagesListTitle || "Site Pages";
  private readonly contentTypeName = () => this.props.contentTypeName || "TIRLetsConnect";
  private readonly maxItems = () => this.props.maxItems ?? 12;

  public async componentDidMount(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    this.setState({ loading: true, error: null });

    try {
      const raw = await this.fetchPages();

      // ✅ Only those which have valid YouTube URL (no blanks)
      const vms = raw
        .map(this.mapToVm)
        .filter((x): x is CardVM => !!x);

      this.setState({ loading: false, error: null, items: vms });
    } catch (e: any) {
      this.setState({
        loading: false,
        error: e?.message || "Failed to load gallery.",
        items: [],
      });
    }
  }

  public render(): React.ReactElement<ILetsMeetGalleryProps> {
    const { loading, error, items } = this.state;

    if (loading) return <div className={styles.letsMeetGallery}>Loading...</div>;

    if (error) {
      return (
        <div className={styles.letsMeetGallery}>
          <div className={styles.error}>{error}</div>
        </div>
      );
    }

    return (
      <section className={styles.letsMeetGallery}>
        {/* HEADER */}
        <div className={styles.headerWrap}>
          <h2 className={styles.title}>
            <span className={styles.titleLets}>Let&apos;s</span>{" "}
            <span className={styles.titleMeet}>Meet</span>
          </h2>

          <img className={styles.arrowIcon} src={LetsMeetArrowIcon_URL} alt="" />

          {!!this.props.letsMeetDescription && (
            <div className={styles.desc}>{this.props.letsMeetDescription}</div>
          )}
        </div>

        {/* GRID */}
        {items.length === 0 ? (
          <div className={styles.error}>No videos found (URL not set).</div>
        ) : (
          <div className={styles.grid}>
            {items.map((it) => (
              <div
                key={it.id}
                className={styles.card}
                role="button"
                tabIndex={0}
                title={it.title}
                onClick={() => window.open(it.pageUrl, "_blank", "noopener,noreferrer")}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    window.open(it.pageUrl, "_blank", "noopener,noreferrer");
                  }
                }}
              >
                <img
                  className={styles.thumb}
                  src={it.thumbMax}
                  alt={it.title}
                  onError={(ev) => this.handleThumbFallback(ev, it.thumbHQ)}
                />

                <div className={styles.playCenter} aria-hidden="true">
                  <span className={styles.playTriangle} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  // ✅ maxres -> hq -> placeholder
  private handleThumbFallback(
    ev: React.SyntheticEvent<HTMLImageElement, Event>,
    thumbHQ: string
  ): void {
    const img = ev.currentTarget;
    if (!img) return;

    if (img.src !== thumbHQ && img.src !== FALLBACK_IMAGE) {
      img.src = thumbHQ;
      return;
    }

    if (img.src !== FALLBACK_IMAGE) {
      img.src = FALLBACK_IMAGE;
    }
  }

  private async fetchPages(): Promise<PageItem[]> {
    const webUrl = this.props.context.pageContext.web.absoluteUrl;
    const listTitle = this.listTitle();
    const ctName = this.contentTypeName();
    const top = this.maxItems();

    // ✅ Resolve CT ID from list (reliable filtering)
    const ctId = await this.getContentTypeIdByName(webUrl, listTitle, ctName);
    if (!ctId) {
      throw new Error(
        `Content Type '${ctName}' not found in '${listTitle}' library. Ensure it's added to Site Pages content types.`
      );
    }

    const url =
      `${webUrl}/_api/web/lists/getbytitle('${this.escOData(listTitle)}')/items` +
      `?$select=Id,Title,FileRef,URL,TIRSortOrder,Modified,ContentTypeId` +
      `&$filter=startswith(ContentTypeId,'${this.escOData(ctId)}')` +
      `&$orderby=TIRSortOrder asc,Modified desc` +
      `&$top=${top}`;

    const res = await this.props.context.spHttpClient.get(url, SPHttpClient.configurations.v1);

    if (!res.ok) {
      const msg = await this.readSpError(res);
      throw new Error(`Failed to load items. (${res.status}) ${msg}`);
    }

    const json = await res.json();
    return (json?.value || []) as PageItem[];
  }

  private async getContentTypeIdByName(
    webUrl: string,
    listTitle: string,
    ctName: string
  ): Promise<string | null> {
    if (this._ctIdCache !== undefined) return this._ctIdCache;

    try {
      const url =
        `${webUrl}/_api/web/lists/getbytitle('${this.escOData(listTitle)}')/ContentTypes` +
        `?$select=Name,Id&$top=200`;

      const res = await this.props.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
      if (!res.ok) {
        this._ctIdCache = null;
        return null;
      }

      const json = await res.json();
      const arr = (json?.value || []) as Array<{ Name: string; Id: { StringValue?: string } }>;

      const hit = arr.find(
        (x) => (x?.Name || "").trim().toLowerCase() === (ctName || "").trim().toLowerCase()
      );

      const id = hit?.Id?.StringValue || null;
      this._ctIdCache = id;
      return id;
    } catch {
      this._ctIdCache = null;
      return null;
    }
  }

  // ✅ Only returns VM if URL is valid YouTube link
  private mapToVm = (item: PageItem): CardVM | null => {
    const youtubeUrl = (this.readUrlField(item.URL) || "").trim();
    if (!youtubeUrl) return null;

    const videoId = this.parseYouTubeId(youtubeUrl);
    if (!videoId) return null;

    const thumbMax = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const thumbHQ = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    const pageUrl = this.toAbsoluteUrl(item.FileRef);

    return {
      id: item.Id,
      title: item.Title || "Let's Meet",
      pageUrl,
      thumbMax,
      thumbHQ,
    };
  };

  private readUrlField(val?: UrlFieldValue | string): string | null {
    if (!val) return null;
    if (typeof val === "string") return val.trim() || null;
    const u = (val.Url || "").trim();
    return u ? u : null;
  }

  private toAbsoluteUrl(serverRelative: string): string {
    const webAbs = this.props.context.pageContext.web.absoluteUrl;
    const origin = new URL(webAbs).origin;
    return serverRelative.startsWith("http") ? serverRelative : `${origin}${serverRelative}`;
  }

  private parseYouTubeId(url: string): string | null {
    try {
      const u = new URL(url);

      if (u.hostname.includes("youtu.be")) {
        return u.pathname.replace("/", "").trim() || null;
      }

      const v = u.searchParams.get("v");
      if (v) return v;

      const parts = u.pathname.split("/").filter(Boolean);

      const embedIdx = parts.indexOf("embed");
      if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];

      const shortsIdx = parts.indexOf("shorts");
      if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];

      return null;
    } catch {
      return null;
    }
  }

  private escOData(val: string): string {
    return (val || "").replace(/'/g, "''");
  }

  private async readSpError(res: any): Promise<string> {
    try {
      const text = await res.text();
      if (!text) return "";

      try {
        const j = JSON.parse(text);
        const msg =
          j?.error?.message?.value ||
          j?.error?.message ||
          j?.["odata.error"]?.message?.value ||
          "";
        return msg ? `- ${msg}` : "";
      } catch {
        return text.length > 180 ? `- ${text.slice(0, 180)}...` : `- ${text}`;
      }
    } catch {
      return "";
    }
  }
}
