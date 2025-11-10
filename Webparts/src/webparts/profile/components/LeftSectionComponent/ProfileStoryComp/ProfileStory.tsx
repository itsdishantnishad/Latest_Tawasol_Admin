// import * as React from "react";
// import styles from "./ProfileStory.module.scss";
// import { STORIES, StoryItem } from "./stories.data";
// import "@pnp/sp/profiles";
// import "@pnp/sp/webs";
// import "@pnp/sp/site-users/web";

// interface IState { mePhotoUrl: string; }

// function timeAgo(iso: string): string {
//   const nowMs = Date.now();
//   const thenMs = new Date(iso).getTime();
//   const diffSec = Math.round((thenMs - nowMs) / 1000);
//   const abs = Math.abs(diffSec);
//   const minute = 60, hour = 60 * minute, day = 24 * hour, week = 7 * day;

//   let value: number; let unit: "second" | "minute" | "hour" | "day" | "week";
//   if (abs < minute)       { value = diffSec;               unit = "second"; }
//   else if (abs < hour)    { value = Math.round(diffSec/minute); unit = "minute"; }
//   else if (abs < day)     { value = Math.round(diffSec/hour);   unit = "hour"; }
//   else if (abs < week)    { value = Math.round(diffSec/day);    unit = "day"; }
//   else                    { value = Math.round(diffSec/week);   unit = "week"; }

//   const RTF = (Intl as any)?.RelativeTimeFormat;
//   if (RTF) return new RTF(undefined, { numeric: "auto" }).format(value, unit);

//   const absVal = Math.abs(value);
//   const label = absVal === 1 ? unit : `${unit}s`;
//   return value < 0 ? `${absVal} ${label} ago` : `in ${absVal} ${label}`;
// }


// export default class ProfileStoryList extends React.Component<{}, IState> {
//   public state: IState = { mePhotoUrl: "" };
//   private _buildMePhoto(emailOrLogin?: string): string {
//     const base = "/_layouts/15/userphoto.aspx?size=M";
//     return emailOrLogin ? `${base}&username=${encodeURIComponent(emailOrLogin)}` : base;
//   }

//   public async componentDidMount(): Promise<void> {
//     try {
//       const me = await sp().profiles.myProperties();
//       if (me?.PictureUrl) {
//         this.setState({ mePhotoUrl: me.PictureUrl });
//         return;
//       }
//     } catch { }
//     try {
//       const currentUser = await sp().web.currentUser();
//       const username = (currentUser?.Email as string) || (currentUser?.LoginName as string) || "";
//       this.setState({ mePhotoUrl: this._buildMePhoto(username) });
//       return;
//     } catch { /* ignore */ }
//     this.setState({ mePhotoUrl: this._buildMePhoto() });
//   }

//   private renderHeaderRow = (s: StoryItem) => (
//     <div className={styles.headerRow} key={`h-${s.id}`}>
//       <span className={styles.timeAgo}>{timeAgo(s.created)}</span>
//       <button className={styles.kebab} aria-label="More options" type="button">
//         <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
//       </button>
//     </div>
//   );

//   private renderProfileLine = (s: StoryItem) => {
//     const avatarSrc = s.avatar === "me" ? this.state.mePhotoUrl : (s.avatar || this.state.mePhotoUrl);
//     return (
//       <div className={styles.profileLine} key={`p-${s.id}`}>
//         <img className={styles.avatar} src={avatarSrc} alt={`${s.name} avatar`} />
//         <div className={styles.profileMeta}>
//           <div className={styles.name}>{s.name}</div>
//           <div className={styles.titleDept}>{s.titleAndDept}</div>
//         </div>
//       </div>
//     );
//   };

//   private renderBody = (s: StoryItem) => (
//     <div className={styles.bodyRow} key={`b-${s.id}`}>
//       {s.imageUrl ? (
//         <img className={styles.storyImage} src={s.imageUrl} alt="" />
//       ) : (
//         <div className={styles.storyImagePlaceholder} />
//       )}
//       <div className={styles.storyTextCol}>
//         <div className={styles.storyText}>
//           {s.content.split("\n").map((ln, i) => <p key={i}>{ln}</p>)}
//         </div>
//         <button className={styles.seeMore} type="button">see more…</button>
//       </div>
//     </div>
//   );

//   private renderCard = (s: StoryItem) => (
//     <article className={styles.card} key={s.id}>
//       {this.renderHeaderRow(s)}
//       {this.renderProfileLine(s)}
//       {this.renderBody(s)}
//     </article>
//   );

//   public render(): React.ReactElement {
//     return <div className={styles.listWrap}>{STORIES.map(this.renderCard)}</div>;
//   }
// }


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
