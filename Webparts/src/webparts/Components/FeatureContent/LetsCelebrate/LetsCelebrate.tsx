import * as React from "react";
import styles from "./LetsCelebrate.module.scss";

const leftHeadingLine: string = require("../images/leftArrow.svg");
const rightHeadingLine: string = require("../images/rightArrow.svg");
const cakeImage: string = require("../images/Cake-1.svg");
const newJoinerCenter: string = require("../images/Newjoiner.svg");
const aniversaryImage: string = require("../images/aniversary.svg");
import { listServices } from "../../../services/listServices";
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

const defaultCelebrations = {
  birthdays: [
    {
      id: "1",
      name: "John Doe",
      department: "Engineering",
      date: "Today",
      type: "birthday" as const,
      image: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: "2",
      name: "Jane Smith",
      department: "Marketing",
      date: "Tomorrow",
      type: "birthday" as const,
      image: "https://i.pravatar.cc/150?img=2",
    },
    {
      id: "3",
      name: "Mike Johnson",
      department: "Sales",
      date: "Dec 15",
      type: "birthday" as const,
      image: "https://i.pravatar.cc/150?img=3",
    },
    {
      id: "4",
      name: "Sarah Williams",
      department: "HR",
      date: "Dec 20",
      type: "birthday" as const,
      image: "https://i.pravatar.cc/150?img=4",
    },
  ],
  anniversaries: [
    {
      id: "5",
      name: "Robert Brown",
      department: "Engineering",
      date: "5 Years",
      type: "anniversary" as const,
      image: "https://i.pravatar.cc/150?img=5",
    },
    {
      id: "6",
      name: "Emily Davis",
      department: "Operations",
      date: "10 Years",
      type: "anniversary" as const,
      image: "https://i.pravatar.cc/150?img=6",
    },
    {
      id: "7",
      name: "David Wilson",
      department: "Finance",
      date: "3 Years",
      type: "anniversary" as const,
      image: "https://i.pravatar.cc/150?img=7",
    },
    {
      id: "8",
      name: "Lisa Anderson",
      department: "Legal",
      date: "7 Years",
      type: "anniversary" as const,
      image: "https://i.pravatar.cc/150?img=8",
    },
  ],
  newJoiners: [
    {
      id: "9",
      name: "Tom Harris",
      department: "Engineering",
      date: "This Week",
      type: "newJoiner" as const,
      image: "https://i.pravatar.cc/150?img=9",
    },
    {
      id: "10",
      name: "Anna Martin",
      department: "Design",
      date: "This Week",
      type: "newJoiner" as const,
      image: "https://i.pravatar.cc/150?img=10",
    },
  ],
  Achievements: [
    {
      id: "11",
      name: "Project Alpha",
      department: "Engineering",
      date: "Completed",
      type: "Achievement" as const,
      image: "https://i.pravatar.cc/150?img=11",
    },
    {
      id: "12",
      name: "Sales Milestone",
      department: "Sales",
      date: "Achieved",
      type: "Achievement" as const,
      image: "https://i.pravatar.cc/150?img=12",
    },
  ],
};

// Position assignments for outer circle (2 positions - left and right)
const outerPositions: Array<'left' | 'right'> = ['left', 'right'];

// Position assignments for inner circle (2 positions)
const innerPositions: Array<'bottom-left' | 'bottom-right' | 'bottom-right'> = [
    'bottom-left',
    'bottom-right'
];

export const LetsCelebrate: React.FC<ILetsCelebrateProps> = (props) => {
  const [activeTab, setActiveTab] = React.useState<
    "birthdays" | "anniversaries" | "newJoiners" | "Achievements"
  >("newJoiners");
  const [currentPage, setCurrentPage] = React.useState(0);
   // 1. Create State to hold SharePoint Data
  const [spNewJoiners, setSpNewJoiners] = React.useState<any[]>([]);

  // 2. Use useEffect to fetch data on mount
  React.useEffect(() => {
    const fetchNewJoiners = async () => {
      try {
        const spService = new listServices(props.context);
        // Ensure your service returns data matching ICelebration interface, or map it here
        const data = await spService.getNewJoiners("New Joiner");
        
        // Example mapping if necessary (if 'data' is raw SharePoint items):
        const mappedData = data.map(item => ({
           id: item.Id,
           name: item.Title,
           department: item.Department,
           type: 'newJoiner',
           image: item.UserPicture
        }));
        setSpNewJoiners(mappedData);

      } catch (error) {
        console.error("Error fetching new joiners:", error);
      }
    };

    fetchNewJoiners();
  }, [props.context]); // Re-run if context changes

  // 3. Merge Props/Defaults with Fetched Data
  // Priority: Props -> Fetched Data -> Default Data
  const celebrations = {
    birthdays: props.celebrations?.birthdays ?? defaultCelebrations.birthdays,
    anniversaries: props.celebrations?.anniversaries ?? defaultCelebrations.anniversaries,
    
    // Updated logic: Use fetched data if available
    newJoiners: props.celebrations?.newJoiners ?? (spNewJoiners.length > 0 ? spNewJoiners : defaultCelebrations.newJoiners),
    
    Achievements: props.celebrations?.Achievements ?? defaultCelebrations.Achievements ?? [],
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

  const currentCelebrations: ICelebration[] = celebrations[activeTab] ?? [];

  // Pagination logic - 2 outer + 3 inner = 5 people per page
  const itemsPerPage = 5; // 2 outer + 3 inner
  const totalPages = Math.ceil(currentCelebrations.length / itemsPerPage);
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
    setCurrentPage(0); // Reset page when switching tabs
  };

  const getOuterCirclePosition = (index: number): React.CSSProperties => {
    const position = outerPositions[index % 2];
    const positionMap: Record<string, React.CSSProperties> = {
      'left': {
        top: '50%',
        left: '0%',
        transform: 'translate(-50%, -50%)'
      },
      'right': {
        top: '50%',
        right: '0%',
        transform: 'translate(50%, -50%)'
      }
    };
    return positionMap[position] || {};
  };

  const getInnerCirclePosition = (index: number): React.CSSProperties => {
    const position = innerPositions[index % 2];
    const positionMap: Record<string, React.CSSProperties> = {
      'bottom-left': {
        top: '75%',
        left: '0%',
        transform: 'translate(0%, 0%)'
      },
      'bottom-right': {
        top: '75%',
        right: '0%',
        transform: 'translate(0%, 0%)'
      }
    };
    return positionMap[position] || {};
  };
  return (
    <div className={styles.celebrateContainer}>
      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${
              activeTab === tab.key ? styles.activeTab : ""
            }`}
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
                {/* Render outer circle profile cards (max 2 - left and right) */}
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
                {/* Inner circle with people around it */}
                <div className={styles.innerCircle}>
                  {/* Render inner circle profile cards (max 3) */}
                  {currentItems.slice(2, 5).map((item, index) => (
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

                  {/* Center illustration - always visible */}
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
              {/* Pagination & View All Button */}
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
                  <a href={props.seeAllURL} className={styles.viewAllButton}>
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
            <p>
              No {tabs.find((t) => t.key === activeTab)?.label.toLowerCase()} to
              celebrate right now
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LetsCelebrate;