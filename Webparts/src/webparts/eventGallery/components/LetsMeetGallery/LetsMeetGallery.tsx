
import * as React from "react";
import styles from "./LetsMeetGallery.module.scss";
import type { ILetsMeetGalleryProps } from "./ILetsMeetGalleryProps";
import { SPHttpClient } from "@microsoft/sp-http";

const LetsMeetArrowIcon_URL = require("../../../assets/ArrowIcon.svg");

type PageVideoItem = {
  Id: number;
  Title: string;
  FileRef: string;
  LetsMeetYouTubeUrl?: string;
  LetsMeetIsActive?: boolean;
  LetsMeetSortOrder?: number;
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

  private readonly listTitle = () => this.props.sitePagesListTitle || "Site Pages";
  private readonly contentTypeName = () => this.props.contentTypeName || "Lets Meet Video Page";
  private readonly maxItems = () => this.props.maxItems ?? 12;

  public async componentDidMount(): Promise<void> {
    try {
      const raw = await this.fetchPages();
      const vms = raw
        .map(this.mapToVm)
        .filter((x): x is CardVM => !!x);

      this.setState({ loading: false, error: null, items: vms });
    } catch (e: any) {
      this.setState({ loading: false, error: e?.message || "Failed to load gallery.", items: [] });
    }
  }

  public render(): React.ReactElement<ILetsMeetGalleryProps> {
    const { loading, error, items } = this.state;

    if (loading) return <div className={styles.letsMeetGallery}>Loading...</div>;
    if (error) return <div className={styles.letsMeetGallery}><div className={styles.error}>{error}</div></div>;

    return (
      <section className={styles.letsMeetGallery}>
        {/*  HEADER */}
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


        <div className={styles.grid}>
          {items.map((it) => (
            <div
              key={it.id}
              className={styles.card}
              role="button"
              tabIndex={0}
              title={it.title}
              onClick={() => window.open(it.pageUrl, "_blank", "noopener,noreferrer")}
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
      </section>
    );
  }

  private handleThumbFallback(ev: React.SyntheticEvent<HTMLImageElement, Event>, fallbackSrc: string): void {
    const img = ev.currentTarget;
    if (img && img.src !== fallbackSrc) img.src = fallbackSrc;
  }

  private async fetchPages(): Promise<PageVideoItem[]> {
    const webUrl = this.props.context.pageContext.web.absoluteUrl;
    const ctName = this.contentTypeName();
    const top = this.maxItems();

    const url =
      `${webUrl}/_api/web/lists/getbytitle('${this.escOData(this.listTitle())}')/items` +
      `?$select=Id,Title,FileRef,LetsMeetYouTubeUrl,LetsMeetIsActive,LetsMeetSortOrder,ContentType/Name` +
      `&$expand=ContentType` +
      `&$filter=(LetsMeetIsActive eq 1) and (ContentType/Name eq '${this.escOData(ctName)}')` +
      `&$orderby=LetsMeetSortOrder asc,Modified desc` +
      `&$top=${top}`;

    const res = await this.props.context.spHttpClient.get(url, SPHttpClient.configurations.v1);

    if (!res.ok) {
      const fallbackUrl =
        `${webUrl}/_api/web/lists/getbytitle('${this.escOData(this.listTitle())}')/items` +
        `?$select=Id,Title,FileRef,LetsMeetYouTubeUrl,LetsMeetIsActive,LetsMeetSortOrder` +
        `&$filter=(LetsMeetIsActive eq 1)` +
        `&$orderby=LetsMeetSortOrder asc,Modified desc` +
        `&$top=${top}`;

      const res2 = await this.props.context.spHttpClient.get(fallbackUrl, SPHttpClient.configurations.v1);
      if (!res2.ok) throw new Error(`Failed to load items. (${res2.status})`);

      const json2 = await res2.json();
      return (json2?.value || []) as PageVideoItem[];
    }

    const json = await res.json();
    return (json?.value || []) as PageVideoItem[];
  }

  private mapToVm = (item: PageVideoItem): CardVM | null => {
    const youtubeUrl = (item?.LetsMeetYouTubeUrl || "").trim();
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

  private toAbsoluteUrl(serverRelative: string): string {
    const webAbs = this.props.context.pageContext.web.absoluteUrl;
    const origin = new URL(webAbs).origin;
    return serverRelative.startsWith("http") ? serverRelative : `${origin}${serverRelative}`;
  }

  private parseYouTubeId(url: string): string | null {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "").trim() || null;

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
}
