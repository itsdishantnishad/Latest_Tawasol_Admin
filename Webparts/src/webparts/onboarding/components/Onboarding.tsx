import * as React from "react";
import styles from "./Onboarding.module.scss";
import { IOnboardingProps, IOnboardingPage, IOnboardingCard } from "./IOnboardingProps";

interface IOnboardingState { pageIndex: number; isLock: boolean; }

export default class Onboarding extends React.Component<IOnboardingProps, IOnboardingState> {
  static defaultProps: Partial<IOnboardingProps> = { ctaStartText: "Let's Get Started" };

  constructor(props: IOnboardingProps) {
    super(props);
    this.state = { pageIndex: 0, isLock: false };
  }

  private next = (): void => {
    const pages = this.props.pages ?? this.getDefaultPages();
    const last = pages.length - 1;
    if (this.state.isLock) return;

    this.setState({ isLock: true }, () => {
      if (this.state.pageIndex < last) this.setState({ pageIndex: this.state.pageIndex + 1 });
      else this.props.onStart?.();
      window.setTimeout(() => this.setState({ isLock: false }), 250);
    });
  };

  private goTo = (i: number): void => { if (!this.state.isLock) this.setState({ pageIndex: i }); };

  /** NOTE: reordered per request:
   *  1) News / Manage Tasks / Service Links
   *  2) Trainings / Events / Celebrations
   *  3) Documents & Forms / Schedule Meetings / Profile
   */
  private getDefaultPages(): IOnboardingPage[] {
    return [
      {
        heading: "Everything Organized, Always in Reach",
        subheading: "Access company news, tasks, and support – all from one place. No more jumping between tools.",
        cards: [
          { title: "News",         iconUrl: require("../assets/ob_news.png") },
          { title: "Manage Tasks", iconUrl: require("../assets/ob_tasks.png") },
          { title: "Service Links",iconUrl: require("../assets/ob_services.png") },
        ],
      },
      {
        heading: "Learn, Connect & Celebrate Together",
        subheading: "Stay updated on trainings, join company events, and be part of every celebration.",
        cards: [
          { title: "Book Trainings",  iconUrl: require("../assets/ob_train.png") },
          { title: "Lists of Events", iconUrl: require("../assets/ob_eventslist.png") },
          { title: "Celebrations",    iconUrl: require("../assets/ob_celebrate.png") },
        ],
      },
      {
        heading: "Stay Organised, Stay Connected",
        subheading: "Manage documents, schedule meetings, and personalise your profile.",
        cards: [
          { title: "Documents & Forms", iconUrl: require("../assets/ob_docs.png") },
          { title: "Schedule Meetings",  iconUrl: require("../assets/ob_meet.png") },
          { title: "Profile",            iconUrl: require("../assets/ob_profile.png") },
        ],
      },
    ];
  }

  public render(): React.ReactNode {
    const pages = this.props.pages ?? this.getDefaultPages();
    const { pageIndex } = this.state;
    const active = pages[pageIndex];

    return (
      <section className={`${styles.wrap} ${this.props.className || ""}`} aria-label="Onboarding">
        <header className={styles.header}>
          <h1 className={styles.h1}>{active.heading}</h1>
          <p className={styles.sub}>{active.subheading}</p>
        </header>

        <div className={styles.grid} aria-live="polite">
          {active.cards.map((c: IOnboardingCard, i: number) => (
            <a
              key={i}
              className={styles.card}
              href={c.link || "#"}
              onClick={(e) => { if (!c.link) e.preventDefault(); }}
            >
              <div className={styles.art}><img src={c.iconUrl} alt="" /></div>
              <div className={styles.title}>{c.title}</div>
              {c.caption && <div className={styles.cap}>{c.caption}</div>}
            </a>
          ))}
        </div>

        <div className={styles.dots} role="tablist" aria-label="Onboarding pages">
          {pages.map((p: IOnboardingPage, i: number) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === pageIndex}
              className={`${styles.dot} ${i === pageIndex ? styles.dotActive : ""}`}
              onClick={() => this.goTo(i)}
              title={p.heading}
            />
          ))}
        </div>

        <div className={styles.ctaRow}>
          <button className={styles.cta} onClick={this.next}>
            {pageIndex < pages.length - 1 ? "Next" : (this.props.ctaStartText as string)}
          </button>
        </div>
      </section>
    );
  }
}
