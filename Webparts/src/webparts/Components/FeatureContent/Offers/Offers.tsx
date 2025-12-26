import * as React from 'react';
import styles from './Offers.module.scss';

import ShuffledCards from '../../../widgets/ShuffledCards/ShuffledCards';
import ConditionalLink from '../../ConditionalLink/ConditionalLink';
import PrimaryButton from '../../PrimaryButton/PrimaryButton';

const EmployeePrivilegesIcon = require("../assets/EP.png");
const MedicalInsuranceIcon = require("../assets/MedicalInsurance.svg");
const EmployeeOffersIcon = require("../assets/EmployeeOffers.svg")

export interface IOffer {
    id: string;
    header: string;
    subHeader: string;
    url: string;
    backgroundImage: string;
}

export interface IOffersProps {
    offers?: IOffer[];
    onViewAll?: () => void;
    seeAllURL?: string;
}


const defaultOffers: IOffer[] = [
    {
        id: '1',
        header: 'Medical Insurance',
        subHeader: 'Comprehensive medical care made easy.',
        url: '#',
        backgroundImage: MedicalInsuranceIcon
    },
    {
        id: '2',
        header: 'Employee Privileges',
        subHeader: 'Exclusive perks and workplace benefits.',
        url: '#',
        backgroundImage: EmployeePrivilegesIcon
    },
    {
        id: '3',
        header: 'Employee Offers',
        subHeader: 'Special deals and discounts for employees.',
        url: '#',
        backgroundImage: EmployeeOffersIcon
    },
];

export const Offers: React.FC<IOffersProps> = (props) => {
    const offers = props.offers || defaultOffers;

    return (
        <div>
            <ShuffledCards cards={offers} />

            <div className={styles.ctaWrapper}>
                <ConditionalLink to="https://dubaiholding.sharepoint.com/sites/TawasolUAT/SitePages/Offers-&-Benefits.aspx">
                    <PrimaryButton label="View All" />
                </ConditionalLink>
            </div>
        </div>
    );
};

export default Offers;

