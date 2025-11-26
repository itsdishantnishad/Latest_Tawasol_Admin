import * as React from 'react';
import styles from './Meeting.module.scss';

const TitleArrowLeft = require('../assets/LeftArrowIcon.svg');
const TitleArrowRight = require('../assets/RightArrowIcon.svg');

export interface IMeetingHeaderProps {
  title: string;
  subtitle: string;
}

export default class MeetingHeader extends React.PureComponent<IMeetingHeaderProps> {
  render() {
    const { title, subtitle } = this.props;

    return (
      <div className={styles.titleSection}>
        <div className={styles.titleRow}>
          <img
            src={TitleArrowLeft}
            className={styles.titleArrow}
            alt=""
            aria-hidden="true"
          />
          <h2 className={styles.meetingTitle}>{title}</h2>
          <img
            src={TitleArrowRight}
            className={styles.titleArrow}
            alt=""
            aria-hidden="true"
          />
        </div>

        <p className={styles.meetingDescription}>{subtitle}</p>
      </div>
    );
  }
}
