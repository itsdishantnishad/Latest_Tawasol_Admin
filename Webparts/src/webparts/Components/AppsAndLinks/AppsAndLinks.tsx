import * as React from "react";
import { useState, useEffect, useRef } from "react";
import styles from "./AppsAndLinks.module.scss";

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
}

const LIST_NAME = "test"; // your list name
const USER_EMAIL_COL = "UserEmail";
const APPLINK_COL = "AppLink";

const AppsAndLinks = (props: IAppsAndLinksProps) => {
    const sp: SPFI = React.useMemo(() => spfi().using(SPFx(props.context)), [props.context]);
  const [activeTab, setActiveTab] = useState("quick");
  const [customLinks, setCustomLinks] = useState<ICustomLink[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [linkTitle, setLinkTitle] = useState("");
  const [linkURL, setLinkURL] = useState("");

  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const userEmail = props.context.pageContext.user.email;

  // Quick links sample
  const quickLinks = [
    { Title: "IT Help Request", IconURL: "🖥️", URL: "#" },
    { Title: "Learning @ Dhre", IconURL: "📖", URL: "#" },
    { Title: "Performance Management", IconURL: "📊", URL: "#" },
    { Title: "Leave Request", IconURL: "📋", URL: "#" },
    { Title: "Password Reset", IconURL: "🔄", URL: "#" },
    { Title: "Biometric Attendance", IconURL: "👤", URL: "#" },
    { Title: "Data Protection", IconURL: "🔒", URL: "#" }
  ];

  /** -------------------------
   * Load user's existing custom links
   ------------------------- */
  const loadUserLinks = async () => {
    try {
      const items: IUserListItem[] = await sp.web.lists
        .getByTitle(LIST_NAME)
        .items.select("Id", USER_EMAIL_COL, APPLINK_COL)
        .filter(`${USER_EMAIL_COL} eq '${userEmail}'`)();

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

  /** -------------------------
   * Save to SharePoint List (Add or Update)
   ------------------------- */
  const persistToSharePoint = async (updatedLinks: ICustomLink[]) => {
    try {
      const existingItems: IUserListItem[] = await sp.web.lists
        .getByTitle(LIST_NAME)
        .items.select("Id", USER_EMAIL_COL, APPLINK_COL)
        .filter(`${USER_EMAIL_COL} eq '${userEmail}'`)();

      const payload = {
        [USER_EMAIL_COL]: userEmail,
        [APPLINK_COL]: JSON.stringify(updatedLinks)
      };

      if (existingItems.length > 0) {
        // update
        await sp.web.lists
          .getByTitle(LIST_NAME)
          .items.getById(existingItems[0].Id)
          .update(payload);
      } else {
        // create new
        await sp.web.lists.getByTitle(LIST_NAME).items.add(payload);
      }
    } catch (err) {
      console.error("Error saving link:", err);
    }
  };

  /** -------------------------
   * Open Add Form
   ------------------------- */
  const openAddForm = () => {
    setIsEditMode(false);
    setLinkTitle("");
    setLinkURL("");
    setIsFormOpen(true);
  };

  const openEditForm = (index: number) => {
    setIsEditMode(true);
    setEditingIndex(index);
    setLinkTitle(customLinks[index].Title);
    setLinkURL(customLinks[index].URL);
    setIsFormOpen(true);
  };

  /** -------------------------
   * Save/Add/Update link
   ------------------------- */
  const saveForm = async () => {
    if (!linkTitle || !linkURL) return;

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

  /** -------------------------
   * Delete Link
   ------------------------- */
  const deleteLink = async (index: number) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    const updatedLinks = customLinks.filter((_, i) => i !== index);
    setCustomLinks(updatedLinks);
    await persistToSharePoint(updatedLinks);

    setMenuOpenIndex(null);
  };

  /** -------------------------
   * Detect click outside menu
   ------------------------- */
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
              {quickLinks.map((link, index) => (
                <a key={index} href={link.URL} className={styles.linkItem}>
                  <div className={styles.iconCircle}>{link.IconURL}</div>
                  <div className={styles.linkTitle}>{link.Title}</div>
                </a>
              ))}
            </div>
          )}

          {/* ---------------- Apps Links ---------------- */}
          {activeTab === "app" && (
            <div className={styles.linksGrid}>
              {props.savedApps?.map((app, index) => (
                <a key={index} href={app.URL} className={styles.linkItem}>
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
            <div className={styles.linksGrid}>
              {/* Add button */}
              <button className={styles.addLinkButton} onClick={openAddForm}>
                <div className={styles.iconCircle}>+</div>
                <div className={styles.linkTitle}>Add Link</div>
              </button>

              {/* Custom link items */}
              {customLinks.map((link, index) => (
                <div key={index} className={styles.customLinkItem}>
                  <a href={link.URL} className={styles.linkItem}>
                    <div className={styles.iconCircle}>🔗</div>
                    <div className={styles.linkTitle}>{link.Title}</div>
                  </a>

                  {/* Icon (3-dot or gear icon) */}
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
          )}
        </div>
      </DialogContent>

      {/* ---------------- Add/Edit Form Dialog ---------------- */}
      <Dialog
        hidden={!isFormOpen}
        onDismiss={() => setIsFormOpen(false)}
        dialogContentProps={{
          type: DialogType.normal,
          title: isEditMode ? "Edit Link" : "Add Link",
          showCloseButton: true
        }}
      >
        <DialogContent>
          <TextField
            label="Link Title"
            value={linkTitle}
            onChange={(e, v:any) => setLinkTitle(v)}
          />
          <TextField
            label="URL"
            value={linkURL}
            onChange={(e, v:any) => setLinkURL(v)}
          />

          <div style={{ marginTop: 20, textAlign: "right" }}>
            <DefaultButton
              text="Cancel"
              onClick={() => setIsFormOpen(false)}
              style={{ marginRight: 10 }}
            />
            <PrimaryButton text="Save" onClick={saveForm} />
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

export default AppsAndLinks;