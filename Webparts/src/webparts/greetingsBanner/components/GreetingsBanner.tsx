import * as React from 'react';
import styles from './GreetingsBanner.module.scss';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import { IGreetingsBannerProps } from './IGreetingsBannerProps';
import { MorningSVG, AfternoonSVG, EveningSVG } from '../../assets/constants';

interface IGreetingsBannerState {
  firstName: string;
  greetingText: 'Good Morning' | 'Good Afternoon' | 'Good Evening';
  greetingSvgMarkup: string;
}

export default class GreetingsBanner extends React.Component<IGreetingsBannerProps, IGreetingsBannerState> {
  private nextBoundaryTimerId: number | undefined;

  constructor(props: IGreetingsBannerProps) {
    super(props);
    const { greetingText, greetingSvgMarkup } = this.computeGreetingForCurrentTime();
    this.state = {
      firstName: this.getFallbackFirstName(),
      greetingText,
      greetingSvgMarkup
    };
  }

  public async componentDidMount(): Promise<void> {
    await this.tryPopulateFirstNameFromGraph();
    this.scheduleNextBoundaryTick();
  }

  public componentWillUnmount(): void {
    if (this.nextBoundaryTimerId) window.clearTimeout(this.nextBoundaryTimerId);
  }

  public render(): React.ReactElement<IGreetingsBannerProps> {
    const { firstName, greetingText, greetingSvgMarkup } = this.state;

    return (
      <section className={styles.greetingsBannerRoot} aria-label="Greetings Banner">
        <div className={styles.greetingsBannerCard}>
          <div className={styles.greetingsBannerTitle}>
            <span className={styles.greetingText}>
              {greetingText}
              {firstName ? ',' : '!'}
            </span>
            {firstName && <span className={styles.nameText}> {firstName}!</span>}
          </div>

          {/* inline emoji at the end */}
          {/* <span
            className={styles.greetingsBannerEmoji}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: greetingSvgMarkup }}
          /> */}
        </div>

        {/* keep for future use if you want a subline; currently not in Figma */}
        {/* <div className={styles.greetingsBannerSubText}>Have a great day at Tawasol.</div> */}
      </section>
    );
  }

  // ---------- Data helpers ----------
  private async tryPopulateFirstNameFromGraph(): Promise<void> {
    try {
      const graph: MSGraphClientV3 = await this.props.getGraphClient();
      const me = await graph.api('/me').select('displayName').get();
      const displayName: string = me?.displayName || '';
      if (displayName) this.setState({ firstName: this.extractFirstName(displayName) });
    } catch { /* fallback stays */ }
  }

  private getFallbackFirstName(): string {
    const fallback = this.props.spfxContext?.pageContext?.user?.displayName || '';
    return this.extractFirstName(fallback);
  }

  private extractFirstName(fullName: string): string {
    const trimmed = (fullName || '').trim();
    if (!trimmed) return '';
    const first = trimmed.split(/\s+/)[0]; // take first token
    return this.capitalizeFirstLetter(first);
  }

  private capitalizeFirstLetter(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  // ---------- Greeting / time helpers ----------
  private computeGreetingForCurrentTime(): {
    greetingText: IGreetingsBannerState['greetingText'];
    greetingSvgMarkup: string;
  } {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 4 && hour < 12)  return { greetingText: 'Good Morning',  greetingSvgMarkup: MorningSVG };
    if (hour >= 12 && hour < 17) return { greetingText: 'Good Afternoon', greetingSvgMarkup: AfternoonSVG };
    return { greetingText: 'Good Evening', greetingSvgMarkup: EveningSVG };
  }

  private scheduleNextBoundaryTick(): void {
    const now = new Date();
    const sinceMidnight = now.getTime() - new Date(now).setHours(0, 0, 0, 0);
    const h = now.getHours();
    let targetHour: number;
    if (h < 4)       targetHour = 4;
    else if (h < 12) targetHour = 12;
    else if (h < 17) targetHour = 17;
    else             targetHour = 24 + 4;

    const msToTarget = (targetHour * 3600000) - sinceMidnight;
    this.nextBoundaryTimerId = window.setTimeout(() => {
      const res = this.computeGreetingForCurrentTime();
      this.setState({ greetingText: res.greetingText, greetingSvgMarkup: res.greetingSvgMarkup });
      this.scheduleNextBoundaryTick();
    }, Math.max(60000, msToTarget)); // at least 1 minute
  }
}
