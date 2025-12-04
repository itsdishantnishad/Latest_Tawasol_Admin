import * as React from "react";
import { useState, useEffect, useRef } from "react";
import styles from "./AppsAndLinks.module.scss";
import { listServices } from "../../services/listServices";
import {
  Dialog,
  DialogContent,
  DialogType
} from "@fluentui/react/lib/Dialog";

import {
  IconButton,
  DefaultButton,
  PrimaryButton
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

// Helper regex for URL validation (Requires http:// or https://)
const URL_REGEX = /^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

const AppsAndLinks = (props: IAppsAndLinksProps) => {
  const sp: SPFI = React.useMemo(() => spfi().using(SPFx(props.context)), [props.context]);
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

  const spService = new listServices(props.context);

  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const userEmail = props.context.pageContext.user.loginName;

  const loadUserLinks = async () => {
    try {
      const items: IUserListItem[] = await spService.getCustomAppLinks("Custom App Links", userEmail);
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

  const persistToSharePoint = async (updatedLinks: ICustomLink[]) => {
    try {
      // In a real scenario, consider Debouncing this or handling race conditions
      // For this snippet, we follow existing logic
      const existingItems: IUserListItem[] = await sp.web.lists
        .getByTitle(LIST_NAME)
        .items.select("Id", USER_EMAIL_COL, APPLINK_COL)
        .filter(`${USER_EMAIL_COL} eq '${userEmail}'`)();

      const payload = {
        [USER_EMAIL_COL]: userEmail,
        [APPLINK_COL]: JSON.stringify(updatedLinks)
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
    
    // 1. Validate Title Empty
    if (!linkTitle.trim()) {
      setTitleError("Name is required");
      isValid = false;
    } else {
      // 4. Validate Duplicate Name
      // We filter out the current item if we are in edit mode so we don't compare it against itself
      const duplicateExists = customLinks.some((link, index) => {
         if (isEditMode && index === editingIndex) return false;
         return link.Title.toLowerCase() === linkTitle.trim().toLowerCase();
      });

      if (duplicateExists) {
        setTitleError("This name already exists");
        isValid = false;
      }
    }

    // 2. Validate URL Empty
    if (!linkURL.trim()) {
      setUrlError("URL is required");
      isValid = false;
    } else if (!URL_REGEX.test(linkURL)) {
      // 3. Validate URL Format
      setUrlError("Invalid URL format (must start with http:// or https://)");
      isValid = false;
    }

    return isValid;
  };

  const saveForm = async () => {
    // Clear previous errors first? 
    // Usually better to just set errors based on validation.
    setTitleError("");
    setUrlError("");

    if (!validateForm()) {
      return; 
    }

    let updatedLinks = [...customLinks];

    if (isEditMode && editingIndex !== null) {
      updatedLinks[editingIndex] = { Title: linkTitle, URL: linkURL };
    } else {
      updatedLinks.push({ Title: linkTitle, URL: linkURL });
    }

    setCustomLinks(updatedLinks);
    await persistToSharePoint(updatedLinks);

    setIsFormOpen(false);
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
        showCloseButton: true
      }}
      minWidth={"800px"}
    >
      <DialogContent>
        <div className={styles.container}>

          {/* Tabs */}
          <div className={styles.tabContainer}>
            <button
              className={`${styles.tab} ${activeTab === "quick" && styles.activeTab}`}
              onClick={() => setActiveTab("quick")}
            >
              Quick Links
            </button>

            <button
              className={`${styles.tab} ${activeTab === "app" && styles.activeTab}`}
              onClick={() => setActiveTab("app")}
            >
              App Links
            </button>

            <button
              className={`${styles.tab} ${activeTab === "custom" && styles.activeTab}`}
              onClick={() => setActiveTab("custom")}
            >
              Custom Links
            </button>
          </div>

          {/* ---------------- Quick Links ---------------- */}
          {activeTab === "quick" && (
            <div className={styles.linksGrid}>
              {props.savedApps.filter(app => app.AppType === "Quick Links").map((link, index) => (
                <a key={index} target="_blank" rel="noopener noreferrer" href={link.URL} className={styles.linkItem}>
                  <div className={styles.iconCircle}> {link.IconURL ? (
                      <img src={link.IconURL} className={styles.appIcon} />
                    ) : (
                      "🔗"
                    )}</div>
                  <div className={styles.linkTitle}>{link.Title}</div>
                </a>
              ))}
            </div>
          )}

          {/* ---------------- Apps Links ---------------- */}
          {activeTab === "app" && (
            <div className={styles.linksGrid}>
              {props.savedApps.filter(app => app.AppType === "App Links").map((app, index) => (
                <a key={index} target="_blank" rel="noopener noreferrer" href={app.URL} className={styles.linkItem}>
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
                  <div className={styles.iconCircle}>+</div>
                  <div className={styles.linkTitle}>Add Link</div>
                </button>

                {/* Custom link items */}
                {customLinks.map((link, index) => (
                  <div key={index} className={styles.customLinkItem}>
                    <a href={link.URL} target="_blank" rel="noopener noreferrer" className={styles.linkItem}>
                      <div className={styles.iconCircle}>🔗</div>
                      <div className={styles.linkTitle}>{link.Title}</div>
                    </a>

                    <div className={styles.menuWrapper}>
                      <IconButton
                        iconProps={{ iconName: "MoreVertical" }}
                        onClick={() =>
                          setMenuOpenIndex(menuOpenIndex === index ? null : index)
                        }
                      />

                      {menuOpenIndex === index && (
                        <div ref={menuRef} className={styles.menu}>
                          <button onClick={() => openEditForm(index)}>
                            Edit
                          </button>
                          <button onClick={() => deleteLink(index)}>
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
                        value={linkTitle}
                        onChange={(e, v: any) => {
                          setLinkTitle(v);
                          if (titleError) setTitleError(""); // Clear error on type
                        }}
                        errorMessage={titleError} // Bind error state
                        styles={{
                          fieldGroup: { borderRadius: 8 }
                        }}
                      />
                    </div>

                    <div className={styles.formField}>
                      <TextField
                        label="Enter your URL"
                        placeholder="Enter your URL here"
                        value={linkURL}
                        required
                        onChange={(e, v: any) => {
                          setLinkURL(v);
                          if (urlError) setUrlError(""); // Clear error on type
                        }}
                        errorMessage={urlError} // Bind error state
                        styles={{
                          fieldGroup: { borderRadius: 8 }
                        }}
                      />
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <DefaultButton
                      text="Cancel"
                      onClick={cancelForm}
                      styles={{
                        root: {
                          borderRadius: 24,
                          border: '2px solid #000',
                          minWidth: 200,
                          height: 48
                        }
                      }}
                    />
                    <PrimaryButton
                      text="Save"
                      onClick={saveForm}
                      styles={{
                        root: {
                          borderRadius: 24,
                          minWidth: 200,
                          height: 48,
                          backgroundColor: '#b8b8b8'
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AppsAndLinks;