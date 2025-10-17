import * as React from 'react';
import { IPropertyFieldColumnMultiPickerHostProps, IPropertyFieldColumnMultiPickerHostState } from './IPropertyFieldColumnMultiPickerHost';
/**
* Renders the controls for PropertyFieldSPColumnMultiplePicker component
*/
export default class PropertyFieldColumnMultiPickerHost extends React.Component<IPropertyFieldColumnMultiPickerHostProps, IPropertyFieldColumnMultiPickerHostState> {
    private loaded;
    private async;
    private delayedValidate;
    /**
    * Constructor
    */
    constructor(props: IPropertyFieldColumnMultiPickerHostProps);
    componentDidMount(): void;
    componentDidUpdate(prevProps: IPropertyFieldColumnMultiPickerHostProps, prevState: IPropertyFieldColumnMultiPickerHostState): void;
    private loadColumns;
    /**
    * Raises when a column has been selected
    */
    private onChanged;
    /**
     * Raises when the select all checkbox is changed
     */
    private onSelectAllChanged;
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
    * Renders the SPColumnMultiplePicker controls with Office UI  Fabric
    */
    render(): JSX.Element;
}
//# sourceMappingURL=PropertyFieldColumnMultiPickerHost.d.ts.map