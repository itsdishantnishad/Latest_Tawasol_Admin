
import * as React from "react";
import { useEffect } from "react";
import { SPComponentLoader } from "@microsoft/sp-loader";
import styles from "./VisionAndMission.module.scss";
import { IVisionAndMissionProps } from "./IVisionAndMissionProps";


const VisionAndMission: React.FC<IVisionAndMissionProps> = ({
  visionText = "",
  missionPoint1 = "",
  missionPoint2 = "",
  missionPoint3 = "",
  visionTitle = "Our Vision",
  missionTitle = "Our Mission",
}) => {
  // // load fonts once (safe to call multiple times—cached)
  // useEffect(() => {
  //   SPComponentLoader.loadCss(
  //     "https://fonts.googleapis.com/css2?family=Inter:wght@500;600&family=Instrument+Serif:ital@0;1&display=swap"
  //   );
  // }, []);

  // assets (same names as your repo)
  const arrowsImg = require("../assets/freepik--Arrows--inject-217.png") as string;
  const targetImg = require("../assets/Target.png") as string;
  const num01Img  = require("../assets/01.png") as string;
  const num02Img  = require("../assets/02.png") as string;
  const num03Img  = require("../assets/03.png") as string; // ← added

  return (
    <section className={styles.wrap}>
      {/* ---------- Vision Row ---------- */}
      <div className={styles.row}>
        <div className={styles.leftPic}>
          <img src={arrowsImg} alt="" />
        </div>

        <div className={styles.rightCopy}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.our}>Our</span>
            <span className={styles.main}>Vision</span>
          </h3>

          {visionText && <p className={styles.visionText}>{visionText}</p>}
        </div>
      </div>

      {/* ---------- Mission Row ---------- */}
      <div className={styles.row}>
        <div className={styles.leftPic}>
          <img src={targetImg} alt="" />
        </div>

        <div className={styles.rightCopy}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.our}>Our</span>
            <span className={styles.main}>Mission</span>
          </h3>

          <div className={styles.points}>
            <div className={styles.point}>
              <img className={styles.numImg} src={num01Img} alt="01" />
              <div className={styles.text}>{missionPoint1}</div>
            </div>

            <div className={styles.point}>
              <img className={styles.numImg} src={num02Img} alt="02" />
              <div className={styles.text}>{missionPoint2}</div>
            </div>

            <div className={styles.point}>
              <img className={styles.numImg} src={num03Img} alt="03" />
              <div className={styles.text}>{missionPoint3}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionAndMission;
