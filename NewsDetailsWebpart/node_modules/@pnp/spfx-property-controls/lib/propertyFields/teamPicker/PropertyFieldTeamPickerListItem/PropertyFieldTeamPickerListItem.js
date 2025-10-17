import * as React from 'react';
import { Checkbox } from '@fluentui/react/lib/Checkbox';
import styles from './PropertyFieldTeamPickerListItem.module.scss';
export const PropertyFieldTeamPickerListItem = (props) => {
    const { team, checked } = props;
    return (React.createElement("li", { className: styles.teamListItem, key: team.id },
        React.createElement(Checkbox, { className: styles.checkbox, checked: checked, onChange: (ev, nowChecked) => props.handleCheckboxChange(team, nowChecked) }),
        React.createElement("span", { className: styles.title, title: team.title }, team.title)));
};
//# sourceMappingURL=PropertyFieldTeamPickerListItem.js.map