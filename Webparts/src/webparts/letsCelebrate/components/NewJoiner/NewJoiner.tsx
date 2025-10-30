import * as React from "react";
import styles from "./NewJoiner.module.scss";

export interface INewJoinersFeedProps {
  items: any[];
  formatDate?: (isoOrText?: string) => string;
  webAbsoluteUrl?: string;
  // optional: allow passing a custom celebrations map if needed later
  celebrations?: {
    birthdays?: any[];
    anniversaries?: any[];
    newJoiners?: any[];
  };
}


const NewJoiner: React.FC<INewJoinersFeedProps> = ({ items = [], celebrations, formatDate, webAbsoluteUrl }) => {
  // Note: parent (LetsCelebrate) now controls which items are passed in.
  // This component simply renders the feed. If you also want the local
  // tab UI inside this component, we can add it — currently parent tabs are preferred.

  return (
    <>
      <div className={styles.content}>
        {items && items.length > 0 ? (
          <div className={styles.feed}>
            {items.map((item: any) => {
              return (
                <article key={item.ID || item.id || item.Title}>
                  <div className={styles.cardTop}>
                    <header className={styles.header}>
                      <h2 className={styles.name}>
                        <span className={styles.nameDecor}>{item.Title || item.name}</span>
                      </h2>
                      <div className={styles.role}>{item.Designation || item.department}</div>
                    </header>

                    <div className={styles.ctaCol}>
                      <a className={styles.sayHello}
                        target="_blank"
                        data-interception="off"
                        href={`${"https://teams.microsoft.com/l/chat/0/0?users=" + (item.UserEmail || '') + "&message=Hello"}`} rel="noreferrer">
                        <span className={styles.helloIcon} aria-hidden="true">🤝</span>
                        <span>Say Hello</span>
                      </a>
                    </div>
                  </div>

                  <div className={styles.card}>
                    <div className={styles.left}>
                      <img className={styles.photo} src={item.UserPicture || item.image} alt={item.Title || item.name || "Profile photo"} />
                    </div>

                    <div className={styles.right}>
                      <section className={styles.body}>
                        <p dangerouslySetInnerHTML={{ __html: item.Description || '' }} className={styles.para} />
                      </section>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div>
            <p>No data</p>
          </div>
        )}
      </div>
    </>
  );
};

export default NewJoiner;
