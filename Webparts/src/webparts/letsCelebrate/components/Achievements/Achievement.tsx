// Achievement.tsx

import * as React from "react";
import { getSP } from "../../../services/spSetUp/pnpConfig";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import styles from "./Achievement.module.scss";

const ArrowDown_Icon = require("../../assets/ArrowDown.svg");
const Congratulations_Icon = require("../../assets/congratulationIcon.jpg");

export interface IAchievementsFeedProps {
  context: WebPartContext;
}

const Achievements: React.FC<IAchievementsFeedProps> = ({ context }) => {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedMonths, setExpandedMonths] = React.useState<Record<string, boolean>>({});
  const [error, setError] = React.useState<string | null>(null);
  const [visibleMonths, setVisibleMonths] = React.useState(8);

  React.useEffect(() => {
    if (!context) {
      setError("No context provided");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const sp = getSP(context);

        const response = await sp.web.lists
          .getByTitle("User Achievements")
          .items.select(
            "Id",
            "Title",
            "TIRDesignation",
            "TIRMonthOfAchievement",
            "TIRDescription",
            "TIRUserPicture",
            "TIRContact"
          )();

        setItems(response || []);
      } catch (err: any) {
        setError(`Failed to load achievements: ${err?.message || err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [context]);

  // Handles Hyperlink/Image column returned as object/string/JSON-string safely
  const extractUrl = (value: any): string | null => {
    if (!value) return null;

    // If SharePoint returns JSON string for Image/Hyperlink columns
    if (typeof value === "string") {
      const s = value.trim();
      if (!s) return null;

      // try JSON parse (Image column sometimes returns JSON string)
      if ((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
        try {
          const parsed = JSON.parse(s);
          if (parsed?.Url) return parsed.Url;
          if (parsed?.url) return parsed.url;
          if (parsed?.serverRelativeUrl) return parsed.serverRelativeUrl;
        } catch {
          // ignore
        }
      }

      return s;
    }

    // Hyperlink/Image object commonly has Url
    if (typeof value === "object") {
      return value.Url || value.url || value.URL || value.serverRelativeUrl || null;
    }

    return null;
  };

  const groupedItems = React.useMemo(() => {
    const groups: Record<string, any[]> = {};

    const monthMap: Record<string, string> = {
      jan: "January",
      feb: "February",
      mar: "March",
      apr: "April",
      may: "May",
      jun: "June",
      jul: "July",
      aug: "August",
      sep: "September",
      oct: "October",
      nov: "November",
      dec: "December",
    };

    items.forEach((item) => {
      // ✅ use new column
      const rawMonth: string = item?.TIRMonthOfAchievement || "Unknown";

      const shortMonth = rawMonth.split("-")[0]?.toLowerCase().slice(0, 3) || "";
      const fullMonth =
        monthMap[shortMonth] || rawMonth.replace(/[-\d]/g, "").trim() || "Unknown";

      if (!groups[fullMonth]) groups[fullMonth] = [];
      groups[fullMonth].push(item);
    });

    return groups;
  }, [items]);


  React.useEffect(() => {
  const monthsToAutoOpen = Object.keys(groupedItems).slice(0, visibleMonths);
  if (!monthsToAutoOpen.length) return;

  setExpandedMonths((prev) => {
    const next = { ...prev };

    // ✅ open each visible month by default (but don't override user's toggles)
    monthsToAutoOpen.forEach((m) => {
      if (next[m] === undefined) next[m] = true;
    });

    return next;
  });
}, [groupedItems, visibleMonths]);


  const getNameParts = (fullName: string) => {
    const parts = (fullName || "").trim().split(" ").filter(Boolean);
    if (!parts.length) return { first: "Unknown", last: "" };
    return { first: parts[0], last: parts.slice(1).join(" ") || "" };
  };

  if (error) {
    return (
      <div className={styles.content}>
        <div className={styles.errorState}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.content}>
        <p className={styles.loading}>Loading achievements...</p>
      </div>
    );
  }

  if (Object.keys(groupedItems).length === 0) {
    return (
      <div className={styles.content}>
        <div className={styles.emptyState}>
          <p>No Achievements to Show</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <div className={styles.feed}>
        {Object.keys(groupedItems)
          .slice(0, visibleMonths)
          .map((month) => (
            <div key={month} className={styles.monthSection}>
              <button
                className={styles.monthHeader}
                onClick={() =>
                  setExpandedMonths((prev) => ({ ...prev, [month]: !prev[month] }))
                }
                aria-expanded={!!expandedMonths[month]}
              >
                <h3 className={styles.monthTitle}>{month}</h3>
                <img
                  src={ArrowDown_Icon}
                  alt=""
                  className={`${styles.chevron} ${expandedMonths[month] ? styles.open : ""}`}
                />
              </button>

              {expandedMonths[month] && (
                <div className={styles.monthContent}>
                  {groupedItems[month].map((item: any) => {
                    const { first, last } = getNameParts(item?.Title);

                    // ✅ use new column
                    const imageUrl = extractUrl(item?.TIRUserPicture);

                    // ✅ use new columns
                    const designation = item?.TIRDesignation || "Team Member";
                    const contact = item?.TIRContact || "";
                    const description = item?.TIRDescription || "";

                    return (
                      <article key={item?.Id} className={styles.achievement}>
                        <div className={styles.imageWrapper}>
                          {imageUrl ? (
                            <img className={styles.photo} src={imageUrl} alt={item?.Title || ""} />
                          ) : (
                            <div className={styles.noImage}>No Image</div>
                          )}
                        </div>

                        <div className={styles.contentWrapper}>
                          <div className={styles.headerRow}>
                            <div className={styles.nameSection}>
                              <h2 className={styles.name}>
                                <span className={styles.firstName}>{first}</span>
                                <span className={styles.lastName}>{last}</span>
                              </h2>

                              <div className={styles.role}>{designation}</div>
                            </div>

                            <a
                              className={styles.sayCongratulations}
                              target="_blank"
                              href={`https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(
                                contact
                              )}&message=Congratulations`}
                              rel="noreferrer"
                            >
                              <img
                                src={Congratulations_Icon}
                                alt=""
                                className={styles.congratulationsIcon}
                              />
                              <span>Say Congratulations</span>
                            </a>
                          </div>

                          {!!description && (
                            <p
                              className={styles.description}
                              dangerouslySetInnerHTML={{ __html: description }}
                            />
                          )}

                          {!!contact && (
                            <p className={styles.connect}>Lets connect : {contact}</p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
      </div>

      {visibleMonths < Object.keys(groupedItems).length && (
        <button className={styles.loadMoreBtn} onClick={() => setVisibleMonths((p) => p + 8)}>
          Load More
        </button>
      )}
    </div>
  );
};

export default Achievements;
