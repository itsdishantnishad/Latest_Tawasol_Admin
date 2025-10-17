import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import { getId } from '@fluentui/react/lib/Utilities';
import styles from './IconsList.module.scss';
const radioIdBase = getId('radio');
export const IconsList = ({ onChange, icons, selectedIconName }) => {
    const renderIcon = (iconName) => {
        const radioId = `${radioIdBase}-${iconName}`;
        return React.createElement("li", { className: styles.iconItem },
            React.createElement("input", { type: "radio", name: radioIdBase, id: radioId, className: styles.iconRadio, "data-automation-id": `icon-picker-${iconName}`, checked: iconName === selectedIconName, onChange: () => onChange(iconName) }),
            React.createElement("label", { className: styles.iconLabel, htmlFor: radioId, title: iconName },
                React.createElement(Icon, { iconName: iconName, className: styles.iconGlyph }),
                React.createElement("span", { className: styles.iconName }, iconName)));
    };
    return React.createElement("ul", { className: styles.iconList }, icons.map(renderIcon));
};
//# sourceMappingURL=IconsList.js.map