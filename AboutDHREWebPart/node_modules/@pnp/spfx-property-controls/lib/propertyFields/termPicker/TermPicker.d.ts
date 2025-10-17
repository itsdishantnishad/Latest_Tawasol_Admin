import * as React from 'react';
import { BasePicker, IBasePickerProps, IPickerItemProps } from '@fluentui/react/lib/Pickers';
import { IPickerTerm, IPickerTerms } from './IPropertyFieldTermPicker';
import { IPropertyFieldTermPickerHostProps } from './IPropertyFieldTermPickerHost';
import { BaseComponentContext } from '@microsoft/sp-component-base';
import { ISPTermStorePickerService } from '../../services/ISPTermStorePickerService';
export declare class TermBasePicker extends BasePicker<IPickerTerm, IBasePickerProps<IPickerTerm>> {
}
export interface ITermPickerState {
    terms: IPickerTerms;
}
export interface ITermPickerProps {
    termPickerHostProps: IPropertyFieldTermPickerHostProps;
    context: BaseComponentContext;
    disabled: boolean;
    value: IPickerTerms;
    allowMultipleSelections: boolean;
    areTermsSelectable: boolean;
    areTermsHidden: boolean;
    isTermSetSelectable: boolean;
    disabledTermIds: string[];
    onChanged: (items: IPickerTerm[]) => void;
    termsService: ISPTermStorePickerService;
    resolveDelay?: number;
}
export default class TermPicker extends React.Component<ITermPickerProps, ITermPickerState> {
    /**
     * Constructor method
     */
    constructor(props: ITermPickerProps);
    /**
     * UNSAFE_componentWillReceiveProps method
     */
    UNSAFE_componentWillReceiveProps(nextProps: ITermPickerProps): void;
    /**
     * Renders the item in the picker
     */
    protected onRenderItem(term: IPickerItemProps<IPickerTerm>): JSX.Element;
    /**
     * Renders the suggestions in the picker
     */
    protected onRenderSuggestionsItem(term: IPickerTerm, props: any): JSX.Element;
    /**
     * When Filter Changes a new search for suggestions
     */
    private onFilterChanged;
    /**
     * gets the text from an item
     */
    private onGetTextFromItem;
    /**
   * Render method
   */
    render(): JSX.Element;
}
//# sourceMappingURL=TermPicker.d.ts.map