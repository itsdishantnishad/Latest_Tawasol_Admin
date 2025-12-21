

import * as React from 'react';
import type { INewsStoryProps } from './INewsStoryProps';
import Slider, { Settings } from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './NewsStory.module.scss';
import { listServices } from '../../services/listServices';

export interface INewsStoryState {
  promos: any[];
}

export interface ICarouselProps {
  promos: any[];
  interval: number;
  newsViewUrl: string;
  webUrl: string; // ✅ added (for resolving relative urls)
}

// ✅ Placeholder URL
const PLACEHOLDER_URL = 'https://placehold.net/400x400.png';

// ✅ Figma arrows (shared assets folder)
const LeftArrowImg: string = require('../../assets/LeftArrow.png');
const RightArrowImg: string = require('../../assets/RightArrow.png');

const AutoPlayMethods = (props: ICarouselProps): React.ReactElement => {
  const sliderRef = React.useRef<any>(null);

  const next = (): void => {
    sliderRef.current?.slickNext?.();
  };

  const prev = (): void => {
    sliderRef.current?.slickPrev?.();
  };

  const onNewsImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    const img = e.currentTarget;
    if (img.dataset.fallbackApplied === 'true') return;
    img.dataset.fallbackApplied = 'true';
    img.src = PLACEHOLDER_URL;
  };

  // ✅ Resolve item url to absolute
  const resolveUrl = (rawUrl: string): string => {
    const u = (rawUrl || '').trim();
    if (!u) return props.newsViewUrl;

    // absolute
    if (/^https?:\/\//i.test(u)) return u;

    // server-relative (/sites/... or /SitePages/...)
    if (u.startsWith('/')) return `${window.location.origin}${u}`;

    // site-relative (SitePages/xxx.aspx)
    const base = props.webUrl.replace(/\/$/, '');
    return `${base}/${u.replace(/^\//, '')}`;
  };

  // ✅ Choose per-item page url (prefer path/url/link; fallback to newsViewUrl)
  const getItemUrl = (news: any): string => {
    const candidate =
      news?.path ||
      news?.url ||
      news?.link ||
      news?.pageUrl ||
      ''; // add more keys if needed
    return resolveUrl(candidate || props.newsViewUrl);
  };

  const settings: Settings = {
    dots: true,
    arrows: false,
    infinite: props.promos && props.promos.length <= 1 ? false : true,
    slidesToShow: 1,
    slidesToScroll: 1,
    // autoplay: props.interval > 0,
    autoplaySpeed: props.interval
  };

  return (
    <Slider ref={(s: any) => (sliderRef.current = s)} {...settings}>
      {props.promos.map((news: any) => {
        const imgSrc =
          news?.newsImage && String(news.newsImage).trim()
            ? String(news.newsImage).trim()
            : PLACEHOLDER_URL;

        const detailUrl = getItemUrl(news);

        return (
          <div
            className={styles.bannerCard}
            key={news.path || news.title}
            role="button"
            tabIndex={0}
            onClick={() => window.open(detailUrl, '_self')}
            onKeyDown={(e) => e.key === 'Enter' && window.open(detailUrl, '_self')}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.heroMedia}>
              <img
                className={styles.heroImage}
                src={imgSrc}
                onError={onNewsImgError}
                alt={news?.title ? String(news.title) : 'News banner'}
              />

              <div className={styles.topGradient} />
              <div className={styles.bottomGradient} />

              <div className={styles.captionBar}>
                {/* LEFT side shows RightArrow image (chevrons towards title) */}
                <button
                  type="button"
                  className={styles.captionDecor}
                  aria-label="Previous slide"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation(); // ✅ do not open detail page
                    prev();
                  }}
                >
                  <img src={RightArrowImg} alt="" />
                </button>

                <div className={styles.captionTitle}>{news?.title || ''}</div>

                {/* RIGHT side shows LeftArrow image (chevrons towards title) */}
                <button
                  type="button"
                  className={styles.captionDecor}
                  aria-label="Next slide"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation(); // ✅ do not open detail page
                    next();
                  }}
                >
                  <img src={LeftArrowImg} alt="" />
                </button>
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
    const webUrl = this.props.context.pageContext.web.absoluteUrl.replace(/\/$/, '');

    // configured list view page (still kept as fallback)
    const configuredUrl = (this.props.detailsPageUrl || '').trim();
    const newsViewUrl = configuredUrl
      ? (configuredUrl.startsWith('http')
          ? configuredUrl
          : `${webUrl}/${configuredUrl.replace(/^\//, '')}`)
      : `${webUrl}/SitePages/NewsView.aspx`;

    return (
      <div className={styles.promotionalBanner}>
        <AutoPlayMethods
          promos={this.state.promos}
          interval={this.props.interval}
          newsViewUrl={newsViewUrl}
          webUrl={webUrl}
        />
      </div>
    );
  }

  public async componentDidMount(): Promise<void> {
    try {
      const maxItems = this.props.maxItems && this.props.maxItems > 0 ? this.props.maxItems : 3;
      const listItems = await this.spService.getNewsStory(maxItems);
      this.setState({ promos: listItems });
    } catch (error) {
      console.error('Error loading news story', error);
    }
  }
}
