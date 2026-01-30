// import * as React from "react";
// import { Text, Spinner, SpinnerSize } from "@fluentui/react";

// import styles from "./ProfilePageHeader.module.scss";
// import { IBadgeItem, IProfilePageHeaderProps } from "./IProfilePageHeaderProps";

// import {
//   fetchUserProfilePicture,
//   fetchCurrentUserInfo,
//   fetchGraphMeInfo,
//   fetchGraphCoreUserFields,
//   fetchGraphMyPhotoBlob,
//   getSiteUrl,
//   uploadProfilePicture,
//   updateUserProfilePicture,
//   copyTextToClipboard,
//   buildProfessionalProfileText,
//   type GraphCoreUserFields,
//   saveSelectedBadge,
//   loadSelectedBadge,
// } from "../../services/Profile/profileHeaderServices";

// const ProfileIcon_URL: string = require("../assets/profileCircleImg.svg");
// const ProfileLoaderIcon_URL: string = require("../assets/Profileicon.png")
// // Background in SiteAssets
// const PROFILE_HEADER_BG_FILE_NAME = "Gradient.svg";
// // Packaged fallback background
// const ProfileHeaderBgAsset: string = require("../assets/Gradient.svg");

// interface IProfilePageHeaderState {
//   currentPhoto: string;

//   fullName: string;
//   designation: string;
//   department: string;

//   // ✅ new: all core fields from Graph (used only for copy)
//   graphCore: GraphCoreUserFields | null;

//   showMenu: boolean;
//   copyFeedback: boolean;
//   isLoading: boolean;
//   siteUrl: string;
//   error: string | null;

//   badgeImageErrors: { [badgeName: string]: boolean };
//   selectedBadge: IBadgeItem | null;
// }

// export default class ProfilePageHeader extends React.Component<IProfilePageHeaderProps, IProfilePageHeaderState> {
//   private menuRef: React.RefObject<HTMLDivElement>;
//   private fileInputRef: React.RefObject<HTMLInputElement>;
//   private feedbackTimeout: number | undefined;

//   private graphPhotoObjectUrl: string | null = null;

//   constructor(props: IProfilePageHeaderProps) {
//     super(props);

//     this.state = {
//       currentPhoto: "",

//       fullName: (props.fullName || "").trim(),
//       designation: "",
//       department: (props.department || "").trim(),

//       graphCore: null,

//       showMenu: false,
//       copyFeedback: false,
//       isLoading: true,
//       siteUrl: "",
//       error: null,

//       badgeImageErrors: {},
//       selectedBadge: props.selectedBadge ?? null,
//     };

//     this.menuRef = React.createRef();
//     this.fileInputRef = React.createRef();
//   }

//   public componentDidMount(): void {
//     document.addEventListener("click", this.handleOutsideClick);
//     void this.initializeProfile();
//   }

//   public componentWillUnmount(): void {
//     document.removeEventListener("click", this.handleOutsideClick);

//     if (this.feedbackTimeout) {
//       window.clearTimeout(this.feedbackTimeout);
//       this.feedbackTimeout = undefined;
//     }

//     if (this.graphPhotoObjectUrl) {
//       URL.revokeObjectURL(this.graphPhotoObjectUrl);
//       this.graphPhotoObjectUrl = null;
//     }
//   }

//   private upgradeSharePointPhotoToLarge(url: string): string {
//     if (!url) return "";
//     // typical: /_layouts/15/userphoto.aspx?size=S&accountname=...
//     return url.replace(/([?&]size=)(S|M|L)/i, "$1L");
//   }

//   private setGraphPhotoFromBlob(blob: Blob | null): string {
//     if (!blob || !blob.size) return "";

//     if (this.graphPhotoObjectUrl) {
//       URL.revokeObjectURL(this.graphPhotoObjectUrl);
//       this.graphPhotoObjectUrl = null;
//     }

//     const url = URL.createObjectURL(blob);
//     this.graphPhotoObjectUrl = url;
//     return url;
//   }

//   private getHeaderBgStyle = (): React.CSSProperties => {
//     const webAbsoluteUrl = (this.props.context?.pageContext?.web?.absoluteUrl || "").trim();
//     const file = encodeURIComponent(PROFILE_HEADER_BG_FILE_NAME);
//     const siteAssetsUrl = webAbsoluteUrl ? `${webAbsoluteUrl}/SiteAssets/${file}` : "";

//     const layers: string[] = [];

//     // SiteAssets first (if present)
//     if (siteAssetsUrl) layers.push(`url("${siteAssetsUrl}")`);
//     // Packaged fallback
//     if (ProfileHeaderBgAsset) layers.push(`url("${ProfileHeaderBgAsset}")`);
//     // Gradient fallback
//     layers.push(`linear-gradient(90deg,#fbd8c7 0%,#fee2cf 35%,#ffd6b6 68%,#ffe4d1 100%)`);

//     return {
//       backgroundImage: layers.join(", "),
//       backgroundRepeat: "no-repeat",
//       backgroundSize: "cover",
//       backgroundPosition: "center",
//       width: "100%",
//     };
//   };

//   private initializeProfile = async (): Promise<void> => {
//     try {
//       const siteUrl = await getSiteUrl();
//       this.setState({ siteUrl });

//       const savedBadge = loadSelectedBadge();
//       if (savedBadge) this.setState({ selectedBadge: savedBadge });

//       // ----------------------------
//       // 1) Graph info + HQ photo (preferred)
//       // ----------------------------
//       let graphInfo: { fullName: string; designation: string; department: string } | null = null;
//       try {
//         graphInfo = await fetchGraphMeInfo(this.props.context);
//       } catch {
//         // ignore
//       }

//       // ✅ Fetch all core user fields for clipboard copy
//       let graphCore: GraphCoreUserFields | null = null;
//       try {
//         graphCore = await fetchGraphCoreUserFields(this.props.context);
//       } catch {
//         // ignore
//       }

//       let graphPhotoUrl = "";
//       try {
//         const blob = await fetchGraphMyPhotoBlob(this.props.context);
//         graphPhotoUrl = this.setGraphPhotoFromBlob(blob);
//       } catch {
//         // ignore
//       }

//       // ----------------------------
//       // 2) SharePoint photo + SP user info (fallbacks)
//       // ----------------------------
//       let spPhotoUrl = "";
//       try {
//         const photoUrl = await fetchUserProfilePicture();
//         if (photoUrl) spPhotoUrl = this.upgradeSharePointPhotoToLarge(photoUrl);
//       } catch {
//         // ignore
//       }

//       let spInfo: { fullName: string; department: string } | null = null;
//       try {
//         spInfo = await fetchCurrentUserInfo();
//       } catch {
//         // ignore
//       }

//       // ----------------------------
//       // Final merge priority (Graph > SPInfo > existing)
//       // ----------------------------
//       const finalFullName =
//         (graphInfo?.fullName || "").trim() ||
//         (spInfo?.fullName || "").trim() ||
//         (this.state.fullName || "").trim();

//       const finalDesignation = (graphInfo?.designation || "").trim();

//       const finalDepartment =
//         (graphInfo?.department || "").trim() ||
//         (spInfo?.department || "").trim() ||
//         (this.state.department || "").trim();

//       const finalPhoto = (graphPhotoUrl || "").trim() || (spPhotoUrl || "").trim();

//       this.setState({
//         currentPhoto: finalPhoto,
//         fullName: finalFullName,
//         designation: finalDesignation,
//         department: finalDepartment,
//         graphCore: graphCore,
//         error: null,
//       });
//     } catch {
//       this.setState({ error: "Failed to load profile" });
//     } finally {
//       this.setState({ isLoading: false });
//     }
//   };

//   private handleOutsideClick = (e: MouseEvent): void => {
//     if (this.menuRef.current && !this.menuRef.current.contains(e.target as Node)) {
//       this.setState({ showMenu: false });
//     }
//   };

//   private toggleMenu = (): void => {
//     this.setState((prev) => ({ showMenu: !prev.showMenu }));
//   };

//   private openFileDialog = (): void => {
//     this.setState({ showMenu: false });
//     if (this.fileInputRef.current) this.fileInputRef.current.click();
//   };

//   private handleProfileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     try {
//       const { siteUrl } = this.state;

//       // instant preview
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         const photoData = event.target?.result as string;
//         this.setState({ currentPhoto: photoData });
//       };
//       reader.readAsDataURL(file);

//       // upload to SharePoint + update user profile picture
//       const uploadedUrl = await uploadProfilePicture(file, siteUrl);
//       if (uploadedUrl) {
//         await updateUserProfilePicture(uploadedUrl);
//         this.setState({ error: null });
//       }
//     } catch (error: any) {
//       this.setState({ error: error?.message || "Failed to upload profile picture" });
//     }

//     e.target.value = "";
//   };

//   // ✅ Updated copy handler: copies full professional block using graphCore
//   private handleCopyProfile = async (): Promise<void> => {
//     try {
//       const { fullName, designation, department, graphCore } = this.state;

//       const text = buildProfessionalProfileText({
//         core: graphCore,
//         fallbackName: fullName,
//         fallbackDesignation: designation,
//         fallbackDepartment: department,
//       });

//       await copyTextToClipboard(text);

//       this.setState({ copyFeedback: true });

//       if (this.feedbackTimeout) window.clearTimeout(this.feedbackTimeout);
//       this.feedbackTimeout = window.setTimeout(() => {
//         this.setState({ copyFeedback: false });
//       }, 2000);
//     } catch {
//       this.setState({ error: "Failed to copy profile" });
//     }
//   };

//   private handleBadgeImageError = (badgeName: string): void => {
//     this.setState((prev) => ({
//       badgeImageErrors: { ...prev.badgeImageErrors, [badgeName]: true },
//     }));
//   };

//   private handleSelectBadge = (badge: IBadgeItem): void => {
//     this.setState((prev) => {
//       const isSame = prev.selectedBadge?.name === badge.name;
//       const next = isSame ? null : badge;
//       saveSelectedBadge(next);
//       return { selectedBadge: next };
//     });
//   };

//   private getInitials(fullName: string): string {
//     const cleaned = (fullName || "").replace(/,/g, " ").trim().replace(/\s+/g, " ");
//     if (!cleaned) return "";

//     const parts = cleaned.split(" ").filter(Boolean);
//     if (!parts.length) return "";

//     const first = (parts[0] || "").charAt(0);
//     const last = (parts.length > 1 ? parts[parts.length - 1] : parts[0]).charAt(0);
//     return (first + last).toUpperCase();
//   }

//   private renderName = (): React.ReactElement => {
//     const name = (this.state.fullName || "").trim().replace(/,/g, " ").replace(/\s+/g, " ");
//     const parts = name.split(" ").filter(Boolean);
//     const first = parts[0] || "";
//     const rest = parts.slice(1);

//     return (
//       <div className={styles.nameRow}>
//         <Text className={styles.firstName} block>
//           {first}
//         </Text>
//         {rest.length > 0 && (
//           <Text className={styles.lastName} block>
//             {" "}
//             {rest.join(" ")}
//           </Text>
//         )}
//       </div>
//     );
//   };

//   private renderAvatarCore(): React.ReactElement {
//     const { isLoading, currentPhoto, fullName } = this.state;

//     if (isLoading) {
//       return (
//         <div
//           className={styles.avatar}
//           style={{ background: "#f99999ff", display: "flex", alignItems: "center", justifyContent: "center" }}
//         >
//           <Spinner size={SpinnerSize.large} />
//         </div>
//       );
//     }

//     if (currentPhoto) {
//       return <img className={styles.avatar} src={currentPhoto} alt="Profile" />;
//     }

//     const initials = this.getInitials(fullName) || "—";
//     return (
//       <div
//         className={styles.avatar}
//         title={fullName}
//         aria-label="Profile initials"
//         style={{
//           background: "#d9d9d9",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           fontWeight: 700,
//           fontSize: 22,
//           color: "#333",
//         }}
//       >
//         {initials}
//       </div>
//     );
//   }

//   public render(): React.ReactElement<IProfilePageHeaderProps> {
//     const badges = this.props.badges || [];
//     const { designation, department, showMenu, copyFeedback, error, isLoading, selectedBadge, badgeImageErrors } =
//       this.state;

//     const subtitle = (designation || "").trim() || (department || "").trim() || "—";

//     return (
//       <div className={styles.headerWrap} style={this.getHeaderBgStyle()}>
//         <div className={styles.identityCard}>
//           <div className={styles.avatarWrap}>
//             {this.renderAvatarCore()}

//             {selectedBadge ? (
//               <div
//                 className={styles.avatarBadge}
//                 title={selectedBadge.name}
//                 aria-label={`Selected badge: ${selectedBadge.name}`}
//               >
//                 {badgeImageErrors[selectedBadge.name] ? (
//                   <div className={styles.avatarBadgeFallback}>?</div>
//                 ) : (
//                   <img
//                     className={styles.avatarBadgeIcon}
//                     src={selectedBadge.imageUrl}
//                     alt={selectedBadge.name}
//                     onError={() => this.handleBadgeImageError(selectedBadge.name)}
//                   />
//                 )}
//               </div>
//             ) : null}
//           </div>

//           <div className={styles.metaCol}>
//             {this.renderName()}
//             <Text className={styles.department} block>
//               {subtitle}
//             </Text>
//           </div>
//         </div>

//         <div className={styles.flexCol}>
//           <div className={styles.actions} role="group" aria-label="Header actions">
//            <span><img src={ProfileLoaderIcon_URL} alt="" /></span>
//             <button
//               className={styles.iconBtn}
//               title={copyFeedback ? "Profile Copied!" : "Copy Profile"}
//               aria-label={copyFeedback ? "Profile Copied!" : "Copy Profile"}
//               onClick={this.handleCopyProfile}
//               type="button"
//               disabled={isLoading}
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
//                 <path
//                   d="M14.9922 17.5H16.5022C19.5222 17.5 22.0022 15.03 22.0022 12C22.0022 8.98 19.5322 6.5 16.5022 6.5H14.9922"
//                   stroke="black"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//                 <path
//                   d="M9.00391 6.5H7.50391C4.47391 6.5 2.00391 8.97 2.00391 12C2.00391 15.02 4.47391 17.5 7.50391 17.5H9.00391"
//                   stroke="black"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//                 <path
//                   d="M8.00391 12H16.0039"
//                   stroke="black"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </svg>
//             </button>

//             {copyFeedback && (
//               <div className={styles.copyPill} role="status" aria-live="polite">
//                 <span className={styles.copyDot} aria-hidden="true">
//                   !
//                 </span>
//                 <span className={styles.copyText}>Profile Copied</span>
//                 <button
//                   type="button"
//                   className={styles.copyClose}
//                   aria-label="Close"
//                   onClick={() => this.setState({ copyFeedback: false })}
//                 >
//                   ×
//                 </button>
//               </div>
//             )}

//             <div className={styles.kebabWrapper} ref={this.menuRef}>
//               <button
//                 className={`${styles.iconBtn} ${styles.kebabBtn}`}
//                 title="More options"
//                 aria-label="More options"
//                 onClick={this.toggleMenu}
//                 type="button"
//                 disabled={isLoading}
//               >
//                 <svg width="24" height="24" viewBox="0 0 24 24">
//                   <circle cx="12" cy="5" r="2" />
//                   <circle cx="12" cy="12" r="2" />
//                   <circle cx="12" cy="19" r="2" />
//                 </svg>
//               </button>              
//               {showMenu && (
//                 <div className={styles.dropdownMenu}>
//                   <button type="button" className={styles.changePhotoBtn} onClick={this.openFileDialog} role="menuitem">
//                     <img src={ProfileIcon_URL} className={styles.changePhotoIcon} alt="" />
//                     <span className={styles.changePhotoLabel}>Change Profile Photo</span>
//                   </button>
//                 </div>
//               )}
              
//             </div>
//             <input
//               ref={this.fileInputRef}
//               type="file"
//               accept="image/*"
//               style={{ display: "none" }}
//               onChange={this.handleProfileChange}
//               aria-hidden="true"
//             />
//           </div>

//           {error && (
//             <div className={styles.errorMessage} role="alert">
//               {error}
//             </div>
//           )}

//           {badges.length > 0 ? (
//             <div className={styles.badgesRow} aria-label="Badges">
//               {badges.map((b, i) => (
//                 <div
//                   className={styles.badgeItem}
//                   key={`${b.name}-${i}`}
//                   role="button"
//                   tabIndex={0}
//                   onClick={() => this.handleSelectBadge(b)}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter" || e.key === " ") this.handleSelectBadge(b);
//                   }}
//                   aria-label={`Select badge ${b.name}`}
//                 >
//                   {badgeImageErrors[b.name] ? (
//                     <div className={styles.badgePlaceholder} title={`Failed to load: ${b.name}`}>
//                       ?
//                     </div>
//                   ) : (
//                     <img className={styles.badgeImg} src={b.imageUrl} alt={b.name} onError={() => this.handleBadgeImageError(b.name)} />
//                   )}
//                   <div className={styles.badgeName}>{b.name}</div>
//                 </div>
//               ))}
//             </div>
//           ) : null}
//         </div>
//       </div>
//     );
//   }
// }










import * as React from "react";
import { Text, Spinner, SpinnerSize } from "@fluentui/react";

import styles from "./ProfilePageHeader.module.scss";
import { IBadgeItem, IProfilePageHeaderProps } from "./IProfilePageHeaderProps";

// [PROFILECARD] ✅ NEW import (ProfileCard popup component)
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
  loadSelectedBadge,
} from "../../services/Profile/profileHeaderServices";

const ProfileIcon_URL: string = require("../assets/profileCircleImg.svg");

// [PROFILECARD] ✅ Profile card toggle icon image (your uploaded icon)
const ProfileLoaderIcon_URL: string = require("../assets/Profileicon.png");

// Background in SiteAssets
const PROFILE_HEADER_BG_FILE_NAME = "Gradient.svg";
// Packaged fallback background
const ProfileHeaderBgAsset: string = require("../assets/Gradient.svg");

interface IProfilePageHeaderState {
  currentPhoto: string;

  fullName: string;
  designation: string;
  department: string;

  graphCore: GraphCoreUserFields | null;

  showMenu: boolean;

  // [PROFILECARD] ✅ NEW state flag (controls open/close of ProfileCard)
  showProfileCard: boolean;

  copyFeedback: boolean;
  isLoading: boolean;
  siteUrl: string;
  error: string | null;

  badgeImageErrors: { [badgeName: string]: boolean };
  selectedBadge: IBadgeItem | null;
}

export default class ProfilePageHeader extends React.Component<
  IProfilePageHeaderProps,
  IProfilePageHeaderState
> {
  private menuRef: React.RefObject<HTMLDivElement>;
  private fileInputRef: React.RefObject<HTMLInputElement>;
  private feedbackTimeout: number | undefined;

  private graphPhotoObjectUrl: string | null = null;

  // [PROFILECARD] ✅ NEW refs (outside click close)
  private profileCardWrapRef: React.RefObject<HTMLDivElement>;
  private profileCardPopoverRef: React.RefObject<HTMLDivElement>;

  constructor(props: IProfilePageHeaderProps) {
    super(props);

    this.state = {
      currentPhoto: "",

      fullName: (props.fullName || "").trim(),
      designation: "",
      department: (props.department || "").trim(),

      graphCore: null,

      showMenu: false,

      // [PROFILECARD] ✅ init
      showProfileCard: false,

      copyFeedback: false,
      isLoading: true,
      siteUrl: "",
      error: null,

      badgeImageErrors: {},
      selectedBadge: props.selectedBadge ?? null,
    };

    this.menuRef = React.createRef();
    this.fileInputRef = React.createRef();

    // [PROFILECARD] ✅ init refs
    this.profileCardWrapRef = React.createRef();
    this.profileCardPopoverRef = React.createRef();
  }

  public componentDidMount(): void {
    document.addEventListener("click", this.handleOutsideClick);
    void this.initializeProfile();
  }

  public componentWillUnmount(): void {
    document.removeEventListener("click", this.handleOutsideClick);

    if (this.feedbackTimeout) {
      window.clearTimeout(this.feedbackTimeout);
      this.feedbackTimeout = undefined;
    }

    if (this.graphPhotoObjectUrl) {
      URL.revokeObjectURL(this.graphPhotoObjectUrl);
      this.graphPhotoObjectUrl = null;
    }
  }

  private upgradeSharePointPhotoToLarge(url: string): string {
    if (!url) return "";
    return url.replace(/([?&]size=)(S|M|L)/i, "$1L");
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

  private getHeaderBgStyle = (): React.CSSProperties => {
    const webAbsoluteUrl = (this.props.context?.pageContext?.web?.absoluteUrl || "").trim();
    const file = encodeURIComponent(PROFILE_HEADER_BG_FILE_NAME);
    const siteAssetsUrl = webAbsoluteUrl ? `${webAbsoluteUrl}/SiteAssets/${file}` : "";

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

      // 1) Graph info + HQ photo (preferred)
      let graphInfo: { fullName: string; designation: string; department: string } | null = null;
      try {
        graphInfo = await fetchGraphMeInfo(this.props.context);
      } catch {}

      let graphCore: GraphCoreUserFields | null = null;
      try {
        graphCore = await fetchGraphCoreUserFields(this.props.context);
      } catch {}

      let graphPhotoUrl = "";
      try {
        const blob = await fetchGraphMyPhotoBlob(this.props.context);
        graphPhotoUrl = this.setGraphPhotoFromBlob(blob);
      } catch {}

      // 2) SharePoint photo + SP user info (fallbacks)
      let spPhotoUrl = "";
      try {
        const photoUrl = await fetchUserProfilePicture();
        if (photoUrl) spPhotoUrl = this.upgradeSharePointPhotoToLarge(photoUrl);
      } catch {}

      let spInfo: { fullName: string; department: string } | null = null;
      try {
        spInfo = await fetchCurrentUserInfo();
      } catch {}

      const finalFullName =
        (graphInfo?.fullName || "").trim() ||
        (spInfo?.fullName || "").trim() ||
        (this.state.fullName || "").trim();

      const finalDesignation = (graphInfo?.designation || "").trim();

      const finalDepartment =
        (graphInfo?.department || "").trim() ||
        (spInfo?.department || "").trim() ||
        (this.state.department || "").trim();

      const finalPhoto = (graphPhotoUrl || "").trim() || (spPhotoUrl || "").trim();

      this.setState({
        currentPhoto: finalPhoto,
        fullName: finalFullName,
        designation: finalDesignation,
        department: finalDepartment,
        graphCore: graphCore,
        error: null,
      });
    } catch {
      this.setState({ error: "Failed to load profile" });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  private handleOutsideClick = (e: MouseEvent): void => {
    const target = e.target as Node;

    // existing: close kebab if clicked outside
    if (this.menuRef.current && !this.menuRef.current.contains(target)) {
      this.setState({ showMenu: false });
    }

    // [PROFILECARD] ✅ close ProfileCard if clicked outside
    if (this.state.showProfileCard) {
      const wrapEl = this.profileCardWrapRef.current;
      const popEl = this.profileCardPopoverRef.current;

      const insideWrap = !!wrapEl && wrapEl.contains(target);
      const insidePopover = !!popEl && popEl.contains(target);

      if (!insideWrap && !insidePopover) {
        this.setState({ showProfileCard: false });
      }
    }
  };

  private toggleMenu = (): void => {
    this.setState((prev) => ({ showMenu: !prev.showMenu }));
  };

  // [PROFILECARD] ✅ icon click toggle open/close
  private toggleProfileCard = (): void => {
    this.setState((prev) => ({ showProfileCard: !prev.showProfileCard }));
  };

  private openFileDialog = (): void => {
    this.setState({ showMenu: false });
    if (this.fileInputRef.current) this.fileInputRef.current.click();
  };

  private handleProfileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
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
        fallbackDepartment: department,
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
      badgeImageErrors: { ...prev.badgeImageErrors, [badgeName]: true },
    }));
  };

  private handleSelectBadge = (badge: IBadgeItem): void => {
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
      graphCore,
      showProfileCard, // [PROFILECARD]
    } = this.state;

    const subtitle = (designation || "").trim() || (department || "").trim() || "—";

    // [PROFILECARD] safe employeeId fetch (if exists in graphCore)
    const employeeId = (graphCore as any)?.employeeId || "";

    return (
      <div className={styles.headerWrap} style={this.getHeaderBgStyle()}>
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
            {/* [PROFILECARD] ✅ Icon + hover + toggle + popover */}
            <div className={styles.profileCardWrap} ref={this.profileCardWrapRef}>
              <button
                type="button"
                className={`${styles.profileCardBtn} ${showProfileCard ? styles.profileCardBtnActive : ""}`}
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

              {showProfileCard && (
                <div
                  className={styles.profileCardPopover}
                  ref={this.profileCardPopoverRef}
                  onClick={(ev) => ev.stopPropagation()}
                >
                  <ProfileCard
                    displayName={this.state.fullName}
                    jobTitle={this.state.designation}
                    department={this.state.department}
                    photoUrl={this.state.currentPhoto}
                    employeeId={employeeId}
                  />
                </div>
              )}
            </div>

            {/* existing copy button */}
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
                  <button type="button" className={styles.changePhotoBtn} onClick={this.openFileDialog} role="menuitem">
                    <img src={ProfileIcon_URL} className={styles.changePhotoIcon} alt="" />
                    <span className={styles.changePhotoLabel}>Change Profile Photo</span>
                  </button>
                </div>
              )}
            </div>

            <input
              ref={this.fileInputRef}
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

          {badges.length > 0 ? (
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
