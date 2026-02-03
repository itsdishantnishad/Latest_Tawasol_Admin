
import * as React from 'react';
import styles from './GreetingsBanner.module.scss';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import { IGreetingsBannerProps } from './IGreetingsBannerProps';

const GoodMorningIcon: any = require("../../assets/GoodMorningIcon.png");
const GoodAfternoonIcon: any = require("../../assets/GoodAfternoonIcon.png");
const GoodEveningIcon: any = require("../../assets/GoodEveningIcon.png");

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
            {firstName && <span className={styles.nameText}> {firstName}!</span>}{" "}

            {/* ✅ render PNG icon */}
            <img
              className={styles.greetingsBannerEmoji}
              src={greetingSvgMarkup}
              alt=""
              aria-hidden="true"
            />
          </div>
        </div>
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
    } catch(error) {
      console.log(error)
    }
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

  private normalizeAsset(asset: any): string {
    return asset && asset.default ? asset.default : asset;
  }

  // ---------- Greeting / time helpers ----------
  private computeGreetingForCurrentTime(): {
    greetingText: IGreetingsBannerState['greetingText'];
    greetingSvgMarkup: string;
  } {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 4 && hour < 12) {
      return { greetingText: 'Good Morning',  greetingSvgMarkup: this.normalizeAsset(GoodMorningIcon) };
    }
    if (hour >= 12 && hour < 17) {
      return { greetingText: 'Good Afternoon',  greetingSvgMarkup: this.normalizeAsset(GoodAfternoonIcon) };
    }
    return { greetingText: 'Good Evening',  greetingSvgMarkup: this.normalizeAsset(GoodEveningIcon) };
  }

  private scheduleNextBoundaryTick(): void {
    const now = new Date();
    const sinceMidnight = now.getTime() - new Date(now).setHours(0, 0, 0, 0);
    const h = now.getHours();
    let targetHour: number;
    if (h < 4) targetHour = 4;
    else if (h < 12) targetHour = 12;
    else if (h < 17) targetHour = 17;
    else targetHour = 24 + 4;

    const msToTarget = (targetHour * 3600000) - sinceMidnight;
    this.nextBoundaryTimerId = window.setTimeout(() => {
      const res = this.computeGreetingForCurrentTime();
      this.setState({ greetingText: res.greetingText, greetingSvgMarkup: res.greetingSvgMarkup });
      this.scheduleNextBoundaryTick();
    }, Math.max(60000, msToTarget)); 
  }
}
