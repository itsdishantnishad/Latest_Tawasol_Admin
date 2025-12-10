
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
          .items.select("ID",  "Title", "Designation", "MonthofAchievement", "AchievementDescription", "ProfilePicture",  "ContactInformation" )();
          setItems(response);
         } catch (err: any) {
          setError(`Failed to load achievements: ${err.message}`);
         } finally {
         setLoading(false);
       }
    };

    fetchData();
  }, [context]);

  const groupedItems = React.useMemo(() => {
    const groups: Record<string, any[]> = {};
    const monthMap: Record<string, string> = { jan: "January", feb: "February", mar: "March", apr: "April", may: "May",
      jun: "June", jul: "July", aug: "August", sep: "September", oct: "October", nov: "November", dec: "December" };

    items.forEach(item => {
      const rawMonth = item.MonthofAchievement || "Unknown";
      const shortMonth = rawMonth.split("-")[0]?.toLowerCase().slice(0, 3) || "";
      const fullMonth =
        monthMap[shortMonth] || rawMonth.replace(/[-\d]/g, "").trim() || "Unknown";

      if (!groups[fullMonth]) groups[fullMonth] = [];
      groups[fullMonth].push(item);
    });

    return groups;
  }, [items]);

  const getNameParts = (fullName: string) => {
    const parts = fullName?.split(" ") || ["Unknown"];
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
          .map(month => (
            <div key={month} className={styles.monthSection}>
              <button
                className={styles.monthHeader}
                onClick={() =>
                  setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }))
                }
                aria-expanded={expandedMonths[month]}
              >
                <h3 className={styles.monthTitle}>{month}</h3>
                <img
                  src={ArrowDown_Icon}
                  alt=""
                  className={`${styles.chevron} ${
                    expandedMonths[month] ? styles.open : ""
                  }`}
                />
              </button>

              {expandedMonths[month] && (
                <div className={styles.monthContent}>
                  {groupedItems[month].map(item => {
                    const { first, last } = getNameParts(item.Title);

                    // Typed URL extractor
                    let imageUrl: string | null = null;

                    if (item.ProfilePicture) {
                      if (typeof item.ProfilePicture === "object") {
                        imageUrl = item.ProfilePicture.Url || null;
                      } else if (typeof item.ProfilePicture === "string") {
                        imageUrl = item.ProfilePicture;
                      }
                    }

                    return (
                      <article key={item.ID} className={styles.achievement}>
                        <div className={styles.imageWrapper}>
                          {imageUrl ? (
                            <img className={styles.photo} src={imageUrl} alt={item.Title} />
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
                              <div className={styles.role}>
                                {item.Designation || "Team Member"}
                              </div>
                            </div>

                            <a
                              className={styles.sayCongratulations}
                              target="_blank"
                              href={`https://teams.microsoft.com/l/chat/0/0?users=${
                                item.ContactInformation || ""
                              }&message=Congratulations`}
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

                          {item.AchievementDescription && (
                            <p
                              className={styles.description}
                              dangerouslySetInnerHTML={{
                                __html: item.AchievementDescription
                              }}
                            />
                          )}

                          {item.ContactInformation && (
                            <p className={styles.connect}>
                              Lets connect : {item.ContactInformation}
                            </p>
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
        <button
          className={styles.loadMoreBtn}
          onClick={() => setVisibleMonths(prev => prev + 8)}
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default Achievements;
