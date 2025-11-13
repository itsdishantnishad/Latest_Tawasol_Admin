import * as React from 'react';
import { FontIcon } from '@fluentui/react';
import styles from './Meeting.module.scss';
import MeetingHeader from './meetingHeader'; 

const ClockIcon = require('../assets/clockIcon.svg');
const LocationIcon = require('../assets/locationIcon.svg');

export interface MeetingItem {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  organizerName?: string;
  description?: string;
  joinUrl?: string;
  avatarUrl?: string;
}

interface MeetingProps {
  items: MeetingItem[];
  onViewAll?: () => void;
  showingAll?: boolean;
}

export default class Meeting extends React.Component<MeetingProps> {
  private fmtDate(d: string) {
    const dt = new Date(d);
    const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(dt);
    return `${weekday} ${dt.getMonth() + 1}/${dt.getDate()}/${dt.getFullYear()}`;
  }

  private fmtTimeRange(s: string, e: string) {
    const f = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
    return `${f.format(new Date(s))} - ${f.format(new Date(e))}`;
  }

  private open(url?: string) {
    if (url) window.open(url, '_blank', 'noopener');
  }

  private renderCard = (m: MeetingItem) => (
    <div key={m.id} className={styles.card}>
      <div className={styles.titleTile}>
        <div className={styles.titleText}>{m.title}</div>
      </div>

      <div className={styles.row}>
        <img src={ClockIcon} className={styles.iconClock} alt="" aria-hidden="true" />
        <div className={styles.metaLine}>{this.fmtDate(m.start)}</div>
      </div>

      <div className={styles.timeLine}>
        <div className={styles.timeText}>{this.fmtTimeRange(m.start, m.end)}</div>
      </div>

      <div className={styles.row}>
        <img src={LocationIcon} className={styles.iconLocation} alt="" aria-hidden="true" />
        <div className={styles.metaSingle} title={m.location || ''}>
          {m.location || '—'}
        </div>
      </div>

      <div className={styles.row}>
        {m.avatarUrl ? (
          <img
            className={styles.avatar}
            src={m.avatarUrl}
            alt={m.organizerName || 'Organizer'}
          />
        ) : (
          <FontIcon iconName="Contact" className={styles.avatarIcon} />
        )}
        <div className={styles.metaSingle}>
          {m.organizerName ? `${m.organizerName} invited you` : 'Invited you'}
        </div>
      </div>

      <button
        className={styles.joinBtn}
        onClick={() => this.open(m.joinUrl)}
        aria-label="Join meeting"
        disabled={!m.joinUrl}
      >
        <span className={styles.joinText}>Join</span>
      </button>
    </div>
  );

  render() {
    const { items, onViewAll, showingAll } = this.props;

    return (
      <section className={styles.meetingSection}>
        <MeetingHeader
          title="See your Meetings Scheduled"
          subtitle="Connect, collaborate, and drive decisions together"
        />

        <div className={styles.wrap}>
          <div className={styles.grid}>{items.map(this.renderCard)}</div>

          {onViewAll && (
            <div className={styles.viewAllWrap}>
              <button className={styles.viewAllBtn} onClick={onViewAll}>
                <span className={styles.viewAllText}>
                  {showingAll ? 'Show Less' : 'View All'}
                </span>
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }
}
