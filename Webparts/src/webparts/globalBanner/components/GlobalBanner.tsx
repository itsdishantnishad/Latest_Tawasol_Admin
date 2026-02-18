import * as React from "react";
import { DisplayMode } from "@microsoft/sp-core-library";
import { Shimmer, ShimmerElementType } from "@fluentui/react";
import styles from "./GlobalBanner.module.scss";
import { IBannerProps } from "./IGlobalBannerProps";
import { LoadingBoundary } from "../../Components/LoadingShimmer/LoadingBoundary";
import {
  DEFAULT_BANNER_URL,
  DEFAULT_BANNER_TITLE,
  DEFAULT_BANNER_DESCRIPTION
} from "../../assets/constants";

interface IBannerState {
  loading: boolean;
  error?: unknown;
  imgUrl: string;
  reloadKey: number;
}

export default class Banner extends React.Component<IBannerProps, IBannerState> {
  public constructor(props: IBannerProps) {
    super(props);

    const initialUrl =
      props.customBannerUrl?.trim()?.length
        ? props.customBannerUrl.trim()
        : DEFAULT_BANNER_URL;

    this.state = {
      loading: true,
      error: undefined,
      imgUrl: initialUrl,
      reloadKey: 0
    };
  }

  private getResolvedTitleParts(): { first: string; rest: string } {
    const { titleFirst, titleSecond } = this.props;
    const first = (titleFirst || "").trim();
    const second = (titleSecond || "").trim();

    if (first || second) return { first, rest: second };

    const trimmed = (DEFAULT_BANNER_TITLE || "").trim();
    if (!trimmed) return { first: "", rest: "" };
    const [f, ...restArr] = trimmed.split(/\s+/);
    return { first: f, rest: restArr.join(" ") };
  }

  private getEffectiveUrl(props: IBannerProps): string {
    return props.customBannerUrl?.trim()?.length
      ? props.customBannerUrl.trim()
      : DEFAULT_BANNER_URL;
  }

  private startLoading(url: string) {
    this.setState((s) => ({
      loading: true,
      error: undefined,
      imgUrl: url,
      reloadKey: s.reloadKey + 1
    }));
  }

  private onImgLoad = () => {
    this.setState({ loading: false, error: undefined });
  };

  private onImgError = (e: any) => {
    this.setState({ loading: false, error: e || new Error("Failed to load banner") });
  };

  public componentDidMount(): void {
    this.startLoading(this.getEffectiveUrl(this.props));
  }

  public componentDidUpdate(prevProps: IBannerProps): void {
    if (prevProps.customBannerUrl !== this.props.customBannerUrl) {
      this.startLoading(this.getEffectiveUrl(this.props));
    }
  }

  public render(): React.ReactElement<IBannerProps> {
    const { bannerSubTitle, displayMode } = this.props;
    const { loading, error, imgUrl, reloadKey } = this.state;

    const resolvedDescription =
      bannerSubTitle?.trim()?.length ? bannerSubTitle : DEFAULT_BANNER_DESCRIPTION;

    const { first: firstWord, rest: remainingWords } = this.getResolvedTitleParts();
    const isEdit = displayMode === DisplayMode.Edit;

    return (
      <section className={styles.bannerRoot} role="region" aria-label="Banner">
        <div className={styles.frame}>

          {/* ✅ IMPORTANT: Probe image OUTSIDE LoadingBoundary (so it loads even when boundary hides children) */}
          <img
            key={reloadKey}
            className={styles.preloadProbe}
            src={imgUrl}
            alt=""
            aria-hidden="true"
            onLoad={this.onImgLoad}
            onError={this.onImgError}
          />

          <LoadingBoundary
            loading={loading}
            error={error}
            errorMessage="Banner failed to load."
            // ✅ keep onRetry removed
            preset="banner"
            count={1}
            gap={0}
            ariaLabel="Loading banner"
            timeoutMs={15000}
          >
            {isEdit ? (
              <div
                className={styles.bannerBg}
                role="img"
                aria-label="Global banner"
                style={{ backgroundImage: `url("${imgUrl}")` }}
              />
            ) : (
              <img
                className={styles.customImage}
                src={imgUrl}
                alt="Global banner"
                decoding="async"
                loading="eager"
                width={1320}
                height={260}
              />
            )}
          </LoadingBoundary>

          {/* ✅ TEXT shimmer while loading */}
          <div className={styles.textOverlay}>
            <div className={styles.textWrap}>
              {loading ? (
                <div className={styles.textShimmer} aria-label="Loading banner text">
                  <Shimmer
                    shimmerElements={[
                      { type: ShimmerElementType.line, width: "42%", height: 24 },
                      { type: ShimmerElementType.gap, width: "100%", height: 10 },
                      { type: ShimmerElementType.line, width: "55%", height: 14 }
                    ]}
                  />
                </div>
              ) : (
                <>
                  {(firstWord || remainingWords) && (
                    <h2 className={styles.title}>
                      <span className={styles.titleFirst}>{firstWord}</span>
                      {remainingWords ? (
                        <>
                          {" "}
                          <span className={styles.titleRest}>{remainingWords}</span>
                        </>
                      ) : null}
                    </h2>
                  )}
                  {resolvedDescription && (
                    <p className={styles.description}>{resolvedDescription}</p>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </section>
    );
  }
}