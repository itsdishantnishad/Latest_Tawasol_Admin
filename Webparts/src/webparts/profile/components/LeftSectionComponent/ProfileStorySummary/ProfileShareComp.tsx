

// src/webparts/.../ProfileShareComp.tsx
import * as React from "react";
import styles from "./ProfileShare.module.scss";

const  discussionIcon  = require("../../../assets/DiscussionIcon.svg")
const  questionIcon  =  require("../../../assets/QuestionIcon.svg")
const  praiseIcon  =   require("../../../assets/PraiseIcon.svg")
const pollIcon    =   require("../../../assets/PollIcon.svg")
// No props required anymore (optional override kept if you ever need it)
export interface IProfileShareCompProps {
  avatarUrlOverride?: string;
  onShareClick?: () => void;
}

interface IProfileShareCompState {
  avatarUrl: string;
  loading: boolean;
}

export default class ProfileShareComp
  extends React.Component<IProfileShareCompProps, IProfileShareCompState> {

  public state: IProfileShareCompState = {
    avatarUrl: "",
    loading: true,
  };

  private _buildUserPhotoUrl(username: string | undefined): string {
    const base = "/_layouts/15/userphoto.aspx?size=M";
    return username ? `${base}&username=${encodeURIComponent(username)}` : base;
  }

  private async _resolveAvatarUrl(): Promise<string> {
    // 0) explicit override wins
    if (this.props.avatarUrlOverride) return this.props.avatarUrlOverride;

    // 1) Try PeopleManager (PictureUrl)
    try {
      const res = await fetch("/_api/SP.UserProfiles.PeopleManager/GetMyProperties", {
        headers: { accept: "application/json;odata=nometadata" },
        credentials: "same-origin",
      });
      if (res.ok) {
        const me = await res.json();
        if (me?.PictureUrl) return me.PictureUrl as string;
      }
    } catch { /* ignore and keep falling back */ }

    // 2) Try current user (Email/LoginName) → userphoto.aspx
    try {
      const res2 = await fetch("/_api/web/currentuser?$select=Email,LoginName", {
        headers: { accept: "application/json;odata=nometadata" },
        credentials: "same-origin",
      });
      if (res2.ok) {
        const cu = await res2.json();
        const username: string =
          (cu?.Email as string) || (cu?.LoginName as string) || "";
        if (username) return this._buildUserPhotoUrl(username);
      }
    } catch { /* ignore */ }
    return this._buildUserPhotoUrl(undefined);
  }

  public async componentDidMount(): Promise<void> {
    const url = await this._resolveAvatarUrl();
    this.setState({ avatarUrl: url, loading: false });
  }

  private Item = (props: { src: string; alt: string; label: string }) => (
    <button type="button" className={styles.itemBtn}>
      <span className={styles.itemIcon}>
        <img src={props.src} alt={props.alt} />
      </span>
      <span className={styles.itemText}>{props.label}</span>
    </button>
  );

  public render(): React.ReactElement<IProfileShareCompProps> {
    const { onShareClick } = this.props;
    const { avatarUrl } = this.state;

    return (
      <div className={styles.wrap}>
        {/* Top row: avatar + prompt */}
        <div className={styles.topRow} onClick={onShareClick} role="button" tabIndex={0}>
          <img
            className={styles.avatar}
            src={avatarUrl}
            alt="Your avatar"
          />
          <span className={styles.prompt}>Share thoughts, ideas, or updates</span>
        </div>

        {/* Divider */}
        <div className={styles.hr} />

        {/* Bottom row: actions */}
        <div className={styles.actionsRow}>
          <this.Item src={discussionIcon} alt="Discussion" label="Discussion" />
          <this.Item src={questionIcon}   alt="Question"   label="Question" />
          <this.Item src={praiseIcon}     alt="Praise"     label="Praise" />
          <this.Item src={pollIcon}       alt="Poll"       label="Poll" />
        </div>
      </div>
    );
  }
}
