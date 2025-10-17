import * as React from 'react';
import * as telemetry from '../../common/telemetry';
import { DefaultButton, Panel, PanelType, Label } from '@fluentui/react';
import { CollectionDataViewer } from './collectionDataViewer';
import FieldErrorMessage from '../errorMessage/FieldErrorMessage';
import * as strings from 'PropertyControlStrings';
export class PropertyFieldCollectionDataHost extends React.Component {
    constructor(props) {
        super(props);
        /**
         * Open the panel
         */
        this.openPanel = () => {
            this.setState({
                panelOpen: true,
            });
        };
        /**
         * Closes the panel
         */
        this.closePanel = () => {
            this.setState({
                panelOpen: false,
            });
        };
        /**
         * On save action
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.onSave = (items) => {
            this.props.onChanged(items);
            this.setState({
                panelOpen: false,
            });
        };
        this.state = {
            panelOpen: false,
        };
        telemetry.track('PropertyFieldCollectionData', {});
    }
    render() {
        var _a;
        return (React.createElement("div", null,
            React.createElement(Label, null, this.props.label),
            React.createElement(DefaultButton, { text: this.props.manageBtnLabel, onClick: this.openPanel, disabled: this.props.fields.length === 0 || this.props.disabled }),
            this.props.fields.length === 0 && (React.createElement(FieldErrorMessage, { errorMessage: strings.CollectionDataEmptyFields })),
            React.createElement(Panel, Object.assign({ isOpen: this.state.panelOpen, onDismiss: this.closePanel, type: PanelType.large, headerText: this.props.panelHeader, onOuterClick: () => {
                    /* no-op; */
                }, className: `PropertyFieldCollectionData__panel ${this.props.panelClassName || ''}` }, ((_a = this.props.panelProps) !== null && _a !== void 0 ? _a : {})),
                this.props.panelDescription && (React.createElement("p", { className: 'PropertyFieldCollectionData__panel__description' }, this.props.panelDescription)),
                React.createElement(CollectionDataViewer, Object.assign({}, this.props, { fOnSave: this.onSave, fOnClose: this.closePanel })))));
    }
}
//# sourceMappingURL=PropertyFieldCollectionDataHost.js.map