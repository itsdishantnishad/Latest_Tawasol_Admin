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

const AppsAndLinks = (props: IAppsAndLinksProps) => {
  const sp: SPFI = React.useMemo(() => spfi().using(SPFx(props.context)), [props.context]);
  const [activeTab, setActiveTab] = useState("quick");
  const [customLinks, setCustomLinks] = useState<ICustomLink[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  let spService: listServices;
   spService = new listServices(props.context);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkURL, setLinkURL] = useState("");

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

  const openAddForm = () => {
    setIsEditMode(false);
    setLinkTitle("");
    setLinkURL("");
    setIsFormOpen(true);
    setMenuOpenIndex(null);
  };

  const openEditForm = (index: number) => {
    setIsEditMode(true);
    setEditingIndex(index);
    setLinkTitle(customLinks[index].Title);
    setLinkURL(customLinks[index].URL);
    setIsFormOpen(true);
    setMenuOpenIndex(null);
  };

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

  const cancelForm = () => {
    setIsFormOpen(false);
    setLinkTitle("");
    setLinkURL("");
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
                <a key={index}target="_blank" rel="noopener noreferrer" href={link.URL} className={styles.linkItem}>
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
                        onChange={(e, v: any) => setLinkTitle(v)}
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
                        onChange={(e, v: any) => setLinkURL(v)}
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