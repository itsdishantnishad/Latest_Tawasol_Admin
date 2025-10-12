import * as React from "react";
import styles from "./Banner1.module.scss";

interface IBannerProps {
    title: string;
    bannerSubTitle: string;
    //flagUrl?: string;
}

const FallbackFlagSvg: string = require("../../assets/flag.svg");
const LeftSideImage: string = require("../../assets/LeftSideImage.svg");
const RightSideImage: string = require("../../assets/RightSideImage.svg");


const Banner1: React.FC<IBannerProps> = (props) => {

    return (
        <section
            //  ref={hostRef}
            className={`${styles.banner}`}

            // style={{
            //     ["--scale" as any]: scale,
            //     ["--designW" as any]: `${DESIGN_W}px`,
            //     ["--designH" as any]: `${DESIGN_H}px`,
            // }}
            role="region"
            aria-label="Celebration banner"
        >

            <div className={styles.canvas}>

                <img src={LeftSideImage} alt="" aria-hidden="true" className={styles.leftDecor} />
                <img src={RightSideImage} alt="" aria-hidden="true" className={styles.rightDecor} />

                <div className={styles.center}>
                    <img src={FallbackFlagSvg} alt="Celebration flag" className={styles.flagImage} />
                    {props?.title && (
                        <div className={styles.flagTextContainer}>                        
                            <div className={styles.occasion}>{props.title}</div> 
                        </div>
                    )}
                    {props?.bannerSubTitle && (
                        <div className={styles.slogan}>{props.bannerSubTitle}</div>                       
                    )}
                </div>
            </div>

        </section>
    )
}

export default Banner1;