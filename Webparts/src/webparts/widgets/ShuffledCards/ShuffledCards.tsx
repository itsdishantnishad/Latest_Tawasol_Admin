import React, { useEffect, useState } from "react";
import styles from "./ShuffledCards.module.scss";
import ConditionalLink from "../../Components/ConditionalLink/ConditionalLink";

interface Card {
    id?: string | number;
    url?: string;
    backgroundImage: string;
    header: string;
    subHeader?: string;
}

const rotations = ["-5deg", "5deg", "10deg"];

const ShuffledCards: React.FC<{ cards: Card[] }> = ({ cards }) => {
    const [isMweb, setIsMweb] = useState<boolean>(false);

    useEffect(() => {
        const checkWindowSize = (): void => {
            setIsMweb(window.innerWidth <= 768);
        };

        checkWindowSize();
        window.addEventListener("resize", checkWindowSize);

        return () => {
            window.removeEventListener("resize", checkWindowSize);
        };
    }, []);

    return (
        <div className={styles.wrapper}>
            {cards.map((card, index) => {
                const rotation = isMweb
                    ? "0deg"
                    : rotations[index % rotations.length];

                return (
                    <ConditionalLink
                        key={card.id || index}
                        to={card.url}
                    >
                        <div
                            className={styles.body}
                            style={{
                                transform: `rotate(${rotation})`,
                                ...(card.backgroundImage && {
                                    backgroundImage: `url(${card.backgroundImage})`,
                                }),
                            }}
                        >
                            {/* <h3 className={styles.header}>{card.header}</h3> */}
                            {/* {card.subHeader && <p className={styles.subHeader}>{card.subHeader}</p>} */}
                        </div>
                    </ConditionalLink>
                );
            })}
        </div>
    );
};

export default ShuffledCards;