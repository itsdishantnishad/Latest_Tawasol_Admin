import * as React from 'react';
import styles from './PrimaryButton.module.scss';

export interface IPrimaryButtonProps {
    label?: string;
    disabled?: boolean;
    theme?: 'black' | 'gold';
    size?: 'small' | 'regular' | 'large';
    onClick?: () => void;
}

const PrimaryButton: React.FC<IPrimaryButtonProps> = ({ label = 'Button', disabled = false, theme = 'black', size = 'regular', onClick }) => {
    return (
        <div className={styles.buttonContainer}>
            <button className={`${styles.button} ${styles[theme]} ${styles[size]}`} onClick={onClick} disabled={disabled}>
                {label}
            </button>
        </div>
    );
};

export default PrimaryButton;

