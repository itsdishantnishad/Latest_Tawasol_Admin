import * as React from "react";
import { Text } from "@fluentui/react";
import styles from "./ProfileHeader.module.scss";

type StatItem = { label: string; value: number };

export interface IProfileHeaderProps {
    photoUrl?: string;
    fullName: string;
    department: string;
    stats: StatItem[];                 
    actionNavigateUrl?: string;     
}

export default class ProfileHeader extends React.Component<IProfileHeaderProps> {
    public static defaultProps: Partial<IProfileHeaderProps> = {
        photoUrl:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&h=300&fit=crop&crop=faces",
        fullName: "Muhammed Ali",
        department: "UI/UX Designer • Information Technology",
        stats: [
            { label: "Posts", value: 3 },
            { label: "Followers", value: 21 },
            { label: "Following", value: 20 },
            { label: "Praises", value: 5 },
        ],
        actionNavigateUrl: "/sites/Tawasol",
    };

    private renderName() {
        const name = (this.props.fullName || "").trim();
        const [first, ...rest] = name.split(" ");
        return (
            <div className={styles.nameRow}>
                <Text className={styles.firstName} block>{first}</Text>
                {rest.length > 0 && <Text className={styles.lastName} block>{" "}{rest.join(" ")}</Text>}
            </div>
        );
    }

    private renderStat = (s: StatItem, idx: number) => (
        <div className={styles.statBox} key={idx}>
            <div className={styles.statNumber}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
        </div>
    );

    private handleNavigate = (): void => {
        const url = this.props.actionNavigateUrl || "/sites/Tawasol";
        window.location.href = url; 
    };

    public render(): React.ReactElement<IProfileHeaderProps> {
        const { photoUrl, department, stats } = this.props;

        return (
            <div className={styles.headerWrap}>
                <div className={styles.cornerLeft} aria-hidden="true" />
                <div className={styles.cornerRight} aria-hidden="true" />

                <div className={styles.actions} role="group" aria-label="Header actions">
                    <button
                        className={styles.iconBtn}
                        title="Download"
                        aria-label="Download"
                        onClick={this.handleNavigate}
                        type="button"
                    >
                        
                        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                        
                            <path d="M10 6a6 6 0 0 0 0 12"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                           
                            <path d="M14 6a6 6 0 0 1 0 12"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            
                            <path d="M10.5 12h3"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                    <button  className={`${styles.iconBtn} ${styles.kebabBtn}`} title="More options" aria-label="More options" onClick={this.handleNavigate} type="button"
                    >
                        
                        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="12" cy="5" r="2" fill="currentColor" />
                            <circle cx="12" cy="12" r="2" fill="currentColor" />
                            <circle cx="12" cy="19" r="2" fill="currentColor" />
                        </svg>
                    </button>
                </div>
                <div className={styles.identityCard}>
                    <img className={styles.avatar} src={photoUrl} alt="Profile photo" />
                    <div className={styles.metaCol}>
                        {this.renderName()}
                        <Text className={styles.department} block>{department}</Text>
                    </div>
                </div>

              
                <div className={styles.statsRow} aria-label="Profile stats">
                    {stats.slice(0, 4).map(this.renderStat)}
                </div>
            </div>
        );
    }
}
