import * as React from "react";
import styles from "./NewsView.module.scss";
import type { NewsRow, ViewMode } from "./NewsView";
import { Image, ImageFit, Icon } from "@fluentui/react";

/* Department & Category icon maps with descriptive keys */
const departmentIconSrcByKey: Record<string, string> = {
  governance_risk_and_compliance: require("../../assets/GovernanceRiskandCompliance.svg"),
  health_safety_environment: require("../../assets/HealthSafetyEnvironment.svg"),
  human_capital: require("../../assets/HumanCapital.svg"),
  procurement_and_admin: require("../../assets/Procurement.svg"),
};

const categoryIconSrcByKey: Record<string, string> = {
  announcement: require("../../assets/AnnouncementIconNewsTag.svg"),
  dhre_stories: require("../../assets/DHREIconNewsTag.svg"),
  around_the_world: require("../../assets/ArroundTheWorldIconNewsTag.svg"),
};

const buildUserPhotoUrl = (emailAddress?: string, size: "S" | "M" | "L" = "S") =>
  emailAddress && emailAddress.trim()
    ? `/_layouts/15/userphoto.aspx?size=${size}&accountname=${encodeURIComponent(emailAddress)}`
    : `/_layouts/15/userphoto.aspx?size=${size}`;

/* Fallback (placeholder) image */
const PLACEHOLDER_IMAGE_DATA_URI =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='675'>
       <defs><linearGradient id='g' x1='0' x2='0' y1='0' y2='1'>
         <stop offset='0%' stop-color='#efefef'/><stop offset='100%' stop-color='#dcdcdc'/>
       </linearGradient></defs>
       <rect width='100%' height='100%' fill='url(#g)'/>
     </svg>`
  );

const getImageSrcOrPlaceholder = (imageSrc?: string) =>
  imageSrc && imageSrc.trim() ? imageSrc : PLACEHOLDER_IMAGE_DATA_URI;

/* Resolve target URL */
const resolveTargetUrl = (newsItem: NewsRow): string | undefined => {
  if (newsItem.path && newsItem.path.trim()) return newsItem.path;

  if (newsItem.newsImage) {
    try {
      const parsedUrl = new URL(newsItem.newsImage, window.location.origin);
      const pagePath = parsedUrl.searchParams.get("path");
      if (pagePath) return decodeURIComponent(pagePath);
    } catch {
      /* ignore parse errors */
    }
  }
  return undefined;
};

const getIconSourcePaths = (departmentName?: string, newsType?: string) => {
  let departmentIconSrc: string | undefined;
  let categoryIconSrc: string | undefined;

  if (departmentName) {
    const deptKey = departmentName.toLowerCase();
    if (deptKey.includes("governance")) departmentIconSrc = departmentIconSrcByKey.governance_risk_and_compliance;
    else if (deptKey.includes("health")) departmentIconSrc = departmentIconSrcByKey.health_safety_environment;
    else if (deptKey.includes("human")) departmentIconSrc = departmentIconSrcByKey.human_capital;
    else if (deptKey.includes("procurement")) departmentIconSrc = departmentIconSrcByKey.procurement_and_admin;
  }

  if (newsType) {
    const typeKey = newsType.toLowerCase();
    if (typeKey.includes("announce")) categoryIconSrc = categoryIconSrcByKey.announcement;
    else if (typeKey.includes("dhre")) categoryIconSrc = categoryIconSrcByKey.dhre_stories;
    else if (typeKey.includes("world")) categoryIconSrc = categoryIconSrcByKey.around_the_world;
  }

  return { departmentIconSrc, categoryIconSrc };
};

export interface INewsResultsProps {
  items: NewsRow[];
  view: ViewMode;
}

type AnimationState = { animateGrid: boolean; animateList: boolean };

export default class NewsResults extends React.Component<INewsResultsProps, AnimationState> {
  private hasAnimatedListOnce = false;
  private animationTimers: number[] = [];

  constructor(props: INewsResultsProps) {
    super(props);
    this.state = { animateGrid: false, animateList: false };
  }

  componentDidMount() {
    this.triggerIntroAnimation("grid");
  }

  componentDidUpdate(previousProps: INewsResultsProps) {
    const viewModeChanged = previousProps.view !== this.props.view;
    const isNowListView = this.props.view === "list";

    if (viewModeChanged && isNowListView && !this.hasAnimatedListOnce) {
      this.triggerIntroAnimation("list");
      this.hasAnimatedListOnce = true;
    }
  }

  componentWillUnmount() {
    this.animationTimers.forEach((timerId) => window.clearTimeout(timerId));
  }

  private triggerIntroAnimation(which: "grid" | "list") {
    const stateKey = which === "grid" ? "animateGrid" : "animateList";
    this.setState({ [stateKey]: true } as unknown as AnimationState);

    const timerId = window.setTimeout(
      () => this.setState({ [stateKey]: false } as unknown as AnimationState),
      650
    ) as unknown as number;

    this.animationTimers.push(timerId);
  }

  private renderMetaRow(newsItem: NewsRow, variant: "grid" | "list") {
    const metaClassName = variant === "grid" ? styles.gridMetaInline : styles.metaInline;
    return (
      <span className={metaClassName}>
        <span>{newsItem.lastModified}</span>
        <span>{newsItem.readTime} min read</span>
        <span>{newsItem.pageView} Views</span>
      </span>
    );
  }

  /* GRID */
  private renderGrid(newsItems: NewsRow[]) {
    const gridRowChunks: NewsRow[][] = [];
    for (let startIndex = 0; startIndex < newsItems.length; startIndex += 3) {
      gridRowChunks.push(newsItems.slice(startIndex, startIndex + 3));
    }

    return (
      <div className={`${styles.gridWrap} ${this.state.animateGrid ? styles.animateIn : ""}`}>
        {gridRowChunks.map((rowItems, rowIndex) => {
          const rowPositionClassName =
            rowIndex % 3 === 0 ? styles["row-left"] : rowIndex % 3 === 1 ? styles["row-center"] : styles["row-right"];

          return (
            <div key={rowIndex} className={`${styles.gridRow} ${rowPositionClassName}`}>
              {rowItems.map((newsItem, columnIndex) => {
                const isFeaturedCard =
                  (rowIndex % 3 === 0 && columnIndex === 0) ||
                  (rowIndex % 3 === 1 && columnIndex === 1) ||
                  (rowIndex % 3 === 2 && columnIndex === 2);

                const isFirstGridCard = rowIndex === 0 && columnIndex === 0;
                return this.renderGridCard(newsItem, isFeaturedCard, isFirstGridCard);
              })}
            </div>
          );
        })}
      </div>
    );
  }

  private handleAnchorClick = (event: React.MouseEvent<HTMLAnchorElement>, href?: string) => {
    if (!href) return event.preventDefault();
    event.preventDefault();
    window.open(href, "_blank", "noopener");
  };

  private renderGridCard(newsItem: NewsRow, isFeaturedCard: boolean, showPinnedPill?: boolean) {
    const sizeClassName = isFeaturedCard ? styles.big : styles.small;
    const { departmentIconSrc, categoryIconSrc } = getIconSourcePaths(newsItem.department, newsItem.newsType);
    const previewImageSrc = getImageSrcOrPlaceholder(newsItem.newsImage);
    const targetUrl = resolveTargetUrl(newsItem);

    return (
      <a
        key={newsItem.listItemId ?? targetUrl ?? newsItem.title}
        className={sizeClassName}
        href={targetUrl || "#"}
        title={newsItem.title}
        target="_blank"
        rel="noopener noreferrer"
        data-interception="off"
        onClick={(event) => this.handleAnchorClick(event, targetUrl)}
      >
        <div className={styles.imagePaint} style={{ backgroundImage: `url("${previewImageSrc}")` }} />
        {categoryIconSrc && (
          <div className={styles.TIRCategoryIconGrid}>
            <Image src={categoryIconSrc} alt="" width={40} height={40} imageFit={ImageFit.contain} />
          </div>
        )}

        {showPinnedPill && (
          <span className={styles.pinPill} title="Pinned" aria-label="Pinned">
            <Icon iconName="Pinned" className={styles.pinGlyph} />
            <span className={styles.pinText}>Pinned</span>
          </span>
        )}

        <div className={styles.gridTextStack}>
          {newsItem.department && (
            <span className={styles.TIRDeptInline}>
              {departmentIconSrc && (
                <Image
                  className="deptIcon"
                  src={departmentIconSrc}
                  alt=""
                  width={18}
                  height={18}
                  imageFit={ImageFit.contain}
                />
              )}
              {newsItem.department}
            </span>
          )}
          <div className={isFeaturedCard ? styles.bigTitle : styles.smallTitle}>{newsItem.title}</div>
          {this.renderMetaRow(newsItem, "grid")}
        </div>
      </a>
    );
  }

  /* LIST */
  private renderList(newsItems: NewsRow[]) {
    return (
      <ul className={`${styles.listWrap} ${this.state.animateList ? styles.animateIn : ""}`}>
        {newsItems.map((newsItem) => {
          const previewImageSrc = getImageSrcOrPlaceholder(newsItem.newsImage);
          const { departmentIconSrc, categoryIconSrc } = getIconSourcePaths(newsItem.department, newsItem.newsType);
          const targetUrl = resolveTargetUrl(newsItem);

          return (
            <li key={newsItem.listItemId ?? targetUrl ?? newsItem.title} className={styles.listItem}>
              <a
                className={styles.listItemLink}
                href={targetUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                title={newsItem.title}
                data-interception="off"
                onClick={(event) => this.handleAnchorClick(event, targetUrl)}
              >
                <div className={`${styles.listMedia} ${styles.thumb}`}>
                  <Image
                    src={previewImageSrc}
                    alt={newsItem.title}
                    shouldStartVisible
                    imageFit={ImageFit.cover}
                    width={120}
                    height={64}
                  />
                  {categoryIconSrc && (
                    <span className={styles.listCatIcon}>
                      <Image src={categoryIconSrc} alt="" width={26} height={26} imageFit={ImageFit.contain} />
                    </span>
                  )}
                </div>

                <div className={styles.listBody}>
                  <div className={styles.topRow}>
                    {newsItem.department && (
                      <span className={styles.listDeptGroup}>
                        {departmentIconSrc && (
                          <Image
                            className={styles.listDeptIcon}
                            src={departmentIconSrc}
                            alt=""
                            width={16}
                            height={16}
                            imageFit={ImageFit.contain}
                          />
                        )}
                        <span className={styles.listDept}>{newsItem.department}</span>
                      </span>
                    )}
                    {Array.isArray(newsItem.tags) && newsItem.tags.length > 0 && (
                      <span className={styles.hashes}>
                        {newsItem.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className={styles.hash}>
                            #{tag}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>

                  <div className={styles.titleRow}>
                    <span className={styles.listTitle}>{newsItem.title}</span>
                    <span className={styles.metaInline}>{this.renderMetaRow(newsItem, "list")}</span>
                  </div>

                  <div className={styles.authorRow}>
                    <Image
                      src={buildUserPhotoUrl(newsItem.authorEmail, "S")}
                      alt={newsItem.author || "Author"}
                      width={20}
                      height={20}
                      imageFit={ImageFit.cover}
                    />
                    <span className={styles.authorName}>{newsItem.author}</span>
                  </div>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    );
  }

  public render() {
    const { items, view } = this.props;
    if (!items || items.length === 0) return <div className={styles.empty}>No news found.</div>;
    return view === "grid" ? this.renderGrid(items) : this.renderList(items);
    }
}
