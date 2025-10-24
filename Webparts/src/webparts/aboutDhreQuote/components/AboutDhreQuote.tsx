
import * as React from "react";
import styles from "./AboutDhreQuote.module.scss";
import { IAboutDhreQuoteProps } from "./IAboutDhreQuoteProps";



const AboutDhreQuote: React.FC<IAboutDhreQuoteProps> = ({
  title = "",
  description = "",
  role = "",
}) => {
  const quoteIcon: string = require("../assets/quote.png");
  const arrowImg: string = require("../assets/Arrow.png");

  return (
    <section className={styles.wrap}>
      <div className={styles.inner}>
        {/* Top Quote Icon */}
        <div className={styles.quoteIcon}>
          <img src={quoteIcon} alt="quote" />
        </div>

        {/* Description */}
        {description && <p className={styles.desc}>{description}</p>}

        {/* ✅ Replace divider with Arrow image */}
        <div className={styles.divider}>
          <img src={arrowImg} alt="divider arrow" className={styles.ArrowImg} />
        </div>

        {/* Name + Role */}
        <div className={styles.meta}>
          {title && <div className={styles.name}>{title}</div>}
          {role && <div className={styles.role}>{role}</div>}
        </div>
      </div>
    </section>
  );
};

export default AboutDhreQuote;





