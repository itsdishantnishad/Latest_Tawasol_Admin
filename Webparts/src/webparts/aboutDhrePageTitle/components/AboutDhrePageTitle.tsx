
import * as React from 'react';
import styles from './AboutDhrePageTitle.module.scss';
import type { IAboutDhrePageTitleProps } from './IAboutDhrePageTitleProps';

export default class AboutDhrePageTitle extends React.Component<IAboutDhrePageTitleProps, {}> {
  public render(): React.ReactElement<IAboutDhrePageTitleProps> {
    const { title, subTitle, description, imageUrl } = this.props;

    return (
      <div className={styles.bannerBg}>
        <section
          role="banner"
          className={styles.banner}
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
          aria-label={`${title} ${subTitle}`}
        >
          {/* light gradient overlay (figma style) */}
          <div className={styles.shade} />

          {/* content */}
          <div className={styles.inner}>
            <h2 className={styles.heading}>
              <span className={styles.title}>{title}</span>{" "}
              <span className={styles.subTitle}>{subTitle}</span>
            </h2>

            <div className={styles.divider} aria-hidden="true">
              <span className={styles.line} />
              {/* <span className={styles.chevrons} /> */}
            </div>

            <p className={styles.copy}>{description}</p>
          </div>
        </section>
      </div>
    );
  }
}
