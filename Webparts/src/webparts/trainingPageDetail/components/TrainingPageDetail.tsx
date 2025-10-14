import * as React from 'react';
import styles from './TrainingPageDetail.module.scss';
import type { ITrainingPageDetailProps } from './ITrainingPageDetailProps';


export default class TrainingPageDetail extends React.Component<ITrainingPageDetailProps, {}> {
  public render(): React.ReactElement<ITrainingPageDetailProps> {
    const {
   
    } = this.props;

    return (
      <div className={styles.card}>
        <div className={styles.tag}>Class Room</div>
        <h2 className={styles.title}>Dubai Futures Academy: Future Literacy</h2>

        <div className={styles.details}>
          <p>📅 12–14 Aug 2024 • 2 days</p>
          <p>📍 Taj, Bay Avenue</p>
        </div>

        <div className={styles.speaker}>
          <img src="https://via.placeholder.com/40" alt="XYZ" />
          <div>
            <p className={styles.name}>Mohit</p>
            <p className={styles.role}>Co-founder, XYZ</p>
          </div>
        </div>

        <button className={styles.button}>Request for Approval</button>
      </div>

    );
  }
}
