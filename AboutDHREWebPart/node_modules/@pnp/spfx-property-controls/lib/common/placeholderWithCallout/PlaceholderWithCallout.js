import * as React from 'react';
import { Callout, DirectionalHint, getIconClassName } from '@fluentui/react';
import { CalloutTriggers } from '../callout/Callout';
import styles from './PlaceholderWithCallout.module.scss';
/**
 * PlaceholderWithCallout component.
 * Displays a label and a callout
 */
export default class PlaceholderWithCallout extends React.Component {
    constructor(props, state) {
        super(props, state);
        this._onCalloutDismiss = this._onCalloutDismiss.bind(this);
        this.state = {
            isCalloutVisible: false,
        };
    }
    render() {
        return (React.createElement("div", { className: styles.placeholder },
            React.createElement("div", { className: styles.children }, this.props.children),
            React.createElement("div", { className: styles.info },
                React.createElement("i", { className: getIconClassName('Info'), ref: (infoIcon) => {
                        this._infoIcon = infoIcon;
                    }, onMouseOver: this.props.calloutTrigger === CalloutTriggers.Hover
                        ? this._onInfoIconMouseOver.bind(this)
                        : null, onMouseOut: this.props.calloutTrigger === CalloutTriggers.Hover
                        ? this._onInfoIconMouseOut.bind(this)
                        : null, onClick: this.props.calloutTrigger === CalloutTriggers.Click
                        ? this._onInfoIconClick.bind(this)
                        : null })),
            this.state.isCalloutVisible && (React.createElement(Callout, { className: styles.callout, target: this._infoIcon, isBeakVisible: true, directionalHint: DirectionalHint.leftCenter, directionalHintForRTL: DirectionalHint.rightCenter, onDismiss: this._onCalloutDismiss, gapSpace: this.props.gapSpace !== undefined ? this.props.gapSpace : 5, calloutWidth: this.props.calloutWidth }, this.props.calloutContent))));
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
//# sourceMappingURL=PlaceholderWithCallout.js.map