
import * as React from "react";
import { Text, Spinner, SpinnerSize } from "@fluentui/react";
import {
  fetchUserProfilePicture,
  getSiteUrl,
  uploadProfilePicture,
  updateUserProfilePicture,
  copyProfileToClipboard,
  fetchCurrentUserInfo,
  saveSelectedBadge,
  loadSelectedBadge,
} from "../services/profileHeaderServices";
import styles from "./ProfileHeader.module.scss";

const ProfileIcon_URL = require("../../assets/profileCircleImg.svg");

type StatItem = { label: string; value: number };
type BadgeItem = { name: string; imageUrl: string };

export interface IProfileHeaderProps {
  photoUrl?: string;
  fullName?: string;
  department?: string;
  stats: StatItem[];
  actionNavigateUrl?: string;
  badges?: BadgeItem[];

  // ✅ make optional (so parent doesn't have to pass)
  selectedBadge?: BadgeItem | null;
}

interface IProfileHeaderState {
  currentPhoto: string;
  fullName: string;
  department: string;
  showMenu: boolean;
  copyFeedback: boolean;
  isLoading: boolean;
  siteUrl: string;
  error: string | null;
  badgeImageErrors: { [key: string]: boolean };

  // ✅ NEW
  selectedBadge: BadgeItem | null;
}

export default class ProfileHeader extends React.Component<
  IProfileHeaderProps,
  IProfileHeaderState
> {
  private menuRef: React.RefObject<HTMLDivElement>;
  private feedbackTimeout: number | undefined;

  public static defaultProps: Partial<IProfileHeaderProps> = {
    stats: [
      { label: "Posts", value: 3 },
      { label: "Followers", value: 21 },
      { label: "Following", value: 20 },
      { label: "Praises", value: 5 },
    ],
    actionNavigateUrl: "/sites/Tawasol",
  };

  constructor(props: IProfileHeaderProps) {
    super(props);

    this.state = {
      currentPhoto: "",
      fullName: props.fullName || "",
      department: props.department || "",
      showMenu: false,
      copyFeedback: false,
      isLoading: true,
      siteUrl: "",
      error: null,
      badgeImageErrors: {},

      // ✅ NEW
      selectedBadge: props.selectedBadge ?? null,
    };

    this.menuRef = React.createRef();
  }

  componentDidMount(): void {
    document.addEventListener("click", this.handleOutsideClick);
    this.initializeProfile();
  }

  componentWillUnmount(): void {
    document.removeEventListener("click", this.handleOutsideClick);
    if (this.feedbackTimeout) {
      window.clearTimeout(this.feedbackTimeout);
    }
  }

  private initializeProfile = async (): Promise<void> => {
    try {
      const siteUrl = await getSiteUrl();
      this.setState({ siteUrl });

      const photoUrl = await fetchUserProfilePicture();
      if (photoUrl) {
        this.setState({ currentPhoto: photoUrl });
      }

      const userInfo = await fetchCurrentUserInfo();
      if (userInfo) {
        this.setState({
          fullName: userInfo.fullName,
          department: userInfo.department || "SharePoint Developer",
        });
      }

      // ✅ NEW: load saved selected badge (if any)
      const saved = loadSelectedBadge();
      if (saved) {
        this.setState({ selectedBadge: saved });
      }
    } catch (error) {
      this.setState({ error: "Failed to load profile" });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  private handleOutsideClick = (e: MouseEvent): void => {
    if (
      this.menuRef.current &&
      !this.menuRef.current.contains(e.target as Node)
    ) {
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

  private handleProfileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { siteUrl } = this.state;

      const reader = new FileReader();
      reader.onload = (event) => {
        const photoData = event.target?.result as string;
        this.setState({ currentPhoto: photoData });
      };
      reader.readAsDataURL(file);

      const uploadedUrl = await uploadProfilePicture(file, siteUrl);
      if (uploadedUrl) {
        await updateUserProfilePicture(uploadedUrl);
        this.setState({ error: null });
      }
    } catch (error: any) {
      this.setState({
        error: error.message || "Failed to upload profile picture",
      });
    }
    e.target.value = "";
  };

  private handleCopyProfile = async (): Promise<void> => {
    try {
      const { fullName, department } = this.state;

      await copyProfileToClipboard(fullName, department);

      this.setState({ copyFeedback: true, error: null });

      if (this.feedbackTimeout) window.clearTimeout(this.feedbackTimeout);
      this.feedbackTimeout = window.setTimeout(() => {
        this.setState({ copyFeedback: false });
      }, 2000);
    } catch (error) {
      this.setState({ error: "Failed to copy profile" });
    }
  };

  // ✅ Handle badge image load errors
  private handleBadgeImageError = (badgeName: string): void => {
    console.warn(`[ProfileHeader] Badge image failed: ${badgeName}`);
    this.setState((prev) => ({
      badgeImageErrors: {
        ...prev.badgeImageErrors,
        [badgeName]: true,
      },
    }));
  };

  // ✅ NEW: click badge -> select/unselect + persist
  private handleSelectBadge = (badge: BadgeItem): void => {
    this.setState((prev) => {
      const isSame = prev.selectedBadge?.name === badge.name;
      const next = isSame ? null : badge;

      saveSelectedBadge(next);
      return { selectedBadge: next };
    });
  };

  private renderName = (): React.ReactElement => {
    const name = (this.state.fullName || "").trim();
    const [first, ...rest] = name.split(" ");

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

  private renderStat = (s: StatItem, idx: number): React.ReactElement => (
    <div className={styles.statBox} key={idx}>
      <div className={styles.statNumber}>{s.value}</div>
      <div className={styles.statLabel}>{s.label}</div>
    </div>
  );

  public render(): React.ReactElement {
    const { stats, badges } = this.props;

    const {
      currentPhoto,
      department,
      showMenu,
      copyFeedback,
      isLoading,
      error,
      badgeImageErrors,
      selectedBadge,
    } = this.state;

    return (
      <div className={styles.headerWrap}>
        <div className={styles.identityCard}>
          {/* ✅ Wrap avatar to support badge overlay */}
          <div className={styles.avatarWrap}>
            {isLoading ? (
              <div
                className={styles.avatar}
                style={{
                  background: "#e0e0e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Spinner size={SpinnerSize.large} />
              </div>
            ) : (
              <img className={styles.avatar} src={currentPhoto} alt="Profile" />
            )}

            {/* ✅ Selected badge overlay (like your screenshot) */}
            {selectedBadge ? (
              <div
                className={styles.avatarBadge}
                title={selectedBadge.name}
                aria-label={`Selected badge: ${selectedBadge.name}`}
              >
                {badgeImageErrors[selectedBadge.name] ? (
                  <div className={styles.avatarBadgeFallback}>?</div>
                ) : (
                  <img
                    className={styles.avatarBadgeIcon}
                    src={selectedBadge.imageUrl}
                    alt={selectedBadge.name}
                    onError={() =>
                      this.handleBadgeImageError(selectedBadge.name)
                    }
                  />
                )}
              </div>
            ) : null}
          </div>

          <div className={styles.metaCol}>
            {this.renderName()}
            <Text className={styles.department} block>
              {department}
            </Text>
          </div>
        </div>

        <div className={styles.flexCol}>
          <div
            className={styles.actions}
            role="group"
            aria-label="Header actions"
          >
            {/* COPY ICON (unchanged) */}
            <button
              className={styles.iconBtn}
              aria-label="Copy Profile"
              onClick={this.handleCopyProfile}
              type="button"
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
              >
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
                <path
                  d="M8.00391 12H16.0039"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* FLOATING PILL (unchanged) */}
            {copyFeedback && (
              <div className={styles.copyPill} role="status" aria-live="polite">
                <span className={styles.copyDot} aria-hidden="true">
                  !
                </span>
                <span className={styles.copyText}>Profile Copied</span>
                <button
                  type="button"
                  className={styles.copyClose}
                  aria-label="Close"
                  onClick={() => this.setState({ copyFeedback: false })}
                >
                  ×
                </button>
              </div>
            )}

            {/* KEBAB (unchanged) */}
            <div className={styles.kebabWrapper} ref={this.menuRef}>
              <button
                className={`${styles.iconBtn} ${styles.kebabBtn}`}
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
                  <button
                    type="button"
                    className={styles.changePhotoBtn}
                    onClick={this.openFileDialog}
                    role="menuitem"
                  >
                    <img
                      src={ProfileIcon_URL}
                      className={styles.changePhotoIcon}
                      alt=""
                    />
                    <span className={styles.changePhotoLabel}>
                      Change Profile Photo
                    </span>
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

          {/* BADGES (now clickable) */}
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
                    if (e.key === "Enter" || e.key === " ") {
                      this.handleSelectBadge(b);
                    }
                  }}
                  aria-label={`Select badge ${b.name}`}
                >
                  {badgeImageErrors[b.name] ? (
                    <div
                      className={styles.badgePlaceholder}
                      title={`Failed to load: ${b.name}`}
                    >
                      ?
                    </div>
                  ) : (
                    <img
                      className={styles.badgeImg}
                      src={b.imageUrl}
                      alt={b.name}
                      onError={() => this.handleBadgeImageError(b.name)}
                    />
                  )}
                  <div className={styles.badgeName}>{b.name}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
