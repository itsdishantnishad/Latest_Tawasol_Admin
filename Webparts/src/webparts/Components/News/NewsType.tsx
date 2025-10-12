import * as React from 'react';
import styles from './NewsType.module.scss';

interface IDHRELogoProps {
  newsType: string;
}

const DHRELogo: string = require("../../assets/DHRE Stories-logo.png");


const NewsType = ({ newsType }: IDHRELogoProps): JSX.Element => {
  return (
    <div className={styles.departmentLogo}>
      <img src={DHRELogo}></img>{newsType}
    </div>
  );
};

export default NewsType;