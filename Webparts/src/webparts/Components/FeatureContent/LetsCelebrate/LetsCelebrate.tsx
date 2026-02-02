// src/webparts/Components/FeatureContent/LetsCelebrate/LetsCelebrate.tsx

import * as React from "react";
import styles from "./LetsCelebrate.module.scss";
import { listServices } from "../../../services/listServices";
import { getSP } from "../../../services/spSetUp/pnpConfig";
import {
  TahweelService,
  TahweelActiveEmployee,
} from "../../../services/Integration/TahweelService";

// Shimmer wrapper (Option 1 shared)
import { LoadingBoundary } from "../../LoadingShimmer";
import { MessageBar, MessageBarType, DefaultButton } from "@fluentui/react";

const cakeImage: string = require("../images/Cake-1.svg");
const newJoinerCenter: string = require("../images/Newjoiner.svg");
const aniversaryImage: string = require("../images/aniversary.svg");
const Congratulations_Icon: string = require("../../../letsCelebrate/assets/congratulationIcon.jpg");

export interface ICelebration {
  id: string;
  name: string;
  department?: string;
  date?: string;
  type: "birthday" | "anniversary" | "newJoiner" | "Achievement";
  image?: string;
  description?: string;
  contact?: string;
  email?: string;
}

export interface ILetsCelebrateProps {
  celebrations?: {
    birthdays: ICelebration[];
    anniversaries: ICelebration[];
    newJoiners: ICelebration[];
    Achievements?: ICelebration[];
  };
  onViewAll?: () => void;
  seeAllURL?: string;
  context: any;
}

// Position assignments for outer circle (2 positions - left and right)
const outerPositions: Array<"left" | "right"> = ["left", "right"];

// Position assignments for inner circle (2 positions)
const innerPositions: Array<"bottom-left" | "bottom-right"> = [
  "bottom-left",
  "bottom-right",
];

// ---- date helpers (API gives DD-MMM-YYYY or YYYY-MM-DD) ----
const monthMap: { [k: string]: number } = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
};

const parseMonthDay = (raw?: string): { m: number; d: number } | null => {
  const v = (raw || "").trim();
  if (!v) return null;

  const parts = v.split("-");
  if (parts.length < 2) return null;

  // "YYYY-MM-DD"
  if (parts[0].length === 4) {
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (!m || !d) return null;
    return { m: m - 1, d };
  }

  // "DD-MMM-YYYY"
  const d = parseInt(parts[0], 10);
  const mon = (parts[1] || "").toUpperCase();
  const m = monthMap[mon];
  if (m === undefined || !d) return null;
  return { m, d };
};

const isTodayFromRaw = (raw?: string): boolean => {
  const md = parseMonthDay(raw);
  if (!md) return false;
  const now = new Date();
  return now.getMonth() === md.m && now.getDate() === md.d;
};

const shuffle = <T,>(arr: T[]): T[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
};

const normalizeFullName = (raw: string): string => {
  const v = (raw || "").toString().trim();
  if (!v) return "";

  // "Last, First Middle" -> "First Middle Last"
  if (v.indexOf(",") >= 0) {
    const parts = v.split(",");
    const last = (parts[0] || "").trim();
    const first = (parts.slice(1).join(" ") || "").trim();
    const merged = (first + " " + last).trim();
    return merged.replace(/\s+/g, " ");
  }

  return v.replace(/\s+/g, " ");
};

// Image/Hyperlink column URL extractor (object/string/JSON-string safe)
const extractUrl = (value: any): string => {
  if (!value) return "";

  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return "";
    if (
      (s.startsWith("{") && s.endsWith("}")) ||
      (s.startsWith("[") && s.endsWith("]"))
    ) {
      try {
        const parsed = JSON.parse(s);
        return parsed?.Url || parsed?.url || parsed?.serverRelativeUrl || "";
      } catch {
        return s;
      }
    }
    return s;
  }

  if (typeof value === "object") {
    return value.Url || value.url || value.URL || value.serverRelativeUrl || "";
  }

  return "";
};

export const LetsCelebrate: React.FC<ILetsCelebrateProps> = (props) => {
  const [activeTab, setActiveTab] = React.useState<
    "birthdays" | "anniversaries" | "newJoiners" | "Achievements"
  >("birthdays");

  const [currentPage, setCurrentPage] = React.useState(0);

  // SP - New Joiners + Achievements
  const [spNewJoiners, setSpNewJoiners] = React.useState<ICelebration[]>([]);
  const [spAchievements, setSpAchievements] = React.useState<ICelebration[]>([]);

  // loading/errors for ALL tabs
  const [loadingNewJoiners, setLoadingNewJoiners] = React.useState<boolean>(true);
  const [errorNewJoiners, setErrorNewJoiners] = React.useState<string | null>(null);

  const [loadingAchievements, setLoadingAchievements] = React.useState<boolean>(true);
  const [errorAchievements, setErrorAchievements] = React.useState<string | null>(null);

  // API-driven (Today only, max 4, random on reload)
  const [apiBirthdays, setApiBirthdays] = React.useState<ICelebration[]>([]);
  const [apiAnniversaries, setApiAnniversaries] = React.useState<ICelebration[]>([]);
  const [loadingBirthdays, setLoadingBirthdays] = React.useState<boolean>(true);
  const [loadingAnniversaries, setLoadingAnniversaries] = React.useState<boolean>(true);
  const [errorBirthdays, setErrorBirthdays] = React.useState<string | null>(null);
  const [errorAnniversaries, setErrorAnniversaries] = React.useState<string | null>(null);

  const openTeamsChat = (email?: string, name?: string) => {
    const e = (email || "").trim();
    if (!e) return;

    const message = getChatMessage(name || "");

    window.open(
      `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(
        e
      )}&message=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const isChatEnabledTab =
    activeTab === "newJoiners" ||
    activeTab === "birthdays" ||
    activeTab === "anniversaries";

  // Keep Tahweel service stable
  const tahweelRef = React.useRef<TahweelService | null>(null);
  React.useEffect(() => {
    tahweelRef.current = new TahweelService({
      httpClient: props.context.httpClient,
    });
  }, [props.context]);

  // Individual loaders so we can "Retry" per tab
  const loadNewJoiners = React.useCallback(async (mountedRef: { current: boolean }) => {
    setLoadingNewJoiners(true);
    setErrorNewJoiners(null);

    try {
      const spService = new listServices(props.context);
      const data = await spService.getNewJoiners("New Joiner");

      const mappedData: ICelebration[] = (data || []).map((item: any) => ({
        id: (item.Id || item.ID || item.id || item.Title || "").toString(),
        name: (item.Title || item.name || "").toString(),
        department: (item.Department || item.department || "").toString(),
        type: "newJoiner" as const,
        image: (item.UserPicture || item.image || "").toString(),
        description: (item.TIRDescription || "").toString(),
        contact: (item.TIRContact || "").toString(),
        email: (item.TIRUserEmail || "").toString(),
      }));

      if (mountedRef.current) setSpNewJoiners(mappedData);
    } catch (e: any) {
      console.error("Error fetching new joiners:", e);
      if (mountedRef.current) {
        setSpNewJoiners([]);
        setErrorNewJoiners(e?.message || "Failed to load new joiners.");
      }
    } finally {
      if (mountedRef.current) setLoadingNewJoiners(false);
    }
  }, [props.context]);

  const loadAchievements = React.useCallback(async (mountedRef: { current: boolean }) => {
    setLoadingAchievements(true);
    setErrorAchievements(null);

    try {
      const sp = getSP(props.context);

      const rows: any[] =
        (await sp.web.lists
          .getByTitle("User Achievements")
          .items.select(
            "Id",
            "Title",
            "TIRDesignation",
            "TIRMonthOfAchievement",
            "TIRUserPicture",
            "TIRContact",
            "TIRDescription"
          )()) || [];

      const mapped: ICelebration[] = rows
        .map((it: any) => ({
          id: (it.Id || it.ID || it.id || it.Title || "").toString(),
          name: (it.Title || "").toString(),
          department: (it.TIRDesignation || "").toString(),
          date: (it.TIRMonthOfAchievement || "").toString(),
          type: "Achievement" as const,
          image: extractUrl(it.TIRUserPicture),
          description: (it.TIRDescription || "").toString(),
          contact: (it.TIRContact || "").toString(),
        }))
        .filter((x) => !!x.name);

      if (mountedRef.current) setSpAchievements(mapped);
    } catch (e: any) {
      console.error("Error fetching achievements:", e);
      if (mountedRef.current) {
        setSpAchievements([]);
        setErrorAchievements(e?.message || "Failed to load achievements.");
      }
    } finally {
      if (mountedRef.current) setLoadingAchievements(false);
    }
  }, [props.context]);

  const loadBirthdays = React.useCallback(async (mountedRef: { current: boolean }) => {
    setLoadingBirthdays(true);
    setErrorBirthdays(null);

    try {
      const tahweel = tahweelRef.current;
      const rows: TahweelActiveEmployee[] =
        (await tahweel?.fetchActiveEmployees({ DOB: "1", DOJ: "0" })) || [];

      const todayRows = rows.filter((r) => isTodayFromRaw(r.dateOfBirth));
      const picked = shuffle(todayRows).slice(0, 4);

      const mapped: ICelebration[] = picked.map((r) => ({
        id: (r.personNumber || r.fullName || "").toString().trim(),
        name: normalizeFullName(r.fullName),
        type: "birthday",
        image: (r.imageDataUrl || r.imageUrl || "").toString().trim(),
        email: (r.email || "").toString().trim(),
      }));

      if (mountedRef.current) setApiBirthdays(mapped);
    } catch (e: any) {
      console.error("Tahweel birthdays failed:", e);
      if (mountedRef.current) {
        setApiBirthdays([]);
        setErrorBirthdays(e?.message || "Failed to load birthdays.");
      }
    } finally {
      if (mountedRef.current) setLoadingBirthdays(false);
    }
  }, []);

  const loadAnniversaries = React.useCallback(async (mountedRef: { current: boolean }) => {
    setLoadingAnniversaries(true);
    setErrorAnniversaries(null);

    try {
      const tahweel = tahweelRef.current;
      const rows: TahweelActiveEmployee[] =
        (await tahweel?.fetchActiveEmployees({ DOB: "0", DOJ: "1" })) || [];

      const todayRows = rows.filter((r) => isTodayFromRaw(r.doj));
      const picked = shuffle(todayRows).slice(0, 4);

      const mapped: ICelebration[] = picked.map((r) => ({
        id: (r.personNumber || r.fullName || "").toString().trim(),
        name: normalizeFullName(r.fullName),
        type: "anniversary",
        image: (r.imageDataUrl || r.imageUrl || "").toString().trim(),
        email: (r.email || "").toString().trim(),
      }));

      if (mountedRef.current) setApiAnniversaries(mapped);
    } catch (e: any) {
      console.error("Tahweel anniversaries failed:", e);
      if (mountedRef.current) {
        setApiAnniversaries([]);
        setErrorAnniversaries(e?.message || "Failed to load anniversaries.");
      }
    } finally {
      if (mountedRef.current) setLoadingAnniversaries(false);
    }
  }, []);

  const loadAll = React.useCallback(async (mountedRef: { current: boolean }) => {
    await Promise.all([
      loadNewJoiners(mountedRef),
      loadAchievements(mountedRef),
      loadBirthdays(mountedRef),
      loadAnniversaries(mountedRef),
    ]);
  }, [loadNewJoiners, loadAchievements, loadBirthdays, loadAnniversaries]);

  React.useEffect(() => {
    const mountedRef = { current: true };
    void loadAll(mountedRef);
    return () => {
      mountedRef.current = false;
    };
  }, [loadAll]);

  // No dummy fallback now
  const celebrations = {
    birthdays: props.celebrations?.birthdays ?? apiBirthdays,
    anniversaries: props.celebrations?.anniversaries ?? apiAnniversaries,
    newJoiners: props.celebrations?.newJoiners ?? spNewJoiners,
    Achievements: props.celebrations?.Achievements ?? spAchievements,
  };

  const tabs = [
    {
      key: "birthdays" as const,
      label: "Birthdays",
      count: celebrations.birthdays.length,
    },
    {
      key: "anniversaries" as const,
      label: "Anniversaries",
      count: celebrations.anniversaries.length,
    },
    {
      key: "newJoiners" as const,
      label: "New Joiners",
      count: celebrations.newJoiners.length,
    },
    {
      key: "Achievements" as const,
      label: "Achievements",
      count: celebrations.Achievements.length,
    },
  ];

  const currentCelebrations: ICelebration[] = (celebrations as any)[activeTab] ?? [];

  // Sort achievements by latest first, keep others as-is
  const sortedCelebrations =
    activeTab === "Achievements"
      ? [...currentCelebrations].sort((a, b) => parseInt(b.id) - parseInt(a.id))
      : currentCelebrations;

  // Show 1 achievement per page, 4 for others
  const itemsPerPage = activeTab === "Achievements" ? 1 : 4;
  const totalPages = Math.max(1, Math.ceil(sortedCelebrations.length / itemsPerPage));
  const currentItems = sortedCelebrations.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePrev = (): void => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = (): void => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const handleTabChange = (
    key: "birthdays" | "anniversaries" | "newJoiners" | "Achievements"
  ): void => {
    setActiveTab(key);
    setCurrentPage(0);
  };

  const getOuterCirclePosition = (index: number): React.CSSProperties => {
    const position = outerPositions[index % 2];
    const positionMap: Record<string, React.CSSProperties> = {
      left: { top: "45%", left: "0%", transform: "translate(-50%, -50%)" },
      right: { top: "45%", right: "0%", transform: "translate(50%, -50%)" },
    };
    return positionMap[position] || {};
  };

  const getInnerCirclePosition = (index: number): React.CSSProperties => {
    const position = innerPositions[index % 2];
    const positionMap: Record<string, React.CSSProperties> = {
      "bottom-left": { top: "75%", left: "-10%", transform: "translate(0%, 0%)" },
      "bottom-right": { top: "75%", right: "-10%", transform: "translate(0%, 0%)" },
    };
    return positionMap[position] || {};
  };

  const getNameParts = (fullName: string) => {
    const parts = (fullName || "").trim().split(" ").filter(Boolean);
    if (!parts.length) return { first: "Unknown", last: "" };
    return { first: parts[0], last: parts.slice(1).join(" ") || "" };
  };

  // --- DYNAMIC VIEW-ALL URL WITH DEFAULT ---
  const webUrl: string = props.context.pageContext.web.absoluteUrl.replace(/\/$/, "");
  const origin: string = new URL(webUrl).origin;

  const viewAllHref = React.useMemo(() => {
    const configured = (props.seeAllURL || "").trim();
    const raw = configured || "SitePages/Lets-Celebrate.aspx";

    if (/^https?:\/\//i.test(raw)) {
      try {
        const parsed = new URL(raw);
        return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        return raw;
      }
    }

    if (raw.startsWith("/")) return `${origin}${raw}`;
    return `${webUrl}/${raw}`;
  }, [props.seeAllURL, webUrl, origin]);
  // --- END ---

  const isLoadingActive =
    (activeTab === "birthdays" && loadingBirthdays) ||
    (activeTab === "anniversaries" && loadingAnniversaries) ||
    (activeTab === "newJoiners" && loadingNewJoiners) ||
    (activeTab === "Achievements" && loadingAchievements);

  const activeError =
    activeTab === "birthdays"
      ? errorBirthdays
      : activeTab === "anniversaries"
      ? errorAnniversaries
      : activeTab === "newJoiners"
      ? errorNewJoiners
      : activeTab === "Achievements"
      ? errorAchievements
      : null;

  const retryActiveTab = async (): Promise<void> => {
    const mountedRef = { current: true };
    try {
      if (activeTab === "birthdays") await loadBirthdays(mountedRef);
      else if (activeTab === "anniversaries") await loadAnniversaries(mountedRef);
      else if (activeTab === "newJoiners") await loadNewJoiners(mountedRef);
      else if (activeTab === "Achievements") await loadAchievements(mountedRef);
    } finally {
      mountedRef.current = false;
    }
  };

  const emptyLabel = (tabs.find((t) => t.key === activeTab)?.label || "").toLowerCase();

  // When failed + no cached data -> show shimmer instead of "Failed to fetch" text
  const showShimmer = isLoadingActive || !!activeError;

  const emptyMessage =
    activeError ? activeError : `No ${emptyLabel} to celebrate right now`;

  const getHoverMessage = (name: string): string => {
    switch (activeTab) {
      case "birthdays":
        return `Wish ${name} Happy Birthday!`;
      case "anniversaries":
        return `Congratulate ${name} on this milestone!`;
      case "newJoiners":
        return `Welcome ${name} to the team!`;
      default:
        return `Wish ${name}`;
    }
  };

  const getChatMessage = (name: string): string => {
    switch (activeTab) {
      case "birthdays":
        return `Wish you a very Happy Birthday!`;
      case "anniversaries":
        return `Congratulations on this milestone!`;
      case "newJoiners":
        return `Welcome to the team!`;
      default:
        return `Hello ${name}!`;
    }
  };

  const shimmerPreset = activeTab === "Achievements" ? "details" : "details";
  const shimmerCount = 1;

  return (
    <div className={styles.celebrateContainer}>
      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ""}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label} <span className={styles.count}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Error bar (shown for active tab), shimmer will show below */}
      {activeError ? (
        <div style={{ marginTop: 10 }}>
          <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
            {activeError}
            <span style={{ marginLeft: 10 }}>
              <DefaultButton text="Retry" onClick={retryActiveTab} />
            </span>
          </MessageBar>
        </div>
      ) : null}

      {/* Content */}
      <div className={styles.content}>
        {/* Shimmer for ALL tabs (loading OR failed-with-no-data) */}
        <LoadingBoundary
          loading={showShimmer}
          preset={shimmerPreset as any}
          count={shimmerCount}
          ariaLabel={`Loading ${emptyLabel}`}
        >
          {currentCelebrations.length > 0 ? (
            <>
              {activeTab === "Achievements" ? (
                // Achievement Card Layout
                <div className={styles.achievementWrapper}>
                  <button
                    className={styles.navButton}
                    onClick={handlePrev}
                    disabled={totalPages <= 1}
                    style={{ visibility: totalPages <= 1 ? "hidden" : "visible" }}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M15 18L9 12L15 6"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <div className={styles.achievementCardContainer}>
                    <div className={styles.achievementCircleContainer}>
                      <div className={styles.achievementOuterCircle}>
                        <div className={styles.achievementInnerCircle} />
                      </div>
                    </div>

                    {currentItems.map((item) => {
                      const { first, last } = getNameParts(item.name);
                      const imageUrl = item.image;
                      const designation = item.department || "Team Member";
                      const contact = item.contact || "";
                      const description = item.description || "";

                      return (
                        <article key={item.id} className={styles.achievementCard}>
                          <div className={styles.achievementImageWrapper}>
                            {imageUrl ? (
                              <img
                                className={styles.achievementPhoto}
                                src={imageUrl}
                                alt={item.name || ""}
                              />
                            ) : (
                              <div className={styles.achievementNoImage}>No Image</div>
                            )}
                          </div>

                          <div className={styles.achievementContentWrapper}>
                            <div className={styles.achievementHeaderRow}>
                              <div className={styles.achievementNameSection}>
                                <h2 className={styles.achievementName}>
                                  <span className={styles.achievementFirstName}>{first}</span>
                                  <span className={styles.achievementLastName}>{last}</span>
                                </h2>
                                <div className={styles.achievementRole}>{designation}</div>
                              </div>

                              <a
                                className={styles.sayCongratulations}
                                target="_blank"
                                href={`https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(
                                  contact
                                )}&message=Congratulations`}
                                rel="noreferrer"
                              >
                                <img
                                  src={Congratulations_Icon}
                                  alt=""
                                  className={styles.congratulationsIcon}
                                />
                                <span>Say Congratulations</span>
                              </a>
                            </div>

                            {!!description && (
                              <p
                                className={styles.achievementDescription}
                                dangerouslySetInnerHTML={{ __html: description }}
                              />
                            )}

                            {!!contact && (
                              <p className={styles.achievementConnect}>Lets connect : {contact}</p>
                            )}
                          </div>
                        </article>
                      );
                    })}

                    {totalPages > 1 && (
                      <div className={styles.achievementPagination}>
                        {Array.from({ length: totalPages }).map((_, index) => (
                          <button
                            key={index}
                            className={`${styles.dot} ${index === currentPage ? styles.activeDot : ""}`}
                            onClick={() => setCurrentPage(index)}
                            aria-label={`Go to page ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    <div className={styles.achievementButtonContainer}>
                      <a href={viewAllHref} className={styles.viewAllButton}>
                        View All
                      </a>
                    </div>
                  </div>

                  <button
                    className={styles.navButton}
                    onClick={handleNext}
                    disabled={totalPages <= 1}
                    style={{ visibility: totalPages <= 1 ? "hidden" : "visible" }}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 18L15 12L9 6"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                // Wheel Layout for other tabs
                <div className={styles.wheelWrapper}>
                  <button
                    className={styles.navButton}
                    onClick={handlePrev}
                    disabled={totalPages <= 1}
                    style={{ visibility: totalPages <= 1 ? "hidden" : "visible" }}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M15 18L9 12L15 6"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <div className={styles.circleContainer}>
                    <div className={styles.outerCircle}>
                      {currentItems.slice(0, 2).map((item, index) => (
                        <div
                          key={item.id}
                          className={styles.profileCard}
                          style={getOuterCirclePosition(index)}
                          onClick={
                            isChatEnabledTab
                              ? () => openTeamsChat(item.email, item.name)
                              : undefined
                          }
                          role={isChatEnabledTab ? "button" : undefined}
                          tabIndex={isChatEnabledTab ? 0 : -1}
                          onKeyDown={
                            isChatEnabledTab
                              ? (e) => {
                                  if (e.key === "Enter" || e.key === " ")
                                    openTeamsChat(item.email, item.name);
                                }
                              : undefined
                          }
                        >
                          <div className={styles.profileImageWrapper}>
                            <img
                              src={
                                item.image ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  item.name
                                )}&background=ffecd1&color=333&size=200`
                              }
                              alt={item.name}
                              className={styles.profileImage}
                            />
                          </div>
                          <div className={styles.profileName}>{item.name}</div>
                          <div className={styles.HoverText}>{getHoverMessage(item.name)}</div>
                        </div>
                      ))}

                      <div className={styles.innerCircle}>
                        {currentItems.slice(2, 4).map((item, index) => (
                          <div
                            key={item.id}
                            className={styles.profileCard}
                            style={getInnerCirclePosition(index)}
                            onClick={
                              isChatEnabledTab
                                ? () => openTeamsChat(item.email, item.name)
                                : undefined
                            }
                            role={isChatEnabledTab ? "button" : undefined}
                            tabIndex={isChatEnabledTab ? 0 : -1}
                            onKeyDown={
                              isChatEnabledTab
                                ? (e) => {
                                    if (e.key === "Enter" || e.key === " ")
                                      openTeamsChat(item.email, item.name);
                                  }
                                : undefined
                            }
                          >
                            <div className={styles.profileImageWrapper}>
                              <img
                                src={
                                  item.image ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    item.name
                                  )}&background=ffecd1&color=333&size=200`
                                }
                                alt={item.name}
                                className={styles.profileImage}
                              />
                            </div>
                            <div className={styles.profileName}>{item.name}</div>
                            <div className={styles.HoverText}>{getHoverMessage(item.name)}</div>
                          </div>
                        ))}

                        <div className={styles.centerIllustration}>
                          <img
                            src={
                              activeTab === "newJoiners"
                                ? newJoinerCenter
                                : activeTab === "anniversaries"
                                ? aniversaryImage
                                : cakeImage
                            }
                            alt="Celebration"
                            className={styles.illustrationImage}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.bottomSection}>
                      {totalPages > 1 && (
                        <div className={styles.pagination}>
                          {Array.from({ length: totalPages }).map((_, index) => (
                            <button
                              key={index}
                              className={`${styles.dot} ${
                                index === currentPage ? styles.activeDot : ""
                              }`}
                              onClick={() => setCurrentPage(index)}
                              aria-label={`Go to page ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}

                      <div className={styles.buttonContainer}>
                        <a href={viewAllHref} className={styles.viewAllButton}>
                          View All
                        </a>
                      </div>
                    </div>
                  </div>

                  <button
                    className={styles.navButton}
                    onClick={handleNext}
                    disabled={totalPages <= 1}
                    style={{ visibility: totalPages <= 1 ? "hidden" : "visible" }}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 18L15 12L9 6"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </>
          ) : activeError ? (
            // error already visible in MessageBar; keep space so shimmer can show
            <div style={{ minHeight: 260 }} />
          ) : (
            <div className={styles.emptyState}>
              <p>{emptyMessage}</p>
            </div>
          )}
        </LoadingBoundary>
      </div>
    </div>
  );
};

export default LetsCelebrate;
