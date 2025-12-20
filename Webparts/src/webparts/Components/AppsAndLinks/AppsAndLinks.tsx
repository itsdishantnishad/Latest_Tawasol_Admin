import * as React from "react";
import { useState, useEffect, useRef } from "react";
import styles from "./AppsAndLinks.module.scss";
import { listServices } from "../../services/listServices";
import { Dialog, DialogContent, DialogType } from "@fluentui/react/lib/Dialog";

const addLinkIcon: string = require("../../../webparts/assets/add-square.svg");
const editIcon: string = require("../../../webparts/assets/editIcon.svg");
const trashIcon: string = require("../../../webparts/assets/trashIcon.svg");

import {
  IconButton,
  DefaultButton,
  PrimaryButton,
} from "@fluentui/react/lib/Button";

import { TextField } from "@fluentui/react/lib/TextField";

import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export interface IAppsAndLinksProps {
  isHidden: boolean;
  savedApps: any[];
  hideAppsAndLinks: () => void;
  context: any;
}

interface ICustomLink {
  Title: string;
  URL: string;
}

interface IUserListItem {
  Id: number;
  UserEmail: string;
  AppLink: string;
  [key: string]: any;
}

const LIST_NAME = "Custom App Links";
const USER_EMAIL_COL = "TIRUserEmail";
const APPLINK_COL = "TIRCustomLinkAttribute";

// Improved URL validation function
const isValidURL = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    // Only allow http and https protocols
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (e) {
    return false;
  }
};

const AppsAndLinks = (props: IAppsAndLinksProps) => {
  const sp: SPFI = React.useMemo(
    () => spfi().using(SPFx(props.context)),
    [props.context]
  );
  const [activeTab, setActiveTab] = useState("quick");
  const [customLinks, setCustomLinks] = useState<ICustomLink[]>([]);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Input State
  const [linkTitle, setLinkTitle] = useState("");
  const [linkURL, setLinkURL] = useState("");

  // Error State
  const [titleError, setTitleError] = useState("");
  const [urlError, setUrlError] = useState("");

  // Success Message State
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const spService = new listServices(props.context);

  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const userEmail = props.context.pageContext.user.loginName;

  const loadUserLinks = async () => {
    try {
      const items: IUserListItem[] = await spService.getCustomAppLinks(
        "Custom App Links",
        userEmail
      );
      if (items.length > 0 && items[0][APPLINK_COL]) {
        setCustomLinks(JSON.parse(items[0][APPLINK_COL]));
      }
    } catch (err) {
      console.error("Error loading user links:", err);
    }
  };

  useEffect(() => {
    loadUserLinks();
  }, []);

  // Reset to default state when dialog is hidden
  useEffect(() => {
    if (props.isHidden) {
      setActiveTab("quick");
      setIsFormOpen(false);
      setMenuOpenIndex(null);
      setShowSuccessMessage(false);
      resetFormState();
    }
  }, [props.isHidden]);

  const persistToSharePoint = async (updatedLinks: ICustomLink[]) => {
    try {
      const existingItems: IUserListItem[] = await sp.web.lists
        .getByTitle(LIST_NAME)
        .items.select("Id", USER_EMAIL_COL, APPLINK_COL)
        .filter(`${USER_EMAIL_COL} eq '${userEmail}'`)();

      const payload = {
        [USER_EMAIL_COL]: userEmail,
        [APPLINK_COL]: JSON.stringify(updatedLinks),
      };

      if (existingItems.length > 0) {
        await sp.web.lists
          .getByTitle(LIST_NAME)
          .items.getById(existingItems[0].Id)
          .update(payload);
      } else {
        await sp.web.lists.getByTitle(LIST_NAME).items.add(payload);
      }
    } catch (err) {
      console.error("Error saving link:", err);
    }
  };

  const resetFormState = () => {
    setLinkTitle("");
    setLinkURL("");
    setTitleError("");
    setUrlError("");
  };

  const openAddForm = () => {
    setIsEditMode(false);
    resetFormState();
    setIsFormOpen(true);
    setMenuOpenIndex(null);
  };

  const openEditForm = (index: number) => {
    setIsEditMode(true);
    setEditingIndex(index);
    setLinkTitle(customLinks[index].Title);
    setLinkURL(customLinks[index].URL);
    setTitleError("");
    setUrlError("");
    setIsFormOpen(true);
    setMenuOpenIndex(null);
  };

  const validateForm = (): boolean => {
    let isValid = true;

    // Clear previous errors
    setTitleError("");
    setUrlError("");

    // 1. Validate Title Empty
    if (!linkTitle.trim()) {
      setTitleError("Name is required");
      isValid = false;
    } else {
      // 2. Validate Duplicate Name
      const duplicateExists = customLinks.some((link, index) => {
        if (isEditMode && index === editingIndex) return false;
        return link.Title.toLowerCase() === linkTitle.trim().toLowerCase();
      });

      if (duplicateExists) {
        setTitleError("This name already exists");
        isValid = false;
      }
    }

    // 3. Validate URL Empty
    if (!linkURL.trim()) {
      setUrlError("URL is required");
      isValid = false;
    } else if (!isValidURL(linkURL.trim())) {
      // 4. Validate URL Format using improved validation
      setUrlError(
        "Not a valid URL. Please check the spelling entered correctly"
      );
      isValid = false;
    }

    return isValid;
  };

  const saveForm = async () => {
    if (!validateForm()) {
      return;
    }

    let updatedLinks = [...customLinks];

    if (isEditMode && editingIndex !== null) {
      updatedLinks[editingIndex] = {
        Title: linkTitle.trim(),
        URL: linkURL.trim(),
      };
    } else {
      updatedLinks.push({
        Title: linkTitle.trim(),
        URL: linkURL.trim(),
      });
    }

    setCustomLinks(updatedLinks);
    await persistToSharePoint(updatedLinks);

    setIsFormOpen(false);
    resetFormState();

    // Show success message
    if (isEditMode) {
      setSuccessMessage("Successfully updated 1 custom URL");
    } else {
      setSuccessMessage("Successfully added 1 custom URL");
    }
    setShowSuccessMessage(true);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const cancelForm = () => {
    setIsFormOpen(false);
    resetFormState();
  };

  const deleteLink = async (index: number) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    const updatedLinks = customLinks.filter((_, i) => i !== index);
    setCustomLinks(updatedLinks);
    await persistToSharePoint(updatedLinks);

    setMenuOpenIndex(null);
  };

  useEffect(() => {
    const handleClick = (e: any) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClick);

    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <Dialog
      hidden={props.isHidden}
      onDismiss={props.hideAppsAndLinks}
      dialogContentProps={{
        type: DialogType.normal,
        title: "Service Links",
        className: styles.serviceLinkModal,
        showCloseButton: true,
      }}
      minWidth={"800px"}
    >
      {/* Dividing Line */}
      <div className={styles.divider}></div>
      <DialogContent>
        <div className={styles.container}>
          {/* Tabs */}
          <div className={styles.tabContainer}>
            <button
              className={`${styles.tab} ${
                activeTab === "quick" && styles.activeTab
              }`}
              onClick={() => setActiveTab("quick")}
            >
              Quick Links
            </button>

            <button
              className={`${styles.tab} ${
                activeTab === "app" && styles.activeTab
              }`}
              onClick={() => setActiveTab("app")}
            >
              App Links
            </button>

            <button
              className={`${styles.tab} ${
                activeTab === "custom" && styles.activeTab
              }`}
              onClick={() => setActiveTab("custom")}
            >
              Custom Links
            </button>
          </div>

          {/* ---------------- Quick Links ---------------- */}
          {activeTab === "quick" && (
            <div className={styles.linksGrid}>
              {props.savedApps
                .filter((app) => app.AppType === "Quick Links")
                .map((link, index) => (
                  <a
                    key={index}
                    target="_blank"
                    rel="noopener noreferrer"
                    href={link.URL}
                    className={styles.linkItem}
                  >
                    <div className={styles.iconCircle}>
                      {" "}
                      {link.IconURL ? (
                        <img src={link.IconURL} className={styles.appIcon} />
                      ) : (
                        "🔗"
                      )}
                    </div>
                    <div className={styles.linkTitle}>{link.Title}</div>
                  </a>
                ))}
            </div>
          )}

          {/* ---------------- Apps Links ---------------- */}
          {activeTab === "app" && (
            <div className={styles.linksGrid}>
              {props.savedApps
                .filter((app) => app.AppType === "App Links")
                .map((app, index) => (
                  <a
                    key={index}
                    target="_blank"
                    rel="noopener noreferrer"
                    href={app.URL}
                    className={styles.linkItem}
                  >
                    <div className={styles.iconCircle}>
                      {app.IconURL ? (
                        <img src={app.IconURL} className={styles.appIcon} />
                      ) : (
                        "🔗"
                      )}
                    </div>
                    <div className={styles.linkTitle}>{app.Title}</div>
                  </a>
                ))}
            </div>
          )}

          {/* ---------------- Custom Links ---------------- */}
          {activeTab === "custom" && (
            <>
              <div className={styles.linksGrid}>
                {/* Add button */}
                <button className={styles.addLinkButton} onClick={openAddForm}>
                  <div className={styles.iconCircle}>
                    <img src={addLinkIcon} alt="" />
                  </div>
                  <div className={styles.linkTitle}>Add Links</div>
                </button>

                {/* Custom link items */}
                {customLinks.map((link, index) => (
                  <div key={index} className={styles.customLinkItem}>
                    <a
                      href={link.URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.linkItem}
                    >
                      <div className={styles.iconCircle}>🔗</div>
                      <div className={styles.linkTitle}>{link.Title}</div>
                    </a>

                    <div className={styles.menuWrapper}>
                      <IconButton
                        iconProps={{ iconName: "MoreVertical" }}
                        onClick={() =>
                          setMenuOpenIndex(
                            menuOpenIndex === index ? null : index
                          )
                        }
                      />

                      {menuOpenIndex === index && (
                        <div ref={menuRef} className={styles.menuedit}>
                          <button onClick={() => openEditForm(index)}>
                            {/* <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M19.089 14.4422V18.8822C19.0888 19.5104 18.8391 20.1128 18.3949 20.557C17.9507 21.0013 17.3483 21.2509 16.72 21.2512H5.11904C4.8068 21.2511 4.49765 21.1892 4.20938 21.0693C3.9211 20.9493 3.65937 20.7735 3.43923 20.5521C3.21909 20.3307 3.04488 20.0679 2.92661 19.7789C2.80833 19.4899 2.74833 19.1804 2.75004 18.8682V7.2802C2.74818 6.96845 2.80822 6.65943 2.92666 6.37104C3.04511 6.08266 3.21961 5.82066 3.44006 5.60021C3.6605 5.37977 3.92251 5.20526 4.21089 5.08682C4.49927 4.96837 4.80829 4.90834 5.12004 4.9102H9.55904"
                                stroke="#4D5257"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M19.089 8.9957L15.004 4.9097M6.83399 15.8037V13.6387C6.83599 13.2817 6.97799 12.9387 7.22899 12.6857L16.761 3.1537C16.8875 3.02581 17.0381 2.92427 17.204 2.85498C17.37 2.78568 17.5481 2.75 17.728 2.75C17.9079 2.75 18.0859 2.78568 18.2519 2.85498C18.4179 2.92427 18.5685 3.02581 18.695 3.1537L20.846 5.3047C20.9739 5.43118 21.0754 5.58177 21.1447 5.74776C21.214 5.91374 21.2497 6.09183 21.2497 6.2717C21.2497 6.45157 21.214 6.62965 21.1447 6.79564C21.0754 6.96163 20.9739 7.11222 20.846 7.2387L11.314 16.7707C11.0605 17.0224 10.7182 17.1643 10.361 17.1657H8.19599C8.01705 17.166 7.83982 17.1309 7.67446 17.0626C7.5091 16.9942 7.35884 16.8939 7.23232 16.7674C7.10579 16.6408 7.00548 16.4906 6.93713 16.3252C6.86877 16.1599 6.83372 15.9826 6.83399 15.8037Z"
                                stroke="#4D5257"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg> */}
                            <img src={editIcon} alt="" />
                            Edit
                          </button>
                          <button onClick={() => deleteLink(index)}>
                            {/* <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M5.03418 5.77637C10.2847 5.24342 15.6193 5.44852 20.9912 5.97559L20.9922 5.97754V5.98047H20.9521C15.6473 5.45069 10.3269 5.24871 5.04297 5.78418L3.00781 5.9834H2.99805L2.99609 5.98242L2.99512 5.97949C2.99497 5.97797 2.99512 5.97659 2.99512 5.97559L5.03223 5.77734L5.03418 5.77637Z"
                                fill="#DA291C"
                                stroke="#BC3D1D"
                                stroke-width="1.5"
                              />
                              <path
                                d="M9.4502 2.23047C9.37416 2.2743 9.29982 2.32778 9.22949 2.39355C9.00884 2.60008 8.90972 2.85125 8.85352 3.04785C8.80037 3.23386 8.76384 3.45524 8.72949 3.65918L8.51855 4.84961L8.71777 3.66406V3.66309C8.80282 3.15283 8.87904 2.78191 9.10156 2.50684C9.17456 2.41665 9.28212 2.31758 9.4502 2.23047ZM10.6875 2H13.3076C13.4698 2 13.616 2.00902 13.748 2.02246C13.6107 2.01281 13.4659 2.00977 13.3174 2.00977H10.6982C10.5402 2.00977 10.3862 2.01325 10.2412 2.02344C10.3747 2.01001 10.5227 2.00001 10.6875 2ZM14.9629 2.61426C14.9705 2.62602 14.9772 2.63834 14.9844 2.65039C14.977 2.63859 14.9708 2.626 14.9629 2.61426ZM14.8115 2.42871C14.8172 2.43426 14.8227 2.43978 14.8281 2.44531C14.8227 2.43971 14.8171 2.43426 14.8115 2.42871Z"
                                fill="#DA291C"
                                stroke="#BC3D1D"
                                stroke-width="1.5"
                              />
                              <path
                                d="M5.87598 20.0273C5.86535 19.9516 5.85619 19.8738 5.84766 19.7939L5.79883 19.209L5.14844 9.14355L5.15039 9.14258L5.15234 9.14453V9.14648L5.80176 19.21L5.80273 19.2158C5.82264 19.4909 5.84092 19.7695 5.87598 20.0273ZM5.87598 20.0273C5.88396 20.0842 5.89382 20.1398 5.90332 20.1943C5.8939 20.1398 5.8837 20.0842 5.87598 20.0273ZM6.01465 20.6484C6.08724 20.861 6.19416 21.073 6.3584 21.2646C6.4236 21.3407 6.49414 21.4091 6.56934 21.4707C6.43695 21.3688 6.33841 21.261 6.2627 21.1553C6.1544 21.004 6.07593 20.8345 6.01465 20.6484ZM17.6357 21.2783C17.6145 21.302 17.5925 21.3261 17.5684 21.3496C17.5912 21.3264 17.614 21.3031 17.6357 21.2783ZM17.7383 21.1553C17.7224 21.1775 17.7026 21.1974 17.6846 21.2197C17.7106 21.1871 17.7358 21.1546 17.7588 21.1211C17.7514 21.132 17.746 21.1445 17.7383 21.1553ZM17.8594 20.9541C17.8553 20.9619 17.8518 20.9699 17.8477 20.9775C17.8519 20.9699 17.8553 20.9618 17.8594 20.9541ZM5.91992 20.2861C5.94139 20.3945 5.96854 20.5057 6.00488 20.6172C5.97181 20.5121 5.9428 20.4022 5.91992 20.2861ZM18.8496 9.14551L18.2021 19.209C18.1939 19.3256 18.1831 19.4384 18.1738 19.5479C18.1822 19.436 18.1918 19.3233 18.1992 19.2109V19.21L18.8477 9.14941C18.8477 9.14941 18.8477 9.14724 18.8496 9.14551Z"
                                fill="#DA291C"
                                stroke="#BC3D1D"
                                stroke-width="1.5"
                              />
                              <mask
                                id="path-4-inside-1_24956_130529"
                                fill="white"
                              >
                                <path d="M13.6581 17.25H10.3281C9.91813 17.25 9.57812 16.91 9.57812 16.5C9.57812 16.09 9.91813 15.75 10.3281 15.75H13.6581C14.0681 15.75 14.4081 16.09 14.4081 16.5C14.4081 16.91 14.0681 17.25 13.6581 17.25Z" />
                              </mask>
                              <path
                                d="M13.6581 17.25H10.3281C9.91813 17.25 9.57812 16.91 9.57812 16.5C9.57812 16.09 9.91813 15.75 10.3281 15.75H13.6581C14.0681 15.75 14.4081 16.09 14.4081 16.5C14.4081 16.91 14.0681 17.25 13.6581 17.25Z"
                                fill="#DA291C"
                              />
                              <path
                                d="M13.6581 17.25V15.75H10.3281V17.25V18.75H13.6581V17.25ZM10.3281 17.25V15.75C10.7466 15.75 11.0781 16.0816 11.0781 16.5H9.57812H8.07812C8.07812 17.7384 9.0897 18.75 10.3281 18.75V17.25ZM9.57812 16.5H11.0781C11.0781 16.9184 10.7466 17.25 10.3281 17.25V15.75V14.25C9.0897 14.25 8.07812 15.2616 8.07812 16.5H9.57812ZM10.3281 15.75V17.25H13.6581V15.75V14.25H10.3281V15.75ZM13.6581 15.75V17.25C13.2397 17.25 12.9081 16.9184 12.9081 16.5H14.4081H15.9081C15.9081 15.2616 14.8966 14.25 13.6581 14.25V15.75ZM14.4081 16.5H12.9081C12.9081 16.0816 13.2397 15.75 13.6581 15.75V17.25V18.75C14.8966 18.75 15.9081 17.7384 15.9081 16.5H14.4081Z"
                                fill="#BC3D1D"
                                mask="url(#path-4-inside-1_24956_130529)"
                              />
                              <mask
                                id="path-6-inside-2_24956_130529"
                                fill="white"
                              >
                                <path d="M14.5 13.25H9.5C9.09 13.25 8.75 12.91 8.75 12.5C8.75 12.09 9.09 11.75 9.5 11.75H14.5C14.91 11.75 15.25 12.09 15.25 12.5C15.25 12.91 14.91 13.25 14.5 13.25Z" />
                              </mask>
                              <path
                                d="M14.5 13.25H9.5C9.09 13.25 8.75 12.91 8.75 12.5C8.75 12.09 9.09 11.75 9.5 11.75H14.5C14.91 11.75 15.25 12.09 15.25 12.5C15.25 12.91 14.91 13.25 14.5 13.25Z"
                                fill="#DA291C"
                              />
                              <path
                                d="M14.5 13.25V11.75H9.5V13.25V14.75H14.5V13.25ZM9.5 13.25V11.75C9.91843 11.75 10.25 12.0816 10.25 12.5H8.75H7.25C7.25 13.7384 8.26157 14.75 9.5 14.75V13.25ZM8.75 12.5H10.25C10.25 12.9184 9.91843 13.25 9.5 13.25V11.75V10.25C8.26157 10.25 7.25 11.2616 7.25 12.5H8.75ZM9.5 11.75V13.25H14.5V11.75V10.25H9.5V11.75ZM14.5 11.75V13.25C14.0816 13.25 13.75 12.9184 13.75 12.5H15.25H16.75C16.75 11.2616 15.7384 10.25 14.5 10.25V11.75ZM15.25 12.5H13.75C13.75 12.0816 14.0816 11.75 14.5 11.75V13.25V14.75C15.7384 14.75 16.75 13.7384 16.75 12.5H15.25Z"
                                fill="#BC3D1D"
                                mask="url(#path-6-inside-2_24956_130529)"
                              />
                            </svg> */}
                            <img src={trashIcon} alt="" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ---------------- Inline Add/Edit Form ---------------- */}
              {isFormOpen && (
                <div className={styles.inlineForm}>
                  <h3 className={styles.formTitle}>
                    {isEditMode ? "Edit Link" : "Add Custom Links"}
                  </h3>

                  <div className={styles.formFields}>
                    <div className={styles.formField}>
                      <TextField
                        label="Add name"
                        placeholder="Add a name"
                        required
                        className={styles.inputLine}
                        value={linkTitle}
                        onChange={(e, v: any) => {
                          setLinkTitle(v);
                          if (titleError) setTitleError("");
                        }}
                        errorMessage={titleError}
                        styles={{
                          fieldGroup: { borderRadius: 8 },
                        }}
                      />
                    </div>

                    <div className={styles.formField}>
                      <TextField
                        label="Enter your URL"
                        placeholder="https://example.com"
                        value={linkURL}
                        required
                        className={styles.inputLine}
                        onChange={(e, v: any) => {
                          setLinkURL(v);
                          if (urlError) setUrlError(urlError);
                        }}
                        errorMessage={urlError}
                        styles={{
                          fieldGroup: { borderRadius: 8 },
                        }}
                      />
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <DefaultButton
                      text="Cancel"
                      onClick={cancelForm}
                    />
                    <PrimaryButton
                      text="Save"
                      onClick={saveForm}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Success Message */}
          {showSuccessMessage && (
            <div className={styles.successMessage}>
              <span className={styles.successIcon}>✓</span>
              <span className={styles.successText}>{successMessage}</span>
              <button
                className={styles.closeButton}
                onClick={() => setShowSuccessMessage(false)}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppsAndLinks;
