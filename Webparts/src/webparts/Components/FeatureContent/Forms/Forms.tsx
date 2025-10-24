import * as React from 'react';
import styles from './Forms.module.scss';
// import sheetIcon from "../images/sheet-icon.svg";
// import leftHeadingLine from "../images/leftArrow.svg";
// import rightHeadingLine from "../images/rightArrow.svg";
const sheetIcon: string = require("../images/sheet-icon.svg");
const leftHeadingLine: string = require("../images/leftArrow.svg");
const rightHeadingLine: string = require("../images/rightArrow.svg");
export interface IForm {
    id: string;
    title: string;
    subtitle: string;
    icon: any;
    url: string;
}

export interface IFormsProps {
    forms?: IForm[];
    onViewAll?: () => void;
    seeAllURL?: string;
}

const defaultForms: IForm[] = [
    {
        id: '1',
        title: 'Legacy & Claims',
        subtitle: 'DHRE ASTF Interactive Form',
        icon: <img src={sheetIcon} alt="" />,
        url: '#'
    },
    {
        id: '2',
        title: 'Business Excellence',
        subtitle: 'Problem Solving - Interactive Form',
        icon: <img src={sheetIcon} alt="" />,
        url: '#'
    },
    {
        id: '3',
        title: 'Business Excellence',
        subtitle: 'Quality Management System - Interactive Form',
        icon: <img src={sheetIcon} alt="" />,
        url: '#'
    },
];

export const Forms: React.FC<IFormsProps> = (props) => {
    const forms = props.forms || defaultForms;

    return (
        <div className={styles.formsContainer}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.decorativeLineLeft}>
                        {/* <svg width="142" height="19" viewBox="0 0 142 19" fill="none">
                            <path d="M1 9.5L141 9.5" stroke="#DA291C" strokeWidth="2" />
                            <circle cx="9" cy="9.5" r="8" stroke="#DA291C" strokeWidth="2" />
                        </svg> */}
                        <img src={rightHeadingLine} alt="right headline line" />
                    </div>
                    <h2 className={styles.title}>Interactive forms</h2>
                    <div className={styles.decorativeLineRight}>
                        {/* <svg width="142" height="19" viewBox="0 0 142 19" fill="none">
                            <path d="M1 9.5L141 9.5" stroke="#DA291C" strokeWidth="2" />
                            <circle cx="133" cy="9.5" r="8" stroke="#DA291C" strokeWidth="2" />
                        </svg> */}
                        <img src={leftHeadingLine} alt="left headline line" />
                    </div>
                </div>
                <p className={styles.subtitle}>
                    All your essential forms – legacy, claims, business excellence, and more
                </p>
            </div>

            {/* Forms Grid */}
            <div className={styles.formsGrid}>
                {forms.map((form, index) => (
                    <a
                        key={form.id}
                        href={form.url}
                        className={styles.formCard}
                        style={{
                            transform: `rotate(${index % 2 === 0 ? '-3deg' : index % 3 === 0 ? '3deg' : '-2deg'})`,
                        }}
                    >
                        <div className={styles.iconContainer}>
                            <div>
                                <span className={styles.formIcon}>{form.icon}</span>
                            </div>
                        </div>
                        <div className={styles.formInfo}>
                            <h3 className={styles.formTitle}>{form.title}</h3>
                            <p className={styles.formSubtitle}>{form.subtitle}</p>
                        </div>
                    </a>
                ))}
            </div>

            {/* View All Button */}
            <div className={styles.buttonContainer}>
                {/* <button className={styles.viewAllButton} onClick={props.onViewAll}>
                    View All
                </button> */}
                <a href={props.seeAllURL} className={styles.viewAllButton}>
                     View All Physical Forms
                </a>
            </div>
        </div>
    );
};

export default Forms;

