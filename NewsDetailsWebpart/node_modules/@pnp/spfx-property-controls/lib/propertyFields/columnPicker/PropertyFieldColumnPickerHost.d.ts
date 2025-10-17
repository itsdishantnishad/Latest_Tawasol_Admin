import * as React from 'react';
import { IPropertyFieldColumnPickerHostProps, IPropertyFieldColumnPickerHostState } from './IPropertyFieldColumnPickerHost';
/**
 * Renders the controls for PropertyFieldColumnPicker component
 */
export default class PropertyFieldColumnPickerHost extends React.Component<IPropertyFieldColumnPickerHostProps, IPropertyFieldColumnPickerHostState> {
    private options;
    private selectedKey;
    private latestValidateValue;
    private async;
    private delayedValidate;
    /**
     * Constructor method
     */
    constructor(props: IPropertyFieldColumnPickerHostProps);
    componentDidMount(): void;
    componentDidUpdate(prevProps: IPropertyFieldColumnPickerHostProps, _prevState: IPropertyFieldColumnPickerHostState): void;
    /**
     * Loads the columns from a SharePoint list
     */
    private loadColumns;
    /**
     * Raises when a column has been selected
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
     * Renders the SPColumnPicker controls with Office UI Fabric
     */
    render(): JSX.Element;
}
//# sourceMappingURL=PropertyFieldColumnPickerHost.d.ts.map