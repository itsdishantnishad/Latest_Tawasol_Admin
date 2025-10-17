import * as React from 'react';
import { Dropdown } from '@fluentui/react';
/**
 * Seconds component, renders the seconds dropdown
 */
export default class SecondsComponent extends React.Component {
    render() {
        const seconds = [];
        for (let k = 0; k < 60; k++) {
            let digitSec;
            if (k < 10) {
                digitSec = '0' + k;
            }
            else {
                digitSec = k.toString();
            }
            let selected = false;
            if (k === this.props.value) {
                selected = true;
            }
            seconds.push({ key: k, text: digitSec, isSelected: selected });
        }
        return (React.createElement(Dropdown, { disabled: this.props.disabled, label: '', options: seconds, onChanged: this.props.onChange }));
    }
}
//# sourceMappingURL=SecondsComponent.js.map