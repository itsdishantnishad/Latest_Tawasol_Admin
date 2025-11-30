import * as React from "react";
import styles from "./ServiceLinks.module.scss";

import PrimaryButton from "../../PrimaryButton/PrimaryButton";
import AppsAndLinks from "../../AppsAndLinks/AppsAndLinks";
import { listServices } from "../../../services/listServices";
export interface IServiceLink {
  id: string;
  name: string;
  icon: string;
  url: string;
  position?:
    | "top-left"
    | "left-center"
    | "bottom-left"
    | "top-right"
    | "right-center"
    | "bottom-right"
    | "top-center";
  relativeTo?: "outer" | "inner";
  category?: "quick" | "app" | "custom";
}

export interface IServiceLinksState {
  isHidden: boolean;
}

export interface IServiceLinksProps {
  services?: IServiceLink[];
  context: any;
}

// Position assignments for outer circle (6 positions)
const outerPositions: Array<
  | "top-left"
  | "left-center"
  | "bottom-left"
  | "top-right"
  | "right-center"
  | "bottom-right"
> = [
  "top-left",
  "left-center",
  "bottom-left",
  "top-right",
  "right-center",
  "bottom-right",
];

// Position assignments for inner circle (3 positions)
const innerPositions: Array<"left-center" | "top-center" | "right-center"> = [
  "left-center",
  "top-center",
  "right-center",
];

export const ServiceLinks: React.FC<IServiceLinksProps> = (props) => {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [data, setData] = React.useState([]);
  const [customLinks, setCustomLinks] = React.useState([]);
  const [isHidden, setIsHidden] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"quick" | "app" | "custom">(
    "quick"
  );
  const [services, setServices] = React.useState<IServiceLink[]>([]);

  const itemsPerPage = 9; // 6 outer circle + 3 inner circle cards

  // Transform API data to service links format
  const transformApiDataToServices = (
    apiData: any[],
    customData: any[]
  ): IServiceLink[] => {
    const serviceLinks: IServiceLink[] = [];

    // Process Quick Links
    const quickLinks = apiData.filter((item) => item.AppType === "Quick Links");
    quickLinks.forEach((item, index) => {
      const isOuter = index < 6;
      serviceLinks.push({
        id: `quick-${index}`,
        name: item.Title,
        icon: item.IconURL || "#",
        url: item.URL,
        position: isOuter
          ? outerPositions[index % 6]
          : innerPositions[index % 3],
        relativeTo: isOuter ? "outer" : "inner",
        category: "quick",
      });
    });

    // Process App Links
    const appLinks = apiData.filter((item) => item.AppType === "App Links");
    appLinks.forEach((item, index) => {
      const isOuter = index < 6;
      serviceLinks.push({
        id: `app-${index}`,
        name: item.Title,
        icon: item.IconURL || "#",
        url: item.URL,
        position: isOuter
          ? outerPositions[index % 6]
          : innerPositions[index % 3],
        relativeTo: isOuter ? "outer" : "inner",
        category: "app",
      });
    });

    // Process Custom Links
    customData.forEach((item, index) => {
      const isOuter = index < 6;
      serviceLinks.push({
        id: `custom-${index}`,
        name: item.Title,
        icon: item.IconURL || "#", // Custom links might not have icons
        url: item.URL,
        position: isOuter
          ? outerPositions[index % 6]
          : innerPositions[index % 3],
        relativeTo: isOuter ? "outer" : "inner",
        category: "custom",
      });
    });

    return serviceLinks;
  };

  // Filter services based on active tab
  const filteredServices = services.filter(
    (service) => service.category === activeTab
  );
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
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
    setCurrentPage(0); // Reset to first page when tab changes
  };

  // Calculate positions for cards bound to outer circle
  const getOuterCirclePosition = (position: string): React.CSSProperties => {
    const positionMap: Record<string, React.CSSProperties> = {
      "top-left": {
        top: "15%",
        left: "15%",
        transform: "translate(-50%, -50%)",
      },
      "left-center": {
        top: "50%",
        left: "0%",
        transform: "translate(-50%, -50%)",
      },
      "bottom-left": {
        bottom: "15%",
        left: "15%",
        transform: "translate(-50%, 50%)",
      },
      "top-right": {
        top: "15%",
        right: "15%",
        transform: "translate(50%, -50%)",
      },
      "right-center": {
        top: "50%",
        right: "0%",
        transform: "translate(50%, -50%)",
      },
      "bottom-right": {
        bottom: "15%",
        right: "15%",
        transform: "translate(50%, 50%)",
      },
    };
    return (
      positionMap[position] || {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }
    );
  };

  // Calculate positions for cards bound to inner circle
  const getInnerCirclePosition = (position: string): React.CSSProperties => {
    const positionMap: Record<string, React.CSSProperties> = {
      "left-center": {
        top: "50%",
        left: "0%",
        transform: "translate(-50%, -50%)",
      },
      "top-center": {
        top: "0%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      },
      "right-center": {
        top: "50%",
        right: "0%",
        transform: "translate(50%, -50%)",
      },
    };
    return (
      positionMap[position] || {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }
    );
  };
  const userEmail = props.context.pageContext.user.loginName;
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        let spService: listServices;
        spService = new listServices(props.context);

        // Fetch Apps data (Quick Links and App Links)
        const appsResult: any = await spService.getApps("Apps");
        setData(appsResult);

        // Fetch Custom Links data
        let updatedcustomLinks: any[] = [];
        const customResult: any = await spService.getCustomAppLinks("Custom App Links", userEmail);
        if (
          customResult.length > 0 &&
          customResult[0]["TIRCustomLinkAttribute"]
        ) {
          setCustomLinks(JSON.parse(customResult[0]["TIRCustomLinkAttribute"]));
          updatedcustomLinks = JSON.parse(
            customResult[0]["TIRCustomLinkAttribute"]
          );
        }

        // Transform and set services
        const transformedServices = transformApiDataToServices(
          appsResult,
          updatedcustomLinks || []
        );
        setServices(transformedServices);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [props.context]);

  const showAppsLinksDialog = (): void => {
    setIsHidden(false);
  };

  const hideAppsAndLinks = (): void => {
    setIsHidden(true);
  };

  return (
    <div className={styles.serviceLinksContainer}>
      <AppsAndLinks
        savedApps={data}
        hideAppsAndLinks={hideAppsAndLinks}
        isHidden={isHidden}
        context={props.context}
      />

      {/* Tab Navigation */}
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tab} ${
            activeTab === "quick" ? styles.activeTab : ""
          }`}
          onClick={() => handleTabChange("quick")}
        >
          Quick Links
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "app" ? styles.activeTab : ""
          }`}
          onClick={() => handleTabChange("app")}
        >
          App Links
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "custom" ? styles.activeTab : ""
          }`}
          onClick={() => handleTabChange("custom")}
        >
          Custom links
        </button>
      </div>

      {/* Circular Services Layout with Navigation */}
      <div className={styles.wheelWrapper}>
        <button
          className={styles.navButton}
          onClick={handlePrev}
          disabled={totalPages <= 1}
        >
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

        <div className={styles.outerCircle}>
          {/* Render outer circle service cards */}
          {currentServices
            .filter(
              (service) => service.relativeTo === "outer" && service.position
            )
            .map((service) => {
              const position = service.position || "top-left";
              return (
                <a
                  key={service.id}
                  href={service.url}
                  className={styles.serviceCard}
                  style={getOuterCirclePosition(position)}
                >
                  {service.icon && service.icon !== "#" && (
                    <img
                      src={service.icon}
                      alt={service.name}
                      width={80}
                      height={80}
                    />
                  )}
                  <span className={styles.serviceName}>{service.name}</span>
                </a>
              );
            })}

          {/* Inner circle with service cards */}
          <div className={styles.innerCircle}>
            {/* Render inner circle service cards */}
            {currentServices
              .filter(
                (service) => service.relativeTo === "inner" && service.position
              )
              .map((service) => {
                const position = service.position || "top-center";
                return (
                  <a
                    key={service.id}
                    href={service.url}
                    className={styles.serviceCard}
                    style={getInnerCirclePosition(position)}
                  >
                    {service.icon && service.icon !== "#" && (
                      <img
                        src={service.icon}
                        alt={service.name}
                        width={80}
                        height={80}
                      />
                    )}
                    <span className={styles.serviceName}>{service.name}</span>
                  </a>
                );
              })}
          </div>
        </div>

        <button
          className={styles.navButton}
          onClick={handleNext}
          disabled={totalPages <= 1}
        >
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
      </div>

      <div className={styles.commonButtonArea}>
        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${
                  index === currentPage ? styles.activeDot : ""
                }`}
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
