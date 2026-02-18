import * as React from "react";
import styles from "./NewJoiner.module.scss";

export interface INewJoinersFeedProps {
  items: any[];
  formatDate?: (isoOrText?: string) => string;
  webAbsoluteUrl?: string;
  celebrations?: {
    birthdays?: any[];
    anniversaries?: any[];
    newJoiners?: any[];
  };
}

const PAGE_SIZE = 5;

const NewJoiner: React.FC<INewJoinersFeedProps> = ({ items = [] }) => {
  const [visibleCount, setVisibleCount] = React.useState<number>(PAGE_SIZE);

  const sortedItems = React.useMemo(() => {
    if (!items || items.length === 0) return [];

    return [...items].sort((a, b) => {
      const dateA = new Date(a.JoiningDate || a.joiningDate || a.date || "").getTime();
      const dateB = new Date(b.JoiningDate || b.joiningDate || b.date || "").getTime();
      return dateA - dateB;
    });
  }, [items]);

  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [items]);

  const itemsToRender = sortedItems.slice(0, visibleCount);
  const canLoadMore = visibleCount < sortedItems.length;

  const splitName = (fullName: string) => {
    const cleaned = (fullName || "").trim().replace(/\s+/g, " ");
    if (!cleaned) return { first: "", rest: "" };

    const parts = cleaned.split(" ");
    const first = parts[0];
    const rest = parts.slice(1).join(" ");
    return { first, rest };
  };

  return (
    <div className={styles.content}>
      {sortedItems.length > 0 ? (
        <div className={styles.feed}>
          {itemsToRender.map((item: any) => {
            const fullName = item.Title || item.name || "";
            const { first, rest } = splitName(fullName);

            const emailToUse: string | undefined = item?.TIRUserEmail?.trim();
            const teamsChatUrl = emailToUse
              ? `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(emailToUse)}`
              : "";

            return (
              <article key={item.ID || item.id || item.Title}>
                <div className={styles.cardTop}>
                  <header className={styles.header}>
                    <h2 className={styles.name}>
                      <span className={styles.firstName}>{first}</span>
                      {rest ? <span className={styles.lastName}> {rest}</span> : null}
                    </h2>
                    <div className={styles.role}>{item.Designation || item.department}</div>
                  </header>

                  <div className={styles.ctaCol}>
                    {emailToUse ? (
                      <a
                        className={styles.sayHello}
                        target="_blank"
                        rel="noreferrer"
                        data-interception="off"
                        href={teamsChatUrl}
                      >
                        <span className={styles.helloIcon} aria-hidden="true">
                          🤝
                        </span>
                        <span>Say Hello</span>
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.left}>
                    <img
                      className={styles.photo}
                      src={item.UserPicture || item.image}
                      alt={fullName || "Profile photo"}
                    />
                  </div>

                  <div className={styles.right}>
                    <section className={styles.body}>
                      <p
                        className={styles.para}
                        dangerouslySetInnerHTML={{ __html: item.Description || "" }}
                      />
                    </section>
                  </div>
                </div>
              </article>
            );
          })}

          {canLoadMore && (
            <div className={styles.loadMoreWrap}>
              <button
                type="button"
                className={styles.loadMoreBtn}
                onClick={() => setVisibleCount((c) => Math.min(c + PAGE_SIZE, sortedItems.length))}
                aria-label="Load more new joiners"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>No New Joiners</p>
        </div>
      )}
    </div>
  );
};

export default NewJoiner;