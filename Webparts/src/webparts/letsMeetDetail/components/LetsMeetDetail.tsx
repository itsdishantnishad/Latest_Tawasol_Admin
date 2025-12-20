// src/webparts/letsMeetDetail/components/LetsMeetDetail.tsx
import * as React from "react";
import styles from "./LetsMeetDetail.module.scss";
import type { ILetsMeetDetailProps } from "./ILetsMeetDetailProps";
import { LetsMeetDataService } from "../LetsMeetServices/LetsMeetDataService";
import { LetsMeetMappingService, ViewModel } from "../LetsMeetServices/LetsMeetMappingService";
import { LetsMeetActionService } from "../LetsMeetServices/LetsMeetActionService";

export interface ILetsMeetDetailState {
  loading: boolean;
  error: string | null;
  current: ViewModel | null;
  suggestions: ViewModel[];
  isPlaying: boolean;
}

export default class LetsMeetDetail extends React.Component<
  ILetsMeetDetailProps,
  ILetsMeetDetailState
> {
  private dataService: LetsMeetDataService;
  private mappingService: LetsMeetMappingService;

  public state: ILetsMeetDetailState = {
    loading: true,
    error: null,
    current: null,
    suggestions: [],
    isPlaying: false,
  };

  constructor(props: ILetsMeetDetailProps) {
    super(props);

    const listTitle = props.sitePagesListTitle || "Site Pages";
    const contentTypeName = props.contentTypeName || "Lets Meet Video Page";

    this.dataService = new LetsMeetDataService(
      props.context,
      listTitle,
      contentTypeName
    );
    this.mappingService = new LetsMeetMappingService(props.context);
  }

  public async componentDidMount(): Promise<void> {
    try {
      const currentItem = await this.dataService.fetchCurrentPageItem();
      const currentVm = this.mappingService.mapToViewModel(currentItem);

      if (!currentVm) {
        this.setState({
          loading: false,
          error: `Please set page property "LetsMeetYouTubeUrl" for this page.`,
          current: null,
          suggestions: [],
          isPlaying: false,
        });
        return;
      }

      const maxSuggestions = this.props.maxSuggestions ?? 10;
      const suggestionsItems = await this.dataService.fetchSuggestions(
        currentVm.id,
        maxSuggestions
      );
      const suggestionsVm = this.mappingService.mapToViewModels(suggestionsItems);

      this.setState({
        loading: false,
        error: null,
        current: currentVm,
        suggestions: suggestionsVm,
        isPlaying: false,
      });
    } catch (e: any) {
      this.setState({
        loading: false,
        error: e?.message || "Something went wrong while loading videos.",
        current: null,
        suggestions: [],
        isPlaying: false,
      });
    }
  }

  public render(): React.ReactElement<ILetsMeetDetailProps> | null {
    const { loading, error, current, suggestions, isPlaying } = this.state;

    if (loading) {
      return <div className={styles.letsMeetDetail}>Loading...</div>;
    }

    if (error) {
      return (
        <div className={styles.letsMeetDetail}>
          <div className={styles.error}>{error}</div>
        </div>
      );
    }

    if (!current) {
      return null;
    }

    return (
      <section className={styles.letsMeetDetail}>
        <div className={styles.mainVideoWrap}>
          <div
            className={styles.mainVideo}
            role="button"
            tabIndex={0}
            onClick={() => {
              if (!isPlaying) this.handlePlayCurrent();
            }}
          >
            {isPlaying ? (
              <iframe
                className={styles.mainVideoIframe}
                src={LetsMeetActionService.getEmbedUrl(current.videoId)}
                title={current.title}
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <>
                <img
                  className={styles.mainVideoImg}
                  src={current.thumbMax}
                  alt={current.title}
                  onError={(ev) =>
                    LetsMeetActionService.handleThumbnailFallback(ev, current.thumbHQ)
                  }
                />

                <div className={styles.mainOverlay}>
                  <button
                    type="button"
                    className={styles.playBtn}
                    aria-label={`Play ${current.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      this.handlePlayCurrent();
                    }}
                  >
                    <span className={styles.playTriangle} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className={styles.missedWrap}>
          <div className={styles.missedHeading}>Missed an Episode?</div>

          <div className={styles.episodesRow}>
            {suggestions.map((item) => (
              <div
                key={item.id}
                className={styles.episodeCard}
                role="button"
                tabIndex={0}
                onClick={() => this.handleOpenPage(item.pageUrl)}
                title={item.title}
              >
                <img
                  className={styles.episodeImg}
                  src={item.thumbHQ}
                  alt={item.title}
                  onError={(ev) =>
                    LetsMeetActionService.handleThumbnailFallback(ev, item.thumbHQ)
                  }
                />

                <div className={styles.episodeOverlay}>
                  <div className={styles.episodeKicker}>Let&apos;s Meet</div>
                  <div className={styles.episodeTitle}>{item.title}</div>

                  <span className={styles.playBtnSmall} aria-hidden="true">
                    <span className={styles.playTriangleSmall} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  private handlePlayCurrent(): void {
    this.setState({ isPlaying: true });
  }

  private handleOpenPage(pageUrl: string): void {
    LetsMeetActionService.navigateToPage(pageUrl);
  }
}