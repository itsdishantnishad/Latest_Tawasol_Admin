import React, { useEffect, useMemo, useState } from "react";
import styles from "./ShuffledCards.module.scss";
import ConditionalLink from "../../Components/ConditionalLink/ConditionalLink";

interface Card {
    id?: string | number;
    url?: string;
    backgroundImage: string;
    header: string;
    subHeader?: string;
}

type Pose = { r: number; y: number; z: number };
const getFanPoses = (count: number): Pose[] => {
  if (count <= 0) return [];
  switch (count) {
    case 1:
      return [{ r: -5, y: 0, z: 0 }];
    case 2:
      return [
        { r: -5, y: 0, z: 0 },
        { r: 5, y: 0, z: 0 },
      ];
    case 3:
      return [
        { r: -5, y: 0, z: 0 },
        { r: 5, y: 0, z: 0 },
        { r: -5, y: 0, z: 0 },
      ];
    case 4:
      return [
        { r: -5, y: 0, z: 0 },
        { r: 5, y: 0, z: 0 },
        { r: -5, y: 0, z: 0 },
        { r: 5, y: 0, z: 0 },
      ];
    case 5:
      return [
        { r: -5, y: 0, z: 0 },
        { r: 5, y: 0, z: 0 },
        { r: -5, y: 0, z: 0 },
        { r: 5, y: 0, z: 0 },
        { r: -5, y: 0, z: 0 },
      ];
  }

  //  6+ cards: auto fan (still symmetric and stable)
  const maxRot = 14;
  const maxDrop = 18;

  const mid = (count - 1) / 2;
  return Array.from({ length: count }).map((_, i) => {
    const t = i - mid; // -mid..+mid
    const norm = mid === 0 ? 0 : t / mid; // -1..+1
    const r = norm * maxRot;
    const y = Math.abs(norm) * maxDrop;

    // center cards appear above slightly
    const z = Math.round(100 - Math.abs(t) * 10);
    return { r, y, z };
  });
};

const ShuffledCards: React.FC<{ cards: Card[] }> = ({ cards }) => {
    const [isMweb, setIsMweb] = useState<boolean>(false);

    useEffect(() => {
        const checkWindowSize = (): void => setIsMweb(window.innerWidth <= 768);
        checkWindowSize();
        window.addEventListener("resize", checkWindowSize);
        return () => window.removeEventListener("resize", checkWindowSize);
    }, []);

    const poses = useMemo(() => getFanPoses(cards.length), [cards.length]);
    const isScrollableDesktop = !isMweb && cards.length > 5;

      return (
        <div className={`${styles.wrapper} ${isScrollableDesktop ? styles.scrollable : ""}`}>
            {cards.map((card, index) => {
                const pose = poses[index] || { r: 0, y: 0 };

                // highest zIndex first, descending
                const zIndex = cards.length - index;

                const r = isMweb ? 0 : pose.r;
                const y = isMweb ? 0 : pose.y;

                return (
                    <ConditionalLink key={card.id || index} to={card.url}>
                    <div
                        className={styles.body}
                        style={{
                        ["--r" as any]: `${r}deg`,
                        ["--y" as any]: `${y}px`,
                        zIndex,
                        ...(card.backgroundImage && {
                            backgroundImage: `url(${card.backgroundImage})`,
                        }),
                        }}
                    />
                    </ConditionalLink>
                );
            })}
        </div>
    );
};

export default ShuffledCards;
