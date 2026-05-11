import * as React from "react";
import { useState, useEffect, useRef } from "react";
import styles from "./AppsAndLinks.module.scss";
import { listServices } from "../../services/listServices";
import { Dialog, DialogContent, DialogType } from "@fluentui/react/lib/Dialog";

const addLinkIcon: string = require("../../../webparts/assets/add-square.svg");
const editIcon: string = require("../../../webparts/assets/editIcon.svg");
const trashIcon: string = require("../../../webparts/assets/trashIcon.svg");
const uploadIcon: string = require("../../../webparts/assets/upload.svg");

import { IconButton, DefaultButton, PrimaryButton } from "@fluentui/react/lib/Button";
import { TextField } from "@fluentui/react/lib/TextField";

import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

type TabType = "quick" | "app" | "custom";

export interface IAppsAndLinksProps {
  isHidden: boolean;
  savedApps: any[];
  hideAppsAndLinks: () => void;
  context: any;

  // tab coming from ServiceLinks (quick/app/custom)
  initialTab?: TabType;
}

interface ICustomLink {
  Title: string;
  URL: string;
  IconData?: string; // base64 data url (data:image/..;base64,...)
  IconURL?: string;  // optional legacy
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
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

// helper: file -> data URL
const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

const AppsAndLinks = (props: IAppsAndLinksProps) => {
  const sp: SPFI = React.useMemo(() => spfi().using(SPFx(props.context)), [props.context]);

  const [activeTab, setActiveTab] = useState<TabType>("quick");
  const [customLinks, setCustomLinks] = useState<ICustomLink[]>([]);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Upload state
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      const items: IUserListItem[] = await spService.getCustomAppLinks("Custom App Links", userEmail);

      if (items.length > 0 && items[0][APPLINK_COL]) {
        const parsed = JSON.parse(items[0][APPLINK_COL] || "[]");

        // normalize for old data
        const normalized: ICustomLink[] = Array.isArray(parsed)
          ? parsed.map((x: any) => ({
              Title: x?.Title ?? "",
              URL: x?.URL ?? "",
              IconData: x?.IconData,
              IconURL: x?.IconURL
            }))
          : [];

        setCustomLinks(normalized);
      } else {
        setCustomLinks([]);
      }
    } catch (err) {
      console.error("Error loading user links:", err);
    }
  };

  useEffect(() => {
    loadUserLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // set tab same as ServiceLinks active tab
  useEffect(() => {
    if (!props.isHidden) {
      setActiveTab(props.initialTab ?? "quick");
    }
  }, [props.isHidden, props.initialTab]);

  // Reset to default state when dialog is hidden
  useEffect(() => {
    if (props.isHidden) {
      setActiveTab("quick");
      setIsFormOpen(false);
      setMenuOpenIndex(null);
      setShowSuccessMessage(false);
      resetFormState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        await sp.web.lists.getByTitle(LIST_NAME).items.getById(existingItems[0].Id).update(payload);
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
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openAddForm = () => {
    setIsEditMode(false);
    setEditingIndex(null);
    resetFormState();
    setIsFormOpen(true);
    setMenuOpenIndex(null);
  };

  const openEditForm = (index: number) => {
    setIsEditMode(true);
    setEditingIndex(index);
    setLinkTitle(customLinks[index]?.Title || "");
    setLinkURL(customLinks[index]?.URL || "");
    setTitleError("");
    setUrlError("");
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsFormOpen(true);
    setMenuOpenIndex(null);
  };

  const validateForm = (): boolean => {
    let isValid = true;
    setTitleError("");
    setUrlError("");

    if (!linkTitle.trim()) {
      setTitleError("Name is required");
      isValid = false;
    } else {
      const duplicateExists = customLinks.some((link, index) => {
        if (isEditMode && index === editingIndex) return false;
        return (link.Title || "").toLowerCase() === linkTitle.trim().toLowerCase();
      });

      if (duplicateExists) {
        setTitleError("This name already exists");
        isValid = false;
      }
    }

    if (!linkURL.trim()) {
      setUrlError("URL is required");
      isValid = false;
    } else if (!isValidURL(linkURL.trim())) {
      setUrlError("Not a valid URL. Please check the spelling entered correctly");
      isValid = false;
    }

    return isValid;
  };

  // Upload handlers
  const onClickUpload = () => fileInputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    // images only
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file only.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadedImage(null);
      return;
    }

    // optional: size guard (2MB)
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      alert("Image is too large. Please upload an image under 2MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadedImage(null);
      return;
    }

    setUploadedImage(file);
  };

  const saveForm = async () => {
    if (!validateForm()) return;

    let iconData: string | undefined;

    // if user uploaded image, convert to base64
    if (uploadedImage) {
      try {
        iconData = await fileToDataUrl(uploadedImage);
      } catch (e) {
        console.error(e);
        alert("Unable to read the selected image. Please try again.");
        return;
      }
    }

    const updatedLinks = [...customLinks];

    if (isEditMode && editingIndex !== null) {
      const existing = updatedLinks[editingIndex];

      updatedLinks[editingIndex] = {
        ...existing, // ✅ preserves any other fields
        Title: linkTitle.trim(),
        URL: linkURL.trim(),
        // ✅ keep old icon if new not selected
        IconData: iconData ?? existing?.IconData,
      };
    } else {
      updatedLinks.push({
        Title: linkTitle.trim(),
        URL: linkURL.trim(),
        IconData: iconData, // optional
      });
    }

    setCustomLinks(updatedLinks);
    await persistToSharePoint(updatedLinks);

    setIsFormOpen(false);
    resetFormState();

    setSuccessMessage(isEditMode ? "Successfully updated 1 custom URL" : "Successfully added 1 custom URL");
    setShowSuccessMessage(true);

    setTimeout(() => setShowSuccessMessage(false), 3000);
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
      modalProps={{
        className: styles.serviceLinksDialog,
      }}
      minWidth={0}
    >
      <div className={styles.divider}></div>

      <DialogContent>
        <div className={styles.container}>
          {/* Tabs */}
          <div className={styles.tabContainer}>
            <button className={`${styles.tab} ${activeTab === "quick" && styles.activeTab}`} onClick={() => setActiveTab("quick")}>
              Quick Links
            </button>
            <button className={`${styles.tab} ${activeTab === "app" && styles.activeTab}`} onClick={() => setActiveTab("app")}>
              App Links
            </button>
            <button className={`${styles.tab} ${activeTab === "custom" && styles.activeTab}`} onClick={() => setActiveTab("custom")}>
              Custom Links
            </button>
          </div>

          {/* Quick Links */}
          {activeTab === "quick" && (
            <div className={styles.linksGrid}>
              {props.savedApps
                .filter((app) => app.AppType === "Quick Links")
                .map((link, index) => (
                  <a key={index} target="_blank" rel="noopener noreferrer" href={link.URL} className={styles.linkItem}>
                    <div className={styles.iconCircle}>
                      {link.IconURL ? <img src={link.IconURL} className={styles.appIcon} alt="" /> : "🔗"}
                    </div>
                    <div className={styles.linkTitle}>{link.Title}</div>
                  </a>
                ))}
            </div>
          )}

          {/* App Links */}
          {activeTab === "app" && (
            <div className={styles.linksGrid}>
              {props.savedApps
                .filter((app) => app.AppType === "App Links")
                .map((app, index) => (
                  <a key={index} target="_blank" rel="noopener noreferrer" href={app.URL} className={styles.linkItem}>
                    <div className={styles.iconCircle}>
                      {app.IconURL ? <img src={app.IconURL} className={styles.appIcon} alt="" /> : "🔗"}
                    </div>
                    <div className={styles.linkTitle}>{app.Title}</div>
                  </a>
                ))}
            </div>
          )}

          {/* Custom Links */}
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
                    <a href={link.URL} target="_blank" rel="noopener noreferrer" className={styles.linkItem}>
                      <div className={styles.iconCircle}>
                        {link.IconData ? (
                          <img src={link.IconData} className={styles.customAppIcon} alt="" />
                        ) : (
                          "🔗"
                        )}
                      </div>
                      <div className={styles.linkTitle}>{link.Title}</div>
                    </a>

                    <div className={styles.menuWrapper}>
                      <IconButton
                        iconProps={{ iconName: "MoreVertical" }}
                        onClick={() => setMenuOpenIndex(menuOpenIndex === index ? null : index)}
                      />

                      {menuOpenIndex === index && (
                        <div ref={menuRef} className={styles.menuedit}>
                          <button onClick={() => openEditForm(index)}>
                            <img src={editIcon} alt="" />
                            Edit
                          </button>
                          <button onClick={() => deleteLink(index)}>
                            <img src={trashIcon} alt="" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Inline Add/Edit Form */}
              {isFormOpen && (
                <div className={styles.inlineForm}>
                  <h3 className={styles.formTitle}>{isEditMode ? "Edit Link" : "Add Custom Links"}</h3>

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
                        styles={{ fieldGroup: { borderRadius: 8 } }}
                      />

                      {/* Upload Image */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className={styles.hiddenFileInput}
                        onChange={onFileChange}
                      />

                      <button type="button" className={styles.uploadBtn} onClick={onClickUpload}>
                        <span>Upload Image</span>
                        <img className={styles.uploadIcon} src={uploadIcon} alt="" />
                      </button>
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
                          if (urlError) setUrlError(""); // ✅ fixed
                        }}
                        errorMessage={urlError}
                        styles={{ fieldGroup: { borderRadius: 8 } }}
                      />
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <DefaultButton text="Cancel" onClick={cancelForm} />
                    <PrimaryButton text="Save" onClick={saveForm} />
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
              <button className={styles.closeButton} onClick={() => setShowSuccessMessage(false)}>
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
