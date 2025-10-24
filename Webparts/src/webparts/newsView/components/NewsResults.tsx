import * as React from "react";
import styles from "./NewsView.module.scss";
import type { NewsRow, ViewMode } from "./NewsView";
// import { timeAgo } from "../utils/time";
import { Image, ImageFit, Icon } from "@fluentui/react";

/* Dept & Category icons */
const DEPARTMENT_ICONS: Record<string, string> = {
    grc: require("../../assets/GovernanceRiskandCompliance.svg"),
    hse: require("../../assets/HealthSafetyEnvironment.svg"),
    hc: require("../../assets/HumanCapital.svg"),
    pa: require("../../assets/Procurement.svg"),
};
const CATEGORY_ICONS: Record<string, string> = {
    announce: require("../../assets/AnnouncementIconNewsTag.svg"),
    dhre: require("../../assets/DHREIconNewsTag.svg"),
    world: require("../../assets/ArroundTheWorldIconNewsTag.svg"),
};

const userPhotoUrl = (email?: string, size: "S" | "M" | "L" = "S") =>
    email && email.trim()
        ? `/_layouts/15/userphoto.aspx?size=${size}&accountname=${encodeURIComponent(email)}`
        : `/_layouts/15/userphoto.aspx?size=${size}`;


/* Fallback image */
const FALLBACK_IMAGE_DATA_URI =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='675'>
       <defs><linearGradient id='g' x1='0' x2='0' y1='0' y2='1'>
         <stop offset='0%' stop-color='#efefef'/><stop offset='100%' stop-color='#dcdcdc'/>
       </linearGradient></defs>
       <rect width='100%' height='100%' fill='url(#g)'/>
     </svg>`
    );

const getPreviewUrl = (src?: string) => (src && src.trim()) ? src : FALLBACK_IMAGE_DATA_URI;

/* Resolve target URL */
const resolveTargetUrl = (r: NewsRow): string | undefined => {
    if (r.path && r.path.trim()) return r.path;
    if (r.newsImage) {
        try {
            const url = new URL(r.newsImage, window.location.origin);
            const pagePath = url.searchParams.get("path");
            if (pagePath) return decodeURIComponent(pagePath);
        } catch { }
    }
    return undefined;
};

const getIconPaths = (dept?: string, type?: string) => {
    let d: string | undefined, c: string | undefined;
    if (dept) {
        const k = dept.toLowerCase();
        if (k.includes("governance")) d = DEPARTMENT_ICONS.grc;
        else if (k.includes("health")) d = DEPARTMENT_ICONS.hse;
        else if (k.includes("human")) d = DEPARTMENT_ICONS.hc;
        else if (k.includes("procurement")) d = DEPARTMENT_ICONS.pa;
    }
    if (type) {
        const k = type.toLowerCase();
        if (k.includes("announce")) c = CATEGORY_ICONS.announce;
        else if (k.includes("dhre")) c = CATEGORY_ICONS.dhre;
        else if (k.includes("world")) c = CATEGORY_ICONS.world;
    }
    return { deptIconPath: d, catIconPath: c };
};



export interface INewsResultsProps { items: NewsRow[]; view: ViewMode; }

export default class NewsResults extends React.Component<
    INewsResultsProps,
    { animateGrid: boolean; animateList: boolean }
> {
    private hasAnimatedListOnce = false;
    private timers: number[] = [];

    constructor(p: INewsResultsProps) {
        super(p);
        this.state = { animateGrid: false, animateList: false };
    }

    componentDidMount() { this.triggerOnce("grid"); }
    componentDidUpdate(prev: INewsResultsProps) {
        if (prev.view !== this.props.view && this.props.view === "list" && !this.hasAnimatedListOnce) {
            this.triggerOnce("list"); this.hasAnimatedListOnce = true;
        }
    }
    componentWillUnmount() { this.timers.forEach(t => window.clearTimeout(t)); }

    private triggerOnce(which: "grid" | "list") {
        const key = which === "grid" ? "animateGrid" : "animateList";
        this.setState({ [key]: true } as any);
        this.timers.push(window.setTimeout(() => this.setState({ [key]: false } as any), 650) as unknown as number);
    }

    private renderMeta(newsItem: NewsRow, variant: "grid" | "list") {

        const cls = variant === "grid" ? styles.gridMetaInline : styles.metaInline;
        return (
            <span className={cls}>
                <span>{newsItem.lastModified}</span>
                <span>{newsItem.readTime} min read</span>
                <span>{newsItem.pageView} Views</span>
            </span>
        );
    }

    /* GRID */
    private renderGrid(items: NewsRow[]) {
        const rows: NewsRow[][] = [];
        for (let i = 0; i < items.length; i += 3) rows.push(items.slice(i, i + 3));

        return (
            <div className={`${styles.gridWrap} ${this.state.animateGrid ? styles.animateIn : ""}`}>
                {rows.map((g, r) => {
                    const rowClass = r % 3 === 0 ? styles["row-left"] : r % 3 === 1 ? styles["row-center"] : styles["row-right"];
                    return (
                        <div key={r} className={`${styles.gridRow} ${rowClass}`}>
                            {g.map((n, c) => {
                                const featured = (r % 3 === 0 && c === 0) || (r % 3 === 1 && c === 1) || (r % 3 === 2 && c === 2);
                                return this.renderGridCard(n, featured, r === 0 && c === 0);
                            })}
                        </div>
                    );
                })}
            </div>
        );
    }



    private handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href?: string) => {
        if (!href) return e.preventDefault();
        e.preventDefault(); window.open(href, "_blank", "noopener");
    };

    private renderGridCard(n: NewsRow, featured: boolean, showPin?: boolean) {
        const size = featured ? styles.big : styles.small;
        const { deptIconPath, catIconPath } = getIconPaths(n.department, n.newsType);
        const img = getPreviewUrl(n.newsImage);
        const href = resolveTargetUrl(n);

        return (
            <a
                key={n.listItemId ?? href ?? n.title}
                className={size}
                href={href || "#"}
                title={n.title}
                target="_blank"
                rel="noopener noreferrer"
                data-interception="off"
                onClick={(e) => this.handleAnchorClick(e, href)}
            >
                <div className={styles.imagePaint} style={{ backgroundImage: `url("${img}")` }} />
                {catIconPath && (
                    <div className={styles.TIRCategoryIconGrid}>
                        <Image src={catIconPath} alt="" width={40} height={40} imageFit={ImageFit.contain} />
                    </div>
                )}
                {showPin && (
                    <span className={styles.pinPill} title="Pinned" aria-label="Pinned">
                        <Icon iconName="Pinned" className={styles.pinGlyph} />
                        <span className={styles.pinText}>Pinned</span>
                    </span>
                )}
                <div className={styles.gridTextStack}>
                    {n.department && (
                        <span className={styles.TIRDeptInline}>
                            {deptIconPath && <Image className="deptIcon" src={deptIconPath} alt="" width={18} height={18} imageFit={ImageFit.contain} />}
                            {n.department}
                        </span>
                    )}
                    <div className={featured ? styles.bigTitle : styles.smallTitle}>{n.title}</div>
                    {this.renderMeta(n, "grid")}
                </div>
            </a>
        );
    }

    /* LIST */
    private renderList(items: NewsRow[]) {
        return (
            <ul className={`${styles.listWrap} ${this.state.animateList ? styles.animateIn : ""}`}>
                {items.map((n) => {
                    const img = getPreviewUrl(n.newsImage);
                    const { deptIconPath, catIconPath } = getIconPaths(n.department, n.newsType);
                    const href = resolveTargetUrl(n);

                    return (
                        <li key={n.listItemId ?? href ?? n.title} className={styles.listItem}>
                            <a
                                className={styles.listItemLink}
                                href={href || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={n.title}
                                data-interception="off"
                                onClick={(e) => this.handleAnchorClick(e, href)}
                            >
                                <div className={`${styles.listMedia} ${styles.thumb}`}>
                                    <Image src={img} alt={n.title} shouldStartVisible imageFit={ImageFit.cover} width={120} height={64} />
                                    {catIconPath && (
                                        <span className={styles.listCatIcon}>
                                            <Image src={catIconPath} alt="" width={26} height={26} imageFit={ImageFit.contain} />
                                        </span>
                                    )}
                                </div>

                                <div className={styles.listBody}>
                                    <div className={styles.topRow}>
                                        {n.department && (
                                            <span className={styles.listDeptGroup}>
                                                {deptIconPath && <Image className={styles.listDeptIcon} src={deptIconPath} alt="" width={16} height={16} imageFit={ImageFit.contain} />}
                                                <span className={styles.listDept}>{n.department}</span>
                                            </span>
                                        )}
                                        {Array.isArray(n.tags) && n.tags.length > 0 && (
                                            <span className={styles.hashes}>
                                                {n.tags.slice(0, 3).map((t, i) => (<span key={i} className={styles.hash}>#{t}</span>))}
                                            </span>
                                        )}
                                    </div>

                                    <div className={styles.titleRow}>
                                        <span className={styles.listTitle}>{n.title}</span>
                                        <span className={styles.metaInline}>{this.renderMeta(n, "list")}</span>
                                    </div>

                                    <div className={styles.authorRow}>
                                        <Image src={userPhotoUrl(n.authorEmail, "S")} alt={n.author || "Author"} width={20} height={20} imageFit={ImageFit.cover} />
                                        <span className={styles.authorName}>{n.author}</span>
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
