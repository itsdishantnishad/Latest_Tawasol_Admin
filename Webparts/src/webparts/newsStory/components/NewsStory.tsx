import * as React from 'react';
// import styles from './NewsStory.module.scss';
import type { INewsStoryProps } from './INewsStoryProps';
import Slider, { Settings } from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useRef } from "react";
import { FontIcon } from '@fluentui/react/lib/Icon';
import styles from './NewsStory.module.scss';
import { listServices } from '../../services/listServices';
import NewsType from '../../Components/News/NewsType';

export interface INewsStoryState {
  promos: any[];
}

export interface ICarouselProps {
  promos: any[],
  interval: number
}

const NEWSVIEW_URL =
  "https://orgessence.sharepoint.com/sites/IntranetRevampTawasol/SitePages/NewsView.aspx";

const AutoPlayMethods = (props: ICarouselProps): React.ReactElement => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any 
  let sliderRef: any = useRef(null);

  const next = (): void => { sliderRef.slickNext(); };
  const prev = (): void => { sliderRef.slickPrev(); };

  const settings: Settings = {
    dots: true,
    infinite: props.promos && props.promos.length <= 1 ? false : true,
    slidesToShow: 1,
    slidesToScroll: 1,
    //autoplay: props.interval > 0,
    autoplaySpeed: props.interval,
    className: "promotionalBanner",
    appendDots: (dots: React.ReactNode) => (
      <div>
        <div className={styles.buttons}>
          <ul style={{ margin: "0px", display: "contents" }}>{dots}</ul>
          <div style={{ display: 'flex', paddingLeft: "0px", paddingTop: "25px" }}>
            <div onClick={prev}>
              <FontIcon aria-label="Previous" iconName="ChevronLeftMed" />
            </div>
            <div onClick={next} className={styles.RightArrow}>
              <FontIcon aria-label="Next" iconName="ChevronRightMed" />
            </div>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <Slider ref={slider => (sliderRef = slider)}  {...settings}>
      {props.promos.map((news: any) => {
        return (
          <div
            className={styles.bannerCard}
            key={news.id}
            role="button"
            tabIndex={0}
            onClick={() => window.open(NEWSVIEW_URL, "_self")}
            onKeyDown={(e) => e.key === "Enter" && window.open(NEWSVIEW_URL, "_self")}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.bannerCard__PromoDetailsContent}>
              <div style={{ height: "100%", flex: '1 1 50%' }}>
                <div style={{ width: "max-content" }}>
                  <NewsType newsType={news.newsType} />
                </div>
                <div className={styles.bannerCard__PromoDetailsContent__title}>
                  {news.title}
                </div>
                <div style={{ marginTop: "20px" }}>
                  <div className={styles.bannerCard__PromoDetailsContent__values}>
                    <span>{news.lastModified}</span>
                    <span style={{ backgroundColor: '#6c6c6c', width: '5px', height: '5px', borderRadius: '50%' }}></span>
                    <span>{news.readTime} min read</span>
                    <span style={{ backgroundColor: '#6c6c6c', width: '5px', height: '5px', borderRadius: '50%' }}></span>
                    <span>{news.pageView} Views</span>
                  </div>
                </div>
              </div>
              <div style={{ height: "100%", display: 'flex', justifyContent: 'flex-end', flex: "1 1 50%", overflow: 'hidden' }}>
                <img style={{ height: "100%", borderRadius: "10px", width: "100%" }} src={news.newsImage} />
              </div>
            </div>
          </div>
        );
      })}
    </Slider>
  );
};

export default class NewsStory extends React.Component<INewsStoryProps, INewsStoryState> {
  private spService: listServices;
  public constructor(props: INewsStoryProps) {
    super(props);
    this.state = { promos: [] };
    this.spService = new listServices(this.props.context);
  }

  public render(): React.ReactElement<INewsStoryProps> {
    return (
      <div className={styles.promotionalBanner}>
        <AutoPlayMethods promos={this.state.promos} interval={this.props.interval} />
      </div>
    );
  }

  async componentDidMount(): Promise<void> {
    const listItems = await this.spService.getNewsStory();
    this.setState({ promos: listItems });
  }
}
