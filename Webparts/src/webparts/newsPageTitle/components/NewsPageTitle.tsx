import * as React from 'react';
import styles from './NewsPageTitle.module.scss';
import type { INewsPageTitleProps } from './INewsPageTitleProps';
// import DHREIcon from "../../assets/DHREStoriesCheck.svg";
// import AnnoucIcon from "../../assets/Announcement.svg";
// import ArrTHEWorldIcon from "../../assets/ArroundTheWorld.svg";
// import HumanCapitalIcon from "../../assets/HumanCapital.svg";
import { AuthorRow } from "./AuthorRow";
import { CategoryRow } from "./CategoryRow";



export default class NewsPageTitle extends React.Component<INewsPageTitleProps, {}> {
  public render(): React.ReactElement<INewsPageTitleProps> {

  const authorName =
      "Mohit"
    const authorEmail =
     "Mohit"; 


    return (
      <div className={styles.newsDetails}>
        {/* Chips row */}
        <CategoryRow
          category={"Human capital"}
          department={"mydep"}
          hashtags={["#internal"]}
          onTagClick={()=>{}}
        />

       <h1 className={styles.title}>{"title"}</h1>

        {/* Author row */}
        <AuthorRow
          authorName={authorName}
          authorEmail={authorEmail}
          readTime={2}
          views={200}
          publishedOn={"today"}
        />
      </div>


    );
  }
}
