


import * as React from "react";
import styles from "./ProfileStory.module.scss";
import { STORIES, StoryItem } from "./stories.data";

import "@pnp/sp/profiles";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";

import { spfi, SPFx, SPFI } from "@pnp/sp";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IProfileStoryProps {
  context: WebPartContext; 
}

interface IProfileStoryState {
  photoUrl: string;
}

function getTimeAgo(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffSeconds = Math.round((then - now) / 1000);
  const abs = Math.abs(diffSeconds);

  const minute = 60, hour = 60 * minute, day = 24 * hour, week = 7 * day;
  let value = diffSeconds;
  let unit: "second" | "minute" | "hour" | "day" | "week" = "second";

  if (abs >= week) { value = Math.round(diffSeconds / week); unit = "week"; }
  else if (abs >= day) { value = Math.round(diffSeconds / day); unit = "day"; }
  else if (abs >= hour) { value = Math.round(diffSeconds / hour); unit = "hour"; }
  else if (abs >= minute) { value = Math.round(diffSeconds / minute); unit = "minute"; }

  const RTF = (Intl as any)?.RelativeTimeFormat;
  if (RTF) return new RTF(undefined, { numeric: "auto" }).format(value, unit);

  const label = Math.abs(value) === 1 ? unit : `${unit}s`;
  return value < 0 ? `${Math.abs(value)} ${label} ago` : `in ${Math.abs(value)} ${label}`;
}

export default class ProfileStory extends React.Component<IProfileStoryProps, IProfileStoryState> {
  public state: IProfileStoryState = { photoUrl: "" };
  private sp: SPFI | null = null;

  public async componentDidMount(): Promise<void> {
    try {
      this.sp = spfi().using(SPFx(this.props.context));
    } catch {
      const siteUrl =
        (window as any)?._spPageContextInfo?.webAbsoluteUrl ||
        document.location.origin;
      this.sp = spfi(siteUrl);
    }

    try {
      const profile = await this.sp.profiles.myProperties();
      if (profile?.PictureUrl) {
        this.setState({ photoUrl: profile.PictureUrl });
        return;
      }
    } catch {console.log(console.error()
    )}
    try {
      const currentUser = await this.sp.web.currentUser();
      const email = currentUser?.Email || currentUser?.LoginName || "";
      this.setState({ photoUrl: this.getUserPhoto(email) });
    } catch {
      this.setState({ photoUrl: this.getUserPhoto() });
    }
  }
  private getUserPhoto(login?: string): string {
    const base = "/_layouts/15/userphoto.aspx?size=M";
    return login ? `${base}&username=${encodeURIComponent(login)}` : base;
  }
  private renderHeader = (story: StoryItem) => (
    <div className={styles.headerRow}>
      <span className={styles.timeAgo}>{getTimeAgo(story.created)}</span>
      <button className={styles.kebab} aria-label="More options">
        <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
      </button>
    </div>
  );
  private renderProfile = (story: StoryItem) => {
    const avatar =
      story.avatar === "me"
        ? this.state.photoUrl
        : story.avatar || this.state.photoUrl;

    return (
      <div className={styles.profileLine}>
        <img className={styles.avatar} src={avatar} alt={`${story.name} avatar`} />
        <div className={styles.profileMeta}>
          <div className={styles.name}>{story.name}</div>
          <div className={styles.titleDept}>{story.titleAndDept}</div>
        </div>
      </div>
    );
  };

  private renderBody = (story: StoryItem) => (
    <div className={styles.bodyRow}>
      {story.imageUrl ? (
        <img className={styles.storyImage} src={story.imageUrl} alt="" />
      ) : (
        <div className={styles.storyImagePlaceholder} />
      )}
      <div className={styles.storyTextCol}>
        <div className={styles.storyText}>
          {story.content.split("\n").map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </div>
        <button className={styles.seeMore}>See more…</button>
      </div>
    </div>
  );
  private renderStoryCard = (story: StoryItem) => (
    <article className={styles.card} key={story.id}>
      {this.renderHeader(story)}
      {this.renderProfile(story)}
      {this.renderBody(story)}
    </article>
  );

  public render(): React.ReactElement {
    return (
      <div className={styles.listWrap}>
        {STORIES.map(this.renderStoryCard)}
      </div>
    );
  }
}
