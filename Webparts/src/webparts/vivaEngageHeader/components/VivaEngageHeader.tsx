import * as React from "react";
import styles from "./VivaEngageHeader.module.scss";
import { IVivaEngageHeaderProps } from "./IVivaEngageHeaderProps";

// assets are one level up from /components
const LeftSideArrow: string  = require("../assets/LeftSideArrow.svg");
const RightSideArrow: string = require("../assets/RightSideArrow.svg");
const BackgroundSvg: string  = require("../assets/DHREImg.svg");

interface IVivaEngageHeaderState { }

export default class VivaEngageHeader
  extends React.Component<IVivaEngageHeaderProps, IVivaEngageHeaderState> {

  public render(): React.ReactElement<IVivaEngageHeaderProps> {
    return (
      <section
        className={styles.vivaHeader}
        style={{ backgroundImage: `url(${BackgroundSvg})` }}
      >
        <div className={styles.wrap}>
          {/* Left strip = full SVG (includes line + arrowhead) */}
          <div className={styles.stripBox}>
            <img className={styles.strip} src={LeftSideArrow} alt="" aria-hidden="true" />
          </div>

          <h2 className={styles.title}>
            <span>Trending Posts</span> <span className={styles.in}>in</span> <span>DHRE</span>
          </h2>

          {/* Right strip = full SVG (includes line + arrowhead) */}
          <div className={styles.stripBox}>
            <img className={styles.strip} src={RightSideArrow} alt="" aria-hidden="true" />
          </div>
        </div>
      </section>
    );
  }
}
