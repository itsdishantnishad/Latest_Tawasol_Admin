import * as React from "react";
import * as ReactDOM from "react-dom";
import { Text, Spinner, SpinnerSize } from "@fluentui/react";

import styles from "./ProfilePageHeader.module.scss";
import { IBadgeItem, IProfilePageHeaderProps } from "./IProfilePageHeaderProps";

// ✅ ProfileCard popup component
import ProfileCard from "./ProfileCard";

import {
  fetchUserProfilePicture,
  fetchCurrentUserInfo,
  fetchGraphMeInfo,
  fetchGraphCoreUserFields,
  fetchGraphMyPhotoBlob,
  getSiteUrl,
  uploadProfilePicture,
  updateUserProfilePicture,
  copyTextToClipboard,
  buildProfessionalProfileText,
  type GraphCoreUserFields,
  saveSelectedBadge,
  loadSelectedBadge
} from "../../services/Profile/profileHeaderServices";

const ProfileIcon_URL: string = require("../assets/profileCircleImg.svg");
const ProfileLoaderIcon_URL: string = require("../assets/Profileicon.png");

/** ---- ES2018 compatible settled wrapper (no Promise.allSettled) ---- */
type SettledResult<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: any };

function toSettled<T>(p: Promise<T>): Promise<SettledResult<T>> {
  return p.then(
    (value) => ({ status: "fulfilled" as const, value }),
    (reason) => ({ status: "rejected" as const, reason })
  );
}

interface IProfilePageHeaderState {
  currentPhoto: string;
  /** Shows an overlay spinner while the <img> is downloading/decoding */
  isPhotoLoading: boolean;

  fullName: string;
  designation: string;
  department: string;

  graphCore: GraphCoreUserFields | null;

  showMenu: boolean;
  copyFeedback: boolean;
  isLoading: boolean;
  siteUrl: string;
  error: string | null;

  badgeImageErrors: { [badgeName: string]: boolean };
  selectedBadge: IBadgeItem | null;

  isSelf: boolean;
  targetUserKey: string;
  targetAccountName: string;

  // ✅ ProfileCard
  showProfileCard: boolean;
  profileCardPos: { top: number; left: number };
}

// NOTE: fetchGraphMeInfo returns this shape in your project
type GraphMeInfo =
  | { fullName: string; designation: string; department: string }
  | null;

export default class ProfilePageHeader extends React.Component<
  IProfilePageHeaderProps,
  IProfilePageHeaderState
> {
  private menuRef: React.RefObject<HTMLDivElement>;
  private fileInputRef: React.RefObject<HTMLInputElement>;
  private feedbackTimeout: number | undefined;
  private graphPhotoObjectUrl: string | null = null;

  /** ✅ prevents infinite loader when src doesn't change (browser won't re-fire onLoad) */
  private lastLoadedSrc: string = "";

  // ✅ ProfileCard refs
  private profileBtnRef: React.RefObject<HTMLButtonElement>;
  private profilePopoverRef: React.RefObject<HTMLDivElement>;

  constructor(props: IProfilePageHeaderProps) {
    super(props);

    this.state = {
      currentPhoto: "",
      isPhotoLoading: false,

      fullName: (props.fullName || "").trim(),
      designation: "",
      department: (props.department || "").trim(),

      graphCore: null,

      showMenu: false,
      copyFeedback: false,
      isLoading: true,
      siteUrl: "",
      error: null,

      badgeImageErrors: {},
      selectedBadge: props.selectedBadge ?? null,

      isSelf: true,
      targetUserKey: "",
      targetAccountName: "",

      showProfileCard: false,
      profileCardPos: { top: 0, left: 0 }
    };

    this.menuRef = React.createRef();
    this.fileInputRef = React.createRef();

    this.profileBtnRef = React.createRef();
    this.profilePopoverRef = React.createRef();
  }

  public componentDidMount(): void {
    document.addEventListener("click", this.handleOutsideClick, true);
    window.addEventListener("resize", this.repositionProfileCard);
    window.addEventListener("scroll", this.repositionProfileCard, true);
    void this.initializeProfile();
  }

  public componentWillUnmount(): void {
    document.removeEventListener("click", this.handleOutsideClick, true);
    window.removeEventListener("resize", this.repositionProfileCard);
    window.removeEventListener("scroll", this.repositionProfileCard, true);

    if (this.feedbackTimeout) {
      window.clearTimeout(this.feedbackTimeout);
      this.feedbackTimeout = undefined;
    }

    if (this.graphPhotoObjectUrl) {
      URL.revokeObjectURL(this.graphPhotoObjectUrl);
      this.graphPhotoObjectUrl = null;
    }
  }

  private getTargetFromUrl(): { userKey: string; accountname: string } {
    try {
      const params = new URLSearchParams(window.location.search || "");
      const uid = (params.get("uid") || "").trim();
      const accountname = (params.get("accountname") || "").trim();
      const userKey = uid || accountname;
      return { userKey, accountname };
    } catch {
      return { userKey: "", accountname: "" };
    }
  }

  private upgradeSharePointPhotoToLarge(url: string): string {
    if (!url) return "";
    return url.replace(/([?&]size=)(S|M|L)/i, "$1L");
  }

  /**
   * Fast SharePoint-renderable photo (browser can cache it).
   * accountname can be UPN/email or login.
   */
  private buildSpUserPhotoUrl(
    siteUrl: string,
    accountname: string,
    size: "S" | "M" | "L" = "L"
  ): string {
    const key = String(accountname || "").trim();
    if (!key) return "";

    const origin = window.location.origin;
    const web = String(siteUrl || "").trim();
    const base = web ? `${origin}${web.startsWith("/") ? web : `/${web}`}` : origin;

    return `${base}/_layouts/15/userphoto.aspx?accountname=${encodeURIComponent(
      key
    )}&size=${size}`;
  }

  private extractAccountFromLogin(loginName: string): string {
    const raw = String(loginName || "").trim();
    if (!raw) return "";
    const parts = raw.split("|").filter(Boolean);
    return (parts[parts.length - 1] || raw).trim();
  }

  private setGraphPhotoFromBlob(blob: Blob | null): string {
    if (!blob || !blob.size) return "";

    if (this.graphPhotoObjectUrl) {
      URL.revokeObjectURL(this.graphPhotoObjectUrl);
      this.graphPhotoObjectUrl = null;
    }

    const url = URL.createObjectURL(blob);
    this.graphPhotoObjectUrl = url;
    return url;
  }

  /** Safe base64 for unicode text */
  private toBase64Unicode(str: string): string {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch {
      return btoa(str);
    }
  }

  /** Initials avatar -> data:image/svg+xml;base64,... */
  private getDefaultAvatar(name: string, size: number = 160): string {
    const display = (name || "User").trim();

    const initials = display
      .split(" ")
      .map((n) => (n ? n[0] : ""))
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const colors = [
      "#a6afed",
      "#a9d3f2",
      "#a1dee9",
      "#e6edbf",
      "#c6b1de",
      "#f7c0e3",
      "#eeacb2",
      "#fdcfb4",
      "#dfc98e",
      "#9fd89f"
    ];

    const colorIndex =
      display
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

    const bgColor = colors[colorIndex];
    const fontSize = Math.max(18, Math.floor(size * 0.38));

    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" rx="${Math.floor(
      size / 2
    )}" ry="${Math.floor(size / 2)}" fill="${bgColor}"/>
        <text x="50%" y="50%"
              text-anchor="middle"
              dy=".35em"
              font-family="Segoe UI, Arial, sans-serif"
              font-size="${fontSize}"
              font-weight="700"
              fill="white">
          ${initials || "U"}
        </text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${this.toBase64Unicode(svg)}`;
  }

  private normalizeKey(v: string): string {
    return (v || "").trim().toLowerCase();
  }

  private initializeProfile = async (): Promise<void> => {
    try {
      const siteUrl = await getSiteUrl();
      this.setState({ siteUrl });

      const { userKey, accountname } = this.getTargetFromUrl();

      const loginName = this.props?.context?.pageContext?.user?.loginName || "";
      const ctxEmail = this.props?.context?.pageContext?.user?.email || "";
      const derivedAccount =
        accountname || ctxEmail || this.extractAccountFromLogin(loginName);

      // Improved self detection
      const isSelf =
        !userKey ||
        this.normalizeKey(userKey) === this.normalizeKey(derivedAccount) ||
        this.normalizeKey(userKey) === this.normalizeKey(accountname);

      // ✅ Instant render (NO email in name)
      const initialDisplayName =
        (this.props.fullName || "").trim() ||
        (this.state.fullName || "").trim() ||
        "Loading...";

      // Avatar initials can still use email if name not available (fine)
      const avatarSeed =
        initialDisplayName === "Loading..." ? (derivedAccount || "User") : initialDisplayName;

      const initialPhoto = this.getDefaultAvatar(avatarSeed, 180);

      this.setState({
        isSelf,
        targetUserKey: userKey,
        targetAccountName: derivedAccount,
        fullName: initialDisplayName,
        currentPhoto: initialPhoto,
        isLoading: false,
        error: null
      });

      // ✅ Badge preference only for self
      if (isSelf) {
        const savedBadge = loadSelectedBadge();
        if (savedBadge) this.setState({ selectedBadge: savedBadge });
      }

      // Fast path: SharePoint userphoto endpoint (loads quickly via browser cache)
      if (derivedAccount) {
        const spUserPhoto = this.buildSpUserPhotoUrl(siteUrl, derivedAccount, "L");
        if (spUserPhoto) {
          // show loader only if it's actually a new src
          const shouldShow = spUserPhoto !== this.lastLoadedSrc;
          this.setState({ currentPhoto: spUserPhoto, isPhotoLoading: shouldShow });
        }
      }

      // ---- 1) Graph (parallel) ----
      const [graphInfoRes, graphCoreRes, graphPhotoRes] = (await Promise.all([
        toSettled<GraphMeInfo>(fetchGraphMeInfo(this.props.context, userKey || undefined)),
        toSettled<GraphCoreUserFields | null>(
          fetchGraphCoreUserFields(this.props.context, userKey || undefined)
        ),
        toSettled<Blob | null>(fetchGraphMyPhotoBlob(this.props.context, userKey || undefined))
      ])) as [
        SettledResult<GraphMeInfo>,
        SettledResult<GraphCoreUserFields | null>,
        SettledResult<Blob | null>
      ];

      const graphInfo = graphInfoRes.status === "fulfilled" ? graphInfoRes.value : null;
      const graphCore = graphCoreRes.status === "fulfilled" ? graphCoreRes.value : null;

      // ✅ Detect "no photo" confirmation from Graph
      const graphNoPhotoConfirmed =
        graphPhotoRes.status === "fulfilled" &&
        (!graphPhotoRes.value || (graphPhotoRes.value as any).size === 0);

      const graphPhotoUrl =
        graphPhotoRes.status === "fulfilled"
          ? this.setGraphPhotoFromBlob(graphPhotoRes.value)
          : "";

      // ---- 2) SharePoint fallbacks (SELF ONLY) ----
      let spPhotoUrl = "";
      let spInfo: { fullName: string; department: string } | null = null;

      if (isSelf) {
        const [spPhotoRes, spInfoRes] = (await Promise.all([
          toSettled<string | null>(fetchUserProfilePicture()),
          toSettled<{ fullName: string; department: string } | null>(fetchCurrentUserInfo())
        ])) as [
          SettledResult<string | null>,
          SettledResult<{ fullName: string; department: string } | null>
        ];

        const photoUrl = spPhotoRes.status === "fulfilled" ? spPhotoRes.value : null;
        if (photoUrl) spPhotoUrl = this.upgradeSharePointPhotoToLarge(photoUrl);

        spInfo = spInfoRes.status === "fulfilled" ? spInfoRes.value : null;
      }

      const coreDisplayName =
        graphCore && (graphCore as any).displayName
          ? String((graphCore as any).displayName).trim()
          : "";

      // ---- Final merge ----
      const finalFullName =
        (graphInfo?.fullName || "").trim() ||
        coreDisplayName ||
        (spInfo?.fullName || "").trim() ||
        (this.props.fullName || "").trim() ||
        (this.state.fullName || "").trim() ||
        "User";

      const finalDesignation = (graphInfo?.designation || "").trim();
      const finalDepartment =
        (graphInfo?.department || "").trim() ||
        (spInfo?.department || "").trim() ||
        (this.state.department || "").trim();

      // Photo priority:
      // 1) Graph photo blob
      // 2) If Graph confirmed no photo => initials (no SP silhouette)
      // 3) If self => SP large photo
      // 4) Else keep existing (sp userphoto fast path) if any
      // 5) Else initials
      let finalPhoto = (graphPhotoUrl || "").trim();

      if (!finalPhoto && graphNoPhotoConfirmed) {
        finalPhoto = this.getDefaultAvatar(finalFullName || "User", 180);
      }

      if (!finalPhoto && isSelf) {
        finalPhoto = (spPhotoUrl || "").trim();
      }

      if (!finalPhoto) {
        const existing = String(this.state.currentPhoto || "").trim();
        // keep existing if it's not a data svg (e.g. sp userphoto url already set)
        if (existing && !existing.startsWith("data:image")) finalPhoto = existing;
      }

      if (!finalPhoto) {
        const nameForInitials = finalFullName || (accountname || "").trim() || "User";
        finalPhoto = this.getDefaultAvatar(nameForInitials, 180);
      }

      // ✅ show loader only when src actually changed and it's a network image
      const shouldShowLoader =
        !!finalPhoto &&
        !finalPhoto.startsWith("data:image") &&
        !finalPhoto.startsWith("blob:") &&
        finalPhoto !== this.lastLoadedSrc;

      this.setState({
        currentPhoto: finalPhoto,
        isPhotoLoading: shouldShowLoader,
        fullName: finalFullName,
        designation: finalDesignation,
        department: finalDepartment,
        graphCore: graphCore,
        error: null
      });
    } catch {
      this.setState({ error: "Failed to load profile" });
    }
  };

  private handleAvatarLoaded = (loadedSrc?: string): void => {
    const src = loadedSrc || this.state.currentPhoto || "";
    this.lastLoadedSrc = src;
    if (this.state.isPhotoLoading) this.setState({ isPhotoLoading: false });
  };

  private handleAvatarError = (): void => {
    const nameForInitials = (this.state.fullName || "User").trim() || "User";
    const fallback = this.getDefaultAvatar(nameForInitials, 180);

    this.lastLoadedSrc = fallback;
    this.setState({ currentPhoto: fallback, isPhotoLoading: false });
  };

  private handleOutsideClick = (e: MouseEvent): void => {
    const target = e.target as Node;

    // close kebab
    if (this.menuRef.current && !this.menuRef.current.contains(target)) {
      this.setState({ showMenu: false });
    }

    // close profile card (portal)
    if (this.state.showProfileCard) {
      const btn = this.profileBtnRef.current;
      const pop = this.profilePopoverRef.current;

      const insideBtn = !!btn && btn.contains(target);
      const insidePop = !!pop && pop.contains(target);

      if (!insideBtn && !insidePop) {
        this.setState({ showProfileCard: false });
      }
    }
  };

  private toggleMenu = (): void => {
    this.setState((prev) => ({ showMenu: !prev.showMenu }));
  };

  private calcProfileCardPos = (): { top: number; left: number } => {
    const btn = this.profileBtnRef.current;
    if (!btn) return this.state.profileCardPos;

    const rect = btn.getBoundingClientRect();
    const cardW = 312; // matches ProfileCard width
    const gap = 8;

    // anchor right edge of card with button right edge
    let left = rect.right - cardW;
    let top = rect.bottom + gap;

    // clamp inside viewport
    const pad = 8;
    left = Math.max(pad, Math.min(left, window.innerWidth - cardW - pad));
    top = Math.max(pad, top);

    return { top, left };
  };

  private repositionProfileCard = (): void => {
    if (!this.state.showProfileCard) return;
    this.setState({ profileCardPos: this.calcProfileCardPos() });
  };

  private toggleProfileCard = (): void => {
    this.setState((prev) => {
      const nextOpen = !prev.showProfileCard;
      return {
        showProfileCard: nextOpen,
        profileCardPos: nextOpen ? this.calcProfileCardPos() : prev.profileCardPos
      };
    });
  };

  private openFileDialog = (): void => {
    this.setState({ showMenu: false });
    if (this.fileInputRef.current) this.fileInputRef.current.click();
  };

  private handleProfileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!this.state.isSelf) {
      this.setState({ error: "You can only change your own profile photo." });
      e.target.value = "";
      return;
    }

    try {
      const { siteUrl } = this.state;

      // instant preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoData = event.target?.result as string;
        this.lastLoadedSrc = photoData;
        this.setState({ currentPhoto: photoData, isPhotoLoading: false });
      };
      reader.readAsDataURL(file);

      const uploadedUrl = await uploadProfilePicture(file, siteUrl);
      if (uploadedUrl) {
        await updateUserProfilePicture(uploadedUrl);
        this.setState({ error: null });
      }
    } catch (error: any) {
      this.setState({ error: error?.message || "Failed to upload profile picture" });
    }

    e.target.value = "";
  };

  private handleCopyProfile = async (): Promise<void> => {
    try {
      const { fullName, designation, department, graphCore } = this.state;

      const text = buildProfessionalProfileText({
        core: graphCore,
        fallbackName: fullName,
        fallbackDesignation: designation,
        fallbackDepartment: department
      });

      await copyTextToClipboard(text);

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
    this.setState((prev) => ({
      badgeImageErrors: { ...prev.badgeImageErrors, [badgeName]: true }
    }));
  };

  private handleSelectBadge = (badge: IBadgeItem): void => {
    if (!this.state.isSelf) return;

    this.setState((prev) => {
      const isSame = prev.selectedBadge?.name === badge.name;
      const next = isSame ? null : badge;
      saveSelectedBadge(next);
      return { selectedBadge: next };
    });
  };

  private renderName = (): React.ReactElement => {
    const name = (this.state.fullName || "")
      .trim()
      .replace(/,/g, " ")
      .replace(/\s+/g, " ");
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
    const { currentPhoto, isPhotoLoading, fullName } = this.state;
    const safePhoto = currentPhoto || this.getDefaultAvatar(fullName || "User", 180);

    return (
      <div className={styles.avatarHost}>
        <img
          className={styles.avatar}
          src={safePhoto}
          alt="Profile"
          decoding="async"
          loading="eager"
          onLoad={() => this.handleAvatarLoaded(safePhoto)}
          onError={this.handleAvatarError}
        />

        {isPhotoLoading ? (
          <div className={styles.avatarOverlay} aria-label="Loading profile photo">
            <Spinner size={SpinnerSize.medium} />
          </div>
        ) : null}
      </div>
    );
  }

  private renderProfileCardPortal(): React.ReactNode {
    const { showProfileCard, profileCardPos, graphCore } = this.state;
    if (!showProfileCard) return null;

    const employeeId = (graphCore as any)?.employeeId || "";

    return ReactDOM.createPortal(
      <div
        className={styles.profileCardPortal}
        style={{ top: profileCardPos.top, left: profileCardPos.left }}
        ref={this.profilePopoverRef}
        onClick={(ev) => ev.stopPropagation()}
      >
        <ProfileCard
          displayName={this.state.fullName}
          jobTitle={this.state.designation}
          department={this.state.department}
          photoUrl={this.state.currentPhoto}
          employeeId={employeeId}
          // qrCodeUrl={...} // optional
        />
      </div>,
      document.body
    );
  }

  public render(): React.ReactElement<IProfilePageHeaderProps> {
    const badges = this.props.badges || [];
    const {
      designation,
      department,
      showMenu,
      copyFeedback,
      error,
      isLoading,
      selectedBadge,
      badgeImageErrors,
      isSelf,
      showProfileCard
    } = this.state;

    const subtitle = (designation || "").trim() || (department || "").trim() || "—";

    return (
      <div className={styles.headerWrap}>
        {/* ✅ Portal Popover */}
        {this.renderProfileCardPortal()}

        <div className={styles.identityCard}>
          <div className={styles.avatarWrap}>
            {this.renderAvatarCore()}

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
            {/* ✅ ProfileCard button (opens portal popup) */}
            <button
              ref={this.profileBtnRef}
              type="button"
              className={`${styles.profileCardBtn} ${
                showProfileCard ? styles.profileCardBtnActive : ""
              }`}
              aria-label="Open profile card"
              title="Profile card"
              disabled={isLoading}
              onClick={(ev) => {
                ev.stopPropagation();
                this.toggleProfileCard();
              }}
            >
              <img className={styles.profileCardIcon} src={ProfileLoaderIcon_URL} alt="" />
            </button>

            {/* copy */}
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
                <path
                  d="M8.00391 12H16.0039"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

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

            {/* kebab */}
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
                  <button
                    type="button"
                    className={`${styles.changePhotoBtn} ${
                      !isSelf ? styles.changePhotoBtnDisabled : ""
                    }`}
                    onClick={this.openFileDialog}
                    role="menuitem"
                    title={!isSelf ? "You can change only your own photo" : "Change Profile Photo"}
                    aria-disabled={!isSelf}
                  >
                    <img src={ProfileIcon_URL} className={styles.changePhotoIcon} alt="" />
                    <span className={styles.changePhotoLabel}>
                      {isSelf ? "Change Profile Photo" : "Change Profile Photo (Self only)"}
                    </span>
                  </button>
                </div>
              )}
            </div>

            <input
              ref={this.fileInputRef}
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              onChange={this.handleProfileChange}
              aria-hidden="true"
            />
          </div>

          {error && (
            <div className={styles.errorMessage} role="alert">
              {error}
            </div>
          )}

          {badges.length > 0 ? (
            <div
              className={`${styles.badgesRow} ${!isSelf ? styles.badgesReadOnly : ""}`}
              aria-label="Badges"
            >
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
                  title={!isSelf ? "Badges are editable only for your own profile" : ""}
                >
                  {badgeImageErrors[b.name] ? (
                    <div className={styles.badgePlaceholder} title={`Failed to load: ${b.name}`}>
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
