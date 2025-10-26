import * as React from 'react';
import styles from './PrimaryButton.module.scss';

export interface IPrimaryButtonProps {
    label?: string;
    disabled?: boolean;
    theme?: 'black' | 'gold';
    onClick?: () => void;
}

export const PrimaryButton: React.FC<IPrimaryButtonProps> = ({ label = 'Button', disabled = false, theme = 'black', onClick }) => {
    return (
        <div className={styles.buttonContainer}>
            <button className={`${styles.button}`} onClick={onClick} disabled={disabled}>
                {label}
            </button>
        </div>
    );
};

export default PrimaryButton;

