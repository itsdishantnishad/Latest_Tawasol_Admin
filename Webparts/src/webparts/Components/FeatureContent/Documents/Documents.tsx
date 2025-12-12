import * as React from 'react';
import styles from './Documents.module.scss';

// import leftHeadingLine from "../images/leftArrow.svg";
// import rightHeadingLine from "../images/rightArrow.svg";

const leftHeadingLine: string = require("../images/leftArrow.svg");
const rightHeadingLine: string = require("../images/rightArrow.svg");
// const docIcon: string = require("../images/doc-icon.svg");
// const pdfIcon: string = require("../images/pdf-icon.svg");
const ProjectDevelopmentIcon = require("../assets/ProjectDevelopement.svg");
const CommercialIcon = require("../assets/Commercial.svg");
const ProjectDeliveryIcon = require("../assets/ProjectDelivery.svg");
const ProjectSecurityIcon = require("../assets/ProjectSecurity.svg");

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
  seeAllURL?: string;
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

// PURANA ICON LOGIC – BAS COMMENT KIYA HAI
// const getIcon = (iconType: IDocument['iconType']) => {
//   switch (iconType) {
//     case 'pdf':
//       return <img src={docIcon} alt="" />;
//     case 'word':
//       return <img src={pdfIcon} alt="" />;
//     default:
//       return <img src={pdfIcon} alt="" />;
//   }
// };

const projectIcons = [
  ProjectDevelopmentIcon, // 1st
  CommercialIcon,         // 2nd
  ProjectDeliveryIcon,    // 3rd
  ProjectSecurityIcon     // 4th
];

export const Documents: React.FC<IDocumentsProps> = (props) => {
  const documents = props.documents || defaultDocuments;

  return (
    <div className={styles.documentsContainer}>
      {/* Documents Grid */}
      <div className={styles.documentsGrid}>
        {
          documents.slice(0, projectIcons.length).map((doc, index) => {
            const iconSrc = projectIcons[index];

            return (
              // <a
              //   key={doc.id}
              //   href={doc.url}
              //   className={styles.documentCard}
              //   style={{
              //     transform: `rotate(${index % 2 === 0 ? '-2deg' : '2deg'})`,
              //   }}
              // >
              <div
                key={doc.id}
                className={styles.documentCard}
                style={{
                  // 🔁 same rotation pattern (for overlap look)
                  transform: `rotate(${index % 2 === 0 ? '-2deg' : '2deg'})`,
                  // 🧱 white background hide
                  background: 'transparent',
                  boxShadow: 'none',
                  padding: 0,
                  height: 'auto',
                  // 📌 stacking: first card sabse upar
                  zIndex: projectIcons.length - index,
                }}
              >
                <div className={styles.iconContainer}>
                  {/* {getIcon(doc.iconType)} */}

                  {/* SIRF IMAGE DIKHANI HAI */}
                  <img src={iconSrc} alt="" />
                </div>

                {/* BOTTOM WHITE AREA COMPLETELY COMMENTED */}
                {/* <div className={styles.documentInfo}>
                  <h3 className={styles.documentTitle}>{doc.title}</h3>
                  <p className={styles.modifiedBy}>Modified by : {doc.modifiedBy}</p>
                  <span className={styles.tag}>
                    <span className={styles.tagDot}></span>
                    {doc.tag}
                  </span>
                </div> */}
              </div>
              // </a>
            );
          })
        }
      </div>

      {/* VIEW ALL – COMMENTED */}
      <div className={styles.buttonContainer}>
        <a
          href="https://orgessence.sharepoint.com/sites/IntranetRevampTawasol/SitePages/PoliciesAndProcedures.aspx"
          className={styles.viewAllButton}
        >
          View All
        </a>
      </div>
    </div>
  );
};

export default Documents;




