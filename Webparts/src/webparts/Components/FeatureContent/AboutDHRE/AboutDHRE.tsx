import * as React from 'react';
import styles from './AboutDHRE.module.scss';


export const AboutDHRE: React.FC = (props) => {
    return (
        <div className={styles.aboutDhreSection}>   
            <div className={styles.grid}>
                <div className={styles.card}>
                    <img src="https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/512x512/crash_test_dummy.png" alt="" className={styles.icon} />
                    <span className={styles.title}>Authentically Principled</span>
                    <div className={styles.description}>
                        <p>We create and manage training initiatives that enhance employee</p>
                    </div>
                </div>
                <div className={styles.card}>
                    <img src="https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/512x512/crash_test_dummy.png" alt="" className={styles.icon} />
                    <span className={styles.title}>Authentically Principled</span>
                    <div className={styles.description}>
                        <p>We create and manage training initiatives that enhance employee</p>
                    </div>
                </div>
                <div className={styles.card}>
                    <img src="https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/512x512/crash_test_dummy.png" alt="" className={styles.icon} />
                    <span className={styles.title}>Authentically Principled</span>
                    <div className={styles.description}>
                        <p>We create and manage training initiatives that enhance employee</p>
                    </div>
                </div>
                <div className={styles.card}>
                    <img src="https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/512x512/crash_test_dummy.png" alt="" className={styles.icon} />
                    <span className={styles.title}>Authentically Principled</span>
                    <div className={styles.description}>
                        <p>We create and manage training initiatives that enhance employee</p>
                    </div>
                </div>
            </div>
            {/* View All Button */}
            <div className={styles.buttonContainer}>
                <a href="https://orgessence.sharepoint.com/sites/IntranetRevampTawasol/SitePages/About-DHRE.aspx" className={styles.viewAllButton}>Know More</a>
            </div>
        </div>
    );
};

export default AboutDHRE;

