import * as React from 'react';
import styles from './AboutDhrePageTitle.module.scss';
import type { IAboutDhrePageTitleProps } from './IAboutDhrePageTitleProps';

export default class AboutDhrePageTitle extends React.Component<IAboutDhrePageTitleProps, {}> {
  public render(): React.ReactElement<IAboutDhrePageTitleProps> {
    const {
      title,
      description,
      imageUrl
    } = this.props;

    return (
      <div className={styles.bannerBg}>
        <section
          role="banner"
          className={styles.banner}
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
          aria-label={title}
        >
          {/* gradient overlay */}
          <div className={styles.shade} />

          {/* content */}
          <div className={styles.inner}>
            <h2 className={styles.heading}>{title}</h2>

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
