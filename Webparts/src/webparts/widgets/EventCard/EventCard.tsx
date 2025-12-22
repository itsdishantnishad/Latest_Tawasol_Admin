import React from "react";
import styles from "./EventCard.module.scss";
import ConditionalLink from "../../Components/ConditionalLink/ConditionalLink";
import PrimaryButton from "../../Components/PrimaryButton/PrimaryButton";

const getInitials = (fullName?: string): string => {
    if (!fullName) return "";
    const parts = fullName
        .split(" ")
        .filter((p) => !!p && p.trim().length > 0);

    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();

    return (parts[0][0] + parts[1][0]).toUpperCase();
};

interface InfoItem {
    iconUrl: string;
    text: string;
}

interface Date {
    day?: string;
    month?: string;
}

interface Creator {
    iconUrl?: string;
    header?: string;
    subHeader?: string;
}

interface EventCardProps {
    redirectUrl: string;
    imageUrl: string;
    infoTag: string;
    tagShape?: 'square' | 'circle';
    date: Date;
    header: string;
    infoList: InfoItem[];
    creator: Creator;
    onCtaClick?: (e: React.MouseEvent) => void
}

const EventCard: React.FC<EventCardProps> = ({
    redirectUrl,
    imageUrl,
    infoTag,
    tagShape = 'square',
    date = {},
    header,
    infoList,
    creator = {},
    onCtaClick
}) => {
    return (
        <ConditionalLink to={redirectUrl}>
            <div className={styles.card}>
                <div className={styles.imageContainer}>
                    <img
                        src={imageUrl}
                        alt={header}
                        height={200}
                        className={styles.image}
                    />
                    {infoTag && (
                        <div className={tagShape === 'square' ? styles.squareBadge : styles.circleBadge}>
                            {infoTag}
                        </div>
                    )}
                    {date.day && date.month && (
                        <div className={styles.dateBadge}>
                            <div className={styles.day}>{date.day}</div>
                            <div className={styles.month}>{date.month}</div>
                        </div>
                    )}
                </div>
                <div className={styles.body}>
                    <div className={styles.header}>{header}</div>
                    <div className={styles.metaRow}>
                        {infoList.map((item, idx) => (
                            <div key={idx} className={styles.metaItem}>
                                <img width={18} height={18} src={item.iconUrl} alt="" />
                                <span className={styles.metaText}>{item.text}</span>
                            </div>
                        ))}
                    </div>
                    {creator.header && (
                        <div className={styles.instructorRow}>
                            <div className={styles.instructorAvatar}>
                                {getInitials(creator.header)}
                            </div>
                            <div className={styles.instructorInfo}>
                                <div className={styles.instructorName}>
                                    {creator.header}
                                </div>
                                {creator.subHeader && (
                                    <div className={styles.instructorTitle}>
                                        {creator.subHeader}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {onCtaClick && <div className={styles.mTop16}>
                        <PrimaryButton
                            fullWidth
                            label="Request for Approval"
                            onClick={onCtaClick}
                        />
                    </div>}
                </div>
            </div>
        </ConditionalLink>
    )
}

export default EventCard