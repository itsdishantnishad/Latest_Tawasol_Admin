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
















// import React, { useEffect, useMemo, useState } from "react";
// import styles from "./ShuffledCards.module.scss";
// import ConditionalLink from "../../Components/ConditionalLink/ConditionalLink";

// interface Card {
//   id?: string | number;
//   url?: string;
//   backgroundImage: string;
//   header: string;
//   subHeader?: string;
// }

// type Pose = { r: number; y: number; z: number };

// //  Easy to tune later (Figma-style fan row)
// const getFanPoses = (count: number): Pose[] => {
//   if (count <= 0) return [];

//   // nice presets for 1..5 (most common)
//   switch (count) {
//     case 1:
//       return [{ r: 0, y: 0, z: 1 }];
//     case 2:
//       return [
//         { r: -6, y: 10, z: 1 },
//         { r: 6, y: 10, z: 2 },
//       ];
//     case 3:
//       return [
//         { r: -10, y: 14, z: 1 },
//         { r: 0, y: 0, z: 3 },
//         { r: 10, y: 14, z: 2 },
//       ];
//     case 4:
//       return [
//         { r: -12, y: 16, z: 1 },
//         { r: -4, y: 6, z: 3 },
//         { r: 4, y: 6, z: 4 },
//         { r: 12, y: 16, z: 2 },
//       ];
//     case 5:
//       return [
//         { r: -14, y: 18, z: 1 },
//         { r: -7, y: 10, z: 3 },
//         { r: 0, y: 0, z: 5 },
//         { r: 7, y: 10, z: 4 },
//         { r: 14, y: 18, z: 2 },
//       ];
//   }

//   //  6+ cards: auto fan (still symmetric and stable)
//   const maxRot = 14;
//   const maxDrop = 18;

//   const mid = (count - 1) / 2;
//   return Array.from({ length: count }).map((_, i) => {
//     const t = i - mid; // -mid..+mid
//     const norm = mid === 0 ? 0 : t / mid; // -1..+1
//     const r = norm * maxRot;
//     const y = Math.abs(norm) * maxDrop;

//     // center cards appear above slightly
//     const z = Math.round(100 - Math.abs(t) * 10);
//     return { r, y, z };
//   });
// };

// const ShuffledCards: React.FC<{ cards: Card[] }> = ({ cards }) => {
//   const [isMweb, setIsMweb] = useState<boolean>(false);

//   useEffect(() => {
//     const checkWindowSize = (): void => setIsMweb(window.innerWidth <= 768);
//     checkWindowSize();
//     window.addEventListener("resize", checkWindowSize);
//     return () => window.removeEventListener("resize", checkWindowSize);
//   }, []);

//   const poses = useMemo(() => getFanPoses(cards.length), [cards.length]);
//   const isScrollableDesktop = !isMweb && cards.length > 5;

//   return (
//     <div className={`${styles.wrapper} ${isScrollableDesktop ? styles.scrollable : ""}`}>
//       {cards.map((card, index) => {
//         const pose = poses[index] || { r: 0, y: 0, z: index + 1 };

//         // Mobile: no rotation/offset (clean horizontal scroll)
//         const r = isMweb ? 0 : pose.r;
//         const y = isMweb ? 0 : pose.y;

//         return (
//           <ConditionalLink key={card.id || index} to={card.url}>
//             <div
//               className={styles.body}
//               style={{
//                 ["--r" as any]: `${r}deg`,
//                 ["--y" as any]: `${y}px`,
//                 zIndex: pose.z,
//                 ...(card.backgroundImage && { backgroundImage: `url(${card.backgroundImage})` }),
//               }}
//             >
//               {/* keep if needed later */}
//               {/* <h3 className={styles.header}>{card.header}</h3> */}
//               {/* {card.subHeader && <p className={styles.subHeader}>{card.subHeader}</p>} */}
//             </div>
//           </ConditionalLink>
//         );
//       })}
//     </div>
//   );
// };

// export default ShuffledCards;
