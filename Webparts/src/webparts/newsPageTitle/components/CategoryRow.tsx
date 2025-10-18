import * as React from "react";
import styles from './NewsPageTitle.module.scss';
import NewsType from "../../Components/News/NewsType";

interface IHeaderChipsProps {
  category?: any; // may be string | object | array (SharePoint inconsistency)
  department?: any;
  hashtags?: string[];
  onTagClick?: (tag: string) => void;
}

export const CategoryRow: React.FC<IHeaderChipsProps> = ({
  category = "",
  department = "",
  hashtags = []  
}) => {

  // ✅ Department icon resolver
  const getDepartmentIcon = (): string | null => {
    const d = department.toLowerCase();
    //  if (d.includes("human capital")) return HumanCapitalIcon;
    if (d.includes("finance")) return "💰";
    if (d.includes("it")) return "💻";
    if (d.includes("marketing")) return "📣";
    if (d.includes("operations")) return "⚙️";
    if (d.includes("administration")) return "🧾";
    return "🏢";
  };

  // ✅ Render SVG or emoji gracefully
  const renderIcon = (icon: string | null) => {
    if (!icon) return null;
    return icon.endsWith(".svg") ? (
      <img src={icon} alt="" className={styles.categoryIcon} />
    ) : (
      <span className={styles.emoji}>{icon}</span>
    );
  };

  return (
    <div className={styles.headerChips}>
      {/* Category */}
      {category && (
        <NewsType newsType={category}></NewsType>
      )}

      {/* Divider */}
      {category && department && <div className={styles.divider}></div>}

      {/* Department */}
      {department && (
        <div className={styles.departmentChip}>
          {renderIcon(getDepartmentIcon())}
          <span className={styles.departmentText}>{department}</span>
        </div>
      )}

      {/* Divider before hashtags */}
      {(category || department) && hashtags && hashtags?.length > 0 && (
        <div className={styles.divider}></div>
      )}
      <div className={styles.hashtagContainer}>
        {hashtags}
      </div>
      {/* 
      {hashtags.length > 0 && (
        <div className={styles.hashtagContainer}>
          {hashtags.map((tag, i) => (
            <span
              key={i}
              className={styles.hashtagLink}
              onClick={() => onTagClick && onTagClick(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
      )} */}
    </div>
  );
};
