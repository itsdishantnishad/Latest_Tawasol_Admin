import * as React from 'react';
import { Checkbox } from '@fluentui/react/lib/Checkbox';
import styles from './PropertyFieldSitePickerListItem.module.scss';
import { toRelativeUrl } from '../../../helpers/GeneralHelper';
export const PropertyFieldSitePickerListItem = (props) => {
    const { site, checked } = props;
    return (React.createElement("li", { className: styles.siteListItem, key: site.url },
        React.createElement(Checkbox, { className: styles.checkbox, checked: checked, onChange: (ev, nowChecked) => props.handleCheckboxChange(site, nowChecked) }),
        React.createElement("div", { className: styles.content },
            React.createElement("span", { className: styles.title, title: site.title }, site.title),
            React.createElement("span", { className: styles.url, title: site.url }, toRelativeUrl(site.url)))));
};
//# sourceMappingURL=PropertyFieldSitePickerListItem.js.map