import { IPropertyPaneCustomFieldProps } from '@microsoft/sp-property-pane';
import { ISearchBoxStyles } from '@fluentui/react/lib/components/SearchBox';
export interface IPropertyFieldSearchProps {
    key: string;
    value: string;
    placeholder?: string;
    underlined?: boolean;
    styles?: ISearchBoxStyles;
    className?: string;
    onSearch?: (newValue: any) => void;
    onChange?: (newValue: any) => void;
    onClear?: (ev?: any) => void;
    onEscape?: (ev?: any) => void;
}
export interface IPropertyFieldSearchPropsInternal extends IPropertyFieldSearchProps, IPropertyPaneCustomFieldProps {
}
//# sourceMappingURL=IPropertyFieldSearch.d.ts.map