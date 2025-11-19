import * as React from 'react';
import styles from './TrainingPageDetail.module.scss';
import type { ITrainingPageDetailProps } from './ITrainingPageDetailProps';


export default class TrainingPageDetail extends React.Component<ITrainingPageDetailProps, {}> {
  public render(): React.ReactElement<ITrainingPageDetailProps> {
    const {
      trainingItem
    } = this.props;

    return (
      <div className={styles.card}>
        <div className={styles.tag}>Class Room</div>
        <h2 className={styles.title}>{trainingItem[0].title}</h2>

        <div className={styles.details}>
          <p><span><svg className="icon_81daac18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12,6 12,12 16,14"></polyline></svg></span>12–14 Aug 2024 • 2 days</p>
          <p><span><svg className="icon_81daac18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span>{trainingItem[0].location}</p>
        </div>

        {/* <div className={styles.speaker}>
          <img src="https://via.placeholder.com/40" alt="XYZ" />
          <div>
            <p className={styles.name}>Mohit</p>
            <p className={styles.role}>Co-founder, XYZ</p>
          </div>
        </div> */}

        <button className={styles.button}>Request for Approval</button>
      </div>

    );
  }
}
