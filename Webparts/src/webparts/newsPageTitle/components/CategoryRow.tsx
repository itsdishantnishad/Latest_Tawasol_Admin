import * as React from 'react';
import styles from './NewsPageTitle.module.scss';
import NewsType from '../../Components/News/NewsType';

// ─── Department icons ─────────────────────────────────────────────────────────
const ICONS: Record<string, string> = {
  grc: require('../../assets/GovernanceRiskandCompliance.svg'),
  hse: require('../../assets/HealthSafetyEnvironment.svg'),
  hc:  require('../../assets/HumanCapital.svg'),
  pa:  require('../../assets/Procurement.svg'),
};

export interface IHeaderChipsProps {
  category?: any;
  department?: any;
  hashtags?: string[] | string | null | undefined;
  onTagClick?: (tag: string) => void;
}

export default class CategoryRow extends React.Component<IHeaderChipsProps> {

  private getCategoryText = (): string => {
    const { category } = this.props;
    if (!category) return '';
    if (typeof category === 'string') return category;
    if (Array.isArray(category)) return (category[0] && (category[0].Label || category[0])) || '';
    if (typeof category === 'object' && 'Label' in (category as any)) return (category as any).Label;
    return String(category);
  };

  private getDepartmentText = (): string => {
    const { department } = this.props;
    if (!department) return '';
    if (typeof department === 'number') return '';
    if (typeof department === 'string') {
      const s = department.trim();
      if (/^\d+$/.test(s)) return '';
      return s;
    }
    if (Array.isArray(department)) return (department[0] && (department[0].Label || department[0])) || '';
    if (typeof department === 'object' && 'Label' in (department as any)) return (department as any).Label;
    return String(department);
  };

  // Pick SVG for department (supports “GRC/HSE/HC/Procurement & Admin” variants)
  private pickDepartmentIcon = (text: string): string | null => {
    const t = (text || '').toLowerCase();
    if (!t) return null;
    if (t.includes('governance') || t.includes('grc')) return ICONS.grc;
    if (t.includes('health') || t.includes('hse')) return ICONS.hse;
    if (t.includes('human capital') || t.includes('hc')) return ICONS.hc;
    if (t.includes('procurement') || t.includes('admin')) return ICONS.pa;
    return null; // default: no icon
  };

  // Normalize hashtags coming as null | string | string[] from search
  private asArray = (v: unknown): string[] => {
    if (Array.isArray(v)) return v.filter(Boolean).map(String);
    if (typeof v === 'string') {
      // SharePoint often returns semicolon- or comma-delimited values
      return v.split(/[;,]/).map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  public render(): React.ReactElement<IHeaderChipsProps> {
    const categoryText = this.getCategoryText();
    const departmentText = this.getDepartmentText();
    const deptIcon = this.pickDepartmentIcon(departmentText);
    const c = (categoryText || '').toLowerCase();
    const showDepartment = c.includes('announce') || c.includes('dhre'); // hide for Around the world
    const tags = this.asArray(this.props.hashtags);

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

        {(categoryText && (showDepartment ? !!departmentText : true)) && tags.length > 0 && (
          <div className={styles.divider}></div>
        )}

        {tags.length > 0 && (
          <div className={styles.hashtagContainer}>
            {tags.map((tag, i) => (
              <span
                key={i}
                className={styles.hashtagLink}
                onClick={() => this.props.onTagClick && this.props.onTagClick(tag)}
              >#
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }
}
