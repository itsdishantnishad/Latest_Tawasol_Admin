import * as React from "react";
import styles from "./NewJoiner.module.scss";
import { INewJoiner } from "./NewJoinerData";

export interface INewJoinersFeedProps {
  items: INewJoiner[];
  formatDate?: (isoOrText?: string) => string;
  webAbsoluteUrl?: string;
}



const NewJoiner: React.FC<INewJoinersFeedProps> = ({ items = [] }) => {


  return (
    <div className={styles.feed}>
      {items.map((p: INewJoiner) => {
        const first = p.firstNameDecor ? p.firstNameDecor : "";
        const last = p.lastName ? p.lastName : "";
        const altText = (first + " " + last).trim();
       

        return (
          <article key={p.id} className={styles.card}>
            <div className={styles.left}>
              <img className={styles.photo} src={""} alt={altText || "Profile photo"} />
            </div>

            <div className={styles.right}>
              <header className={styles.header}>
                <h2 className={styles.name}>
                  <span className={styles.nameDecor}>{first}</span> {last}
                </h2>
                <div className={styles.role}>{p.designation}</div>
              </header>

              <section className={styles.meta}>
                {p.effectiveDate && (
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
              </section>

              <section className={styles.body}>
                {(p.intro || []).map((t: string, i: number) => (
                  <p key={i} className={styles.para}>{t}</p>
                ))}
              </section>
            </div>

            <div className={styles.ctaCol}>
              {p.sayHelloUrl && (
                <a className={styles.sayHello} href={p.sayHelloUrl}>
                  <span className={styles.helloIcon} aria-hidden="true">💬</span>
                  <span>Say Hello</span>
                </a>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default NewJoiner;
