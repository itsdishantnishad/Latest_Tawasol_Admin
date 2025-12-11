import * as React from 'react';
import styles from './Documents.module.scss';

// import leftHeadingLine from "../images/leftArrow.svg";
// import rightHeadingLine from "../images/rightArrow.svg";

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
  seeAllURL?: string;
  // If you want strict typing, you can use WebPartContext instead of any:
  // context: WebPartContext;
  context: any;
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

  // --- DYNAMIC VIEW-ALL URL WITH DEFAULT ---
  const webUrl: string = props.context.pageContext.web.absoluteUrl.replace(/\/$/, "");
  const origin: string = new URL(webUrl).origin;

  const viewAllHref = React.useMemo(() => {
    const configured = (props.seeAllURL || "").trim();

    // If nothing configured, default to a page in the current site:
    //   /sites/ThisSite/SitePages/Policies-and-Procedures.aspx
    const raw = configured || "SitePages/Policies-and-Procedures.aspx";

    // Absolute URL from anywhere -> keep its path but move to current tenant
    if (/^https?:\/\//i.test(raw)) {
      try {
        const parsed = new URL(raw);
        return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        return raw;
      }
    }

    // Root-relative (/sites/YourSite/SitePages/Page.aspx)
    if (raw.startsWith("/")) {
      return `${origin}${raw}`;
    }

    // Web-relative (SitePages/Page.aspx)
    return `${webUrl}/${raw}`;
  }, [props.seeAllURL, webUrl, origin]);
  // --- END ---

  const getIcon = (iconType: IDocument['iconType']) => {
    switch (iconType) {
      case 'pdf':
        return <img src={docIcon} alt="" />;
      case 'word':
        return <img src={pdfIcon} alt="" />;
      default:
        return <img src={pdfIcon} alt="" />;
    }
  };

  return (
    <div className={styles.documentsContainer}>
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
        <a href={viewAllHref} className={styles.viewAllButton}>
          View All
        </a>
        {/* Or if you want to use onViewAll instead of <a>:
        <button className={styles.viewAllButton} onClick={props.onViewAll}>
          View All
        </button>
        */}
      </div>
    </div>
  );
};

export default Documents;
