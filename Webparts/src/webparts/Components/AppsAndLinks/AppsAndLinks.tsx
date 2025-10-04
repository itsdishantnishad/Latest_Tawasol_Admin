import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogType
} from '@fluentui/react/lib/Dialog';
import { useState } from 'react';
import styles from "./AppsAndLinks.module.scss";

export interface IAppsAndLinksProps {
    isHidden: boolean;
    savedApps: any[];
    hideAppsAndLinks: () => void;
}

export const AppsAndLinks = (props: IAppsAndLinksProps) => {
    const [isAddLinks, setIsAddLinks] = useState(false);
    const hideDialog = () => {
        props.hideAppsAndLinks();
    }

    const openAddLink = () => {
        setIsAddLinks(true);
    }

    const closeAddLink = () => {
        setIsAddLinks(false);
    }

    const saveAddLink = () => {
        closeAddLink();
    }

    return (
        <Dialog
            hidden={props.isHidden}
            onDismiss={hideDialog}
            dialogContentProps={{
                type: DialogType.normal,
                title: "Service Links",
                closeButtonAriaLabel: "Close",
                showCloseButton: true
            }}
            minWidth={"650px"}
        >
            <DialogContent>
                <div className={styles.appsAndLinksContainer}>
                    <div className={styles.appsContent}>
                        <div className={styles.category}>Apps</div>
                        <div className={styles.apps}>
                            {props.savedApps && props.savedApps.map((app, index) => (
                                <div className={styles.appItem} key={index}>
                                    <a href={app.URL}>
                                        {/* <div className="icon">{app.icon}</div> */}
                                        <img src={app.IconURL}></img>
                                        <div className="label">{app.Title}</div>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.addLinkContent}>
                        <div className={styles.category}>Links</div>
                        <div>
                            <div onClick={openAddLink}>
                                <img src={" https://orgessence.sharepoint.com/sites/IntranetRevampTawasol/SiteAssets/AppsIcons/add-square.png"}></img>
                                <div className="label"> Add Links</div>
                            </div>
                            <div style={{ display: isAddLinks === true ? "block" : "none" }}>
                                <div>Add Custom Links</div>
                                <div>
                                    <div className={styles.input}>
                                        <label>Add name</label>
                                        <input></input>
                                    </div>
                                    <div className={styles.input}>
                                        <label>Enter your URL</label>
                                        <input></input>
                                    </div>
                                    <div>
                                        <a onClick={closeAddLink}>Cancel</a>
                                        <a onClick={saveAddLink}>Save</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </DialogContent>


        </Dialog>
    );
};