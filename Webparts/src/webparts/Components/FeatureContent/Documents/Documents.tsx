import * as React from 'react';
import styles from './Documents.module.scss';
// import leftHeadingLine from "../images/leftArrow.svg";
// import rightHeadingLine from "../images/rightArrow.svg";
// import docIcon from '../images/doc-icon.svg';
// import pdfIcon from '../images/pdf-icon.svg';
const leftHeadingLine: string = require("../images/leftArrow.svg");
const rightHeadingLine: string = require("../images/rightArrow.svg");
const docIcon: string = require("../images/doc-icon.svg");
const pdfIcon: string = require("../images/pdf-icon.svg");

export interface IDocument {
    id: string;
    title: string;
    modifiedBy: string;
    tag: string;
    iconType: 'pdf' | 'word' | 'excel' | 'other';
    url: string;
}

export interface IDocumentsProps {
    documents?: IDocument[];
    onViewAll?: () => void;
}

const defaultDocuments: IDocument[] = [
    {
        id: '1',
        title: 'DHRE Human Capital Policy Manual.pdf',
        modifiedBy: 'Hinaa Sheikh',
        tag: 'Awareness Sessions',
        iconType: 'pdf',
        url: '#'
    },
    {
        id: '2',
        title: 'DHRE Human Capital Policy Manual.pdf',
        modifiedBy: 'Hinaa Sheikh',
        tag: 'Awareness Sessions',
        iconType: 'word',
        url: '#'
    },
    {
        id: '3',
        title: 'DHRE Human Capital Policy Manual.pdf',
        modifiedBy: 'Hinaa Sheikh',
        tag: 'Awareness Sessions',
        iconType: 'pdf',
        url: '#'
    },
    {
        id: '4',
        title: 'DHRE Human Capital Policy Manual.pdf',
        modifiedBy: 'Hinaa Sheikh',
        tag: 'HC',
        iconType: 'word',
        url: '#'
    },
    {
        id: '5',
        title: 'DHRE Human Capital Policy Manual.pdf',
        modifiedBy: 'Hinaa Sheikh',
        tag: 'Awareness Sessions',
        iconType: 'other',
        url: '#'
    },
];

export const Documents: React.FC<IDocumentsProps> = (props) => {
    const documents = props.documents || defaultDocuments;

    const getIcon = (iconType: IDocument['iconType']) => {
        switch (iconType) {
            case 'pdf':
                return (
                    // <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    //     <rect width="48" height="48" rx="4" fill="#E53E3E" />
                    //     <path d="M24 16V32M16 24H32" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    // </svg>
                    <img src={docIcon} alt="" />
                );
            case 'word':
                return (
                    // <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    //     <rect width="48" height="48" rx="4" fill="#2B6CB0" />
                    //     <path d="M24 16V32M16 24H32" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    // </svg>
                    <img src={pdfIcon} alt="" />
                );
            default:
                return (
                    // <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    //     <rect width="48" height="48" rx="4" fill="#D53F8C" />
                    //     <path d="M24 16V32M16 24H32" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    // </svg>
                    <img src={pdfIcon} alt="" />
                );
        }
    };

    return (
        <div className={styles.documentsContainer}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.decorativeLineLeft}>
                        {/* <svg width="142" height="19" viewBox="0 0 142 19" fill="none">
                            <path d="M1 9.5L141 9.5" stroke="#DA291C" strokeWidth="2" />
                            <circle cx="9" cy="9.5" r="8" stroke="#DA291C" strokeWidth="2" />
                        </svg> */}
                        <img src={rightHeadingLine} alt="rightArrow" />
                    </div>
                    <h2 className={styles.title}>Policy and Procedure</h2>
                    <div className={styles.decorativeLineRight}>
                        {/* <svg width="142" height="19" viewBox="0 0 142 19" fill="none">
                            <path d="M1 9.5L141 9.5" stroke="#DA291C" strokeWidth="2" />
                            <circle cx="133" cy="9.5" r="8" stroke="#DA291C" strokeWidth="2" />
                        </svg> */}
                        <img src={leftHeadingLine} alt="leftArrow" />
                    </div>
                </div>
                <p className={styles.subtitle}>
                    Everything you need, neatly organized
                </p>
            </div>

            {/* Documents Grid */}
            <div className={styles.documentsGrid}>
                {documents.map((doc, index) => (
                    <a
                        key={doc.id}
                        href={doc.url}
                        className={styles.documentCard}
                        style={{
                            transform: `rotate(${index % 2 === 0 ? '-2deg' : '2deg'})`,
                        }}
                    >
                        <div className={styles.iconContainer}>
                            {getIcon(doc.iconType)}
                        </div>
                        <div className={styles.documentInfo}>
                            <h3 className={styles.documentTitle}>{doc.title}</h3>
                            <p className={styles.modifiedBy}>Modified by : {doc.modifiedBy}</p>
                            <span className={styles.tag}>
                                <span className={styles.tagDot}></span>
                                {doc.tag}
                            </span>
                        </div>
                    </a>
                ))}
            </div>

            {/* View All Button */}
            <div className={styles.buttonContainer}>
                <button className={styles.viewAllButton} onClick={props.onViewAll}>
                    View All
                </button>
            </div>
        </div>
    );
};

export default Documents;

