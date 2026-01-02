import * as React from "react";
import styles from "./CategoryView.module.scss";

export interface ICategoryItem {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface ICategoryViewProps {
  categories: ICategoryItem[];
  activeIndex?: number;
  onCategoryClick?: (category: ICategoryItem, index: number) => void;
}

export const CategoryView: React.FC<ICategoryViewProps> = ({
  categories,
  activeIndex = 0,
  onCategoryClick,
}) => {
  const handleClick = (category: ICategoryItem, index: number) => {
    if (onCategoryClick) {
      onCategoryClick(category, index);
    }
  };

  return (
    <div className={styles.categoryContainer}>
      {categories.map((category, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={category.id}
            className={`${styles.categoryItem} ${isActive ? styles.active : ""}`}
            onClick={() => handleClick(category, index)}
            type="button"
          >
            <div className={styles.icon}>
              <img
                src={category.icon}
                alt={category.name}
                width={52}
                height={52}
              />
            </div>
            <span className={styles.label}>{category.name}</span>
            <span className={styles.count}>{category.count.toString().padStart(2, '0')}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryView;

