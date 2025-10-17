import * as React from 'react';
import styles from './NewsPageTitle.module.scss';
import NewsType from '../../Components/News/NewsType';

// ─── Department icons ─────────────────────────────────────────────────────────
const ICONS = {
  grc: require('../../assets/GovernanceRiskandCompliance.svg'),
  hse: require('../../assets/HealthSafetyEnvironment.svg'),
  hc:  require('../../assets/HumanCapital.svg'),
  pa:  require('../../assets/Procurement.svg'),
};

interface IHeaderChipsProps {
  category?: any;
  department?: any;
  hashtags?: string[];
  onTagClick?: (tag: string) => void;
}

export const CategoryRow: React.FC<IHeaderChipsProps> = ({
  category = '',
  department = '',
  hashtags = [],
  onTagClick
}) => {

  const getCategoryText = (): string => {
    if (!category) return '';
    if (typeof category === 'string') return category;
    if (Array.isArray(category)) return category[0]?.Label || category[0] || '';
    if (typeof category === 'object' && 'Label' in category) return (category as any).Label;
    return String(category);
  };

  const getDepartmentText = (): string => {
    if (!department) return '';
    if (typeof department === 'number') return '';
    if (typeof department === 'string') {
      const s = department.trim();
      if (/^\d+$/.test(s)) return '';
      return s;
    }
    if (Array.isArray(department)) return department[0]?.Label || department[0] || '';
    if (typeof department === 'object' && 'Label' in department) return (department as any).Label;
    return String(department);
  };

  // Pick SVG for department (supports “GRC/HSE/HC/Procurement & Admin” variants)
  const pickDepartmentIcon = (text: string): string | null => {
    const t = (text || '').toLowerCase();

    if (!t) return null;
    if (t.includes('governance') || t.includes('grc')) return ICONS.grc;
    if (t.includes('health') || t.includes('hse')) return ICONS.hse;
    if (t.includes('human capital') || t.includes('hc')) return ICONS.hc;
    if (t.includes('procurement') || t.includes('admin')) return ICONS.pa;

    return null; // default: no icon
  };

  const categoryText = getCategoryText();
  const departmentText = getDepartmentText();
  const deptIcon = pickDepartmentIcon(departmentText);

  // ── NEW: show department ONLY for Announcement or DHRE Stories (hide for Around the world)
  const c = (categoryText || '').toLowerCase();
  const showDepartment =
    c.includes('announce') || c.includes('dhre'); // around-the-world intentionally excluded

  return (
    <div className={styles.headerChips}>
      {categoryText && <NewsType newsType={categoryText} />}

      {categoryText && showDepartment && departmentText && <div className={styles.divider}></div>}

      {showDepartment && departmentText && (
        <div className={styles.departmentChip}>
          {deptIcon && <img className={styles.deptIcon} src={deptIcon} alt="" loading="lazy" />}
          <span className={styles.departmentText}>{departmentText}</span>
        </div>
      )}

      {(categoryText && (showDepartment ? !!departmentText : true)) && hashtags.length > 0 && (
        <div className={styles.divider}></div>
      )}

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
