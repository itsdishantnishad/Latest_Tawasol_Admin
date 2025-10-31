import * as React from "react";
import styles from "./GlobalBanner.module.scss";

import { IBannerProps } from "./IGlobalBannerProps";
import { BannerType } from "../GlobalBannerWebPart";

import {
  DefaultBannerSVG,
  DocumentsBannerSVG,
  PlainBannerSVG,
  DEFAULT_BANNER_TITLE,
  DEFAULT_BANNER_DESCRIPTION
} from "../../assets/constants";

export default class Banner extends React.Component<IBannerProps> {

  private getActiveSvgMarkup(): string {
    switch (this.props.bannerType) {
      case BannerType.TYPE_1: return DefaultBannerSVG;
      case BannerType.TYPE_2: return DocumentsBannerSVG;
      case BannerType.TYPE_3: return PlainBannerSVG;
    }
    return "";
  }

  private splitTitleParts(text: string): { first: string; rest: string } {
    const trimmed = (text || "").trim();
    if (!trimmed) return { first: "", rest: "" };
    const [first, ...restArr] = trimmed.split(/\s+/);
    return { first, rest: restArr.join(" ") };
  }

  public render(): React.ReactElement<IBannerProps> {
    const { bannerTitle, bannerSubTitle, customBannerUrl } = this.props;

    const resolvedTitle =
      bannerTitle && bannerTitle.trim().length > 0 ? bannerTitle : DEFAULT_BANNER_TITLE;

    const resolvedDescription =
      bannerSubTitle && bannerSubTitle.trim().length > 0
        ? bannerSubTitle
        : DEFAULT_BANNER_DESCRIPTION;

    const svgMarkup = this.getActiveSvgMarkup();
    const useCustomImage = !!(customBannerUrl && customBannerUrl.trim().length > 0);

    const { first: firstWord, rest: remainingWords } = this.splitTitleParts(resolvedTitle);

    return (
      <section className={styles.bannerRoot} role="region" aria-label="Banner">
        {useCustomImage ? (
          <img className={styles.customImage} src={customBannerUrl} alt="Custom banner" />
        ) : (
          svgMarkup && (
            <div
              className={styles.svgHost}
              dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />
          )
        )}

        <div className={styles.textOverlay} aria-hidden="false">
          <div className={styles.textWrap}>
            {(firstWord || remainingWords) && (
              <h2 className={styles.title}>
                <span className={styles.titleFirst}>{firstWord}</span>
                {remainingWords ? <>{" "}<span className={styles.titleRest}>{remainingWords}</span></> : null}
              </h2>
            )}
            {resolvedDescription && (
              <p className={styles.description}>{resolvedDescription}</p>
            )}
          </div>
        </div>
      </section>
    );
  }
}
