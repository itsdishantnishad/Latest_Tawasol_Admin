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
                <div className={styles.identityCard}>
                    <img className={styles.avatar} src={photoUrl} alt="Profile photo" />
                    <div className={styles.metaCol}>
                        {this.renderName()}
                        <Text className={styles.department} block>{department}</Text>
                    </div>
                </div>
                <div className={styles.flexCol}>
                    <div className={styles.actions} role="group" aria-label="Header actions">
                        <button
                            className={styles.iconBtn}
                            title="Download"
                            aria-label="Download"
                            onClick={this.handleNavigate}
                            type="button"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M14.9922 17.5H16.5022C19.5222 17.5 22.0022 15.03 22.0022 12C22.0022 8.98 19.5322 6.5 16.5022 6.5H14.9922" stroke="black" stroke-width="1.50074" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M9.00391 6.5H7.50391C4.47391 6.5 2.00391 8.97 2.00391 12C2.00391 15.02 4.47391 17.5 7.50391 17.5H9.00391" stroke="black" stroke-width="1.50074" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M8.00391 12H16.0039" stroke="black" stroke-width="1.50074" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button 
                            className={`${styles.iconBtn} ${styles.kebabBtn}`} 
                            title="More options" 
                            aria-label="More options" 
                            onClick={this.handleNavigate} 
                            type="button"
                        >   
                            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="12" cy="5" r="2" fill="currentColor" />
                                <circle cx="12" cy="12" r="2" fill="currentColor" />
                                <circle cx="12" cy="19" r="2" fill="currentColor" />
                            </svg>
                        </button>
                    </div>
                    <div className={styles.statsRow} aria-label="Profile stats">
                        {stats.slice(0, 4).map(this.renderStat)}
                    </div>
                </div>
            </div>
        );
    }
}
