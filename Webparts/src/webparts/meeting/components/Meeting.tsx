import * as React from 'react';
import { FontIcon } from '@fluentui/react';
import styles from './Meeting.module.scss';

import ConditionalLink from '../../Components/ConditionalLink/ConditionalLink';
import PrimaryButton from '../../Components/PrimaryButton/PrimaryButton';
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
  context: any;
  seeAllURL?: string;
}

export default class Meeting extends React.Component<MeetingProps> {

  private getViewAllHref(): string {
    const siteUrl = this.props.context?.pageContext?.web?.absoluteUrl || '';
    let cleanedURL = this.props.seeAllURL;
    if (!cleanedURL || cleanedURL === 'undefined' || cleanedURL.startsWith('undefined')) {
      cleanedURL = 'SitePages/Events-And-Trainings.aspx';
    } else {
      cleanedURL = cleanedURL.split('?')[0];
    }
    if (cleanedURL.startsWith('http://') || cleanedURL.startsWith('https://')) {
      return `${cleanedURL}?tab=meetings`;
    }
    const cleanBase = cleanedURL.startsWith('/') ? cleanedURL.substring(1) : cleanedURL;
    return `${siteUrl}/${cleanBase}?tab=meetings`;
  }


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

  private renderCard = (m: MeetingItem) => {
    const cardClickUrl = this.getViewAllHref();

    return (
      <div
        key={m.id}
        className={styles.card}
        onClick={() => window.location.href = cardClickUrl}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            window.location.href = cardClickUrl;
          }
        }}
      >
        <div className={styles.titleTile}>
          <div className={styles.titleText}>{m.title}</div>
        </div>

        <div className={styles.row}>
          <div>
            <img src={ClockIcon} className={styles.iconClock} alt="" aria-hidden="true" />
          </div>
          <div>
            <div className={styles.metaLine}>{this.fmtDate(m.start)}</div>
            <div className={styles.timeText}>{this.fmtTimeRange(m.start, m.end)}</div>
          </div>
        </div>

        {/* <div className={styles.timeLine}>
          <div className={styles.timeText}>{this.fmtTimeRange(m.start, m.end)}</div>
        </div> */}

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
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when clicking Join
            this.open(m.joinUrl);
          }}
          aria-label="Join meeting"
          disabled={!m.joinUrl}
        >
          <span className={styles.joinText}>Join</span>
        </button>
      </div>
    );
  };

  render() {
    const { items } = this.props;
    const viewAllHref = `${this.getViewAllHref()}`;
    return (
      <section className={styles.meetingSection}>
        <div className={styles.wrap}>
          <div className={styles.grid}>{items.map(this.renderCard)}</div>


          <div className={styles.viewAllWrap}>
            <ConditionalLink to={viewAllHref}>
              <PrimaryButton label="View All" />
            </ConditionalLink>
          </div>

        </div>
      </section>
    );
  }
}
