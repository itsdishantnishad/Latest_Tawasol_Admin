/* eslint-disable react/jsx-key */
import * as React from "react";
import styles from "./NewJoiner.module.scss";
// import { INewJoiner } from "./NewJoinerData";

export interface INewJoinersFeedProps {
  items: any[];
  formatDate?: (isoOrText?: string) => string;
  webAbsoluteUrl?: string;
}

const defaultCelebrations = {
    birthdays: [
        { id: '1', name: 'John Doe', department: 'Engineering', date: 'Today', type: 'birthday' as const, image: 'https://i.pravatar.cc/150?img=1' },
        { id: '2', name: 'Jane Smith', department: 'Marketing', date: 'Tomorrow', type: 'birthday' as const, image: 'https://i.pravatar.cc/150?img=2' },
        { id: '3', name: 'Mike Johnson', department: 'Sales', date: 'Dec 15', type: 'birthday' as const, image: 'https://i.pravatar.cc/150?img=3' },
        { id: '4', name: 'Sarah Williams', department: 'HR', date: 'Dec 20', type: 'birthday' as const, image: 'https://i.pravatar.cc/150?img=4' },
    ],
    anniversaries: [
        { id: '5', name: 'Robert Brown', department: 'Engineering', date: '5 Years', type: 'anniversary' as const, image: 'https://i.pravatar.cc/150?img=5' },
        { id: '6', name: 'Emily Davis', department: 'Operations', date: '10 Years', type: 'anniversary' as const, image: 'https://i.pravatar.cc/150?img=6' },
        { id: '7', name: 'David Wilson', department: 'Finance', date: '3 Years', type: 'anniversary' as const, image: 'https://i.pravatar.cc/150?img=7' },
        { id: '8', name: 'Lisa Anderson', department: 'Legal', date: '7 Years', type: 'anniversary' as const, image: 'https://i.pravatar.cc/150?img=8' },
    ],
    newJoiners: [
        { id: '9', name: 'Tom Harris', department: 'Engineering', date: 'This Week', type: 'newJoiner' as const, image: 'https://i.pravatar.cc/150?img=9' },
        { id: '10', name: 'Anna Martin', department: 'Design', date: 'This Week', type: 'newJoiner' as const, image: 'https://i.pravatar.cc/150?img=10' },
    ],
};

const NewJoiner: React.FC<INewJoinersFeedProps> = ({ items } , props) => {

  const [activeTab, setActiveTab] = React.useState<'birthdays' | 'anniversaries' | 'newJoiners'>('birthdays');
      const celebrations = props.celebrations || defaultCelebrations;
  
      const tabs = [
          { key: 'birthdays' as const, label: 'Birthdays', count: celebrations.birthdays.length },
          { key: 'anniversaries' as const, label: 'Anniversaries', count: celebrations.anniversaries.length },
          { key: 'newJoiners' as const, label: 'New Joiners', count: celebrations.newJoiners.length },
      ];
  
      const currentCelebrations = celebrations[activeTab];

  return (
    <>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
            <button
                key={tab.key}
                className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(tab.key)}
            >
                {tab.label} <span className={styles.count}>{tab.count}</span>
            </button>
        ))}
      </div>

      <div className={styles.content}>
        {currentCelebrations.length > 0 ? (
            <div className={styles.celebrationIcon}>
                {/* Cake emoji as placeholder */}
            </div>
        ) : (
            <div className={styles.emptyState}>
                <p>No {tabs.find(t => t.key === activeTab)?.label.toLowerCase()} to celebrate right now</p>
            </div>
        )}
    </div>

      <div className={styles.feed}>
        {items.map((item: any) => {
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
                    <span className={styles.helloIcon} aria-hidden="true">🤝</span>
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
    </>
  );
};

export default NewJoiner;
