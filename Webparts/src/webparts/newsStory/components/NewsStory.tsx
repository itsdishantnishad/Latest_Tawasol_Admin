import * as React from 'react';
// import styles from './NewsStory.module.scss';
import type { INewsStoryProps } from './INewsStoryProps';
import Slider, { Settings } from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css"; 
import { useRef, useState } from "react";
import { FontIcon } from '@fluentui/react/lib/Icon';
import styles from './NewsStory.module.scss';
import { listServices } from '../../services/listServices';

export interface INewsStoryState {
  promos: any[];
}

export interface ICarouselProps {
  promos: any[],
  interval: number
}

const AutoPlayMethods = (props: ICarouselProps): React.ReactElement => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any 
  let sliderRef: any = useRef(null);
  //let pausePlayFlag = false; 
  const [pausePlayFlag, setPausePlayFlag] = useState(false);
  const play = (): void => {
    sliderRef.slickPlay();
    setPausePlayFlag(false);
  };
  const pause = (): void => {
    sliderRef.slickPause();
    setPausePlayFlag(true);
  };
  const next = (): void => {
    sliderRef.slickNext();
  };
  const prev = (): void => {
    sliderRef.slickPrev();
  };



  const settings: Settings = {

    dots: true,
    infinite: props.promos && props.promos.length <= 1 ? false : true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: props.interval > 0,
    autoplaySpeed: props.interval,
    className: "promotionalBanner",
    appendDots: (dots: React.ReactNode) => (
      <div>
        <div className={styles.buttons}>
          <div onClick={prev}>
            <FontIcon aria-label="Previous" iconName="ChevronLeftMed" />
          </div>
          {props.interval > 0 &&
            <div>
              {pausePlayFlag ?
                <div onClick={play}>
                  <FontIcon aria-label="Play" iconName="PlaySolid" />
                </div> :
                <div onClick={pause}>
                  <FontIcon aria-label="Pause" iconName="CirclePauseSolid" />
                </div>
              }
            </div>
          }
          <ul style={{ margin: "0px", display: "contents" }}> {dots} </ul>
          <div onClick={next} className={styles.RightArrow}>
            <FontIcon aria-label="Next" iconName="ChevronRightMed" />
          </div>
        </div>
      </div>
    ),
  };
  return (

    <Slider ref={slider => (sliderRef = slider)}  {...settings}>
      {
        props.promos.map((promo: any) => {
          return (
            <div className={styles.bannerCard} key={promo.id}>
              <div className={styles.bannerCard__PromoDetailsContent}>
                <div className={styles.bannerCard__PromoDetailsContent__Text}>
                  {promo.Title}
                </div>
              </div>
            </div>
          )
        })
      }
    </Slider>
  );
};



export default class NewsStory extends React.Component<INewsStoryProps, INewsStoryState> {
  private spService: listServices;
  public constructor(props: INewsStoryProps) {
    super(props);
    this.state = {
      promos: []
    };
    this.spService = new listServices(this.props.context);
  }

  public render(): React.ReactElement<INewsStoryProps> {
    const {

    } = this.props;

    return (
      <div className={styles.promotionalBanner}>


        <AutoPlayMethods promos={this.state.promos} interval={this.props.interval} />
      </div>
    );
  }

  async componentDidMount(): Promise<void> {

    let listItems: any = [];

    listItems = await this.spService.getNewsStory("Site Pages");
    console.log(listItems)
    this.setState({
      promos: listItems
    })

  }
}
