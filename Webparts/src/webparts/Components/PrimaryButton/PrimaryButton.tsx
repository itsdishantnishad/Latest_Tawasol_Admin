import * as React from 'react';
import styles from './PrimaryButton.module.scss';

export interface IPrimaryButtonProps {
    label?: string;
    disabled?: boolean;
    fullWidth?: boolean;
    theme?: 'black' | 'gold';
    size?: 'small' | 'regular' | 'large';
    onClick?: (e: React.MouseEvent) => void;
}

const PrimaryButton: React.FC<IPrimaryButtonProps> = ({ label = 'Button', disabled = false, theme = 'black', size = 'regular', fullWidth = false, onClick }) => {
    const classNames = [styles.button, styles[theme], styles[size], fullWidth ? styles.fullWidth : ""].join(" ")
    return (
        <div className={styles.buttonContainer}>
            <button className={classNames} onClick={onClick} disabled={disabled}>
                {label}
            </button>
        </div>
    );
};

export default PrimaryButton;
