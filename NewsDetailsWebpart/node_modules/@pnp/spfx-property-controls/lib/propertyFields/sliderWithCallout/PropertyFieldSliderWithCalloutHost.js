import * as React from 'react';
import PropertyFieldHeader from '../../common/propertyFieldHeader/PropertyFieldHeader';
import * as telemetry from '../../common/telemetry';
import { Slider } from '@fluentui/react';
import omit from 'lodash/omit';
export default class PropertyFieldSliderWithCalloutHost extends React.Component {
    constructor(props) {
        super(props);
        telemetry.track('PropertyFieldSliderWithCallout', {
            disabled: props.disabled
        });
    }
    render() {
        const props = this.props;
        return (React.createElement("div", null,
            React.createElement(PropertyFieldHeader, { label: props.label, calloutContent: props.calloutContent, calloutTrigger: props.calloutTrigger, calloutWidth: props.calloutWidth, gapSpace: props.gapSpace }),
            React.createElement(Slider, Object.assign({}, omit(props, ['label'])))));
    }
}
//# sourceMappingURL=PropertyFieldSliderWithCalloutHost.js.map