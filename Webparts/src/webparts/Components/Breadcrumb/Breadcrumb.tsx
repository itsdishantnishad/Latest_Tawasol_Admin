import * as React from 'react';
import styles from './Breadcrumb.module.scss';

const LeftArrowIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 15L7.5 10L12.5 5" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const RightArrowIcon: React.FC = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 12L10 8L6 4" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

interface BreadcrumbProps {
    onBack: () => void;
    links: { text: string; url?: string }[];
}

const Breadcrumb = ({ onBack, links }: BreadcrumbProps) => {

    return (
        <div className={styles.breadcrumb}>
            <button type="button" className={styles.backBtn} onClick={() => onBack?.()}>
                <LeftArrowIcon />
                <span>Back</span>
            </button>
            <div className={styles.divider} />
            <div className={styles.linksContainer}>
                {links.map((link, index) => (
                    <React.Fragment key={index}>
                        {link.url ? (
                            <a href={link.url} className={styles.taskText}>{link.text}</a>
                        ) : (
                            <span className={styles.taskText}>{link.text}</span>
                        )}
                        {link.url && <RightArrowIcon />}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
};

export default Breadcrumb;