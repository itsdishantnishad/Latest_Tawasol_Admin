import * as React from 'react';
import styles from './TrainingPageDetail.module.scss';
import type { ITrainingPageDetailProps } from './ITrainingPageDetailProps';

export default class TrainingPageDetail extends React.Component<ITrainingPageDetailProps, {}> {
  public render(): React.ReactElement<ITrainingPageDetailProps> {
    const { trainingItem } = this.props;

    // ✅ Guard: no data yet or empty array
    if (!trainingItem || !Array.isArray(trainingItem) || trainingItem.length === 0) {
      return (
        <div className={styles.card}>
          <div className={styles.tag}>Class Room</div>
          <h2 className={styles.title}>Training details not found</h2>
          <div className={styles.details}>
            <p>No training record could be loaded for this page.</p>
          </div>
        </div>
      );
    }

    const item = trainingItem[0];

    return (
      <div className={styles.card}>
        <div className={styles.tag}>Class Room</div>
        <h2 className={styles.title}>{item.title}</h2>

        <div className={styles.details}>
          {/* TODO: you can replace this hard-coded date with item.eventStartDate / eventEndDate later */}
          <p>📅 12–14 Aug 2024 • 2 days</p>
          <p>📍 {item.location}</p>
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
