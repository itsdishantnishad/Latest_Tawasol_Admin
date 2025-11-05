import React from 'react';
import styles from './ConditionalLink.module.scss';

interface ConditionalLinkProps {
    to?: string;
    className?: string;
    children: React.ReactNode;
}

const ConditionalLink: React.FC<ConditionalLinkProps> = ({ to, className, children }) => {
    if (to) {
        return <a href={to} className={styles.link}>{children}</a>
    } else {
        return <div className={className}>{children}</div>
    }
}

export default ConditionalLink;