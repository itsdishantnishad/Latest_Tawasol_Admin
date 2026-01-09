// src/webparts/<yourWebPart>/components/JoinedCommunities/JoinedCommunitiesCard.tsx
import * as React from "react";
import styles from "./JoinedCommunities.module.scss";

const ArrowIcon: string = require("../../../assets/ArrowCheveronRightIcon.svg");

export interface IJoinedCommunitiesCardProps {
  items?: string[];
  onOpen?: (name: string) => void;
}

export default class JoinedCommunitiesCard
  extends React.Component<IJoinedCommunitiesCardProps> {

  public static defaultProps: Partial<IJoinedCommunitiesCardProps> = {
    items: ["Collaborative Creators", "Idea Ignitors", "Business Brainstorms"],
  };

  public render(): React.ReactElement<IJoinedCommunitiesCardProps> {
    const { items, onOpen } = this.props;

    return (
      <section className={styles.card} aria-label="Joined Communities">
        <div className={styles.title}>Joined Communities</div>

        <div className={styles.listWrap}>
          {(items || []).map((name, i) => (
            <button
              key={i}
              type="button"
              className={styles.row}
              onClick={() => onOpen && onOpen(name)}
              aria-label={`Open ${name}`}
            >
              <span className={styles.rowText} title={name}>{name}</span>

              {/*  Use SVG from assets */}
              <img src={ArrowIcon} className={styles.chev} alt="" />
            </button>
          ))}
        </div>
      </section>
    );
  }
}
