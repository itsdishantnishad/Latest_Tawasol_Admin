import * as React from 'react';
import styles from './FieldErrorMessage.module.scss';
import { Icon } from '@fluentui/react/lib/Icon';
/**
 * Component that shows an error message when something went wront with the property control
 */
export default class FieldErrorMessage extends React.Component {
    render() {
        if (this.props.errorMessage !== 'undefined' && this.props.errorMessage !== null && this.props.errorMessage !== '') {
            return (React.createElement("div", { "aria-live": "assertive" },
                React.createElement("p", { className: `ms-TextField-errorMessage ${styles.errorMessage}` },
                    React.createElement(Icon, { iconName: 'Error', className: styles.errorIcon }),
                    React.createElement("span", { "data-automation-id": "error-message" }, this.props.errorMessage))));
        }
        else {
            return null;
        }
    }
}
//# sourceMappingURL=FieldErrorMessage.js.map