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
    const [inputLinkTitle, setInputLinkTitle] = useState('');
    const [inputLinkURL, setInputLinkURL] = useState('');
    const [customLinks, setCustomLinks] = useState([{
        Title: "Add Links",
        URL: ""
    }]);

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
        //const customLink = { inputLinkTitle, inputLinkURL };

        setCustomLinks([
            ...customLinks,
            {
                Title: inputLinkTitle,
                URL: inputLinkURL
            }
        ]);
        closeAddLink();
    }

    const handleInputChange = (event: any) => {
        setInputLinkTitle(event.target.value);
        //setInputLinkURL(inputLinkURL);
    };

    const handleInputChange1 = (event: any) => {
        // setInputLinkTitle(inputLinkTitle);
        setInputLinkURL(event.target.value);
    };

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
                            <div className={styles.addCustomLinksContent}>
                                {customLinks.length > 0 && customLinks.map((link: any) => {
                                    return (
                                        <>
                                            <div className={styles.customLinksContent}>
                                                {link.Title === "Add Links" ?
                                                    <div className={styles.customLinks} onClick={openAddLink}>
                                                        <img src={" https://orgessence.sharepoint.com/sites/IntranetRevampTawasol/SiteAssets/AppsIcons/add-square.png"}></img>
                                                        <div className="label"> Add Links</div>
                                                    </div>
                                                    :
                                                    <div>
                                                        <div>
                                                            {link.Title}
                                                        </div>
                                                        <div>
                                                            {link.URL}
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                        </>
                                    )
                                })}
                            </div>

                            <div style={{ display: isAddLinks === true ? "block" : "none" }} className={styles.openedCustomLinkContent}>
                                <p>Add Custom Links</p>
                                <div className={styles.formGroup}>
                                    <div className={styles.input}>
                                        <label>Add name</label>
                                        <input
                                            type="text"
                                            name="newLinksTitle"
                                            id="my-text-input"
                                            value={inputLinkTitle}
                                            onChange={handleInputChange}
                                            placeholder="Please enter link"
                                            className={styles.formControl}
                                        />
                                    </div>
                                    <div className={styles.input}>
                                        <label>Enter your URL</label>
                                        <input
                                            type="text"
                                            id="my-text-input"
                                            name="newLinksURL"
                                            value={inputLinkURL}
                                            onChange={handleInputChange1}
                                            placeholder="Please enter link URL"
                                            className={styles.formControl}
                                        />
                                    </div>
                                </div>
                                <div className={styles.buttonGroup}>
                                    <a onClick={closeAddLink}>Cancel</a>
                                    <a onClick={saveAddLink}>Save</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </DialogContent>


        </Dialog>
    );
};