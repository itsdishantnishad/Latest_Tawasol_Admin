import * as React from 'react';
import { IPropertyFieldContentTypePickerHostProps, IPropertyFieldContentTypePickerHostState } from './IPropertyFieldContentTypePickerHost';
/**
 * Renders the controls for PropertyFieldContentTypePicker component
 */
export default class PropertyFieldContentTypePickerHost extends React.Component<IPropertyFieldContentTypePickerHostProps, IPropertyFieldContentTypePickerHostState> {
    private options;
    private selectedKey;
    private latestValidateValue;
    private async;
    private delayedValidate;
    /**
     * Constructor method
     */
    constructor(props: IPropertyFieldContentTypePickerHostProps);
    componentDidMount(): void;
    componentDidUpdate(prevProps: IPropertyFieldContentTypePickerHostProps, _prevState: IPropertyFieldContentTypePickerHostState): void;
    /**
     * Loads the loadContentTypes from a selected SharePoint list or SharePoint site
     */
    private loadContentTypes;
    /**
     * Raises when a contentType has been selected
     */
    private onChanged;
    /**
     * Validates the new custom field value
     */
    private validate;
    /**
     * Notifies the parent Web Part of a property value change
     */
    private notifyAfterValidate;
    /**
     * Called when the component will unmount
     */
    componentWillUnmount(): void;
    /**
     * Renders the SPContentTypePicker controls with Office UI Fabric
     */
    render(): JSX.Element;
}
//# sourceMappingURL=PropertyFieldContentTypePickerHost.d.ts.map