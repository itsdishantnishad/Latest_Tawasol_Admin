import * as React from "react";
import styles from "./GlobalBanner.module.scss";
import { IBannerProps } from "./IGlobalBannerProps";
import {
  DEFAULT_BANNER_URL,
  DEFAULT_BANNER_TITLE,
  DEFAULT_BANNER_DESCRIPTION
} from "../../assets/constants";

export default class Banner extends React.Component<IBannerProps> {
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

  public render(): React.ReactElement<IBannerProps> {
    const { bannerSubTitle, customBannerUrl } = this.props;

    const resolvedDescription =
      bannerSubTitle?.trim()?.length ? bannerSubTitle : DEFAULT_BANNER_DESCRIPTION;

    // If a custom URL is provided, use it; otherwise fall back to the default URL
    const effectiveUrl =
      customBannerUrl && customBannerUrl.trim().length > 0
        ? customBannerUrl.trim()
        : DEFAULT_BANNER_URL;

    const { first: firstWord, rest: remainingWords } = this.getResolvedTitleParts();

    return (
      <section className={styles.bannerRoot} role="region" aria-label="Banner">
        <div className={styles.frame}>
          {/* Always render from URL now */}
          <img className={styles.customImage} src={effectiveUrl} alt="Global banner" />

          <div className={styles.textOverlay} aria-hidden="false">
            <div className={styles.textWrap}>
              {(firstWord || remainingWords) && (
                <h2 className={styles.title}>
                  <span className={styles.titleFirst}>{firstWord}</span>
                  {remainingWords ? <> {" "}
                    <span className={styles.titleRest}>{remainingWords}</span>
                  </> : null}
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
