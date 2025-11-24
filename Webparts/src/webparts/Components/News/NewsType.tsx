import * as React from 'react';
import styles from './NewsType.module.scss';

// SVG strings from shared constants (src/webparts/constants.ts)
import {
  DHREIconSVG,
  AnnouncementIconSVG,
  ArroundTheWorldIconSVG,
} from '../../assets/constants';

interface IDHRELogoProps { newsType: string; }

// Helper: convert raw SVG string → data URI so we can use it in <img src="">
const svgToDataUri = (svg: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

// Icons now come from constants.ts instead of /assets folder
const DHRELogo: string        = svgToDataUri(DHREIconSVG);
const AnnoucLogo: string      = svgToDataUri(AnnouncementIconSVG);
const ArrTheWorldLogo: string = svgToDataUri(ArroundTheWorldIconSVG);

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
