import React from "react";
import styles from "./BeverageMenu.module.scss";
import ShuffledCards from "../../../widgets/ShuffledCards/ShuffledCards";
import PrimaryButton from "../../PrimaryButton/PrimaryButton";

const defaultBeverages = [
    {
        id: 1,
        header: 'Hot Beverages',
        backgroundImage: 'https://localhost:4321/dist/ImageGallery_cede2b56074355792c5b1cb3d326e499.svg',
        url: '#'
    },
    {
        id: 2,
        header: 'Cold Beverages',
        backgroundImage: 'https://localhost:4321/dist/ImageGallery_cede2b56074355792c5b1cb3d326e499.svg',
        url: '#'
    },
    {
        id: 3,
        header: 'Tea Menu',
        backgroundImage: 'https://localhost:4321/dist/ImageGallery_cede2b56074355792c5b1cb3d326e499.svg',
        url: '#'
    }
];



const BeverageMenu: React.FC = () => {

    const handleViewAll = () => {
        // View all control
    }

    return (
        <div>
            <ShuffledCards cards={defaultBeverages} />
            <div className={styles.ctaWrapper}>
                <PrimaryButton label="View All" onClick={handleViewAll} />
            </div>
        </div>
    )
}

export default BeverageMenu