import * as React from 'react';
import styles from './Documents.module.scss';
import ShuffledCards from '../../../widgets/ShuffledCards/ShuffledCards';
import ConditionalLink from '../../ConditionalLink/ConditionalLink';
import PrimaryButton from '../../PrimaryButton/PrimaryButton';

const ProjectDevelopmentIcon = require("../assets/Project-Development.png");
const CommercialIcon = require("../assets/Commercial.png");
const ProjectDeliveryIcon = require("../assets/Project-Delivery.png");
const ProjectSecurityIcon = require("../assets/Project-Security.png");

export interface IDocument {
  id: string;
  header: string;
  url: string;
  backgroundImage: string;
}

export interface IDocumentsProps {
  documents?: IDocument[];
  onViewAll?: (seeAllURL: string) => void;
  seeAllURL?: string;
  context: any;
}

const defaultDocuments: IDocument[] = [
  {
    id: '1',
    header: 'Project Development',
    url: '#',
    backgroundImage: ProjectDevelopmentIcon
  },
  { 
    id: '2',
    header: 'Commercial',
    url: '#',
    backgroundImage: CommercialIcon
  },
  {
    id: '3',
    header: 'Project Delivery',
    url: '#',
    backgroundImage: ProjectDeliveryIcon
  },
  {
    id: '4',
    header: 'Project Security',
    url: '#',
    backgroundImage: ProjectSecurityIcon
  },
];

export const Documents: React.FC<IDocumentsProps> = (props) => {
  const documents = props.documents || defaultDocuments;

  // ==========================
  // DYNAMIC VIEW-ALL URL 
  // ==========================
  const webUrl: string = props.context.pageContext.web.absoluteUrl.replace(/\/$/, "");
  const origin: string = new URL(webUrl).origin;

  const viewAllHref = React.useMemo(() => {
    const configured = (props.seeAllURL || "").trim();

    // Default fallback page inside same site
    const raw = configured || "SitePages/Policies-and-Procedures.aspx";

    // Absolute URL → keep path, enforce same tenant
    if (/^https?:\/\//i.test(raw)) {
      try {
        const parsed = new URL(raw);
        return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        return raw;
      }
    }

    // Root-relative (/sites/xxx/...)
    if (raw.startsWith("/")) {
      return `${origin}${raw}`;
    }

    // Site-relative (SitePages/xxx.aspx)
    return `${webUrl}/${raw}`;
  }, [props.seeAllURL, webUrl, origin]);
  // =========================================================
  
   const cards = React.useMemo(
    () => documents.map((c) => ({ ...c, url: viewAllHref })),
    [documents, viewAllHref]
  );

  return (
    <div>
      <ShuffledCards cards={cards} />

      <div className={styles.ctaWrapper}>
        <ConditionalLink to={viewAllHref}>
          <PrimaryButton fullWidth label="View All" />
        </ConditionalLink>
      </div>
    </div>
  );
};

export default Documents;
