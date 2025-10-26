import * as React from "react";
import styles from "./Dashboards.module.scss";

import HeroBanner from "./HeroBanner";
import SideNavPills from "./SideNavPills";
import DashboardCard from "./DashboardCard";
import DashboardPreview from "./DashboardPreview";

interface DashboardItem { title: string; image?: string; url?: string; desc?: string; }
export interface IDashboardsProps {
  heading: string;
  subtitle?: string;
  items?: DashboardItem[];
}

interface State {
  navActive: number;
  showDetail: boolean;
  selectedIndex: number;
}

const DEFAULT_LABELS = [
  "Administration","Project Delivery","Marketing","Commercial","DHLE",
  "Customer Care","RC Dashboards","Management","Finance"
];

export default class Dashboards extends React.Component<IDashboardsProps, State> {
  constructor(props: IDashboardsProps) {
    super(props);
    this.state = { navActive: 0, showDetail: false, selectedIndex: 0 };
  }

  private openDetail = (i: number) => this.setState({ showDetail: true, selectedIndex: i });
  private closeDetail = () => this.setState({ showDetail: false });

  public render(): React.ReactElement {
    // exactly 6 slots
    const items: DashboardItem[] = (this.props.items || []).slice(0, 6);
    while (items.length < 6) items.push({ title: `Dashboard ${items.length + 1}` });

    const { showDetail, selectedIndex } = this.state;
    const selected = items[selectedIndex] || items[0];

    // detail view: show only 3 others below the preview
    const allIdx = items.map((_, i) => i);
    const otherIdx = allIdx.filter(i => i !== selectedIndex);
    const gridIdx = showDetail ? otherIdx.slice(0, 3) : allIdx;

    return (
      <div className={`${styles.page} ${showDetail ? styles.isDetail : ""}`}>

        {/* Banner — hidden in detail via CSS (.isDetail .top {display:none}) */}
        <div className={styles.top}>
          <HeroBanner
            titleRed="Data Work Bench"
            titleBlack="Dashboards"
            subtitle={this.props.subtitle}
          />
        </div>

        {/* Body grid */}
        <div className={styles.body}>

          {/* Back row — now placed UNDER the banner and INSIDE the grid.
              Inline style ensures it spans the grid and aligns left of navpills
              without needing SCSS changes. */}
          {!showDetail && (
            <div
              className={styles.backbar}
              style={{ gridColumn: "1 / -1", paddingLeft: 0, marginTop: 8, marginBottom: 12 }}
            >
              <a
                className={styles.backlink}
                href="#"
                onClick={(e) => { e.preventDefault(); this.closeDetail(); }}
              >
                ← Back
              </a>
              <span className={styles.crumbs}>Home / Dashboards</span>
            </div>
          )}

          {/* SideNav — hidden in detail via CSS if you’ve set it; otherwise it stays */}
          <aside className={styles.side}>
            <SideNavPills
              items={DEFAULT_LABELS}
              activeIndex={this.state.navActive}
              onSelect={(i) => this.setState({ navActive: i })}
            />
          </aside>

          {/* vertical rail — hidden in detail by CSS (.isDetail .rail {display:none}) */}
          <div className={styles.rail} aria-hidden />

          <main className={styles.content}>
            {/* detail preview on top when clicked */}
            {showDetail && (
              <>
                <div className={styles.detailHero}>
                  <h1 className={styles.detailH1}>{selected.title}</h1>
                  {selected.desc && <p className={styles.detailSub}>{selected.desc}</p>}
                </div>
                <DashboardPreview
                  item={{ title: selected.title, image: selected.image, url: selected.url }}
                />
                <div style={{ height: 12 }} />
              </>
            )}

            {/* cards */}
            <div className={styles.cards}>
              {gridIdx.map((i) => (
                <DashboardCard
                  key={i}
                  item={items[i]}
                  active={false}
                  onClick={() => this.openDetail(i)}
                />
              ))}
            </div>

            {showDetail && otherIdx.length > 3 && (
              <div className={styles.centerRow}>
                <button className={styles.viewAll} onClick={this.closeDetail}>View All</button>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }
}
