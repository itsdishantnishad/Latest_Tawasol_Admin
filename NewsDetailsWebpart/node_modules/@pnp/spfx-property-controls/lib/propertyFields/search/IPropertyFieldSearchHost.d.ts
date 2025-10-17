import { ISearchBoxStyles } from "@fluentui/react/lib/components/SearchBox";
export interface IPropertyFieldSearchHostProps {
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
export interface IPropertyFieldSearchHostState {
    value: string;
}
//# sourceMappingURL=IPropertyFieldSearchHost.d.ts.map