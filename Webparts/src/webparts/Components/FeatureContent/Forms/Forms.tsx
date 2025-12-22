import * as React from 'react';
import styles from './Forms.module.scss';
import ShuffledCards from '../../../widgets/ShuffledCards/ShuffledCards';
import ConditionalLink from '../../ConditionalLink/ConditionalLink';
import PrimaryButton from '../../PrimaryButton/PrimaryButton';

export interface IForm {
    id: string;
    header: string;
    url: string;
    backgroundImage: string;
}

export interface IFormsProps {
    forms?: IForm[];
    onViewAll?: () => void;
    seeAllURL?: string;
}

const defaultForms: IForm[] = [
    {
        id: '1',
        header: 'Human Capital',
        url: '#',
        backgroundImage: ""
    },
    {
        id: '2',
        header: 'Contracts & Procurement Hub',
        url: '#',
        backgroundImage: ""
    },
    {
        id: '3',
        header: 'Business Excellence',
        url: '#',
        backgroundImage: ""
    },
];

export const Forms: React.FC<IFormsProps> = (props) => {
    const forms = props.forms || defaultForms;

    return (
        <div>
            <ShuffledCards cards={forms} />

            <div className={styles.ctaWrapper}>
                <ConditionalLink to={props.seeAllURL}>
                    <PrimaryButton label="View All Physical Forms" />
                </ConditionalLink>
            </div>
        </div>
    );
};

export default Forms;

