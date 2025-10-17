import * as React from 'react';
import { IComboBox, IComboBoxOption } from '@fluentui/react/lib/ComboBox';
import { IPropertyFieldEditableComboBoxHostProps, IPropertyFieldEditableComboBoxHostState } from './IPropertyFieldEditableComboBoxHost';
/**
 * @class PropertyFieldEditableComboBoxHost
 * @description Core JSX Element for displaying and managing an editable combo box
 */
export default class PropertyFieldEditableComboBoxHost extends React.Component<IPropertyFieldEditableComboBoxHostProps, IPropertyFieldEditableComboBoxHostState> {
    private readonly logStyle;
    protected box: React.RefObject<IComboBox>;
    constructor(props: IPropertyFieldEditableComboBoxHostProps, state: IPropertyFieldEditableComboBoxHostState);
    /**
     * @function optionChanged
     * @param event
     * @param option
     * @param index
     * @param value
     * @description Handles when the selected option has changed or whether a new option has been added
     */
    optionChanged(event: React.FormEvent<IComboBox>, option?: IComboBoxOption | undefined, index?: number | undefined, value?: string | undefined): void;
    /**
     * @function onKeyDown
     * @param event the keyboard event incoming
     * @description monitors the keystrokes to stop the user from exceeding the `maxFillInLength`
     */
    protected onKeyDown(event: React.KeyboardEvent<IComboBox>): void;
    /**
     * @function log
     * @param val the string to write out to the console
     * @description lightweight logging to the console, with just a little custom styling
     */
    private log;
    /**
     * @function render
     * @description Renders out the Fluent UI `ComboBox` along with some labeling and tooltip components
     */
    render(): JSX.Element;
}
//# sourceMappingURL=PropertyFieldEditableComboBoxHost.d.ts.map