import * as React from "react";
import styles from "./Training.module.scss";
import { AllTrainingCard } from "./Card";
import { LearningLinks } from "./Learningcard";
import Trainingcard from "./TrainingCard";

interface IAccordionState {
  [key: string]: boolean;
}

export interface ITrainingmoduleProps {
  AllTrainingdata: any[]|undefined;
}



interface ILearningLink {
  id: number;
  title: string;
  logo: string;
  logoAlt: string;
  url: string;
  backgroundColor?: string;
}

// Sample learning links (unchanged)
const learningLinks: ILearningLink[] = [
  {
    id: 1,
    title: "STRYVE By LinkedIn Learning",
    logo: "https://stryve.com/wp-content/uploads/2020/09/cropped-STRYVE-Logo-Final-1.png",
    logoAlt: "STRYVE",
    url: "https://www.stryve.com/",
    backgroundColor: "#2F2F2F"
  },
  {
    id: 2,
    title: "eCornell by DHRE",
    logo: "https://www.edx.org/sites/default/files/styles/edx_3_2x/public/media/logo/eCornell_Logo.png",
    logoAlt: "eCornell",
    url: "https://ecornell.cornell.edu/",
    backgroundColor: "#0056D2"
  },
  {
    id: 3,
    title: "LMS by DHRE",
    logo: "https://www.simplilearn.com/ice9/assets/course-logo/learning-management-system.jpg",
    logoAlt: "LMS by DHRE",
    url: "https://www.simplilearn.com/learning-management-system-basics-article",
    backgroundColor: "#A435F0"
  }
];

const learningContentLinks = [
  { id: 1, title: "DHRE Unconscious Bias", logo: "/bias.png", logoAlt: "Bias", url: "#" },
  { id: 2, title: "DHRE Effective Time Management", logo: "/time.png", logoAlt: "Time", url: "#" },
  { id: 3, title: "DHRE Priority Matrix Job Aid", logo: "/matrix.png", logoAlt: "Matrix", url: "#" },
];

// --------------------------
// Mapping SharePoint data
// --------------------------
function mapSharePointTrainingsForAll(data: any[]) {
  return data.map((item, index) => {
    const startDateStr = item.eventStartDate?.split("\n\n")[1] || "";
    const endDateStr = item.eventEndDate?.split("\n\n")[1] || "";

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // Month label for AllTrainingCard accordion
    const monthLabel = `${startDate.toLocaleString("default", { month: "long" })} ${startDate.getFullYear()}`;

    // Date range for AllTrainingCard
    const dateRange = `${startDate.getDate()}-${endDate.getDate()} ${startDate.toLocaleString("default", { month: "short" })} ${startDate.getFullYear()}`;

    // Time for TrainingCard
    const timeRange = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    return {
      id: index + 1,
      // AllTrainingCard props
      imageUrl: item.newsImage || "https://via.placeholder.com/400x200?text=No+Image",
      category: "Online",
      title: item.title || "Untitled Training",
      date: dateRange,
      duration: `${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days`,
      instructorName: "TBD",
      instructorTitle: "Trainer",
      instructorImageUrl: `https://i.pravatar.cc/150?img=${(index % 6) + 1}`,
      month: monthLabel,
      isRegistered: !!item.joiningURL,
      isMyTraining: !!item.joiningURL,
      location: item.location?.split("\n\n")[0] || "TBD",
      joinUrl: item.joiningURL || "#",

      // TrainingCard props
      startDate: startDateStr,
      endDate: endDateStr,
      subtitle: "",
      time: timeRange,
    };
  });
}


// --------------------------
// Component
// --------------------------
const Training: React.FC<ITrainingmoduleProps> = (props) => {
  const [activeTab, setActiveTab] = React.useState<"all" | "my">("all");
  const [expandedMonths, setExpandedMonths] = React.useState<IAccordionState>({});

  // Map SharePoint data to your component format
  const mappedTrainings = React.useMemo(() => mapSharePointTrainingsForAll(props.AllTrainingdata || []), [props.AllTrainingdata]);

  const groupedCourses = React.useMemo(() => {
    const filteredData =
      activeTab === "all"
        ? mappedTrainings
        : mappedTrainings.filter((c) => c.isMyTraining);

    const groups: { [key: string]: typeof mappedTrainings } = {};
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

  const handleRequestApproval = (courseId: number, courseTitle: string) => {
    console.log(`Request approval for course: ${courseTitle} (ID: ${courseId})`);
  };

  return (
    <>
      {/* Tabs */}
      <div className={styles.tabContainer}>
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

      {/* Courses */}
      <div className={styles.courseListing}>
        {activeTab !== "my" ? (
          // All Trainings - Accordion by month
          Object.entries(groupedCourses).map(([month, courses]) => (
            <div key={month} className={styles.monthSection}>
              <button
                className={styles.accordionHeader}
                onClick={() => toggleMonth(month)}
                aria-expanded={expandedMonths[month]}
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
                      key={course.id}
                      imageUrl={course.imageUrl}
                      category={course.category}
                      title={course.title}
                      date={course.date}
                      duration={course.duration}
                      instructorName={course.instructorName}
                      instructorTitle={course.instructorTitle}
                      instructorImageUrl={course.instructorImageUrl}
                      isRegistered={course.isRegistered}
                      onJoin={() => handleRequestApproval(course.id, course.title)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          // My Trainings Tab
          <div className={styles.myTrainingsGrid}>
            {mappedTrainings
              .filter((c) => c.isMyTraining)
              .map((event) => (
                <Trainingcard key={event.id} {...event} />
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
    </>
  );
};

export default Training;
