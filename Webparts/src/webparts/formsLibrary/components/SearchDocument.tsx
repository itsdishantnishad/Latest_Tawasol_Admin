
import * as React from "react";
import styles from "./SearchDocument.module.scss";

const SEARCH_ICON_URL = require("../assets/SearchIcon.svg");

export interface ISearchDocumentsProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchDocuments: React.FC<ISearchDocumentsProps> = ({
  value,
  onChange,
  placeholder = "Search documents",
  className = ""
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`${styles.searchRow} ${className}`}>
      <div className={styles.searchContainer}>
        <img
          src={SEARCH_ICON_URL}
          alt="Search"
          className={styles.searchIcon}
        />

        <input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          className={styles.searchInput}
          aria-label={placeholder}
        />
      </div>
    </div>
  );
};

export default SearchDocuments;
