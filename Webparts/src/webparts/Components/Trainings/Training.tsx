import * as React from "react";
import styles from "./Training.module.scss";
import { LearningLinks } from "./Learningcard";
import TrainingCard from "./TrainingCard";
import CalendarViewComponent from "../Events/Calendarview/CalendarView";
import { MSGraphClientV3, SPHttpClient } from "@microsoft/sp-http";

import { spfi, SPFx, SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

interface IAccordionState {
  [key: string]: boolean;
}

export interface ITrainingmoduleProps {
  AllTrainingdata?: any[];
  Trainings?: any[];
  viewtype?: "list" | "calendar" | string;
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

// to convert src to URL from String
const toImgSrc = (m: any): string => (typeof m === "string" ? m : m?.default || m);

// Sample learning links (kept from your old file)
const learningLinks: ILearningLink[] = [
  {
    id: 1,
    title: "STRYVE By LinkedIn Learning",
    logo: toImgSrc(require("../../assets/stryve.webp")),
    logoAlt: "STRYVE",
    url: "https://www.linkedin.com/company/stryvelearning/?utm_source=chatgpt.com",
    backgroundColor: "#FDECDC",
  },
  {
    id: 2,
    title: "eCornell by DHRE",
    logo: toImgSrc(require("../../assets/ecornell.webp")),
    logoAlt: "eCornell",
    url: "https://auth.ecornell.com/cas/login?service=https%3A%2F%2Flms.ecornell.com%2Flogin%2Fcas#entry-37079268",
    backgroundColor: "#FDECDC",
  },
  {
    id: 3,
    title: "LMS by DHRE",
    logo: toImgSrc(require("../../assets/lms.webp")),
    logoAlt: "LMS by DHRE",
    url: "https://esbe.fa.em8.oraclecloud.com/fscmUI/redwood/learner/learn/learn-enrollment-details?launchedFrom=myLearnExperience&learnerRecordId=300001155944032&persona=ORA_LEARNER",
    backgroundColor: "#FDECDC",
  },
];

const learningContentLinks: ILearningLink[] = [
  {
    id: 1,
    title: "DHRE Unconscious Bias",
    logo: toImgSrc(require("../../assets/learningconcious.webp")),
    logoAlt: "Bias",
    url: "https://esbe.fa.em8.oraclecloud.com/fscmUI/redwood/learner/learn/learn-landing?tab=myLearnExperience&pagesUseSessionStoredFilters=learning-landing",
    backgroundColor: "#FDECDC",
  },
  {
    id: 2,
    title: "DHRE Effective Time Management",
    logo: toImgSrc(require("../../assets/effectivemanagement.webp")),
    logoAlt: "Time",
    url: "https://esbe.fa.em8.oraclecloud.com/fscmUI/redwood/learner/learn/learn-landing?tab=myLearnExperience&pagesUseSessionStoredFilters=learning-landing",
    backgroundColor: "#FDECDC",
  },
  {
    id: 3,
    title: "DHRE Priority Matrix Job Aid",
    logo: toImgSrc(require("../../assets/priorityjob.webp")),
    logoAlt: "Matrix",
    url: "https://esbe.fa.em8.oraclecloud.com/fscmUI/redwood/learner/learn/learn-landing?tab=myLearnExperience&pagesUseSessionStoredFilters=learning-landing",
    backgroundColor: "#FDECDC",
  },
];

// ----------------------------
// Helpers (date + URL)
// ----------------------------
const safeStr = (v: any): string => String(v ?? "").trim();

/** Prefer ISO token if SharePoint provides "display\nISO" */
const pickBestDateText = (v: any): string => {
  const s = String(v ?? "").trim();
  if (!s) return "";

  const parts = s
    .split(/\n+/g)
    .map((x) => x.trim())
    .filter(Boolean);

  const iso =
    parts.find((p) => /^\d{4}-\d{2}-\d{2}T/.test(p)) ||
    parts.find((p) => /\d{4}-\d{2}-\d{2}T/.test(p));

  return iso || parts[0] || "";
};

const parseSPDate = (value: any): Date | null => {
  if (!value) return null;

  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  // Graph payload shape {dateTime:"..."}
  if (typeof value === "object") {
    const dt = (value as any)?.dateTime || (value as any)?.DateTime;
    if (dt) {
      const rawObj = pickBestDateText(dt);
      const dObj = new Date(rawObj);
      return isNaN(dObj.getTime()) ? null : dObj;
    }
  }

  const raw = pickBestDateText(value);
  if (!raw) return null;

  const d1 = new Date(raw);
  return isNaN(d1.getTime()) ? null : d1;
};

const fmtTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });

const daysBetween = (start: Date, end: Date) => {
  const ms = end.getTime() - start.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
};

const uniqNums = (arr: number[]): number[] => Array.from(new Set(arr));

const toServerRelativeUrl = (pathOrUrl: string): string => {
  const s = String(pathOrUrl || "").trim();
  if (!s) return "";
  try {
    if (/^https?:\/\//i.test(s)) {
      return new URL(s).pathname;
    }
  } catch {
    // ignore
  }
  return s;
};

const escapeODataString = (s: string): string => String(s || "").replace(/'/g, "''");

const safeUrlFromHyperlinkField = (v: any): string => {
  if (!v) return "";
  if (typeof v === "string") return v;
  return String(v?.Url ?? v?.url ?? "").trim();
};

type PersonInfo = { name: string; avatarUrl: string };

type TrainingMeta = { id: number; joinUrl: string };

type MappedTraining = {
  id: number;
  trainingId: number;

  imageUrl: string;
  category: string;
  title: string;
  subtitle: string;

  // display strings
  dateRangeDisplay: string;
  timeRange: string;
  time: string;

  // raw dates
  startDate: string;
  endDate: string;

  // calendar needs real dates too
  start: Date;
  end: Date;
  eventDateTime: Date;

  duration: string;

  instructorName?: string;
  instructorTitle?: string;
  instructorImageUrl?: string;
  instructorEmail?: string;

  month: string;
  location: string;

  meetingLink: string;
  joinUrl: string;
  pageUrl: string;

  Eventtype: "Trainings";
};

// ----------------------------
// Promise.allSettled polyfill (ES6 safe)
// ----------------------------
type Settled<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: unknown };

const allSettled = <T,>(promises: Promise<T>[]): Promise<Settled<T>[]> => {
  return Promise.all(
    promises.map((p) =>
      p.then(
        (value) => ({ status: "fulfilled", value } as Settled<T>),
        (reason) => ({ status: "rejected", reason } as Settled<T>)
      )
    )
  );
};

// ----------------------------
// Default avatar (utf8-safe base64)
// ----------------------------
const toBase64Utf8 = (input: string): string => {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const getDefaultAvatar = (nameOrEmail: string): string => {
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
      <text x="50%" y="50%" text-anchor="middle" dy=".35em"
            font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="600" fill="white">
        ${initials}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${toBase64Utf8(svg)}`;
};

// ----------------------------
// Map training items (robust parsing; filters invalid dates)
// ----------------------------
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
      const startRaw =
        item?.eventStartDate || item?.EventStartDate || item?.startDate || item?.StartDate;
      const endRaw =
        item?.eventEndDate || item?.EventEndDate || item?.endDate || item?.EndDate;

      const start = parseSPDate(startRaw);
      const end = parseSPDate(endRaw);
      if (!start || !end) return null;

      const monthLabel = `${start.toLocaleString("default", { month: "long" })} ${start.getFullYear()}`;

      const dateRangeDisplay = `${start.getDate()}-${end.getDate()} ${start.toLocaleString("default", {
        month: "short",
      })} ${start.getFullYear()}`;

      const timeRange = `${fmtTime(start)} - ${fmtTime(end)}`;

      const location = safeStr(item?.location).split("\n")[0]?.trim() || "";

      // trainingId should be Site Pages item ID
      const spIdRaw = item?.ListItemID ?? item?.ListItemId ?? item?.ID ?? item?.Id;
      const spId = Number(spIdRaw) > 0 ? Number(spIdRaw) : 0;

      const meetingLink = safeStr(
        item?.joiningURL || item?.joiningUrl || item?.meetingLink || item?.MeetingLink || ""
      );

      const pageUrl = safeStr(item?.pageUrl || item?.Path || item?.path || "") || "#";

      const durationDays = daysBetween(start, end);

      const instructorName =
        item?.instructor?.name ||
        item?.instructorName ||
        item?.InstructorName ||
        item?.organizerName ||
        item?.OrganizerName ||
        "";

      const instructorTitle =
        item?.instructor?.role || item?.instructorTitle || item?.InstructorTitle || "";

      const instructorEmail =
        item?.instructor?.email ||
        item?.instructorEmail ||
        item?.InstructorEmail ||
        item?.instructor?.id ||
        item?.Instructor?.Email ||
        item?.Instructor?.EMail ||
        item?.Organizer?.Email ||
        item?.Organizer?.EMail ||
        item?.Author?.Email ||
        item?.Author?.EMail ||
        "";

      const startIso = pickBestDateText(startRaw) || start.toISOString();
      const endIso = pickBestDateText(endRaw) || end.toISOString();

      const idForKey = spId || index + 1;

      return {
        ...item,
        id: idForKey,
        trainingId: spId, // may be 0 until we resolve from Site Pages

        imageUrl: item?.newsImage || item?.imageUrl || item?.Image || "https://via.placeholder.com/400x200?text=No+Image",
        category: item?.category || item?.Category || "Classroom",
        title: item?.title || item?.Title || "Untitled Training",
        subtitle: item?.subtitle || "",

        dateRangeDisplay,
        timeRange,
        time: timeRange,

        startDate: startIso,
        endDate: endIso,

        start,
        end,
        eventDateTime: start,

        duration: `${durationDays} day${durationDays > 1 ? "s" : ""}`,

        instructorName,
        instructorTitle,
        instructorEmail,
        instructorImageUrl: undefined,

        month: monthLabel,
        location,
        meetingLink,
        joinUrl: meetingLink || "#",
        pageUrl,

        Eventtype: "Trainings",
      } as MappedTraining;
    })
    .filter(Boolean) as MappedTraining[];
};

const Training: React.FC<ITrainingmoduleProps> = (props) => {
  const [activeTab, setActiveTab] = React.useState<"all" | "my">("all");

  // Use either prop name
  const source = (props.AllTrainingdata || props.Trainings || []) as any[];

  // Base mapped list (no async meta resolution yet)
  const baseMappedTrainings = React.useMemo(() => mapSharePointTrainingsForAll(source), [source]);

  // ----------------------------
  // Resolve Site Pages meta by FileRef (Id + TIRJoiningURL)
  // ----------------------------
  const [metaByFileRef, setMetaByFileRef] = React.useState<Record<string, TrainingMeta>>({});

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        if (!props.context || !baseMappedTrainings.length) return;

        const webUrl = props.context.pageContext.web.absoluteUrl;
        const fileRefs = baseMappedTrainings
          .map((t) => toServerRelativeUrl(t.pageUrl || ""))
          .filter(Boolean);

        const unique = Array.from(new Set(fileRefs));
        const missing = unique.filter((ref) => !metaByFileRef[ref]);
        if (!missing.length) return;

        const results = await allSettled(
          missing.map(async (fileRef) => {
            const url =
              `${webUrl}` +
              `/_api/web/lists/getbytitle('Site Pages')/items` +
              `?$top=1&$select=Id,FileRef,TIRJoiningURL&$filter=FileRef eq '${escapeODataString(fileRef)}'`;

            const resp = await props.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
            if (!resp.ok) return null;

            const json = await resp.json();
            const row = Array.isArray(json?.value) ? json.value[0] : null;
            if (!row) return null;

            const id = Number(row?.Id || 0);
            const joinUrl = safeUrlFromHyperlinkField(row?.TIRJoiningURL);

            return id > 0 ? { fileRef, id, joinUrl } : null;
          })
        );

        const updates: Record<string, TrainingMeta> = {};
        results.forEach((r) => {
          if (r.status === "fulfilled" && (r as any).value) {
            const v = (r as any).value as any;
            if (v?.fileRef && v?.id) {
              updates[v.fileRef] = { id: v.id, joinUrl: v.joinUrl || "" };
            }
          }
        });

        if (!cancelled && Object.keys(updates).length) {
          setMetaByFileRef((prev) => ({ ...prev, ...updates }));
        }
      } catch {
        // ignore
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.context, baseMappedTrainings, metaByFileRef]);

  // Apply resolved meta to mapped trainings
  const mappedTrainings = React.useMemo(() => {
    return baseMappedTrainings.map((t) => {
      const fileRef = toServerRelativeUrl(t.pageUrl || "");
      const meta = fileRef ? metaByFileRef[fileRef] : undefined;

      const trainingId = Number(meta?.id || t.trainingId || 0);
      const meetingLink = safeStr(meta?.joinUrl || t.meetingLink || "");

      return {
        ...t,
        trainingId,
        meetingLink,
        joinUrl: meetingLink || "#",
      };
    });
  }, [baseMappedTrainings, metaByFileRef]);

  // ----------------------------
  // PnP: Current user + Registered Training list filtering
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
  // Graph: resolve instructor name + avatar (cache by email)
  // ----------------------------
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

  const ensurePeopleFromGraph = React.useCallback(
    async (emails: string[]) => {
      const ctx = props.context;
      if (!ctx?.msGraphClientFactory) return;

      const unique = Array.from(new Set((emails || []).map((e) => String(e || "").trim()).filter(Boolean)));
      const missing = unique.filter((e) => !personCacheRef.current[e]);
      if (!missing.length) return;

      const graph: MSGraphClientV3 = await ctx.msGraphClientFactory.getClient("3");
      const updates: Record<string, PersonInfo> = {};

      for (const email of missing) {
        const fallbackName =
          mappedTrainings.find((t) => String(t.instructorEmail || "").trim() === email)?.instructorName || email;

        let displayName = fallbackName;
        try {
          const user = await graph.api(`/users/${email}`).select("displayName").get();
          if (user?.displayName) displayName = user.displayName;
        } catch {
          // ignore
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
    [props.context, mappedTrainings, blobToDataUrl]
  );

  React.useEffect(() => {
    const emails = mappedTrainings
      .map((t) => String(t.instructorEmail || "").trim())
      .filter(Boolean);

    if (!emails.length) return;
    void ensurePeopleFromGraph(emails);
  }, [mappedTrainings, ensurePeopleFromGraph]);

  // ----------------------------
  // Accordion open state per month
  // ----------------------------
  const [expandedMonths, setExpandedMonths] = React.useState<IAccordionState>(() => {
    const initialState: IAccordionState = {};
    baseMappedTrainings.forEach((item) => {
      initialState[item.month] = true;
    });
    return initialState;
  });

  React.useEffect(() => {
    // if months change due to new data, ensure defaults exist
    setExpandedMonths((prev) => {
      const next: IAccordionState = { ...prev };
      mappedTrainings.forEach((t) => {
        if (typeof next[t.month] === "undefined") next[t.month] = true;
      });
      return next;
    });
  }, [mappedTrainings]);

  const groupedCourses = React.useMemo(() => {
    const filteredData = activeTab === "all" ? mappedTrainings : myTrainings;

    const groups: { [key: string]: MappedTraining[] } = {};
    filteredData.forEach((course) => {
      if (!groups[course.month]) groups[course.month] = [];
      groups[course.month].push(course);
    });

    // sort within each month by start
    Object.keys(groups).forEach((k) => {
      groups[k] = groups[k].slice().sort((a, b) => a.start.getTime() - b.start.getTime());
    });

    return groups;
  }, [activeTab, mappedTrainings, myTrainings]);

  const toggleMonth = (month: string) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [month]: !prev[month],
    }));
  };

  // ----------------------------
  // Render
  // ----------------------------
  const isList = String(props.viewtype || "list") === "list";

  return (
    <>
      {/* Tabs */}
      <div className={styles.tabContainer}>
        <div className={styles.tabContainerInner}>
          <button
            className={`${styles.tabButton} ${activeTab === "all" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("all")}
            type="button"
          >
            All Trainings
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "my" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("my")}
            type="button"
          >
            My Trainings
          </button>
        </div>
      </div>

      {isList ? (
        <div className={styles.courseListing}>
          {Object.entries(groupedCourses).map(([month, courses]) => (
            <div key={month} className={styles.monthSection}>
              <button
                className={styles.accordionHeader}
                onClick={() => toggleMonth(month)}
                aria-expanded={!!expandedMonths[month]}
                type="button"
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
                    <TrainingCard
                      key={course.trainingId || course.id}
                      startDate={course.startDate}
                      endDate={course.endDate}
                      category={course.category}
                      title={course.title}
                      subtitle={course.subtitle}
                      time={course.time}
                      duration={course.duration}
                      location={course.location}
                      imageUrl={course.imageUrl}
                      pageUrl={course.pageUrl}
                      trainingId={course.trainingId}
                      meetingLink={course.meetingLink}
                      context={props.context}
                      // Department (Managed Metadata) - pass through if the search payload already has it
                      // (matches TrainingPageDetail behaviour; avoids extra Site Pages reads)
                      departmentName={
                        (course as any).departmentName ||
                        (course as any).department ||
                        (course as any).TIRDepartment ||
                        ""
                      }
                      departmentTaxId={(course as any).departmentTaxId || (course as any).owstaxIdTIRDepartment || ""}
                      instructorName={
                        (course.instructorEmail
                          ? personByEmail[String(course.instructorEmail || "").trim()]?.name
                          : "") || course.instructorName
                      }
                      instructorTitle={course.instructorTitle}
                      instructorImageUrl={
                        (course.instructorEmail
                          ? personByEmail[String(course.instructorEmail || "").trim()]?.avatarUrl
                          : "") || (course.instructorName ? getDefaultAvatar(course.instructorName) : undefined)
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Learning Section (kept from old file) */}
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
        <CalendarViewComponent
          events={(activeTab === "my" ? myTrainings : mappedTrainings) as any}
          context={props.context}
        />
      )}
    </>
  );
};

export default Training;
