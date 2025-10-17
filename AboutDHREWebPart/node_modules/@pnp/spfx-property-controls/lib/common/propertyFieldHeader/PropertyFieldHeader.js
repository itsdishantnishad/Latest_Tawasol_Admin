import * as React from 'react';
import { Callout, DirectionalHint, css, getIconClassName, } from '@fluentui/react';
import { CalloutTriggers, } from './IPropertyFieldHeader';
import styles from './PropertyFieldHeader.module.scss';
/**
 * PropertyFieldHeader component.
 * Displays a label and a callout
 */
export default class PropertyFieldHeader extends React.Component {
    constructor(props, state) {
        super(props, state);
        this._onCalloutDismiss = this._onCalloutDismiss.bind(this);
        this.state = {
            isCalloutVisible: false,
        };
    }
    render() {
        const { disabled, label, calloutContent, calloutTrigger, calloutWidth, gapSpace, } = this.props;
        return (React.createElement("div", { className: css({
                [styles.headerBar]: true,
                [styles.isDisabled]: !!disabled,
            }) },
            React.createElement("div", { className: styles.header }, label),
            React.createElement("div", { className: styles.info }, calloutContent && (React.createElement("i", { className: getIconClassName('Info'), ref: (infoIcon) => {
                    this._infoIcon = infoIcon;
                }, onMouseOver: !disabled && calloutTrigger === CalloutTriggers.Hover
                    ? this._onInfoIconMouseOver.bind(this)
                    : null, onMouseOut: !disabled && calloutTrigger === CalloutTriggers.Hover
                    ? this._onInfoIconMouseOut.bind(this)
                    : null, onClick: !disabled && calloutTrigger === CalloutTriggers.Click
                    ? this._onInfoIconClick.bind(this)
                    : null }))),
            this.state.isCalloutVisible && (React.createElement(Callout, { className: styles.headerCallout, target: this._infoIcon, isBeakVisible: true, directionalHint: DirectionalHint.leftCenter, directionalHintForRTL: DirectionalHint.rightCenter, onDismiss: this._onCalloutDismiss, gapSpace: gapSpace !== undefined ? gapSpace : 5, calloutWidth: calloutWidth }, calloutContent))));
    }
    _onCalloutDismiss() {
        if (this.state.isCalloutVisible) {
            this.setState({
                isCalloutVisible: false,
            });
        }
    }
    _onInfoIconMouseOver() {
        if (this.props.calloutTrigger !== CalloutTriggers.Hover) {
            return;
        }
        if (!this.state.isCalloutVisible) {
            this.setState({
                isCalloutVisible: true,
            });
        }
    }
    _onInfoIconMouseOut(e) {
        if (this.props.calloutTrigger !== CalloutTriggers.Hover) {
            return;
        }
        if (e.relatedTarget) {
            const relatedTarget = e.relatedTarget;
            if (relatedTarget && relatedTarget.closest('.ms-Callout-container')) {
                return;
            }
        }
        this.setState({
            isCalloutVisible: false,
        });
    }
    _onInfoIconClick() {
        if (this.props.calloutTrigger !== CalloutTriggers.Click) {
            return;
        }
        this.setState({
            isCalloutVisible: !this.state.isCalloutVisible,
        });
    }
}
//# sourceMappingURL=PropertyFieldHeader.js.map