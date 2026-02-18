import * as React from "react";
import styles from "./ServiceLinks.module.scss";

import PrimaryButton from "../../PrimaryButton/PrimaryButton";
import AppsAndLinks from "../../AppsAndLinks/AppsAndLinks";
import { listServices } from "../../../services/listServices";

type OuterPosition = "top-left" | "bottom-left" | "top-right" | "bottom-right";
type InnerPosition = "left-center" | "top-center" | "right-center";
export type Position = OuterPosition | InnerPosition;

export interface IServiceLink {
  id: string;
  name: string;
  icon: string;
  url: string;
  position?: Position;
  relativeTo?: "outer" | "inner";
  category?: "quick" | "app" | "custom";
}

export interface IServiceLinksProps {
  services?: IServiceLink[];
  context: any;
}

// exactly four outer positions
const outerPositions: OuterPosition[] = [
  "top-left",
  "bottom-left",
  "top-right",
  "bottom-right",
];

// Resolve URLs so "www.google.com" becomes "https://www.google.com"
const resolveUrl = (raw?: string): string => {
  const url = (raw || "").trim();
  if (!url || url === "#") return "#";

  // already absolute or special schemes
  if (/^(https?:\/\/)/i.test(url)) return url;
  if (/^(mailto:|tel:|sms:|teams:|#)/i.test(url)) return url;

  // protocol-relative
  if (url.startsWith("//")) return `https:${url}`;

  // common case: www.*
  if (/^www\./i.test(url)) return `https://${url}`;

  // site-relative
  if (url.startsWith("/")) return `${window.location.origin}${url}`;

  // if user types like "sites/xxx" or "SitePages/xxx"
  if (/^(sites\/|SitePages\/|Lists\/)/i.test(url)) return `${window.location.origin}/${url}`;

  // default: treat as a domain/external host
  return `https://${url}`;
};

const handleOpenNewTab = (e: React.MouseEvent<HTMLAnchorElement>, rawUrl?: string): void => {
  const finalUrl = resolveUrl(rawUrl);
  if (finalUrl === "#") {
    e.preventDefault();
    return;
  }

  e.preventDefault(); // stop SharePoint SPA navigation
  window.open(finalUrl, "_blank", "noopener,noreferrer");
};

// exactly three inner positions
const innerPositions: InnerPosition[] = ["left-center", "top-center", "right-center"];

export const ServiceLinks: React.FC<IServiceLinksProps> = (props) => {
  const [currentPage, setCurrentPage] = React.useState<number>(0);
  const [data, setData] = React.useState<any[]>([]);
  const [customLinks, setCustomLinks] = React.useState<any[]>([]);
  const [isHidden, setIsHidden] = React.useState<boolean>(true);
  const [activeTab, setActiveTab] = React.useState<"quick" | "app" | "custom">("quick");
  const [services, setServices] = React.useState<IServiceLink[]>([]);

  // 4 outer + 3 inner = 7 items per page
  const itemsPerPage = 7;

  //  Strong new-tab behavior for SharePoint (prevents interception + forces window.open)
  const handleOpenNewTab = (e: React.MouseEvent<HTMLAnchorElement>, rawUrl?: string): void => {
    const finalUrl = resolveUrl(rawUrl);
    if (!finalUrl || finalUrl === "#") {
      e.preventDefault();
      return;
    }

    e.preventDefault(); // stop SharePoint SPA nav
    window.open(finalUrl, "_blank", "noopener,noreferrer");
  };

  // Transform API data into a flat list; position/relativeTo not relied on here.
  const transformApiDataToServices = (apiData: any[], customData: any[]): IServiceLink[] => {
    const serviceLinks: IServiceLink[] = [];

    const quickLinks = apiData.filter((item) => item.AppType === "Quick Links");
    quickLinks.forEach((item, index) => {
      serviceLinks.push({
        id: `quick-${index}`,
        name: item.Title,
        icon: item.IconURL || "#",
        url: item.URL,
        category: "quick",
      });
    });

    const appLinks = apiData.filter((item) => item.AppType === "App Links");
    appLinks.forEach((item, index) => {
      serviceLinks.push({
        id: `app-${index}`,
        name: item.Title,
        icon: item.IconURL || "#",
        url: item.URL,
        category: "app",
      });
    });

    // ✅ Custom: prefer IconData (base64/data URL), fallback to IconURL
    customData.forEach((item, index) => {
      serviceLinks.push({
        id: `custom-${index}`,
        name: item.Title,
        icon: item.IconData || item.IconURL || "#",
        url: item.URL,
        category: "custom",
      });
    });

    return serviceLinks;
  };

  const filteredServices = services.filter((service) => service.category === activeTab);
  const totalPages = Math.max(1, Math.ceil(filteredServices.length / itemsPerPage));
  const currentServices = filteredServices.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePrev = (): void => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = (): void => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const handleTabChange = (tab: "quick" | "app" | "custom"): void => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  // Outer position mapper
  const getOuterCirclePosition = (position?: OuterPosition): React.CSSProperties => {
    const positionMap: Record<OuterPosition, React.CSSProperties> = {
      "top-left": { top: "20%", left: "10%", transform: "translate(-50%, -50%)" },
      "bottom-left": { bottom: "20%", left: "10%", transform: "translate(-50%, 50%)" },
      "top-right": { top: "20%", right: "10%", transform: "translate(50%, -50%)" },
      "bottom-right": { bottom: "20%", right: "10%", transform: "translate(50%, 50%)" },
    };
    return (position && positionMap[position]) || {
      top: "50%",
      left: "50%",
      transform: "translate(-50%,-50%)",
    };
  };

  // Inner position mapper
  const getInnerCirclePosition = (position?: InnerPosition): React.CSSProperties => {
    const positionMap: Record<InnerPosition, React.CSSProperties> = {
      "left-center": { top: "65%", left: "5%", transform: "translate(-50%, -50%)" },
      "top-center": { top: "10%", left: "50%", transform: "translate(-50%, -50%)" },
      "right-center": { top: "65%", right: "5%", transform: "translate(50%, -50%)" },
    };
    return (position && positionMap[position]) || {
      top: "50%",
      left: "50%",
      transform: "translate(-50%,-50%)",
    };
  };

  const userEmail = props.context.pageContext.user.loginName;

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const spService = new listServices(props.context);

        const appsResult: any = await spService.getApps("Apps");
        setData(appsResult);

        let updatedcustomLinks: any[] = [];
        const customResult: any = await spService.getCustomAppLinks("Custom App Links", userEmail);
        if (customResult && customResult.length > 0 && customResult[0]["TIRCustomLinkAttribute"]) {
          updatedcustomLinks = JSON.parse(customResult[0]["TIRCustomLinkAttribute"]);
          setCustomLinks(updatedcustomLinks);
        }

        const transformed = transformApiDataToServices(appsResult || [], updatedcustomLinks || []);
        setServices(transformed);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [props.context, userEmail]);

  // open/close popup
  const showAppsLinksDialog = (): void => setIsHidden(false);
  const hideAppsAndLinks = (): void => setIsHidden(true);
  const showNavButtons = totalPages > 1;

  return (
    <div className={styles.serviceLinksContainer}>
      <AppsAndLinks
        savedApps={data}
        hideAppsAndLinks={hideAppsAndLinks}
        isHidden={isHidden}
        context={props.context}
        initialTab={activeTab} // open popup on the same tab
      />

      <div className={styles.tabContainer}>
        <button
          className={`${styles.tab} ${activeTab === "quick" ? styles.activeTab : ""}`}
          onClick={() => handleTabChange("quick")}
        >
          Quick Links
        </button>
        <button
          className={`${styles.tab} ${activeTab === "app" ? styles.activeTab : ""}`}
          onClick={() => handleTabChange("app")}
        >
          App Links
        </button>
        <button
          className={`${styles.tab} ${activeTab === "custom" ? styles.activeTab : ""}`}
          onClick={() => handleTabChange("custom")}
        >
          Custom links
        </button>
      </div>

      <div className={styles.wheelWrapper}>
        {/* prev button */}
        {showNavButtons && (
          <button className={styles.navButton} onClick={handlePrev}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <div className={styles.circleContainer}>
          <div className={styles.outerCircle}>
            {/* OUTER circle service cards (first 4 items of the current page) */}
            {currentServices.slice(0, 4).map((service, idx) => {
              const position = outerPositions[idx]; // 0..3
              return (
                <a
                  key={service.id}
                  href={resolveUrl(service.url)}
                  className={styles.serviceCard}
                  style={getOuterCirclePosition(position)}
                  data-interception="off"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleOpenNewTab(e, service.url)}
                >
                  {service.icon && service.icon !== "#" && (
                    <img src={service.icon} alt={service.name} className={styles.serviceIcon} />
                  )}
                  <span className={styles.serviceName}>{service.name}</span>
                </a>
              );
            })}

            {/* INNER circle service cards (next 3 items of the current page) */}
            <div className={styles.innerCircle}>
              {currentServices.slice(4, 7).map((service, idx) => {
                const position = innerPositions[idx]; // 0..2
                return (
                  <a
                    key={service.id}
                    href={resolveUrl(service.url)}
                    className={styles.serviceCard}
                    style={getInnerCirclePosition(position)}
                    data-interception="off"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handleOpenNewTab(e, service.url)}
                  >
                    {service.icon && service.icon !== "#" && (
                      <img src={service.icon} alt={service.name} className={styles.serviceIcon} />
                    )}
                    <span className={styles.serviceName}>{service.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* next button */}
        {showNavButtons && (
          <button className={styles.navButton} onClick={handleNext}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      <div className={styles.commonButtonArea}>
        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === currentPage ? styles.activeDot : ""}`}
                onClick={() => setCurrentPage(index)}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}
        <PrimaryButton label="View All" onClick={showAppsLinksDialog} />
      </div>
    </div>
  );
};

export default ServiceLinks;
