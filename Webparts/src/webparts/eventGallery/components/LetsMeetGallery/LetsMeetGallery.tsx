// LetsMeetGallery.tsx
import * as React from "react";
import styles from "./LetsMeetGallery.module.scss";
import type { ILetsMeetGalleryProps } from "./ILetsMeetGalleryProps";
import { listServices, LetsMeetPageItem, ContentTypeId } from "../../../services/listServices";

const LetsMeetArrowIcon_URL = require("../../../assets/ArrowIcon.svg");
const FALLBACK_IMAGE: string = require("../../../assets/PlaceHolderImage.png");

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

  private spService: listServices;

  public constructor(props: ILetsMeetGalleryProps) {
    super(props);
    this.spService = new listServices(this.props.context);
  }

  private readonly listTitle = () => this.props.sitePagesListTitle || "Site Pages";
  private readonly contentTypeName = () => this.props.contentTypeName || "TIRLetsConnect";
  private readonly maxItems = () => this.props.maxItems ?? 12;

  public async componentDidMount(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    this.setState({ loading: true, error: null });

    try {
      const pages: LetsMeetPageItem[] = await this.spService.getLetsMeetPagesFromSitePages(
        this.listTitle(),
        ContentTypeId.LETSCONNECT,
        this.maxItems()
      );

      const vms = pages
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
              <div key={it.id} className={styles.cardWrap}>
                <div
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

                {/* Title below card */}
                <div className={styles.cardTitle} title={it.title}>
                  {it.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

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

  private mapToVm = (item: LetsMeetPageItem): CardVM | null => {
    const youtubeUrl = (item.youtubeUrl || "").trim();
    if (!youtubeUrl) return null;

    const videoId = this.parseYouTubeId(youtubeUrl);
    if (!videoId) return null;

    const thumbMax = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const thumbHQ = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    return {
      id: item.id,
      title: item.title || "Let's Meet",
      pageUrl: item.pageUrl,
      thumbMax,
      thumbHQ,
    };
  };

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
}
