// ProfileHeaderComp.tsx
// ✅ Graph-only version (Tahweel removed completely)
// ✅ Keeps: Graph info + HQ photo, SharePoint fallbacks, background SiteAssets+packaged fallback, badges, copy profile, upload photo, cleanup.

import * as React from "react";
import { Text, Spinner, SpinnerSize } from "@fluentui/react";
import {
  fetchUserProfilePicture,
  fetchCurrentUserInfo,
  fetchGraphMeInfo,
  fetchGraphMyPhotoBlob,
  getSiteUrl,
  uploadProfilePicture,
  updateUserProfilePicture,
  copyProfileToClipboard,
  saveSelectedBadge,
  loadSelectedBadge,
} from "../services/profileHeaderServices";
import styles from "./ProfileHeader.module.scss";

const ProfileIcon_URL = require("../../assets/profileCircleImg.svg");

// File name (SiteAssets)
const PROFILE_HEADER_BG_FILE_NAME = "Gradient.svg";

// Packaged fallback
const ProfileHeaderBgAsset: string = require("../../assets/Gradient.svg");

type StatItem = { label: string; value: number };
type BadgeItem = { name: string; imageUrl: string };

export interface IProfileHeaderProps {
  context: any;

  photoUrl?: string;
  fullName?: string;
  department?: string;

  stats: StatItem[];
  actionNavigateUrl?: string;

  badges?: BadgeItem[];
  selectedBadge?: BadgeItem | null;
}

interface IProfileHeaderState {
  currentPhoto: string;

  fullName: string;
  designation: string;
  department: string;

  showMenu: boolean;
  copyFeedback: boolean;
  isLoading: boolean;
  siteUrl: string;
  error: string | null;

  badgeImageErrors: { [key: string]: boolean };
  selectedBadge: BadgeItem | null;
}

export default class ProfileHeader extends React.Component<IProfileHeaderProps, IProfileHeaderState> {
  private menuRef: React.RefObject<HTMLDivElement>;
  private feedbackTimeout: number | undefined;

  private graphPhotoObjectUrl: string | null = null;

  public static defaultProps: Partial<IProfileHeaderProps> = {
    stats: [
      // ✅ only comment (remove nahi)
      // { label: "Posts", value: 3 },
      // { label: "Followers", value: 21 },
      // { label: "Following", value: 20 },
      // { label: "Praises", value: 5 },
    ],
    actionNavigateUrl: "/sites/Tawasol",
  };

  constructor(props: IProfileHeaderProps) {
    super(props);

    this.state = {
      currentPhoto: "",

      fullName: props.fullName || "",
      designation: "",
      department: props.department || "",

      showMenu: false,
      copyFeedback: false,
      isLoading: true,
      siteUrl: "",
      error: null,

      badgeImageErrors: {},
      selectedBadge: props.selectedBadge ?? null,
    };

    this.menuRef = React.createRef();
  }

  public componentDidMount(): void {
    document.addEventListener("click", this.handleOutsideClick);
    void this.initializeProfile();
  }

  public componentWillUnmount(): void {
    document.removeEventListener("click", this.handleOutsideClick);
    if (this.feedbackTimeout) window.clearTimeout(this.feedbackTimeout);

    if (this.graphPhotoObjectUrl) {
      URL.revokeObjectURL(this.graphPhotoObjectUrl);
      this.graphPhotoObjectUrl = null;
    }
  }

  private getUserEmailFromContext(): string {
    return (this.props.context?.pageContext?.user?.email || "").trim();
  }

  private upgradeSharePointPhotoToLarge(url: string): string {
    if (!url) return "";
    // typical: /_layouts/15/userphoto.aspx?size=S&accountname=...
    return url.replace(/([?&]size=)(S|M|L)/i, "$1L");
  }

  private setGraphPhotoFromBlob(blob: Blob | null): string {
    if (!blob || !blob.size) return "";

    // revoke previous object url to avoid leaks
    if (this.graphPhotoObjectUrl) {
      URL.revokeObjectURL(this.graphPhotoObjectUrl);
      this.graphPhotoObjectUrl = null;
    }

    const url = URL.createObjectURL(blob);
    this.graphPhotoObjectUrl = url;
    return url;
  }

  // ✅ Header background (SiteAssets + packaged assets fallback)
  private getHeaderBgStyle = (): React.CSSProperties => {
    const webUrl = (this.props.context?.pageContext?.web?.absoluteUrl || this.state.siteUrl || "").trim();

    const file = encodeURIComponent(PROFILE_HEADER_BG_FILE_NAME);
    const siteAssetsUrl = webUrl ? `${webUrl}/SiteAssets/${file}` : "";

    // ✅ Multiple backgrounds:
    // 1) SiteAssets file (if exists)
    // 2) Packaged asset (always available once bundled)
    // 3) Fallback gradient (if svg blocked)
    const layers: string[] = [];

    if (siteAssetsUrl) layers.push(`url("${siteAssetsUrl}")`);
    if (ProfileHeaderBgAsset) layers.push(`url("${ProfileHeaderBgAsset}")`);

    layers.push(`linear-gradient(90deg,#fbd8c7 0%,#fee2cf 35%,#ffd6b6 68%,#ffe4d1 100%)`);

    return {
      backgroundImage: layers.join(", "),
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      backgroundPosition: "center",
      width: "100%",
    };
  };

  private initializeProfile = async (): Promise<void> => {
    try {
      const siteUrl = await getSiteUrl();
      this.setState({ siteUrl });

      const savedBadge = loadSelectedBadge();
      if (savedBadge) this.setState({ selectedBadge: savedBadge });

      // (optional) context email, helpful for logs/future
      this.getUserEmailFromContext();

      // ----------------------------
      // 1) Graph info + HQ photo (preferred)
      // ----------------------------
      let graphInfo: any = null;
      try {
        graphInfo = await fetchGraphMeInfo(this.props.context);
      } catch {
        // ignore
      }

      let graphPhotoUrl = "";
      try {
        const blob = await fetchGraphMyPhotoBlob(this.props.context);
        graphPhotoUrl = this.setGraphPhotoFromBlob(blob);
      } catch {
        // ignore
      }

      // ----------------------------
      // 2) SharePoint photo + SP user info (fallbacks)
      // ----------------------------
      let spPhotoUrl = "";
      try {
        const photoUrl = await fetchUserProfilePicture();
        if (photoUrl) spPhotoUrl = this.upgradeSharePointPhotoToLarge(photoUrl);
      } catch {
        // ignore
      }

      let spInfo: { fullName: string; department: string } | null = null;
      try {
        spInfo = await fetchCurrentUserInfo();
      } catch {
        // ignore
      }

      // ----------------------------
      // Final merge priority (Graph > SPInfo > props/state)
      // ----------------------------
      const gName =
        (graphInfo?.displayName ||
          graphInfo?.fullName ||
          `${graphInfo?.givenName || ""} ${graphInfo?.surname || ""}` ||
          "").trim();

      const gDesig = (graphInfo?.jobTitle || graphInfo?.designation || "").trim();
      const gDept = (graphInfo?.department || "").trim();

      const finalFullName =
        gName || (spInfo?.fullName || "").trim() || (this.state.fullName || "").trim();

      const finalDesignation = gDesig;

      const finalDepartment =
        gDept || (spInfo?.department || "").trim() || (this.state.department || "").trim();

      // Photo preference: Graph HQ > SharePoint photo
      const finalPhoto = (graphPhotoUrl || "").trim() || (spPhotoUrl || "").trim();

      this.setState({
        currentPhoto: finalPhoto,
        fullName: finalFullName,
        designation: finalDesignation,
        department: finalDepartment,
        error: null,
      });
    } catch {
      this.setState({ error: "Failed to load profile" });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  private handleOutsideClick = (e: MouseEvent): void => {
    if (this.menuRef.current && !this.menuRef.current.contains(e.target as Node)) {
      this.setState({ showMenu: false });
    }
  };

  private toggleMenu = (): void => {
    this.setState((prev) => ({ showMenu: !prev.showMenu }));
  };

  private openFileDialog = (): void => {
    this.setState({ showMenu: false });
    document.getElementById("profile-upload-input")?.click();
  };

  private handleProfileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { siteUrl } = this.state;

      // ✅ instant preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoData = event.target?.result as string;
        this.setState({ currentPhoto: photoData });
      };
      reader.readAsDataURL(file);

      // ✅ upload to SharePoint + update user profile picture
      const uploadedUrl = await uploadProfilePicture(file, siteUrl);
      if (uploadedUrl) {
        await updateUserProfilePicture(uploadedUrl);
        this.setState({ error: null });
      }
    } catch (error: any) {
      this.setState({ error: error.message || "Failed to upload profile picture" });
    }

    e.target.value = "";
  };

  private handleCopyProfile = async (): Promise<void> => {
    try {
      const { fullName, designation, department } = this.state;
      const subtitle = (designation || "").trim() || (department || "").trim();
      await copyProfileToClipboard(fullName, subtitle);

      this.setState({ copyFeedback: true });

      if (this.feedbackTimeout) window.clearTimeout(this.feedbackTimeout);
      this.feedbackTimeout = window.setTimeout(() => {
        this.setState({ copyFeedback: false });
      }, 2000);
    } catch {
      this.setState({ error: "Failed to copy profile" });
    }
  };

  private handleBadgeImageError = (badgeName: string): void => {
    console.warn(`[ProfileHeader] Badge image failed: ${badgeName}`);
    this.setState((prev) => ({
      badgeImageErrors: { ...prev.badgeImageErrors, [badgeName]: true },
    }));
  };

  private handleSelectBadge = (badge: BadgeItem): void => {
    this.setState((prev) => {
      const isSame = prev.selectedBadge?.name === badge.name;
      const next = isSame ? null : badge;
      saveSelectedBadge(next);
      return { selectedBadge: next };
    });
  };

  private getInitials(fullName: string): string {
    const cleaned = (fullName || "").replace(/,/g, " ").trim().replace(/\s+/g, " ");
    if (!cleaned) return "";

    const parts = cleaned.split(" ").filter(Boolean);
    if (!parts.length) return "";

    const first = (parts[0] || "").charAt(0);
    const last = (parts.length > 1 ? parts[parts.length - 1] : parts[0]).charAt(0);
    return (first + last).toUpperCase();
  }

  private renderName = (): React.ReactElement => {
    const name = (this.state.fullName || "").trim().replace(/,/g, " ").replace(/\s+/g, " ");
    const parts = name.split(" ").filter(Boolean);
    const first = parts[0] || "";
    const rest = parts.slice(1);

    return (
      <div className={styles.nameRow}>
        <Text className={styles.firstName} block>
          {first}
        </Text>
        {rest.length > 0 && (
          <Text className={styles.lastName} block>
            {" "}
            {rest.join(" ")}
          </Text>
        )}
      </div>
    );
  };

  private renderAvatarCore(): React.ReactElement {
    const { isLoading, currentPhoto, fullName } = this.state;

    if (isLoading) {
      return (
        <div
          className={styles.avatar}
          style={{ background: "#f99999ff", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Spinner size={SpinnerSize.large} />
        </div>
      );
    }

    if (currentPhoto) {
      return <img className={styles.avatar} src={currentPhoto} alt="Profile" />;
    }

    const initials = this.getInitials(fullName) || "—";
    return (
      <div
        className={styles.avatar}
        title={fullName}
        aria-label="Profile initials"
        style={{
          background: "#d9d9d9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 22,
          color: "#333",
        }}
      >
        {initials}
      </div>
    );
  }

  public render(): React.ReactElement {
    const { badges } = this.props;
    const { designation, department, showMenu, copyFeedback, error, isLoading, selectedBadge, badgeImageErrors } = this.state;

    const subtitle = (designation || "").trim() || (department || "").trim() || "—";

    return (
      <div className={styles.headerWrap} style={this.getHeaderBgStyle()}>
        <div className={styles.identityCard}>
          <div className={styles.avatarWrap}>
            {this.renderAvatarCore()}

            {selectedBadge ? (
              <div className={styles.avatarBadge} title={selectedBadge.name} aria-label={`Selected badge: ${selectedBadge.name}`}>
                {badgeImageErrors[selectedBadge.name] ? (
                  <div className={styles.avatarBadgeFallback}>?</div>
                ) : (
                  <img
                    className={styles.avatarBadgeIcon}
                    src={selectedBadge.imageUrl}
                    alt={selectedBadge.name}
                    onError={() => this.handleBadgeImageError(selectedBadge.name)}
                  />
                )}
              </div>
            ) : null}
          </div>

          <div className={styles.metaCol}>
            {this.renderName()}
            <Text className={styles.department} block>
              {subtitle}
            </Text>
          </div>
        </div>

        <div className={styles.flexCol}>
          <div className={styles.actions} role="group" aria-label="Header actions">
            <button
              className={styles.iconBtn}
              title={copyFeedback ? "Profile Copied!" : "Copy Profile"}
              aria-label={copyFeedback ? "Profile Copied!" : "Copy Profile"}
              onClick={this.handleCopyProfile}
              type="button"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                <path
                  d="M14.9922 17.5H16.5022C19.5222 17.5 22.0022 15.03 22.0022 12C22.0022 8.98 19.5322 6.5 16.5022 6.5H14.9922"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.00391 6.5H7.50391C4.47391 6.5 2.00391 8.97 2.00391 12C2.00391 15.02 4.47391 17.5 7.50391 17.5H9.00391"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M8.00391 12H16.0039" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {copyFeedback && (
              <div className={styles.copyPill} role="status" aria-live="polite">
                <span className={styles.copyDot} aria-hidden="true">
                  !
                </span>
                <span className={styles.copyText}>Profile Copied</span>
                <button type="button" className={styles.copyClose} aria-label="Close" onClick={() => this.setState({ copyFeedback: false })}>
                  ×
                </button>
              </div>
            )}

            <div className={styles.kebabWrapper} ref={this.menuRef}>
              <button
                className={`${styles.iconBtn} ${styles.kebabBtn}`}
                title="More options"
                aria-label="More options"
                onClick={this.toggleMenu}
                type="button"
                disabled={isLoading}
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>

              {showMenu && (
                <div className={styles.dropdownMenu}>
                  <button type="button" className={styles.changePhotoBtn} onClick={this.openFileDialog} role="menuitem">
                    <img src={ProfileIcon_URL} className={styles.changePhotoIcon} alt="" />
                    <span className={styles.changePhotoLabel}>Change Profile Photo</span>
                  </button>
                </div>
              )}
            </div>

            <input
              id="profile-upload-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={this.handleProfileChange}
              aria-hidden="true"
            />
          </div>

          {error && (
            <div className={styles.errorMessage} role="alert">
              {error}
            </div>
          )}

          {badges && badges.length > 0 ? (
            <div className={styles.badgesRow} aria-label="Badges">
              {badges.map((b, i) => (
                <div
                  className={styles.badgeItem}
                  key={`${b.name}-${i}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => this.handleSelectBadge(b)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") this.handleSelectBadge(b);
                  }}
                  aria-label={`Select badge ${b.name}`}
                >
                  {badgeImageErrors[b.name] ? (
                    <div className={styles.badgePlaceholder} title={`Failed to load: ${b.name}`}>
                      ?
                    </div>
                  ) : (
                    <img className={styles.badgeImg} src={b.imageUrl} alt={b.name} onError={() => this.handleBadgeImageError(b.name)} />
                  )}
                  <div className={styles.badgeName}>{b.name}</div>
                </div>
              ))}
            </div>
          ) : null}

          {/* ✅ ONLY COMMENT (remove nahi) */}
          {/*
          <div className={styles.statsRow} role="region" aria-label="Profile stats">
            {stats.slice(0, 4).map(this.renderStat)}
          </div>
          */}
        </div>
      </div>
    );
  }
}
