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
  hashtags = [],
  onTagClick,
}) => {
  /** 🧩 Normalize category text (handles string | object | array) */
  const getCategoryText = (): string => {
    if (!category) return "";
    if (typeof category === "string") return category;
    if (Array.isArray(category)) return category[0]?.Label || category[0] || "";
    if (typeof category === "object" && "Label" in category) return (category as any).Label;
    return String(category);
  };

  /** 🧩 Normalize department text with guards (avoid showing plain numbers like "1") */
  const getDepartmentText = (): string => {
    if (!department) return "";
    if (typeof department === "number") return "";
    if (typeof department === "string") {
      const s = department.trim();
      if (/^\d+$/.test(s)) return ""; // don’t render bare numeric
      return s;
    }
    if (Array.isArray(department)) return department[0]?.Label || department[0] || "";
    if (typeof department === "object" && "Label" in department) return (department as any).Label;
    return String(department);
  };

  const categoryText = getCategoryText();
  const departmentText = getDepartmentText();


  // ✅ Department icon resolver
  const getDepartmentIcon = (): string | null => {
    const d = departmentText.toLowerCase();
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
      {categoryText && (       
        <NewsType newsType={categoryText}></NewsType>
      )}

      {/* Divider */}
      {categoryText && departmentText && <div className={styles.divider}></div>}

      {/* Department */}
      {departmentText && (
        <div className={styles.departmentChip}>
          {renderIcon(getDepartmentIcon())}
          <span className={styles.departmentText}>{departmentText}</span>
        </div>
      )}

      {/* Divider before hashtags */}
      {(categoryText || departmentText) && hashtags.length > 0 && (
        <div className={styles.divider}></div>
      )}

      {/* Hashtags */}
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
      )}
    </div>
  );
};
