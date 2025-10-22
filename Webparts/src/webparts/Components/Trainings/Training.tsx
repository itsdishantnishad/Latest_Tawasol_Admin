import * as React from "react";
import styles from "./Training.module.scss";
import { AllTrainingCard } from "./Card";
import { LearningLinks } from "./Learningcard";
import Trainingcard from "./TrainingCard";

const AllTrainingData = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
    category: 'Classroom',
    title: 'Dubai Futures Academy: Future Literacy',
    date: '12-14 Aug 2024',
    duration: '2 days',
    instructorName: 'Jordan Belforth',
    instructorTitle: 'Instructor at Google',
    instructorImageUrl: 'https://i.pravatar.cc/150?img=1',
    month: 'September 2025',
    isRegistered: false
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
    category: 'In-person',
    title: 'Mobile App Design Complete Guide',
    date: '12-14 Aug 2024',
    duration: '2 days',
    instructorName: 'Jordan Belforth',
    instructorTitle: 'Instructor at Google',
    instructorImageUrl: 'https://i.pravatar.cc/150?img=2',
    month: 'September 2025',
    isRegistered: false
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400',
    category: 'Classroom',
    title: 'ChatGPT and GenAI - The Complete Course',
    date: '12-14 Aug 2024',
    duration: '2 days',
    instructorName: 'Jordan Belforth',
    instructorTitle: 'Instructor at Google',
    instructorImageUrl: 'https://i.pravatar.cc/150?img=3',
    month: 'September 2025',
    isMyTraining: true,
    isRegistered: true
  },
  {
    id: 4,
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    category: 'Classroom',
    title: 'Digital Marketing Full Masterclass',
    date: '12-14 Aug 2024',
    duration: '2 days',
    instructorName: 'Jordan Belforth',
    instructorTitle: 'Instructor at Google',
    instructorImageUrl: 'https://i.pravatar.cc/150?img=4',
    month: 'September 2025',
    isRegistered: false
  },
  {
    id: 5,
    imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400',
    category: 'Online',
    title: 'Project Management Professional',
    date: '20-22 Sep 2024',
    duration: '3 days',
    instructorName: 'Sarah Johnson',
    instructorTitle: 'Senior PM at Microsoft',
    instructorImageUrl: 'https://i.pravatar.cc/150?img=5',
    month: 'October 2025',
    isMyTraining: true,
    isRegistered: true
  },
  {
    id: 6,
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400',
    category: 'Classroom',
    title: 'Data Science and Machine Learning',
    date: '25-27 Sep 2024',
    duration: '3 days',
    instructorName: 'Michael Chen',
    instructorTitle: 'Data Scientist at Amazon',
    instructorImageUrl: 'https://i.pravatar.cc/150?img=6',
    month: 'October 2025',
    isMyTraining: true,
    isRegistered: true
  }
];
export interface ITrainingProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}



interface IAccordionState {
  [key: string]: boolean;
}

interface ILearningLink {
  id: number;
  title: string;
  logo: string;
  logoAlt: string;
  url: string;
  backgroundColor?: string;
}

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
 const sampleEvent = {
    startDate: '2025-07-06',
    endDate: '2025-07-07',
    category: 'Entertainment',
    title: 'Dubai Futures Academy:Future Literacy',
    subtitle: '',
    time: '11 AM - 12 PM',
    duration: '2 Days',
    location: 'Zabeel Theatre, Sharjah',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=60',
    isRegistered: true,
    joinUrl: '#'
  };
const Training: React.FC<ITrainingProps> = () => {
  const [activeTab, setActiveTab] = React.useState<"all" | "my">("all");
  const [expandedMonths, setExpandedMonths] = React.useState<IAccordionState>({
    "September 2025": true,
    "October 2025": false,
  });

  const groupedCourses = React.useMemo(() => {
    const filteredData =
      activeTab === "all"
        ? AllTrainingData
        : AllTrainingData.filter((c) => c.isMyTraining);

    const groups: { [key: string]: typeof AllTrainingData } = {};
    filteredData.forEach((course) => {
      if (!groups[course.month]) groups[course.month] = [];
      groups[course.month].push(course);
    });
    return groups;
  }, [activeTab]);

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
      {/* Tabs Section */}
      <div className={styles.tabContainer}>
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

      {/* Course Listing */}
     <div className={styles.courseListing}>
  {activeTab !== "my" ? (
    // All Trainings Tab - Show accordion with months
    Object.entries(groupedCourses).map(([month, courses]) => (
      <div key={month} className={styles.monthSection}>
        <button
          className={styles.accordionHeader}
          onClick={() => toggleMonth(month)}
          aria-expanded={expandedMonths[month]}
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
                    onJoin={() =>
                      handleRequestApproval(course.id, course.title)
                    }
              />
            ))}
          </div>
        )}
      </div>
    ))
  ) : (
    // My Trainings Tab - Show MyCourseCard without accordion
    <div className={styles.myTrainingsGrid}>
      <Trainingcard {...sampleEvent} />
      {/* {Object.entries(groupedCourses).map(([month, courses]) =>
        courses.map((event, index) => (
          <trainingcard
            key={index}
            imageUrl={event.imageUrl}
            category={event.category}
            title={event.title}
            date={event.date}
            month={event.month}
            day={event.startDay || ""}
            status={event.isRegistered ? "Registered" : "Upcoming"}
            time={event.timeSlot || ""}
            eventDateTime={`${event.startDate || ""} ${event.startMonth || ""} - ${event.endDate || ""} ${event.endMonth || ""}`}
            location={event.location || ""}
          />
        ))
      )} */}
    </div>
  )}

  {/* Learning Sections */}
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