import * as React from "react";
import styles from "./HRLetter.module.scss";

const hrLetterHero: string = require("../../../../assets/HR-Letter-Image.svg");

export interface IHrLettersCardProps {
  //  pass the URL instead of a click handler
  requestUrl?: string;
  introText?: string;
  heroUrl?: string;
}

export default class HrLettersCard extends React.Component<IHrLettersCardProps> {
  public static defaultProps: Partial<IHrLettersCardProps> = {
    introText:
      "Easily request and access all your HR letters anytime you need, hassle-free",
    heroUrl: hrLetterHero,
  };

  public render(): React.ReactElement<IHrLettersCardProps> {
    const { requestUrl, introText, heroUrl } = this.props;

    return (
      <section className={styles.card} aria-label="Request for HR Letter">
        <div className={styles.headTitle}>Request for HR Letter</div>

        <p className={styles.subText}>{introText}</p>

        <div className={styles.heroWrap}>
          <img className={styles.heroImg} src={heroUrl} alt="HR Letters" />
        </div>

        {/*  CTA opens in new tab */}
        <a
          className={styles.cta}
          href={requestUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          data-interception="off"
          aria-disabled={!requestUrl}
          onClick={(e) => {
            if (!requestUrl) e.preventDefault();
          }}
        >
          <span className={styles.ctaText}>Request for HR Letter</span>
        </a>
      </section>
    );
  }
}
