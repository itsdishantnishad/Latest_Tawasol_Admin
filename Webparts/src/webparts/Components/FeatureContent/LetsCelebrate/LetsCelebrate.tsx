// import * as React from "react";
// import styles from "./LetsCelebrate.module.scss";
// import { listServices } from "../../../services/listServices";

// const cakeImage: string = require("../images/Cake-1.svg");
// const newJoinerCenter: string = require("../images/Newjoiner.svg");
// const aniversaryImage: string = require("../images/aniversary.svg");

// export interface ICelebration {
//   id: string;
//   name: string;
//   department?: string;
//   date?: string;
//   type: "birthday" | "anniversary" | "newJoiner" | "Achievement";
//   image?: string;
// }

// export interface ILetsCelebrateProps {
//   celebrations?: {
//     birthdays: ICelebration[];
//     anniversaries: ICelebration[];
//     newJoiners: ICelebration[];
//     Achievements?: ICelebration[];
//   };
//   onViewAll?: () => void;
//   seeAllURL?: string;
//   context: any;
// }

// const defaultCelebrations = {
//   birthdays: [
//     {
//       id: "1",
//       name: "John Doe",
//       department: "Engineering",
//       date: "Today",
//       type: "birthday" as const,
//       image: "https://i.pravatar.cc/150?img=1",
//     },
//     {
//       id: "2",
//       name: "Jane Smith",
//       department: "Marketing",
//       date: "Tomorrow",
//       type: "birthday" as const,
//       image: "https://i.pravatar.cc/150?img=2",
//     },
//     {
//       id: "3",
//       name: "Mike Johnson",
//       department: "Sales",
//       date: "Dec 15",
//       type: "birthday" as const,
//       image: "https://i.pravatar.cc/150?img=3",
//     },
//     {
//       id: "4",
//       name: "Sarah Williams",
//       department: "HR",
//       date: "Dec 20",
//       type: "birthday" as const,
//       image: "https://i.pravatar.cc/150?img=4",
//     },
//   ],
//   anniversaries: [
//     {
//       id: "5",
//       name: "Robert Brown",
//       department: "Engineering",
//       date: "5 Years",
//       type: "anniversary" as const,
//       image: "https://i.pravatar.cc/150?img=5",
//     },
//     {
//       id: "6",
//       name: "Emily Davis",
//       department: "Operations",
//       date: "10 Years",
//       type: "anniversary" as const,
//       image: "https://i.pravatar.cc/150?img=6",
//     },
//     {
//       id: "7",
//       name: "David Wilson",
//       department: "Finance",
//       date: "3 Years",
//       type: "anniversary" as const,
//       image: "https://i.pravatar.cc/150?img=7",
//     },
//     {
//       id: "8",
//       name: "Lisa Anderson",
//       department: "Legal",
//       date: "7 Years",
//       type: "anniversary" as const,
//       image: "https://i.pravatar.cc/150?img=8",
//     },
//   ],
//   newJoiners: [
//     {
//       id: "9",
//       name: "Tom Harris",
//       department: "Engineering",
//       date: "This Week",
//       type: "newJoiner" as const,
//       image: "https://i.pravatar.cc/150?img=9",
//     },
//     {
//       id: "10",
//       name: "Anna Martin",
//       department: "Design",
//       date: "This Week",
//       type: "newJoiner" as const,
//       image: "https://i.pravatar.cc/150?img=10",
//     },
//   ],
//   Achievements: [
//     {
//       id: "11",
//       name: "Project Alpha",
//       department: "Engineering",
//       date: "Completed",
//       type: "Achievement" as const,
//       image: "https://i.pravatar.cc/150?img=11",
//     },
//     {
//       id: "12",
//       name: "Sales Milestone",
//       department: "Sales",
//       date: "Achieved",
//       type: "Achievement" as const,
//       image: "https://i.pravatar.cc/150?img=12",
//     },
//   ],
// };

// // Position assignments for outer circle (2 positions - left and right)
// const outerPositions: Array<"left" | "right"> = ["left", "right"];

// // Position assignments for inner circle (2 positions)
// const innerPositions: Array<
//   "bottom-left" | "bottom-right" | "bottom-right"
// > = ["bottom-left", "bottom-right"];

// export const LetsCelebrate: React.FC<ILetsCelebrateProps> = (props) => {
//   const [activeTab, setActiveTab] = React.useState<
//     "birthdays" | "anniversaries" | "newJoiners" | "Achievements"
//   >("newJoiners");
//   const [currentPage, setCurrentPage] = React.useState(0);
//   const [spNewJoiners, setSpNewJoiners] = React.useState<any[]>([]);

//   React.useEffect(() => {
//     const fetchNewJoiners = async () => {
//       try {
//         const spService = new listServices(props.context);
//         const data = await spService.getNewJoiners("New Joiner");

//         const mappedData = data.map((item) => ({
//           id: item.Id,
//           name: item.Title,
//           department: item.Department,
//           type: "newJoiner" as const,
//           image: item.UserPicture,
//         }));
//         setSpNewJoiners(mappedData);
//       } catch (error) {
//         console.error("Error fetching new joiners:", error);
//       }
//     };

//     fetchNewJoiners();
//   }, [props.context]);

//   const celebrations = {
//     birthdays: props.celebrations?.birthdays ?? defaultCelebrations.birthdays,
//     anniversaries:
//       props.celebrations?.anniversaries ?? defaultCelebrations.anniversaries,
//     newJoiners:
//       props.celebrations?.newJoiners ??
//       (spNewJoiners.length > 0 ? spNewJoiners : defaultCelebrations.newJoiners),
//     Achievements:
//       props.celebrations?.Achievements ??
//       defaultCelebrations.Achievements ??
//       [],
//   };

//   const tabs = [
//     {
//       key: "birthdays" as const,
//       label: "Birthdays",
//       count: celebrations.birthdays.length,
//     },
//     {
//       key: "anniversaries" as const,
//       label: "Anniversaries",
//       count: celebrations.anniversaries.length,
//     },
//     {
//       key: "newJoiners" as const,
//       label: "New Joiners",
//       count: celebrations.newJoiners.length,
//     },
//     {
//       key: "Achievements" as const,
//       label: "Achievements",
//       count: celebrations.Achievements.length,
//     },
//   ];

//   const currentCelebrations: ICelebration[] = celebrations[activeTab] ?? [];

//   const itemsPerPage = 5;
//   const totalPages = Math.ceil(currentCelebrations.length / itemsPerPage);
//   const currentItems = currentCelebrations.slice(
//     currentPage * itemsPerPage,
//     (currentPage + 1) * itemsPerPage
//   );

//   const handlePrev = (): void => {
//     setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
//   };

//   const handleNext = (): void => {
//     setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
//   };

//   const handleTabChange = (
//     key: "birthdays" | "anniversaries" | "newJoiners" | "Achievements"
//   ): void => {
//     setActiveTab(key);
//     setCurrentPage(0);
//   };

//   const getOuterCirclePosition = (index: number): React.CSSProperties => {
//     const position = outerPositions[index % 2];
//     const positionMap: Record<string, React.CSSProperties> = {
//       left: {
//         top: "50%",
//         left: "0%",
//         transform: "translate(-50%, -50%)",
//       },
//       right: {
//         top: "50%",
//         right: "0%",
//         transform: "translate(50%, -50%)",
//       },
//     };
//     return positionMap[position] || {};
//   };

//   const getInnerCirclePosition = (index: number): React.CSSProperties => {
//     const position = innerPositions[index % 2];
//     const positionMap: Record<string, React.CSSProperties> = {
//       "bottom-left": {
//         top: "75%",
//         left: "0%",
//         transform: "translate(0%, 0%)",
//       },
//       "bottom-right": {
//         top: "75%",
//         right: "0%",
//         transform: "translate(0%, 0%)",
//       },
//     };
//     return positionMap[position] || {};
//   };

//   // --- DYNAMIC VIEW-ALL URL WITH DEFAULT ---
//   const webUrl: string = props.context.pageContext.web.absoluteUrl.replace(
//     /\/$/,
//     ""
//   );
//   const origin: string = new URL(webUrl).origin;

//   const viewAllHref = React.useMemo(() => {
//     const configured = (props.seeAllURL || "").trim();

//     // If nothing configured, default to a page in the current site:
//     //   /sites/ThisSite/SitePages/Lets-Celebrate.aspx
//     const raw = configured || "SitePages/Lets-Celebrate.aspx";

//     // Absolute URL from anywhere -> keep its path but move to current tenant
//     if (/^https?:\/\//i.test(raw)) {
//       try {
//         const parsed = new URL(raw);
//         return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
//       } catch {
//         return raw;
//       }
//     }

//     // Root-relative (/sites/YourSite/SitePages/Page.aspx)
//     if (raw.startsWith("/")) {
//       return `${origin}${raw}`;
//     }

//     // Web-relative (SitePages/Page.aspx)
//     return `${webUrl}/${raw}`;
//   }, [props.seeAllURL, webUrl, origin]);
//   // --- END ---

//   return (
//     <div className={styles.celebrateContainer}>
//       {/* Tabs */}
//       <div className={styles.tabs}>
//         {tabs.map((tab) => (
//           <button
//             key={tab.key}
//             className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ""
//               }`}
//             onClick={() => handleTabChange(tab.key)}
//           >
//             {tab.label} <span className={styles.count}>{tab.count}</span>
//           </button>
//         ))}
//       </div>

//       {/* Content */}
//       <div className={styles.content}>
//         {currentCelebrations.length > 0 ? (
//           <div className={styles.wheelWrapper}>
//             <button
//               className={styles.navButton}
//               onClick={handlePrev}
//               disabled={totalPages <= 1}
//               style={{ visibility: totalPages <= 1 ? "hidden" : "visible" }}
//             >
//               <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
//                 <path
//                   d="M15 18L9 12L15 6"
//                   stroke="currentColor"
//                   strokeWidth="1"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </svg>
//             </button>

//             <div className={styles.circleContainer}>
//               <div className={styles.outerCircle}>
//                 {currentItems.slice(0, 2).map((item, index) => (
//                   <div
//                     key={item.id}
//                     className={styles.profileCard}
//                     style={getOuterCirclePosition(index)}
//                   >
//                     <div className={styles.profileImageWrapper}>
//                       <img
//                         src={
//                           item.image ||
//                           `https://ui-avatars.com/api/?name=${encodeURIComponent(
//                             item.name
//                           )}&background=ffecd1&color=333&size=200`
//                         }
//                         alt={item.name}
//                         className={styles.profileImage}
//                       />
//                     </div>
//                     <div className={styles.profileName}>{item.name}</div>
//                   </div>
//                 ))}

//                 <div className={styles.innerCircle}>
//                   {currentItems.slice(2, 4).map((item, index) => (
//                     <div
//                       key={item.id}
//                       className={styles.profileCard}
//                       style={getInnerCirclePosition(index)}
//                     >
//                       <div className={styles.profileImageWrapper}>
//                         <img
//                           src={
//                             item.image ||
//                             `https://ui-avatars.com/api/?name=${encodeURIComponent(
//                               item.name
//                             )}&background=ffecd1&color=333&size=200`
//                           }
//                           alt={item.name}
//                           className={styles.profileImage}
//                         />
//                       </div>
//                       <div className={styles.profileName}>{item.name}</div>
//                     </div>
//                   ))}

//                   <div className={styles.centerIllustration}>
//                     <img
//                       src={
//                         activeTab === "newJoiners"
//                           ? newJoinerCenter
//                           : activeTab === "anniversaries"
//                             ? aniversaryImage
//                             : cakeImage
//                       }
//                       alt="Celebration"
//                       className={styles.illustrationImage}
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className={styles.bottomSection}>
//                 {totalPages > 1 && (
//                   <div className={styles.pagination}>
//                     {Array.from({ length: totalPages }).map((_, index) => (
//                       <button
//                         key={index}
//                         className={`${styles.dot} ${index === currentPage ? styles.activeDot : ""
//                           }`}
//                         onClick={() => setCurrentPage(index)}
//                         aria-label={`Go to page ${index + 1}`}
//                       />
//                     ))}
//                   </div>
//                 )}

//                 <div className={styles.buttonContainer}>
//                   <a href={viewAllHref} className={styles.viewAllButton}>
//                     View All
//                   </a>
//                 </div>
//               </div>
//             </div>

//             <button
//               className={styles.navButton}
//               onClick={handleNext}
//               disabled={totalPages <= 1}
//               style={{ visibility: totalPages <= 1 ? "hidden" : "visible" }}
//             >
//               <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
//                 <path
//                   d="M9 18L15 12L9 6"
//                   stroke="currentColor"
//                   strokeWidth="1"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </svg>
//             </button>
//           </div>
//         ) : (
//           <div className={styles.emptyState}>
//             <p>
//               No {tabs.find((t) => t.key === activeTab)?.label.toLowerCase()} to
//               celebrate right now
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LetsCelebrate;
































// src/webparts/Components/FeatureContent/LetsCelebrate/LetsCelebrate.tsx

import * as React from "react";
import styles from "./LetsCelebrate.module.scss";
import { listServices } from "../../../services/listServices";
import {
  TahweelService,
  TahweelActiveEmployee,
} from "../../../services/Integration/TahweelService";

const cakeImage: string = require("../images/Cake-1.svg");
const newJoinerCenter: string = require("../images/Newjoiner.svg");
const aniversaryImage: string = require("../images/aniversary.svg");

export interface ICelebration {
  id: string;
  name: string;
  department?: string;
  date?: string;
  type: "birthday" | "anniversary" | "newJoiner" | "Achievement";
  image?: string;
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
const innerPositions: Array<"bottom-left" | "bottom-right" | "bottom-right"> = [
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

export const LetsCelebrate: React.FC<ILetsCelebrateProps> = (props) => {
  const [activeTab, setActiveTab] = React.useState<
    "birthdays" | "anniversaries" | "newJoiners" | "Achievements"
  >("newJoiners");
  const [currentPage, setCurrentPage] = React.useState(0);
  const [spNewJoiners, setSpNewJoiners] = React.useState<ICelebration[]>([]);

  // ✅ API-driven (Today only, max 4, random on reload)
  const [apiBirthdays, setApiBirthdays] = React.useState<ICelebration[]>([]);
  const [apiAnniversaries, setApiAnniversaries] = React.useState<ICelebration[]>(
    []
  );
  const [loadingBirthdays, setLoadingBirthdays] = React.useState<boolean>(true);
  const [loadingAnniversaries, setLoadingAnniversaries] =
    React.useState<boolean>(true);
  const [errorBirthdays, setErrorBirthdays] = React.useState<string | null>(null);
  const [errorAnniversaries, setErrorAnniversaries] =
    React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      // New Joiners (SP)
      const newJoinersP = (async () => {
        try {
          const spService = new listServices(props.context);
          const data = await spService.getNewJoiners("New Joiner");

          const mappedData: ICelebration[] = (data || []).map((item: any) => ({
            id: (item.Id || item.ID || item.id || item.Title || "").toString(),
            name: (item.Title || item.name || "").toString(),
            department: (item.Department || item.department || "").toString(),
            type: "newJoiner" as const,
            image: (item.UserPicture || item.image || "").toString(),
          }));

          if (mounted) setSpNewJoiners(mappedData);
        } catch (error) {
          console.error("Error fetching new joiners:", error);
          if (mounted) setSpNewJoiners([]);
        }
      })();

      // Birthdays + Anniversaries (Tahweel)
      const tahweel = new TahweelService({
        httpClient: props.context.httpClient,
      });

      const birthdaysP = (async () => {
        setLoadingBirthdays(true);
        setErrorBirthdays(null);
        try {
          const rows: TahweelActiveEmployee[] =
            (await tahweel.fetchActiveEmployees({ DOB: "1", DOJ: "0" })) || [];

          const todayRows = rows.filter((r) => isTodayFromRaw(r.dateOfBirth));
          const picked = shuffle(todayRows).slice(0, 4);

          const mapped: ICelebration[] = picked.map((r) => ({
            id: (r.personNumber || r.fullName || "").toString().trim(),
            name: normalizeFullName(r.fullName),
            type: "birthday",
            image: (r.imageDataUrl || r.imageUrl || "").toString().trim(),
          }));

          if (mounted) setApiBirthdays(mapped);
        } catch (e: any) {
          console.error("Tahweel birthdays failed:", e);
          if (mounted) {
            setApiBirthdays([]);
            setErrorBirthdays(e?.message || "Failed to load birthdays.");
          }
        } finally {
          if (mounted) setLoadingBirthdays(false);
        }
      })();

      const anniversariesP = (async () => {
        setLoadingAnniversaries(true);
        setErrorAnniversaries(null);
        try {
          const rows: TahweelActiveEmployee[] =
            (await tahweel.fetchActiveEmployees({ DOB: "0", DOJ: "1" })) || [];

          const todayRows = rows.filter((r) => isTodayFromRaw(r.doj));
          const picked = shuffle(todayRows).slice(0, 4);

          const mapped: ICelebration[] = picked.map((r) => ({
            id: (r.personNumber || r.fullName || "").toString().trim(),
            name: normalizeFullName(r.fullName),
            type: "anniversary",
            image: (r.imageDataUrl || r.imageUrl || "").toString().trim(),
          }));

          if (mounted) setApiAnniversaries(mapped);
        } catch (e: any) {
          console.error("Tahweel anniversaries failed:", e);
          if (mounted) {
            setApiAnniversaries([]);
            setErrorAnniversaries(e?.message || "Failed to load anniversaries.");
          }
        } finally {
          if (mounted) setLoadingAnniversaries(false);
        }
      })();

      await Promise.all([newJoinersP, birthdaysP, anniversariesP]);
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, [props.context]);

  // ✅ No dummy fallback now
  const celebrations = {
    birthdays: props.celebrations?.birthdays ?? apiBirthdays,
    anniversaries: props.celebrations?.anniversaries ?? apiAnniversaries,
    newJoiners: props.celebrations?.newJoiners ?? spNewJoiners,
    Achievements: props.celebrations?.Achievements ?? [],
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

  const currentCelebrations: ICelebration[] =
    (celebrations as any)[activeTab] ?? [];

  // ✅ Wheel displays max 4 per page (matches UI positions)
  const itemsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(currentCelebrations.length / itemsPerPage));
  const currentItems = currentCelebrations.slice(
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
      left: {
        top: "50%",
        left: "0%",
        transform: "translate(-50%, -50%)",
      },
      right: {
        top: "50%",
        right: "0%",
        transform: "translate(50%, -50%)",
      },
    };
    return positionMap[position] || {};
  };

  const getInnerCirclePosition = (index: number): React.CSSProperties => {
    const position = innerPositions[index % 2];
    const positionMap: Record<string, React.CSSProperties> = {
      "bottom-left": {
        top: "75%",
        left: "0%",
        transform: "translate(0%, 0%)",
      },
      "bottom-right": {
        top: "75%",
        right: "0%",
        transform: "translate(0%, 0%)",
      },
    };
    return positionMap[position] || {};
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

    if (raw.startsWith("/")) {
      return `${origin}${raw}`;
    }

    return `${webUrl}/${raw}`;
  }, [props.seeAllURL, webUrl, origin]);
  // --- END ---

  const isLoadingActive =
    (activeTab === "birthdays" && loadingBirthdays) ||
    (activeTab === "anniversaries" && loadingAnniversaries);

  const activeError =
    activeTab === "birthdays"
      ? errorBirthdays
      : activeTab === "anniversaries"
      ? errorAnniversaries
      : null;

  const emptyLabel = (tabs.find((t) => t.key === activeTab)?.label || "").toLowerCase();

  const emptyMessage = activeError
    ? activeError
    : isLoadingActive
    ? `Loading ${emptyLabel}...`
    : `No ${emptyLabel} to celebrate right now`;

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

      {/* Content */}
      <div className={styles.content}>
        {currentCelebrations.length > 0 ? (
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
                  </div>
                ))}

                <div className={styles.innerCircle}>
                  {currentItems.slice(2, 4).map((item, index) => (
                    <div
                      key={item.id}
                      className={styles.profileCard}
                      style={getInnerCirclePosition(index)}
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
                        className={`${styles.dot} ${index === currentPage ? styles.activeDot : ""}`}
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
        ) : (
          <div className={styles.emptyState}>
            <p>{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LetsCelebrate;
