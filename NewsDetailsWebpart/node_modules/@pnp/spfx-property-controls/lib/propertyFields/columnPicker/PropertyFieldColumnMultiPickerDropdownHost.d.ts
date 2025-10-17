import * as React from 'react';
import { IPropertyFieldColumnMultiPickerDropdownHostProps, IPropertyFieldColumnMultiPickerDropdownHostState } from './IPropertyFieldColumnMultiPickerDropdownHost';
/**
* Renders the controls for PropertyFieldSPColumnMultiplePicker component
*/
export default class PropertyFieldColumnMultiPickerDropdownHost extends React.Component<IPropertyFieldColumnMultiPickerDropdownHostProps, IPropertyFieldColumnMultiPickerDropdownHostState> {
    private loaded;
    private async;
    private delayedValidate;
    /**
    * Constructor
    */
    constructor(props: IPropertyFieldColumnMultiPickerDropdownHostProps);
    componentDidMount(): void;
    componentDidUpdate(prevProps: IPropertyFieldColumnMultiPickerDropdownHostProps, prevState: IPropertyFieldColumnMultiPickerDropdownHostState): void;
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
//# sourceMappingURL=PropertyFieldColumnMultiPickerDropdownHost.d.ts.map