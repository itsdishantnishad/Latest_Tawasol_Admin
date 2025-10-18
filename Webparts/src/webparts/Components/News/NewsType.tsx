import * as React from 'react';
import styles from './NewsType.module.scss';

interface IDHRELogoProps { newsType: string; }

const DHRELogo: string        = require('../../assets/DHREIconNewsTag.svg');
const AnnoucLogo: string      = require('../../assets/AnnouncementIconNewsTag.svg');
const ArrTheWorldLogo: string = require('../../assets/ArroundTheWorldIconNewsTag.svg');

const NewsType = ({ newsType }: IDHRELogoProps): JSX.Element => {
  const t = (newsType || '').toLowerCase().trim();

  let icon = DHRELogo;
  if (t.includes('announce')) {
    icon = AnnoucLogo;
  } else if (t.includes('around') || t.includes('arround') || t.includes('world')) {
    // handles both “Around the World” and the “Arround” asset name
    icon = ArrTheWorldLogo;
  }

  return (
    <div className={styles.departmentLogo}>
      <img src={icon} alt="" loading="lazy" />
      {newsType}
    </div>
  );
};

export default NewsType;
