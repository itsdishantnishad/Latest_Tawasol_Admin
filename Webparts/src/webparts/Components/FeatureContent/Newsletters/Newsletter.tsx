import * as React from 'react';
import styles from './Newsletter.module.scss';
const image: string = require("../assets/newsletter-image.png");
const Newsletter = () => {
  return (
    <div className={styles.newsletterArea}>
      <img src={image} alt="" />
    </div>
  )
}

export default Newsletter