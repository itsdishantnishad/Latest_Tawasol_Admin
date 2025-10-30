import * as React from 'react';
import { Stack, Text } from '@fluentui/react';
import styles from './DashboardBanner.module.scss';

export default class DashboardBanner extends React.Component<{}, {}> {
  render(): React.ReactElement {
    return (
      <section className={styles.bannerWrap}>
        <div className={styles.banner}>
          <Stack tokens={{ childrenGap: 8 }}>
            <Text as="h2" className={styles.title}>
              <span className={styles.titleAccent}>Data Work Bench</span>
              <span className={styles.titleDash}> – Dashboards</span>
            </Text>
            <Text className={styles.subtitle}>
              Enjoy exclusive perks, rewards, and benefits designed to support you
              at work and beyond.
            </Text>
          </Stack>
        </div>
      </section>
    );
  }
}
