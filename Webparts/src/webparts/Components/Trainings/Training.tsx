import * as React from "react";
import styles from "./Training.module.scss";
import { AllTrainingCard } from "./Card";
import { LearningLinks } from "./Learningcard";
import Trainingcard from "./TrainingCard";
import CalendarViewComponent from "../Events/Calendarview/CalendarView";
import { MSGraphClientV3 } from "@microsoft/sp-http";

import { spfi, SPFx, SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

interface IAccordionState {
  [key: string]: boolean;
}

export interface ITrainingmoduleProps {
  AllTrainingdata: any[] | undefined;
  viewtype?: string;
  context?: any;
}

interface ILearningLink {
  id: number;
  title: string;
  logo: string;
  logoAlt: string;
  url: string;
  backgroundColor?: string;
}

// Sample learning links
const learningLinks: ILearningLink[] = [
  {
    id: 1,
    title: "STRYVE By LinkedIn Learning",
    logo: require("../../assets/stryve.svg"),
    logoAlt: "STRYVE",
    url: "https://www.linkedin.com/company/stryvelearning/?utm_source=chatgpt.com",
    backgroundColor: "#FDECDC",
  },
  {
    id: 2,
    title: "eCornell by DHRE",
    logo: require("../../assets/ecornell.svg"),
    logoAlt: "eCornell",
    url: "https://auth.ecornell.com/cas/login?service=https%3A%2F%2Flms.ecornell.com%2Flogin%2Fcas#entry-37079268",
    backgroundColor: "#FDECDC",
  },
  {
    id: 3,
    title: "LMS by DHRE",
    logo: require("../../assets/lms.svg"),
    logoAlt: "LMS by DHRE",
    url: "https://esbe.fa.em8.oraclecloud.com/fscmUI/redwood/learner/learn/learn-enrollment-details?launchedFrom=myLearnExperience&learnerRecordId=300001155944032&persona=ORA_LEARNER",
    backgroundColor: "#FDECDC",
  },
];

const learningContentLinks: ILearningLink[] = [
  {
    id: 1,
    title: "DHRE Unconscious Bias",
    logo: require("../../assets/learningconcious.svg"),
    logoAlt: "Bias",
    url: "https://esbe.fa.em8.oraclecloud.com/fscmUI/redwood/learner/learn/learn-landing?tab=myLearnExperience&pagesUseSessionStoredFilters=learning-landing",
    backgroundColor: "#FDECDC",
  },
  {
    id: 2,
    title: "DHRE Effective Time Management",
    logo: require("../../assets/effectivemanagement.svg"),
    logoAlt: "Time",
    url: "https://esbe.fa.em8.oraclecloud.com/fscmUI/redwood/learner/learn/learn-landing?tab=myLearnExperience&pagesUseSessionStoredFilters=learning-landing",
    backgroundColor: "#FDECDC",
  },
  {
    id: 3,
    title: "DHRE Priority Matrix Job Aid",
    logo: require("../../assets/priorityjob.svg"),
    logoAlt: "Matrix",
    url: "https://esbe.fa.em8.oraclecloud.com/fscmUI/redwood/learner/learn/learn-landing?tab=myLearnExperience&pagesUseSessionStoredFilters=learning-landing",
    backgroundColor: "#FDECDC",
  },
];

type MappedTraining = {
  id: number;
  trainingId: number;

  imageUrl: string;
  category: string;
  title: string;

  // display strings
  dateRangeDisplay: string;
  timeRange: string;

  // ✅ TrainingCardProps requires `time`
  time: string;

  // raw dates
  startDate: string;
  endDate: string;

  duration: string;
  instructorName?: string;
  instructorTitle?: string;
  instructorImageUrl?: string;

  // Graph-backed person (from instructor email)
  instructorEmail?: string;

  month: string;

  // kept for backward-compat but not used for My-tab filtering anymore
  isMyTraining: boolean;

  location: string;
  meetingLink: string;
  joinUrl: string;

  pageUrl: string;

  Eventtype: "Trainings";
  subtitle: string;
};

const safeStr = (v: any): string => String(v ?? "").trim();

const uniqNums = (arr: number[]): number[] => Array.from(new Set(arr));

const mapSharePointTrainingsForAll = (data: any[]): MappedTraining[] => {
  const deduped = Array.from(
    new Map(
      (data || []).map((i: any) => {
        const idKey = i?.ID ?? i?.Id ?? i?.ListItemID ?? i?.ListItemId ?? i?.title;
        return [String(idKey), i];
      })
    ).values()
  );

  return deduped
    .map((item: any, index: number) => {
      const startDateStr = safeStr(item?.eventStartDate).split("\n")[0]?.trim() || "";
      const endDateStr = safeStr(item?.eventEndDate).split("\n")[0]?.trim() || "";

      if (!startDateStr || !endDateStr) return null;

      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;

      const monthLabel = `${startDate.toLocaleString("default", { month: "long" })} ${startDate.getFullYear()}`;

      const dateRangeDisplay = `${startDate.getDate()}-${endDate.getDate()} ${startDate.toLocaleString("default", {
        month: "short",
      })} ${startDate.getFullYear()}`;

      const timeRange = `${startDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })} - ${endDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`;

      const location = safeStr(item?.location).split("\n")[0]?.trim() || "";

      const spIdRaw = item?.ID ?? item?.Id ?? item?.ListItemID ?? item?.ListItemId;
      const spId = Number(spIdRaw) || 0;

      const meetingLink = safeStr(item?.joiningURL || item?.joiningUrl || item?.meetingLink || item?.MeetingLink);
      const pageUrl = safeStr(item?.pageUrl) || "#";

      return {
        ...item,
        id: spId || index + 1,
        trainingId: spId || index + 1,

        imageUrl: item?.newsImage || "https://via.placeholder.com/400x200?text=No+Image",
        category: "Classroom",
        title: item?.title || "Untitled Training",

        dateRangeDisplay,
        timeRange,
        time: timeRange, // ✅ satisfy TrainingCardProps

        startDate: startDateStr,
        endDate: endDateStr,

        duration: `${Math.max(
          1,
          Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        )} days`,

        instructorName: item?.instructor?.name,
        instructorTitle: item?.instructor?.role,
        instructorEmail: item?.instructor?.email || item?.instructor?.id,
        instructorImageUrl: undefined,

        month: monthLabel,

        // ❌ OLD LOGIC (kept but NOT used for filtering My tab anymore)
        isMyTraining: !!meetingLink,

        location,
        meetingLink,
        joinUrl: meetingLink || "#",

        pageUrl,

        Eventtype: "Trainings",
        subtitle: "",
      } as MappedTraining;
    })
    .filter(Boolean) as MappedTraining[];
};

const Training: React.FC<ITrainingmoduleProps> = (props) => {
  const [activeTab, setActiveTab] = React.useState<"all" | "my">("all");

  const mappedTrainings = React.useMemo(
    () => mapSharePointTrainingsForAll(props.AllTrainingdata || []),
    [props.AllTrainingdata]
  );

  // ----------------------------
  // PnP: Current user + Registered Training list filtering (FIX)
  // ----------------------------
  const sp: SPFI | null = React.useMemo(() => {
    try {
      return props.context ? spfi().using(SPFx(props.context)) : null;
    } catch {
      return null;
    }
  }, [props.context]);

  const [myTrainingIds, setMyTrainingIds] = React.useState<number[]>([]);

  const getCurrentUserId = React.useCallback(async (): Promise<number> => {
    const legacyId = (props.context?.pageContext as any)?.legacyPageContext?.userId;
    if (legacyId) return Number(legacyId);

    if (sp) {
      const me: any = await sp.web.currentUser.select("Id")();
      return Number(me?.Id || 0);
    }
    return 0;
  }, [props.context, sp]);

  const loadMyTrainingIds = React.useCallback(async () => {
    if (!sp || !props.context) {
      setMyTrainingIds([]);
      return;
    }

    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        setMyTrainingIds([]);
        return;
      }

      const rows: any[] = await sp.web.lists
        .getByTitle("Registered Training")
        .items.select("Id", "AuthorId", "TIRTrainingID")
        .filter(`AuthorId eq ${userId}`)
        .top(5000)();

      const ids = uniqNums(
        (rows || [])
          .map((r) => Number(r?.TIRTrainingID))
          .filter((n) => Number.isFinite(n) && n > 0)
      );

      setMyTrainingIds(ids);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("loadMyTrainingIds failed", e);
      setMyTrainingIds([]);
    }
  }, [sp, props.context, getCurrentUserId]);

  React.useEffect(() => {
    void loadMyTrainingIds();
  }, [loadMyTrainingIds]);

  const myTrainings = React.useMemo(() => {
    if (!myTrainingIds.length) return [];
    return mappedTrainings.filter((t) => myTrainingIds.includes(Number(t.trainingId)));
  }, [mappedTrainings, myTrainingIds]);

  // ----------------------------
  // Graph: resolve instructor name + avatar (with initials fallback)
  // ----------------------------
  type PersonInfo = { name: string; avatarUrl: string };

  const [personByEmail, setPersonByEmail] = React.useState<Record<string, PersonInfo>>({});
  const personCacheRef = React.useRef<Record<string, PersonInfo>>({});

  const blobToDataUrl = React.useCallback((blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  const getDefaultAvatar = React.useCallback((nameOrEmail: string): string => {
    const safe = String(nameOrEmail || "").trim() || "User";
    const initials = safe
      .split(" ")
      .map((n) => n?.trim()?.[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const colors = [
      "#0078D4",
      "#00A4EF",
      "#50E6FF",
      "#8764B8",
      "#881798",
      "#E43BA6",
      "#E74856",
      "#F7630C",
      "#FFB900",
      "#00CC6A",
    ];

    const colorIndex =
      safe.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

    const bgColor = colors[colorIndex];

    const svg = `
      <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" fill="${bgColor}"/>
        <text x="50%" y="50%"
              text-anchor="middle"
              dy=".35em"
              font-family="Segoe UI, Arial, sans-serif"
              font-size="20"
              font-weight="600"
              fill="white">
          ${initials}
        </text>
      </svg>
    `.trim();

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }, []);

  const ensurePeopleFromGraph = React.useCallback(
    async (emails: string[]) => {
      const ctx = props.context;
      if (!ctx?.msGraphClientFactory) return;

      const unique = Array.from(new Set((emails || []).filter(Boolean)));
      const missing = unique.filter((e) => !personCacheRef.current[e]);
      if (!missing.length) return;

      const graph: MSGraphClientV3 = await ctx.msGraphClientFactory.getClient("3");
      const updates: Record<string, PersonInfo> = {};

      for (const email of missing) {
        const fallbackName =
          mappedTrainings.find((t) => t.instructorEmail === email)?.instructorName || email;

        let displayName = fallbackName;

        try {
          const user = await graph.api(`/users/${email}`).select("displayName").get();
          if (user?.displayName) displayName = user.displayName;
        } catch {
          // ignore - keep fallback
        }

        let avatarUrl = "";
        try {
          const photoResponse = await graph.api(`/users/${email}/photo/$value`).get();

          let blob: Blob;
          if (photoResponse instanceof ArrayBuffer) {
            blob = new Blob([photoResponse], { type: "image/jpeg" });
          } else if (photoResponse instanceof Blob) {
            blob = photoResponse;
          } else {
            throw new Error("Unexpected photo response type");
          }

          avatarUrl = await blobToDataUrl(blob);
        } catch {
          avatarUrl = getDefaultAvatar(displayName || email);
        }

        updates[email] = { name: displayName, avatarUrl };
      }

      if (Object.keys(updates).length) {
        setPersonByEmail((prev) => {
          const next = { ...prev, ...updates };
          personCacheRef.current = next;
          return next;
        });
      }
    },
    [props.context, mappedTrainings, blobToDataUrl, getDefaultAvatar]
  );

  React.useEffect(() => {
    const emails = mappedTrainings
      .map((t) => (t.instructorEmail || "").trim())
      .filter(Boolean);

    if (!emails.length) return;
    void ensurePeopleFromGraph(emails);
  }, [mappedTrainings, ensurePeopleFromGraph]);

  const [expandedMonths, setExpandedMonths] = React.useState<IAccordionState>(() => {
    const initialState: IAccordionState = {};
    mappedTrainings.forEach((item) => {
      initialState[item.month] = true;
    });
    return initialState;
  });

  const groupedCourses = React.useMemo(() => {
    const filteredData = activeTab === "all" ? mappedTrainings : myTrainings;

    const groups: { [key: string]: MappedTraining[] } = {};
    filteredData.forEach((course) => {
      if (!groups[course.month]) groups[course.month] = [];
      groups[course.month].push(course);
    });

    return groups;
  }, [activeTab, mappedTrainings, myTrainings]);

  const toggleMonth = (month: string) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [month]: !prev[month],
    }));
  };

  return (
    <>
      {/* Tabs */}
      <div className={styles.tabContainer}>
        <div className={styles.tabContainerInner}>
          <button
            className={`${styles.tabButton} ${activeTab === "all" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Trainings
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "my" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("my")}
          >
            My Trainings
          </button>
        </div>
      </div>

      {props.viewtype === "list" ? (
        <div className={styles.courseListing}>
          {activeTab !== "my" ? (
            Object.entries(groupedCourses).map(([month, courses]) => (
              <div key={month} className={styles.monthSection}>
                <button
                  className={styles.accordionHeader}
                  onClick={() => toggleMonth(month)}
                  aria-expanded={!!expandedMonths[month]}
                >
                  <h2 className={styles.monthTitle}>{month}</h2>
                  <svg
                    className={`${styles.chevron} ${expandedMonths[month] ? styles.chevronUp : ""}`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {expandedMonths[month] && (
                  <div className={styles.cardsGrid}>
                    {courses.map((course) => (
                      <AllTrainingCard
                        key={course.trainingId || course.id}
                        imageUrl={course.imageUrl}
                        category={course.category}
                        title={course.title}
                        date={course.startDate}
                        endDate={course.endDate}
                        duration={course.duration}
                        instructorName={personByEmail[course.instructorEmail || ""]?.name || course.instructorName}
                        instructorTitle={course.instructorTitle}
                        instructorImageUrl={
                          personByEmail[course.instructorEmail || ""]?.avatarUrl ||
                          (course.instructorName ? getDefaultAvatar(course.instructorName) : undefined)
                        }
                        pageUrl={course.pageUrl}
                        context={props.context}
                        trainingId={course.trainingId}
                        meetingLink={course.meetingLink}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={styles.myTrainingsGrid}>
              {myTrainings.map((event) => (
                <Trainingcard
                  key={event.trainingId || event.id}
                  {...event}
                  instructorName={personByEmail[event.instructorEmail || ""]?.name || event.instructorName}
                  instructorImageUrl={
                    personByEmail[event.instructorEmail || ""]?.avatarUrl ||
                    (event.instructorName ? getDefaultAvatar(event.instructorName) : undefined)
                  }
                  time={event.time}
                  context={props.context}
                />
              ))}
            </div>
          )}

          {/* Learning Section */}
          <div className={styles.learningSection}>
            <div className={styles.learningColumn}>
              <LearningLinks
                title="Learning Links"
                description="Enhance your knowledge with our learning links."
                links={learningLinks}
              />
            </div>
            <div className={styles.learningColumn}>
              <LearningLinks
                title="Learning Content"
                description="Access insightful and engaging learning content."
                links={learningContentLinks}
              />
            </div>
          </div>
        </div>
      ) : (
        <CalendarViewComponent events={mappedTrainings as any} context={props.context} />
      )}
    </>
  );
};

export default Training;
