import * as React from 'react';
import styles from './Documents.module.scss';
import ShuffledCards from '../../../widgets/ShuffledCards/ShuffledCards';
import ConditionalLink from '../../ConditionalLink/ConditionalLink';
import PrimaryButton from '../../PrimaryButton/PrimaryButton';

const ProjectDevelopmentIcon = require("../assets/ProjectDevelopement.svg");
const CommercialIcon = require("../assets/Commercial.svg");
const ProjectDeliveryIcon = require("../assets/ProjectDelivery.svg");
const ProjectSecurityIcon = require("../assets/ProjectSecurity.svg");

export interface IDocument {
  id: string;
  header: string;
  url: string;
  backgroundImage: string;
}

export interface IDocumentsProps {
  documents?: IDocument[];
  onViewAll?: () => void;
  seeAllURL?: string;
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

  return (
    <div>
      <ShuffledCards cards={documents} />

      <div className={styles.ctaWrapper}>
        <ConditionalLink to="https://orgessence.sharepoint.com/sites/IntranetRevampTawasol/SitePages/PoliciesAndProcedures.aspx">
          <PrimaryButton label="View All Physical Forms" />
        </ConditionalLink>
      </div>
    </div>
  );
};

export default Documents;




