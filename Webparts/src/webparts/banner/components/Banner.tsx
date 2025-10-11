import * as React from 'react';
// import styles from './Banner.module.scss';
import type { IBannerProps } from './IBannerProps';
import Banner1 from './BannerCategory/Banner1';

import { BannerType } from '../BannerWebPart';

export default class Banner extends React.Component<IBannerProps, {}> {
  public render(): React.ReactElement<IBannerProps> {
    const {
      bannerType,
      bannerTitle,
      bannerSubTitle
    } = this.props;

    return (
      BannerType.TYPE_3 === bannerType ?
        <div></div> :
        BannerType.TYPE_2 === bannerType ?
          <div></div>
          : <Banner1 title={bannerTitle} bannerSubTitle={bannerSubTitle}></Banner1>
    );
  }
}
