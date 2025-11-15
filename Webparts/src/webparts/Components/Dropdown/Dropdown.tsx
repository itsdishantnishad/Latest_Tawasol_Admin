import React from "react";
import { Dropdown as FluentUIDropdown, IDropdownProps } from "@fluentui/react";
import styles from "./Dropdown.module.scss";

const Dropdown = (props: IDropdownProps): JSX.Element => {
    return (
        <FluentUIDropdown
            {...props}
            className={styles.dropdown}
            onRenderCaretDown={() => (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M8 10L12 14L16 10" stroke="#6C6C6C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            )}
        />
    )
}

export default Dropdown;