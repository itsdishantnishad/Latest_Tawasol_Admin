import * as React from "react";
import styles from "./HRLetter.module.scss";

export interface IHrLettersCardProps {
  onRequest?: () => void;
  introText?: string;
  heroUrl?: string; // ✅ added optional image prop
}

export default class HrLettersCard extends React.Component<IHrLettersCardProps> {
  public static defaultProps: Partial<IHrLettersCardProps> = {
    introText: "Easily request and access all your HR letters anytime you need, hassle-free",
    heroUrl: "https://images.unsplash.com/photo-1581093588401-22d38258ef4c?q=80&w=1200&fit=crop", // ✅ default HR image
  };

  public render(): React.ReactElement<IHrLettersCardProps> {
    const { onRequest, introText, heroUrl } = this.props;

    return (
      <section className={styles.card} aria-label="HR Letters">
        <div className={styles.headTitle}>HR Letters</div>
        <p className={styles.subText}>{introText}</p>

        {/* ✅ Image section replacing spacer */}
        <div className={styles.heroWrap}>
          {heroUrl ? (
            <img className={styles.heroImg} src={heroUrl} alt="HR Letters" />
          ) : (
            <div className={styles.heroPlaceholder} />
          )}
        </div>

        <button type="button" className={styles.cta} onClick={onRequest}>
          <span className={styles.ctaText}>Request for HR Letter</span>
        </button>
      </section>
    );
  }
}
