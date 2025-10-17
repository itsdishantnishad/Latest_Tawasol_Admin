import * as React from 'react';
import { Dropdown } from '@fluentui/react';
/**
 * Minutes component, renders the minutes dropdown
 */
export default class MinutesComponent extends React.Component {
    render() {
        const minutes = [];
        for (let j = 0; j < 60; j++) {
            let digitMin;
            if (j < 10) {
                digitMin = '0' + j;
            }
            else {
                digitMin = j.toString();
            }
            let selected = false;
            if (j === this.props.value) {
                selected = true;
            }
            minutes.push({ key: j, text: digitMin, isSelected: selected });
        }
        return (React.createElement(Dropdown, { disabled: this.props.disabled, label: '', options: minutes, onChanged: this.props.onChange }));
    }
}
//# sourceMappingURL=MinutesComponent.js.map