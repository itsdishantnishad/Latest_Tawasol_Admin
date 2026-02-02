import React from "react";
import styles from "./ConditionalLink.module.scss";

interface ConditionalLinkProps {
  to?: string;
  className?: string;
  children: React.ReactNode;
}

const ConditionalLink: React.FC<ConditionalLinkProps> = ({ to, className, children }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!to) return;

    // Allow new-tab / open-in-new-window / middle click etc.
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }

    // Force HARD navigation (avoid SharePoint soft navigation causing stuck shimmer)
    e.preventDefault();
    window.location.assign(to);
  };

  if (to) {
    return (
      <a
        href={to}
        className={`${styles.link} ${className || ""}`.trim()}
        data-interception="off"
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return <div className={className}>{children}</div>;
};

export default ConditionalLink;
