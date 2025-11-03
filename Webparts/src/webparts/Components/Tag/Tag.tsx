import * as React from 'react';
import styles from './Tag.module.scss';

interface TagProps {
    label: string;
    backgroundColor?: string;
    textColor?: string;
}

const Tag: React.FC<TagProps> = ({ label, backgroundColor, textColor = '#ffffff' }) => {
    return (
        <div
            className={styles.tagContainer}
            style={{ backgroundColor, color: textColor }}
        >
            <span>{label}</span>
        </div>
    )
}

export default Tag;