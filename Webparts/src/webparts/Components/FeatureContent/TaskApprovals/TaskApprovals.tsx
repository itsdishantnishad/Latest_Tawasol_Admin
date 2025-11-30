import React, { useState } from "react";
import styles from "./TaskApprovals.module.scss";
import CategoryView, { ICategoryItem } from "../CategoryView/CategoryView";
import TableView from "./widgets/TableView/TableView";

const TaskApprovals: React.FC = () => {
    const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);

    // Sample category data - replace with actual data from your API/service
    const categories: ICategoryItem[] = [
        {
            id: "tahweel",
            name: "Tahweel",
            icon: "http://localhost:3845/assets/5ef86ae7106ed269747770b78bd3763bbcc0c8a7.png",
            count: 8
        },
        {
            id: "salesforce",
            name: "Salesforce",
            icon: "http://localhost:3845/assets/a04068baa3bf4c37b858d84c23f7a58a5d8bfd4a.png",
            count: 22
        },
        {
            id: "servicenow",
            name: "ServiceNow",
            icon: "http://localhost:3845/assets/cbebbd7b6244cd3ad75080c7963562bed3a21fd6.png",
            count: 12
        }
    ];

    const handleCategoryClick = (category: ICategoryItem, index: number): void => {
        setActiveCategoryIndex(index);
        // Add your logic here to handle category selection
        console.log("Selected category:", category);
    };



    return (
        <div className={styles.taskApprovalsContainer}>
            <CategoryView
                categories={categories}
                activeIndex={activeCategoryIndex}
                onCategoryClick={handleCategoryClick}
            />
            <TableView />
        </div>
    );
};

export default TaskApprovals;