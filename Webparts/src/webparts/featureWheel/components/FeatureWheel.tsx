// src/webparts/featureWheel/components/FeatureWheel.tsx

import * as React from "react";
import { useCallback, useRef, useState } from "react";
import type { IFeatureWheelProps } from "./IFeatureWheelProps";

import FeatureSelector from "../../widgets/FeatureSelector/FeatureSelector";
import { EventsTrainingsTabKey } from "../../Components/NavTabs/eventsTrainingsTabs";
import styles from "./FeatureWheel.module.scss";

// Shared shimmer wrapper (Option 1)
import { LoadingBoundary } from "../../Components/LoadingShimmer";



const toImgSrc = (m: any): string => (typeof m === "string" ? m : m?.default || m);

const featureImageById: Record<string, string> = {
  dashboard: toImgSrc(require("../../Components/FeatureContent/assets/Dashboard.webp")),
  gallery: toImgSrc(require("../../Components/FeatureContent/assets/ImageGallery.webp")),
  documents: toImgSrc(require("../../Components/FeatureContent/assets/Documents.webp")),
  events: toImgSrc(require("../../Components/FeatureContent/assets/Events.webp")),
  employee_events: toImgSrc(require("../../Components/FeatureContent/assets/LetsCelebrate.webp")),
  meetings: toImgSrc(require("../../Components/FeatureContent/assets/Meeting.webp")),
  service_links: toImgSrc(require("../../Components/FeatureContent/assets/Service-Links.webp")),
  forms: toImgSrc(require("../../Components/FeatureContent/assets/InteractiveForms.webp")),
  offers: toImgSrc(require("../../Components/FeatureContent/assets/Offers.webp")),
  training: toImgSrc(require("../../Components/FeatureContent/assets/Training.webp")),
  about_dhre: toImgSrc(require("../../Components/FeatureContent/assets/AboutDHRE.webp")),
  tasks: toImgSrc(require("../../Components/FeatureContent/assets/Tasks.webp")),
  newsletters: toImgSrc(require("../../Components/FeatureContent/assets/newsletter.webp")),
  beverage_menu: toImgSrc(require("../../Components/FeatureContent/assets/Services.webp")),
};


const leftHeadingLine: string = require("../images/leftArrow.svg");
const rightHeadingLine: string = require("../images/rightArrow.svg");

const leftHeadingLineMobile: string = require("../images/leftArrowMobile.svg");
const rightHeadingLineMobile: string = require("../images/rightArrowMobile.svg");

interface FeatureTitleProps {
  header: string;
  subHeader: string;
}

const FeatureTitle: React.FC<FeatureTitleProps> = ({ header, subHeader }) => {
  return (
    <div className={styles.titleContainer}>
      <div className={styles.headerContent}>
        <img src={rightHeadingLine} alt="" className={styles.desktopImage} />
        <img src={rightHeadingLineMobile} alt="" className={styles.mobImage} />
        <h2 className={styles.title}>{header}</h2>
        <img src={leftHeadingLine} alt="" className={styles.desktopImage} />
        <img src={leftHeadingLineMobile} alt="" className={styles.mobImage} />
      </div>
      <div className={styles.subtitle}>{subHeader}</div>
    </div>
  );
};

export interface Feature {
  id: string;
  title: string;
  subtitle: string;
  backgroundImage: string;
}

/** Lets Celebrate tab keys (must match internal webpart URL handling) */
export type CelebrateTabKey =
  | "birthdays"
  | "anniversaries"
  | "newJoiners"
  | "achievements";

/** Helper: append/replace query param safely */
const withQueryParam = (baseUrl: string, key: string, value: string): string => {
  const raw = (baseUrl || "").trim();
  if (!raw) return raw;

  try {
    const u = new URL(raw, window.location.origin);
    u.searchParams.set(key, value);
    return u.toString();
  } catch {
    const sep = raw.includes("?") ? "&" : "?";
    return `${raw}${sep}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }
};

/** Helper: normalize absolute/site-relative/relative urls using current web */
const toAbsoluteFromWeb = (webUrl: string, rawUrl: string, fallbackRel: string): string => {
  const safeWeb = (webUrl || "").replace(/\/$/, "");
  const origin = new URL(safeWeb).origin;

  const raw = (rawUrl || "").trim() || fallbackRel;

  // Absolute
  if (/^https?:\/\//i.test(raw)) return raw;

  // Server-relative
  if (raw.startsWith("/")) return `${origin}${raw}`;

  // Web-relative
  return `${safeWeb}/${raw.replace(/^\.\//, "")}`;
};

/**
 * Lazy load heavy feature modules so initial FeatureWheel load is faster,
 * and show shimmer while a feature module loads.
 */
const Gallery = React.lazy(() => import("../../Components/Gallery/Gallery"));
const Documents = React.lazy(() => import("../../Components/FeatureContent/Documents/Documents"));
const Events = React.lazy(() => import("../../Components/FeatureContent/Events/Events"));
const LetsCelebrate = React.lazy(() => import("../../Components/FeatureContent/LetsCelebrate/LetsCelebrate"));
const Meeting = React.lazy(() => import("../../Components/FeatureContent/Meeting/Meeting"));
const ServiceLinks = React.lazy(() => import("../../Components/FeatureContent/ServiceLinks/ServiceLinks"));
const Forms = React.lazy(() => import("../../Components/FeatureContent/Forms/Forms"));
const Dashboard = React.lazy(() => import("../../Components/FeatureContent/Dashboard/Dashboard"));
const Offers = React.lazy(() => import("../../Components/FeatureContent/Offers/Offers"));
const Training = React.lazy(() => import("../../Components/FeatureContent/Training/Training"));
const AboutDHRE = React.lazy(() => import("../../Components/FeatureContent/AboutDHRE/AboutDHRE"));
// const Newsletter = React.lazy(() => import("../../Components/FeatureContent/Newsletter/Newsletter"));
const TaskApprovals = React.lazy(() => import("../../Components/FeatureContent/TaskApprovals/TaskApprovals"));
const BeverageMenu = React.lazy(() => import("../../Components/FeatureContent/BeverageMenu/BeverageMenu"));
const Newsletter = React.lazy(() => import("../../Components/FeatureContent/Newsletters/Newsletter"));
const features: Feature[] = [
  { id: "dashboard", title: "Dashboard", subtitle: "Track, analyze, optimize", backgroundImage: "url('../../Components/FeatureContent/assets/Dashboard.webp')" },
  { id: "offers", title: "Offers", subtitle: "Exclusive perks just for you", backgroundImage: "url('../../Components/FeatureContent/assets/Offers.webp')" },
  { id: "training", title: "Trainings", subtitle: "Grow skills, unlock new doors", backgroundImage: "url('../../Components/FeatureContent/assets/Training.webp')" },
  { id: "gallery", title: "Gallery", subtitle: "Past events images and memories", backgroundImage: "url('../../Components/FeatureContent/assets/ImageGallery.webp')" },
  { id: "documents", title: "Procedures", subtitle: "All files in one place", backgroundImage: "url('../../Components/FeatureContent/assets/Documents.webp')" },
  { id: "employee_events", title: "Lets Celebrate", subtitle: "Birthday, anniversary & new joiners", backgroundImage: "url('../../Components/FeatureContent/assets/LetsCelebrate.webp')" },
  { id: "about_dhre", title: "About DHRE", subtitle: "Journey through DHRE", backgroundImage: "url('../../Components/FeatureContent/assets/AboutDHRE.webp')" },
  { id: "tasks", title: "Approvals", subtitle: "Get things done with clarity", backgroundImage: "url('../../Components/FeatureContent/assets/Tasks.webp')" },
  { id: "newsletters", title: "Newsletters", subtitle: "Get things done with clarity", backgroundImage: "url('../../Components/FeatureContent/assets/newsletter.webp')" },
  { id: "meetings", title: "Meetings", subtitle: "Connect, discuss, move forward", backgroundImage: "url('../../Components/FeatureContent/assets/Meeting.webp')" },
  { id: "service_links", title: "Links", subtitle: "Quick access, zero hassle", backgroundImage: "url('../../Components/FeatureContent/assets/Service-Links.webp')" },
  { id: "forms", title: "Forms", subtitle: "All interactive forms In one place", backgroundImage: "url('../../Components/FeatureContent/assets/InteractiveForms.webp')" },
  { id: "events", title: "Events", subtitle: "Discover whats happening next", backgroundImage: "url('../../Components/FeatureContent/assets/Events.webp')" },
  { id: "beverage_menu", title: "Services", subtitle: "Simplify your journey ahead", backgroundImage: "url('../../Components/FeatureContent/assets/Services.webp')" },
];

const featureTitleContent: Record<string, { header: string; subHeader: string }> = {
  gallery: { header: "A Glimpse through our lens", subHeader: "Recent milestones and cherished memories we've Immortalised" },
  documents: { header: "Policies and Procedures", subHeader: "Everything you need, neatly organized" },
  events: { header: "Upcoming events", subHeader: "Stay updated and never miss out on what’s happening" },
  employee_events: { header: "Let’s Celebrate", subHeader: "Wish your peers on their special day" },
  meetings: { header: "See your Meetings Scheduled", subHeader: "Connect, collaborate, and drive decisions together" },
  service_links: { header: "Service Links", subHeader: "Quickly access your most used service links" },
  forms: { header: "Interactive Forms", subHeader: "All your essential forms – legacy, claims, business excellence, and more" },
  about_dhre: { header: "About DHRE", subHeader: "Dive deep into DHRE: Our departments, culture, and core values." },
  tasks: { header: "Task Approvals", subHeader: "Streamline your work to accomplish more, faster." },
  newsletters: { header: "Newsletters", subHeader: "Company updates, insights, and highlights - all in one place." },
  beverage_menu: { header: "Beverage Menu", subHeader: "Find your favourite drink to fuel your day" },
  dashboard: { header: "Dashboard", subHeader: "Track everything at a glance – insights made simple!" },
  offers: { header: "Offers & Benefits", subHeader: "Save more with benefits designed for you" },
  training: { header: "Enroll Yourself in Upcoming Trainings", subHeader: "Grow your skills with tailored learning sessions" },
};

const FeatureWheel: React.FC<IFeatureWheelProps> = (props) => {
  const [selectedFeature, setSelectedFeature] = useState<string>("tasks");

  const mobileFeatureTrackRef = useRef<HTMLDivElement | null>(null);

React.useEffect(() => {
  const track = mobileFeatureTrackRef.current;
  if (!track) return;

  if (!window.matchMedia("(max-width: 768px)").matches) return;

  const activeCard = track.querySelector(
    `[data-feature-id="${selectedFeature}"]`
  ) as HTMLElement | null;

  if (!activeCard) return;

  window.setTimeout(() => {
    activeCard.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, 80);
}, [selectedFeature]);

  // Track which LetsCelebrate tab is currently active inside FeaturedWheel
  const [celebrateTab, _setCelebrateTab] = useState<CelebrateTabKey>("birthdays");
  const celebrateTabRef = useRef<CelebrateTabKey>("birthdays");

  const setCelebrateTab = useCallback((t: CelebrateTabKey) => {
    celebrateTabRef.current = t;
    _setCelebrateTab(t);
  }, []);

  // If a lazy-loaded chunk fails during SPA navigation, this forces a retry/remount.
  const [lazyRetryKey, setLazyRetryKey] = useState(0);
  const retryLazy = useCallback(() => setLazyRetryKey((k) => k + 1), []);

  const webUrl = props.context.pageContext.web.absoluteUrl;

  /** ViewAll: For LetsCelebrate, navigate with ?tab= (even if property is blank) */
  const handleViewAll = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log("View all clicked for:", selectedFeature);

    if (selectedFeature !== "employee_events") return;

    const tab = celebrateTabRef.current || "birthdays";

    // IMPORTANT: even if props.letsCelebrate is empty, we still navigate using a safe default
    const base = toAbsoluteFromWeb(webUrl, props.letsCelebrate, "SitePages/Lets-Celebrate.aspx");
    const url = withQueryParam(base, "tab", tab);

    window.location.assign(url);
  }, [selectedFeature, props.letsCelebrate, webUrl]);

  const renderFeatureContent = () => {
    switch (selectedFeature) {
      case "gallery":
        return <Gallery context={props.context} seeAllURL={props.imageGallery} onViewAll={handleViewAll} />;

      case "documents":
        return <Documents context={props.context} seeAllURL={props.documents} onViewAll={handleViewAll} />;

      case "events":
        return (
          <Events
            context={props.context}
            seeAllURL={props.upcomingEvents}
            onViewAll={handleViewAll}
            listTitle="Site Pages"
            topCount={4}
          />
        );

      case "employee_events":
        return (
          <LetsCelebrate
            context={props.context}
            seeAllURL={props.letsCelebrate}
            onViewAll={handleViewAll}
            activeTab={celebrateTab}
            onTabChange={setCelebrateTab}
          />
        );

      case "meetings": {
        const meetingUrl = props.meeting
          ? withQueryParam(props.meeting, "tab", EventsTrainingsTabKey.Meetings)
          : "";
        return <Meeting context={props.context} seeAllURL={meetingUrl} />;
      }

      case "service_links":
        return <ServiceLinks context={props.context} />;

      case "forms":
        return <Forms seeAllURL={props.interactiveForms} onViewAll={handleViewAll} />;

      case "about_dhre": return <AboutDHRE context={props.context} />;

      case "newsletters": return <Newsletter />;

      case "tasks":
        return <TaskApprovals context={props.context} seeAllURL={props.taskApprovals} />;

      case "beverage_menu":
        return <BeverageMenu context={props.context} seeAllURL={props.beverageMenu} />;

      case "dashboard":
        return <Dashboard context={props.context} seeAllURL={props.dashboard} onViewAll={handleViewAll} />;

      case "offers":
        return <Offers context={props.context} seeAllURL={props.getOffersAndDiscounts} onViewAll={handleViewAll} />;

      case "training":
        return (
          <Training
            context={props.context}
            seeAllURL={props.trainingAndDevelopment}
            topCount={4}
            listTitle="Site Pages"
          />
        );

      default:
        return null;
    }
  };

  const title = featureTitleContent[selectedFeature] || { header: "", subHeader: "" };

  const selectedMobileIndex = Math.max(
  0,
  features.findIndex((f) => f.id === selectedFeature)
);

const getMobileCardClass = (index: number): string => {
  let position = index - selectedMobileIndex;

  if (position > features.length / 2) {
    position -= features.length;
  } else if (position < -features.length / 2) {
    position += features.length;
  }

  if (position === 0) return styles.mobileFeatureCardSelected;
  if (position === -1) return styles.mobileFeatureCardPrev;
  if (position === 1) return styles.mobileFeatureCardNext;

  return styles.mobileFeatureCardOther;
};

  const shimmerFallback = (
    <LoadingBoundary loading={true} preset="details" count={1} ariaLabel="Loading feature content">
      <div />
    </LoadingBoundary>
  );

  return (
    <div className={styles.featureWheelContainer}>
      <div className={styles.headingSection}>
        <h1>
          <span>Tawasol</span>, The smarter way to stay connected
        </h1>
      </div>

      <div className={styles.desktopFeatureSelector}>
  <FeatureSelector
    features={features}
    selectedFeature={selectedFeature}
    onFeatureSelect={setSelectedFeature}
  />
</div>

<div className={styles.mobileFeatureSelector}>
  <div className={styles.mobileFeatureTrack} ref={mobileFeatureTrackRef}>
    {features.map((feature, index) => (
      <button
        key={feature.id}
        type="button"
        data-feature-id={feature.id}
        className={`${styles.mobileFeatureCard} ${getMobileCardClass(index)}`}
        onClick={() => setSelectedFeature(feature.id)}
      >
       <span
  className={styles.mobileFeatureImage}
  style={{
    backgroundImage: `url(${featureImageById[feature.id] || ""})`,
  }}
/>
        <span className={styles.mobileFeatureOverlay}>
          <span>{feature.title}</span>
        </span>
      </button>
    ))}
  </div>
</div>

      <FeatureTitle header={title.header} subHeader={title.subHeader} />

      <LazyErrorBoundary onRetry={retryLazy}>
        <React.Suspense key={lazyRetryKey} fallback={shimmerFallback}>
          {renderFeatureContent()}
        </React.Suspense>
      </LazyErrorBoundary>
    </div>
  );
};

class LazyErrorBoundary extends React.Component<
  { onRetry: () => void; children: React.ReactNode },
  { hasError: boolean }
> {
  public state = { hasError: false };

  public static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  public componentDidCatch(error: any): void {
    // eslint-disable-next-line no-console
    console.error("Lazy feature load failed:", error);
  }

  public render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{ padding: 12, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>This feature didn’t load.</div>
        <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 10 }}>
          Sometimes SharePoint navigation without a full refresh can interrupt lazy loading.
        </div>
        <button
          onClick={() => {
            this.setState({ hasError: false });
            this.props.onRetry();
          }}
          style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(0,0,0,0.2)", cursor: "pointer" }}
        >
          Retry
        </button>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid rgba(0,0,0,0.2)",
            cursor: "pointer",
            marginLeft: 8,
          }}
        >
          Reload page
        </button>
      </div>
    );
  }
}

export default FeatureWheel;