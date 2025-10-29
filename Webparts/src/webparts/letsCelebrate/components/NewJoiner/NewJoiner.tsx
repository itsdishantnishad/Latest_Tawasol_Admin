/* eslint-disable react/jsx-key */
import * as React from "react";
import styles from "./NewJoiner.module.scss";
// import { INewJoiner } from "./NewJoinerData";

export interface INewJoinersFeedProps {
  items: any[];
  formatDate?: (isoOrText?: string) => string;
  webAbsoluteUrl?: string;
}



const NewJoiner: React.FC<INewJoinersFeedProps> = ({ items }) => {


  return (
    <div className={styles.feed}>
      {items.map((item: any) => {
        // const first = p.firstNameDecor ? p.firstNameDecor : "";
        // const last = p.lastName ? p.lastName : "";
        // const altText = (first + " " + last).trim();


        return (
          <article>
            <div className={styles.cardTop}>
              <header className={styles.header}>
                <h2 className={styles.name}>
                  <span className={styles.nameDecor}>{item.Title}</span>
                </h2>
                <div className={styles.role}>{item.Designation}</div>
              </header>

              <div className={styles.ctaCol}>
                <a className={styles.sayHello}
                  target="_blank"
                  data-interception="off"
                  href={`${"https://teams.microsoft.com/l/chat/0/0?users=" + item.UserEmail + "&message=Hello"}`} rel="noreferrer">
                  <span className={styles.helloIcon} aria-hidden="true">💬</span>
                  <span>Say Hello</span>
                </a>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.left}>
                <img className={styles.photo} src={item.UserPicture} alt={item.Title || "Profile photo"} />
              </div>

              <div className={styles.right}>
                {/* <header className={styles.header}>
                  <h2 className={styles.name}>
                    <span className={styles.nameDecor}>{item.Title}</span>
                  </h2>
                  <div className={styles.role}>{item.Designation}</div>
                </header> */}

                {/* <section className={styles.meta}>
                  {item.effectiveDate && (
                    <div className={styles.metaRow}>
                      <strong>Effective: </strong>
                      <span>Date</span>
                    </div>
                  )}
                  {p.reportingTo && (
                    <div className={styles.metaRow}>
                      <strong>Reports to: </strong>
                      <span>{p.reportingTo}</span>
                    </div>
                  )}
                </section> */}

                <section className={styles.body}>
                  <p dangerouslySetInnerHTML={{ __html: item.Description }} className={styles.para} />
                </section>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default NewJoiner;
