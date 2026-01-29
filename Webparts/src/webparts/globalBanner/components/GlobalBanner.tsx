import * as React from "react";
import { DisplayMode } from "@microsoft/sp-core-library";
import styles from "./GlobalBanner.module.scss";
import { IBannerProps } from "./IGlobalBannerProps";
import {
  DEFAULT_BANNER_URL,
  DEFAULT_BANNER_TITLE,
  DEFAULT_BANNER_DESCRIPTION
} from "../../assets/constants";

export default class Banner extends React.Component<IBannerProps> {
  private _lastPreloaded?: string;

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

  private preload(url: string) {
    const u = (url || "").trim();
    if (!u || this._lastPreloaded === u) return;
    this._lastPreloaded = u;

    // Warm cache early so scroll doesn't pay the cost
    const img = new Image();
    img.decoding = "async";
    img.src = u;
  }

  public componentDidMount(): void {
    const effectiveUrl =
      this.props.customBannerUrl?.trim()?.length ? this.props.customBannerUrl.trim() : DEFAULT_BANNER_URL;

    this.preload(effectiveUrl);
  }

  public componentDidUpdate(prev: IBannerProps): void {
    if (prev.customBannerUrl !== this.props.customBannerUrl) {
      const effectiveUrl =
        this.props.customBannerUrl?.trim()?.length ? this.props.customBannerUrl.trim() : DEFAULT_BANNER_URL;
      this.preload(effectiveUrl);
    }
  }

  public shouldComponentUpdate(next: IBannerProps): boolean {
    return (
      next.titleFirst !== this.props.titleFirst ||
      next.titleSecond !== this.props.titleSecond ||
      next.bannerSubTitle !== this.props.bannerSubTitle ||
      next.customBannerUrl !== this.props.customBannerUrl ||
      next.displayMode !== this.props.displayMode
    );
  }

  public render(): React.ReactElement<IBannerProps> {
    const { bannerSubTitle, customBannerUrl, displayMode } = this.props;

    const resolvedDescription =
      bannerSubTitle?.trim()?.length ? bannerSubTitle : DEFAULT_BANNER_DESCRIPTION;

    const effectiveUrl =
      customBannerUrl && customBannerUrl.trim().length > 0
        ? customBannerUrl.trim()
        : DEFAULT_BANNER_URL;

    const { first: firstWord, rest: remainingWords } = this.getResolvedTitleParts();

    const isEdit = displayMode === DisplayMode.Edit;

    return (
      <section className={styles.bannerRoot} role="region" aria-label="Banner">
        <div className={styles.frame}>
          {isEdit ? (
            // In EDIT mode: avoid <img> so SharePoint image editor doesn't hook in
            <div
              className={styles.bannerBg}
              role="img"
              aria-label="Global banner"
              style={{ backgroundImage: `url("${effectiveUrl}")` }}
            />
          ) : (
            // In VIEW mode: normal <img>
            <img
              className={styles.customImage}
              src={effectiveUrl}
              alt="Global banner"
              decoding="async"
              loading="eager"
              width={1320}
              height={260}
            />
          )}

          <div className={styles.textOverlay}>
            <div className={styles.textWrap}>
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
            </div>
          </div>
        </div>
      </section>
    );
  }
}
