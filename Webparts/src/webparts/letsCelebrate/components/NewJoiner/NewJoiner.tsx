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

const NewJoiner: React.FC<INewJoinersFeedProps> = ({
  items = [],
  celebrations,
  formatDate,
  webAbsoluteUrl
}) => {

  // -------------------------
  // 🟦 FIX 1: SORT BY JOINING DATE
  // -------------------------
  const sortedItems = React.useMemo(() => {
    if (!items || items.length === 0) return [];

    return [...items].sort((a, b) => {
      const dateA = new Date(a.JoiningDate || a.joiningDate || a.date || "").getTime();
      const dateB = new Date(b.JoiningDate || b.joiningDate || b.date || "").getTime();
      return dateA - dateB;          // earliest first
      // return dateB - dateA;        // latest first (if needed)
    });
  }, [items]);


  return (
    <>
      <div className={styles.content}>
        {sortedItems.length > 0 ? (
          <div className={styles.feed}>
            {sortedItems.map((item: any) => {
              return (
                <article key={item.ID || item.id || item.Title}>
                  <div className={styles.cardTop}>
                    <header className={styles.header}>
                      <h2 className={styles.name}>
                        <span className={styles.nameDecor}>
                          {item.Title || item.name}
                        </span>
                      </h2>
                      <div className={styles.role}>
                        {item.Designation || item.department}
                      </div>
                    </header>

                    <div className={styles.ctaCol}>
                      {(() => {
                      //  const dummyEmail = "dishant.nishad@essencetechlabs.com"; 
                       // const emailToUse = (item?.UserEmail && item.UserEmail.trim()) || dummyEmail;
                        const emailToUse = item?.UserEmail?.trim();
                        const teamsChatUrl = `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(
                          emailToUse
                        )}&message=${encodeURIComponent("Hello")}`;
                        return (
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
                        );
                      })()}
                    </div>
                  </div>

                  <div className={styles.card}>
                    <div className={styles.left}>
                      <img
                        className={styles.photo}
                        src={item.UserPicture || item.image}
                        alt={item.Title || item.name || "Profile photo"}
                      />
                    </div>

                    <div className={styles.right}>
                      <section className={styles.body}>
                        <p
                          dangerouslySetInnerHTML={{
                            __html: item.Description || ""
                          }}
                          className={styles.para}
                        />
                      </section>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          // -------------------------
          // 🟦 FIX 2: CLEAR EMPTY MESSAGE
          // -------------------------
          <div className={styles.emptyState}>
            <p>No New Joiners</p>
          </div>
        )}
      </div>
    </>
  );
};

export default NewJoiner;
