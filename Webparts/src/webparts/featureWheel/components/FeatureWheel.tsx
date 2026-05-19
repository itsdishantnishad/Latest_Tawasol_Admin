// FeatureWheel.tsx

import * as React from "react";
import { useCallback, useRef, useState } from "react";
import type { IFeatureWheelProps } from "./IFeatureWheelProps";
import {
  type IResolvedCustomFeatureCardSettings,
  parseCustomFeatureCards,
} from "./FeatureWheelCardSettings";

import FeatureSelector from "../../widgets/FeatureSelector/FeatureSelector";
import { EventsTrainingsTabKey } from "../../Components/NavTabs/eventsTrainingsTabs";
import { LoadingBoundary } from "../../Components/LoadingShimmer";
import { getActiveThemeConfig } from "../../../common/themes/themeResolver";

import styles from "./FeatureWheel.module.scss";

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

const flagSparklesArt: string = require("../images/Flag_Sparkles.svg");
const uaeFlagsArt: string = require("../images/UAE_Flag.svg");
const flagTextArt: string = require("../images/Flag_Text.svg");

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
  targetUrl?: string;
  isCustom?: boolean;
}

/** Lets Celebrate tab keys must match internal webpart URL handling. */
export type CelebrateTabKey =
  | "birthdays"
  | "anniversaries"
  | "newJoiners"
  | "achievements";

/** Append/replace query param safely. */
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

/** Normalize absolute/site-relative/relative urls using current web. */
const toAbsoluteFromWeb = (webUrl: string, rawUrl: string, fallbackRel: string): string => {
  const safeWeb = (webUrl || "").replace(/\/$/, "");
  const origin = new URL(safeWeb).origin;

  const raw = (rawUrl || "").trim() || fallbackRel;

  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return `${origin}${raw}`;

  return `${safeWeb}/${raw.replace(/^\.\//, "")}`;
};

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
const TaskApprovals = React.lazy(() => import("../../Components/FeatureContent/TaskApprovals/TaskApprovals"));
const BeverageMenu = React.lazy(() => import("../../Components/FeatureContent/BeverageMenu/BeverageMenu"));
const Newsletter = React.lazy(() => import("../../Components/FeatureContent/Newsletters/Newsletter"));

const allFeatures: Feature[] = [
  { id: "dashboard", title: "Dashboard", subtitle: "Track, analyze, optimize", backgroundImage: `url(${featureImageById.dashboard})` },
  { id: "offers", title: "Offers", subtitle: "Exclusive perks just for you", backgroundImage: `url(${featureImageById.offers})` },
  { id: "training", title: "Trainings", subtitle: "Grow skills, unlock new doors", backgroundImage: `url(${featureImageById.training})` },
  { id: "gallery", title: "Gallery", subtitle: "Past events images and memories", backgroundImage: `url(${featureImageById.gallery})` },
  { id: "documents", title: "Procedures", subtitle: "All files in one place", backgroundImage: `url(${featureImageById.documents})` },
  { id: "employee_events", title: "Lets Celebrate", subtitle: "Birthday, anniversary & new joiners", backgroundImage: `url(${featureImageById.employee_events})` },
  { id: "about_dhre", title: "About DHRE", subtitle: "Journey through DHRE", backgroundImage: `url(${featureImageById.about_dhre})` },
  { id: "tasks", title: "Approvals", subtitle: "Get things done with clarity", backgroundImage: `url(${featureImageById.tasks})` },
  { id: "newsletters", title: "Newsletters", subtitle: "Get things done with clarity", backgroundImage: `url(${featureImageById.newsletters})` },
  { id: "meetings", title: "Meetings", subtitle: "Connect, discuss, move forward", backgroundImage: `url(${featureImageById.meetings})` },
  { id: "service_links", title: "Links", subtitle: "Quick access, zero hassle", backgroundImage: `url(${featureImageById.service_links})` },
  { id: "forms", title: "Forms", subtitle: "All interactive forms In one place", backgroundImage: `url(${featureImageById.forms})` },
  { id: "events", title: "Events", subtitle: "Discover whats happening next", backgroundImage: `url(${featureImageById.events})` },
  { id: "beverage_menu", title: "Services", subtitle: "Simplify your journey ahead", backgroundImage: `url(${featureImageById.beverage_menu})` },
];

const isBuiltInFeatureEnabled = (id: string, props: IFeatureWheelProps): boolean => {
  switch (id) {
    case "dashboard":
      return props.showDashboard !== false;
    case "offers":
      return props.showOffers !== false;
    case "training":
      return props.showTraining !== false;
    case "gallery":
      return props.showGallery !== false;
    case "documents":
      return props.showDocuments !== false;
    case "employee_events":
      return props.showLetsCelebrate !== false;
    case "about_dhre":
      return props.showAboutDhre !== false;
    case "tasks":
      return props.showTaskApprovals !== false;
    case "newsletters":
      // Newsletter was commented out before; keep it hidden until the pane toggle is turned on.
      return props.showNewsletters === true;
    case "meetings":
      return props.showMeetings !== false;
    case "service_links":
      return props.showServiceLinks !== false;
    case "forms":
      return props.showForms !== false;
    case "events":
      return props.showEvents !== false;
    case "beverage_menu":
      return props.showBeverageMenu !== false;
    default:
      return true;
  }
};

const toCssBackgroundImage = (rawUrl?: string): string => {
  const url = (rawUrl || "").trim();
  if (!url) return `url(${featureImageById.service_links})`;

  return `url("${url.replace(/"/g, '\\"')}")`;
};

const toCustomFeature = (card: IResolvedCustomFeatureCardSettings): Feature => ({
  id: card.id,
  title: card.title,
  subtitle: card.subtitle || "",
  backgroundImage: toCssBackgroundImage(card.imageUrl),
  targetUrl: card.targetUrl,
  isCustom: true,
});

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

const CustomFeatureContent: React.FC<{ card: IResolvedCustomFeatureCardSettings }> = ({ card }) => {
  const contentCards = (card.contentCards || []).filter((contentCard) => contentCard.enabled !== false);

  if (contentCards.length > 0) {
    return (
      <section className={styles.customFeatureContent}>
        <div className={styles.customContentGrid}>
          {contentCards.map((contentCard) => {
            const tileStyle: React.CSSProperties = {
              backgroundImage: toCssBackgroundImage(contentCard.imageUrl || card.imageUrl),
            };

            const tileContent = (
              <>
                <span className={styles.customContentTileShade} />
                <span className={styles.customContentTileText}>
                  <strong>{contentCard.title}</strong>
                  {contentCard.description ? <small>{contentCard.description}</small> : null}
                </span>
              </>
            );

            return contentCard.targetUrl ? (
              <a
                key={contentCard.id}
                href={contentCard.targetUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.customContentTile}
                style={tileStyle}
              >
                {tileContent}
              </a>
            ) : (
              <div key={contentCard.id} className={styles.customContentTile} style={tileStyle}>
                {tileContent}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (!card.targetUrl) return null;

  return (
    <section className={styles.customFeatureContent}>
      <a href={card.targetUrl} target="_blank" rel="noreferrer" className={styles.customFeatureButton}>
        Open {card.title}
      </a>
    </section>
  );
};


const FeatureWheel: React.FC<IFeatureWheelProps> = (props) => {
  const [isDelaying, setIsDelaying] = useState(true);

  React.useEffect(() => {
    const delay = props.loadingDelay ?? 0;
    if (delay <= 0) {
      setIsDelaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsDelaying(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [props.loadingDelay]);

  const themeConfig = React.useMemo(
    () => getActiveThemeConfig(props.themeVariant),
    [props.themeVariant]
  );

  const customCardsSignature = JSON.stringify(props.customCards || []);
  const customFeatureCards = React.useMemo(
    () => parseCustomFeatureCards(props.customCards),
    [customCardsSignature]
  );

  const features = React.useMemo(() => {
    const builtInFeatures = allFeatures.filter((feature) =>
      isBuiltInFeatureEnabled(feature.id, props)
    );

    const usedIds = new Set(builtInFeatures.map((feature) => feature.id));
    const customFeatures = customFeatureCards
      .filter((card) => !usedIds.has(card.id))
      .map(toCustomFeature);

    return [...builtInFeatures, ...customFeatures];
  }, [
    props.showDashboard,
    props.showOffers,
    props.showTraining,
    props.showGallery,
    props.showDocuments,
    props.showLetsCelebrate,
    props.showAboutDhre,
    props.showTaskApprovals,
    props.showNewsletters,
    props.showMeetings,
    props.showServiceLinks,
    props.showForms,
    props.showEvents,
    props.showBeverageMenu,
    customFeatureCards,
  ]);

  const customFeatureById = React.useMemo(() => {
    return customFeatureCards.reduce<Record<string, IResolvedCustomFeatureCardSettings>>((acc, card) => {
      acc[card.id] = card;
      return acc;
    }, {});
  }, [customFeatureCards]);

  const [selectedFeature, setSelectedFeature] = useState<string>(() =>
    themeConfig.key === "uaeNationalDay" ? "employee_events" : "about_dhre"
  );

  const mobileFeatureTrackRef = useRef<HTMLDivElement | null>(null);

  const hasCenteredMobileRef = useRef(false);

  React.useEffect(() => {
    const firstFeature = features[0];

    if (firstFeature && !features.some((feature) => feature.id === selectedFeature)) {
      setSelectedFeature(firstFeature.id);
    }
  }, [features, selectedFeature]);

  React.useLayoutEffect(() => {
    // The wheel isn't rendered while the shimmer delay is active, so refs are null.
    // Re-run after delay ends to ensure the default selected card is centered in mobile view.
    if (isDelaying) return;

    const track = mobileFeatureTrackRef.current;
    if (!track) return;
    if (!window.matchMedia("(max-width: 768px)").matches) return;

    const container = track.parentElement as HTMLElement | null;
    if (!container) return;

    const activeCard = track.querySelector(
      `[data-feature-id="${selectedFeature}"]`
    ) as HTMLElement | null;

    if (!activeCard) return;

    window.requestAnimationFrame(() => {
      const containerWidth = container.clientWidth || container.offsetWidth;
      const cardLeft = activeCard.offsetLeft;
      const cardWidth = activeCard.offsetWidth;

      // Scroll programmatically so selected card is always centered.
      container.scrollTo({
        left: cardLeft - containerWidth / 2 + cardWidth / 2,
        behavior: hasCenteredMobileRef.current ? "smooth" : "auto",
      });

      hasCenteredMobileRef.current = true;
    });
  }, [selectedFeature, isDelaying, features]);

  // Track which LetsCelebrate tab is currently active inside FeatureWheel.
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

  /** ViewAll: For LetsCelebrate, navigate with ?tab= even if property is blank. */
  const handleViewAll = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log("View all clicked for:", selectedFeature);

    if (selectedFeature !== "employee_events") return;

    const tab = celebrateTabRef.current || "birthdays";
    const base = toAbsoluteFromWeb(webUrl, props.letsCelebrate, "SitePages/Lets-Celebrate.aspx");
    const url = withQueryParam(base, "tab", tab);

    window.location.assign(url);
  }, [selectedFeature, props.letsCelebrate, webUrl]);

  const renderHeroHeading = (): React.ReactNode => {
    const hero = themeConfig.featureWheel.hero;

    if (hero.variant === "celebration") {
      return (
        <div className={`${styles.headingSection} ${styles.celebrationHeadingSection}`}>
          <div className={styles.heroArtStack} aria-hidden="true">
            {hero.showSparkles && (
              <img
                src={flagSparklesArt}
                alt=""
                className={styles.sparklesArt}
              />
            )}

            {hero.showFlags && (
              <img
                src={uaeFlagsArt}
                alt=""
                className={styles.flagsArt}
              />
            )}
          </div>

          {hero.useTitleArt ? (
            <img
              src={flagTextArt}
              alt={hero.title}
              className={styles.titleArt}
            />
          ) : (
            <h1 className={styles.celebrationTitle}>{hero.title}</h1>
          )}

          <h6 className={styles.celebrationSubtitle}>{hero.subTitle}</h6>
        </div>
      );
    }

    return (
      <div className={styles.headingSection}>
        <h1>
          {hero.leadingText ? `${hero.leadingText} ` : ""}
          <span>{hero.accentText}</span>
          {hero.trailingText || ""}
        </h1>
      </div>
    );
  };

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

      case "about_dhre":
        return <AboutDHRE context={props.context} />;

      case "newsletters":
        return <Newsletter />;

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

      default: {
        const customCard = customFeatureById[selectedFeature];
        return customCard ? <CustomFeatureContent card={customCard} /> : null;
      }
    }
  };

  const customTitle = customFeatureById[selectedFeature];
  const title = featureTitleContent[selectedFeature] || {
    header: customTitle?.header || customTitle?.title || "",
    subHeader: customTitle?.subHeader || customTitle?.description || customTitle?.subtitle || "",
  };

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

  if (isDelaying) {
    return (
      <div className={styles.featureWheelContainer}>
        {shimmerFallback}
      </div>
    );
  }

  return (
    <div
      className={`${styles.featureWheelContainer} ${
        themeConfig.key === "uaeNationalDay" ? styles.uaeNationalDayTheme : ""
      }`}
    >
      {renderHeroHeading()}

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
                  backgroundImage: feature.backgroundImage,
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
