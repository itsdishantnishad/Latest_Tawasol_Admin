import * as React from 'react';
import { SearchBox } from '@fluentui/react';
import styles from './PoliciesAndProcedures.module.scss';
import Tiles from './Tiles';
import Boards from './Boards';

export interface ILandingProps { title: string; }

/** Core/Support shared item shapes */
export interface CategoryItem {
  key: string;
  title: string;
  imageSrc?: string;   // PNG/JPG fallback
  svgSrc?: string;     // path to an svg file (if ever needed)
  svgMarkup?: string;  // inline SVG markup string from DocumentConstant.ts
}
export interface DepartmentItem { key: string; title: string; iconSrc: string; }

/** SVG constants for Core tiles (RAW SVG MARKUP STRINGS) */
import {
  ProjectDevelopmentSVG,
  CommercialSVG,
  ProjectProcurementandContractSVG,
  ProjectDeliverySVG,
  ProjectSecuritySVG,
  DesignHubSVG
} from '../assets/DocumentConstant'; // keep your current location

interface ILandingState { search: string; }

/** Mock JSON – swap with CMS/TermStore later */
const CORE: CategoryItem[] = [
  { key: 'proj-dev',      title: 'Project Development',            svgMarkup: ProjectDevelopmentSVG },
  { key: 'commercial',    title: 'Commercial',                     svgMarkup: CommercialSVG },
  { key: 'proc-contract', title: 'Project Procurement & Contract', svgMarkup: ProjectProcurementandContractSVG },
  { key: 'delivery',      title: 'Project Delivery',               svgMarkup: ProjectDeliverySVG },
  { key: 'security',      title: 'Project Security',               svgMarkup: ProjectSecuritySVG },
  { key: 'design',        title: 'Design Hub',                     svgMarkup: DesignHubSVG }
];

// /** Support Function tiles (grid) */
// const DEPTS: DepartmentItem[] = [
//   { key: 'ap',    title: 'Administration & Procurement',                 iconSrc: require('../assets/dept/admin.svg') },
//   { key: 'be',    title: 'Business Excellence',                          iconSrc: require('../assets/dept/be.svg') },
//   { key: 'cc',    title: 'Corporate Culture',                            iconSrc: require('../assets/dept/culture.svg') },
//   { key: 'esg',   title: 'Environmental, Social and Governance',         iconSrc: require('../assets/dept/esg.svg') },
//   { key: 'grc',   title: 'Governance, Risk & Compliance',                iconSrc: require('../assets/dept/grc.svg') },
//   { key: 'hc',    title: 'Human Capital',                                iconSrc: require('../assets/dept/hc.svg') },
//   { key: 'hse',   title: 'Health & Safety',                              iconSrc: require('../assets/dept/hse.svg') },
//   { key: 'it',    title: 'Information Technology',                       iconSrc: require('../assets/dept/it.svg') },
//   { key: 'legal', title: 'Legal',                                        iconSrc: require('../assets/dept/legal.svg') },
//   { key: 'op',    title: 'Organisational Performance',                   iconSrc: require('../assets/dept/op.svg') },
//   { key: 'fin',   title: 'Finance',                                      iconSrc: require('../assets/dept/finance.svg') }
// ];

export default class Landing extends React.Component<ILandingProps, ILandingState> {
  public state: ILandingState = { search: '' };

  private handleSearchChange = (_?: any, v?: string): void => this.setState({ search: v || '' });

  public render(): React.ReactElement<ILandingProps> {
    const { search } = this.state;

    return (
      <div className={styles.page}>
        {/* Banner is a separate WP placed above on the page */}

        {/* Core Function */}
        <div className={styles.homeTopRow}>
          <div className={styles.sectionHeading}>Core Function</div>
          <div className={styles.searchHome}>
            <SearchBox placeholder="Search Documents" onChange={this.handleSearchChange} />
          </div>
        </div>
        <Tiles variant="core" categories={CORE} departments={[]} searchText={search} />

        {/* Support Function – as TILES GRID */}
        <div className={styles.sectionHeading}>Support Function</div>
        {/* <Tiles variant="support" categories={[]} departments={DEPTS} searchText={search} /> */}

        {/* Boards */}
        <div style={{ marginTop: 18 }} />
        <Boards />
      </div>
    );
  }
}
