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
  webUrl: string;
}

// Placeholder URL
const PLACEHOLDER_URL = 'https://placehold.net/400x400.png';

// Center caption arrows
const LeftArrowImg: string = require('../../assets/LeftArrow.png');
const RightArrowImg: string = require('../../assets/RightArrow.png');

// Side arrow icons
const LeftArrowIcon: string = require('../../assets/blackLeft.svg') as string;
const RightVectorIcon: string = require('../../assets/VectorIcon.svg') as string;

const AutoPlayMethods = (props: ICarouselProps): React.ReactElement => {
  const sliderRef = React.useRef<any>(null);
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);

  React.useEffect(() => {
    setCurrentIndex(0);
  }, [props.promos?.length]);

  const total = props.promos?.length || 0;
  const canPrev = currentIndex > 0;
  const canNext = total > 0 && currentIndex < total - 1;

  const next = (): void => {
    if (!canNext) return;
    sliderRef.current?.slickNext?.();
  };

  const prev = (): void => {
    if (!canPrev) return;
    sliderRef.current?.slickPrev?.();
  };

  const onNewsImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    const img = e.currentTarget;
    if (img.dataset.fallbackApplied === 'true') return;
    img.dataset.fallbackApplied = 'true';
    img.src = PLACEHOLDER_URL;
  };

  // Convert server-relative path to absolute
  const resolveUrl = (rawUrl: string): string => {
    const u = (rawUrl || '').trim();
    if (!u) return '';

    if (/^https?:\/\//i.test(u)) return u;
    if (u.startsWith('/')) return `${window.location.origin}${u}`;

    const base = props.webUrl.replace(/\/$/, '');
    return `${base}/${u.replace(/^\//, '')}`;
  };

  /**
   * Extract article page URL ONLY from preview image:
   * getpreview.ashx?path=/SitePages/Article.aspx
   */
  const getItemUrl = (news: any): string => {
    const imgUrl: string = news?.newsImage || '';
    const match = imgUrl.match(/[?&]path=([^&]+)/i);

    if (!match || !match[1]) return '';

    return resolveUrl(decodeURIComponent(match[1]));
  };

  const settings: Settings = {
    dots: true,
    arrows: false,
    infinite: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplaySpeed: props.interval,
    afterChange: (idx: number) => setCurrentIndex(idx),
  };

  return (
    <Slider ref={(s: any) => (sliderRef.current = s)} {...settings}>
      {props.promos.map((news: any, index: number) => {
        const imgSrc =
          news?.newsImage && String(news.newsImage).trim()
            ? String(news.newsImage).trim()
            : PLACEHOLDER_URL;

        const detailUrl = getItemUrl(news);

        return (
          <div
            className={styles.bannerCard}
            key={news.path || news.title || index}
            role="button"
            tabIndex={0}
            onClick={() => {
              if (detailUrl) {
                window.open(detailUrl, '_self');
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && detailUrl) {
                window.open(detailUrl, '_self');
              }
            }}
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

              <div className={styles.sideNav}>
                <button
                  type="button"
                  className={`${styles.navIcon} ${canPrev ? styles.navIconActive : styles.navIconDisabled}`}
                  aria-label="Previous slide"
                  disabled={!canPrev}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    prev();
                  }}
                >
                  <span className={styles.navChevron}>
                    <img src={LeftArrowIcon} alt="" />
                  </span>
                </button>

                <button
                  type="button"
                  className={`${styles.navIcon} ${canNext ? styles.navIconActive : styles.navIconDisabled}`}
                  aria-label="Next slide"
                  disabled={!canNext}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    next();
                  }}
                >
                  <span className={styles.navChevron}>
                    <img src={RightVectorIcon} alt="" />
                  </span>
                </button>
              </div>

              <div className={styles.captionBar}>
                <button
                  type="button"
                  className={styles.captionDecor}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    prev();
                  }}
                >
                  <img src={RightArrowImg} alt="" />
                </button>

                <div className={styles.captionTitle}>{news?.title || ''}</div>

                <button
                  type="button"
                  className={styles.captionDecor}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
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

    return (
      <div className={styles.promotionalBanner}>
        <AutoPlayMethods
          promos={this.state.promos}
          interval={this.props.interval}
          webUrl={webUrl}
        />
      </div>
    );
  }

  public async componentDidMount(): Promise<void> {
    try {
      const maxItems =
        this.props.maxItems && this.props.maxItems > 0 ? this.props.maxItems : 3;

      const listItems = await this.spService.getNewsStory(maxItems);
      this.setState({ promos: listItems });
    } catch (error) {
      console.error('Error loading news story', error);
    }
  }
}