import * as React from "react";
import styles from "./Training.module.scss";
import { AllTrainingCard } from "./Card";
import { LearningLinks } from "./Learningcard";
import Trainingcard from "./TrainingCard";
import CalendarViewComponent from "../Events/Calendarview/CalendarView";

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

  month: string;

  isMyTraining: boolean;

  location: string;
  meetingLink: string;
  joinUrl: string;

  pageUrl: string;

  Eventtype: "Trainings";
  subtitle: string;
};

const safeStr = (v: any): string => String(v ?? "").trim();

const mapSharePointTrainingsForAll = (data: any[]): MappedTraining[] => {
  const deduped = Array.from(
    new Map(
      (data || []).map((i: any) => {
        const idKey =
          i?.ID ?? i?.Id ?? i?.ListItemID ?? i?.ListItemId ?? i?.title;
        return [String(idKey), i];
      })
    ).values()
  );

  return deduped
    .map((item: any, index: number) => {
      const startDateStr =
        safeStr(item?.eventStartDate).split("\n")[0]?.trim() || "";
      const endDateStr =
        safeStr(item?.eventEndDate).split("\n")[0]?.trim() || "";

      if (!startDateStr || !endDateStr) return null;

      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;

      const monthLabel = `${startDate.toLocaleString("default", {
        month: "long",
      })} ${startDate.getFullYear()}`;

      const dateRangeDisplay = `${startDate.getDate()}-${endDate.getDate()} ${startDate.toLocaleString(
        "default",
        { month: "short" }
      )} ${startDate.getFullYear()}`;

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

      const spIdRaw =
        item?.ID ?? item?.Id ?? item?.ListItemID ?? item?.ListItemId;
      const spId = Number(spIdRaw) || 0;

      const meetingLink = safeStr(
        item?.joiningURL ||
          item?.joiningUrl ||
          item?.meetingLink ||
          item?.MeetingLink
      );

      const pageUrl = safeStr(item?.pageUrl) || "#";

      return {
        ...item,
        id: spId || index + 1,
        trainingId: spId || index + 1,

        imageUrl:
          item?.newsImage ||
          "https://via.placeholder.com/400x200?text=No+Image",
        category: "Classroom",
        title: item?.title || "Untitled Training",

        dateRangeDisplay,
        timeRange,

        // ✅ satisfy TrainingCardProps
        time: timeRange,

        startDate: startDateStr,
        endDate: endDateStr,

        duration: `${Math.max(
          1,
          Math.ceil(
            (endDate.getTime() - startDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )} days`,

        instructorName: item?.instructor?.name,
        instructorTitle: item?.instructor?.role,
        instructorImageUrl: `https://i.pravatar.cc/150?img=${(index % 6) + 1}`,

        month: monthLabel,

        // NOTE: your existing logic
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

  const [expandedMonths, setExpandedMonths] = React.useState<IAccordionState>(
    () => {
      const initialState: IAccordionState = {};
      mappedTrainings.forEach((item) => {
        initialState[item.month] = true;
      });
      return initialState;
    }
  );

  const groupedCourses = React.useMemo(() => {
    const filteredData =
      activeTab === "all"
        ? mappedTrainings
        : mappedTrainings.filter((c) => c.isMyTraining);

    const groups: { [key: string]: MappedTraining[] } = {};
    filteredData.forEach((course) => {
      if (!groups[course.month]) groups[course.month] = [];
      groups[course.month].push(course);
    });

    return groups;
  }, [activeTab, mappedTrainings]);

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
            className={`${styles.tabButton} ${
              activeTab === "all" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Trainings
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "my" ? styles.activeTab : ""
            }`}
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
                    className={`${styles.chevron} ${
                      expandedMonths[month] ? styles.chevronUp : ""
                    }`}
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
                        // Card.tsx parses these with new Date()
                        date={course.startDate}
                        endDate={course.endDate}
                        duration={course.duration}
                        instructorName={course.instructorName}
                        instructorTitle={course.instructorTitle}
                        instructorImageUrl={course.instructorImageUrl}
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
              {mappedTrainings
                .filter((c) => c.isMyTraining)
                .map((event) => (
                  <Trainingcard
                    key={event.trainingId || event.id}
                    {...event}
                    time={event.time} // ✅ explicit safety
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
        <CalendarViewComponent
          events={mappedTrainings as any}
          context={props.context}
        />
      )}
    </>
  );
};

export default Training;
