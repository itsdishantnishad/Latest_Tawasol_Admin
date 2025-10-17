import * as React from 'react';
import { FluentProvider, IdPrefixProvider, Subtitle2, teamsLightTheme, } from '@fluentui/react-components';
import { Grid } from './grid/Grid';
export default class PropertyFieldButtonControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign(Object.assign({}, props), { selectedItems: this.props.defaultSelectedItems });
    }
    ///
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.isVisible !== this.props.isVisible ||
            prevProps.items !== this.props.items ||
            prevProps.className !== this.props.className ||
            prevProps.styles !== this.props.styles ||
            prevProps.label !== this.props.label ||
            prevProps.defaultSelectedItems !== this.props.defaultSelectedItems ||
            prevProps.key !== this.props.key ||
            prevProps.maxHeight !== this.props.maxHeight ||
            prevProps.multiSelect !== this.props.multiSelect) {
            this.setState({
                items: this.props.items,
                defaultSelectedItems: this.props.defaultSelectedItems,
            });
        }
    }
    render() {
        var _a;
        if (this.props.isVisible === false) {
            return null;
        }
        const containerStyles = Object.assign({ display: "flex", flexDirection: "column", gap: 15, maxHeight: (_a = this.props.maxHeight) !== null && _a !== void 0 ? _a : 400, height: "100%", overflowY: "auto", marginTop: 20, marginBottom: 20 }, this.props.styles);
        return (React.createElement(IdPrefixProvider, { value: "gridItems-pnp_pcontrol-" },
            React.createElement(FluentProvider, { theme: teamsLightTheme },
                React.createElement("div", { className: this.props.className, style: containerStyles },
                    React.createElement(Subtitle2, null,
                        " ",
                        this.props.label),
                    React.createElement(Grid, { items: this.state.items, onSelected: this.props.onSelected, defaultSelectedItems: this.props.defaultSelectedItems, multiSelect: this.props.multiSelect, column2Label: this.props.column2Label, column1Label: this.props.column1Label })))));
    }
}
//# sourceMappingURL=PropertyFieldGridControl.js.map