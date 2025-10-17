import * as React from 'react';
import styles from './PlaceholderComponent.module.scss';
import { Icon, PrimaryButton } from '@fluentui/react';
/**
 * Placeholder component
 */
export class Placeholder extends React.Component {
    /**
     * Constructor
     */
    constructor(props) {
        super(props);
        this._crntElm = null;
        /**
         * Execute the onConfigure function
         */
        this._handleBtnClick = (event) => {
            this.props.onConfigure();
        };
        /**
         * Set the current zone width
         */
        this._setZoneWidth = () => {
            this.setState({
                width: this._crntElm.clientWidth
            });
        };
        /**
         * Stores the current element
         */
        this._linkElm = (e) => {
            this._crntElm = e;
        };
        this.state = {
            width: null
        };
    }
    /**
     * componentDidMount lifecycle hook
     */
    componentDidMount() {
        this._setZoneWidth();
    }
    /**
     * componentDidUpdate lifecycle hook
     * @param prevProps
     * @param prevState
     */
    componentDidUpdate(prevProps, prevState) {
        this._setZoneWidth();
    }
    /**
     * shouldComponentUpdate lifecycle hook
     * @param nextProps
     * @param nextState
     */
    shouldComponentUpdate(nextProps, nextState) {
        return this.state.width !== nextState.width || this.props.hideButton !== nextProps.hideButton;
    }
    /**
     * Default React component render method
     */
    render() {
        return (React.createElement("div", { className: `${styles.placeholder} ${this.props.contentClassName ? this.props.contentClassName : ''}`, ref: this._linkElm },
            React.createElement("div", { className: styles.placeholderContainer },
                React.createElement("div", { className: styles.placeholderHead },
                    React.createElement("div", { className: styles.placeholderHeadContainer },
                        this.props.iconName && React.createElement(Icon, { iconName: this.props.iconName, className: styles.placeholderIcon }),
                        React.createElement("span", { className: `${styles.placeholderText} ${(this.state.width && this.state.width <= 380) ? styles.hide : ""}` }, this.props.iconText))),
                React.createElement("div", { className: styles.placeholderDescription },
                    React.createElement("span", { className: styles.placeholderDescriptionText }, this.props.description)),
                this.props.children,
                React.createElement("div", { className: styles.placeholderDescription }, (this.props.buttonLabel && !this.props.hideButton) &&
                    React.createElement(PrimaryButton, { text: this.props.buttonLabel, ariaLabel: this.props.buttonLabel, ariaDescription: this.props.description, onClick: this._handleBtnClick })))));
    }
}
//# sourceMappingURL=PlaceholderComponent.js.map