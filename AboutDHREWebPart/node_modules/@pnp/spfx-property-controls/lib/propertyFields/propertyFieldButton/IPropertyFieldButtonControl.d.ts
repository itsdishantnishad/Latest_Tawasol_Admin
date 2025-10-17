import { IButtonStyles } from '@fluentui/react/lib/Button';
import { IIconProps } from '@fluentui/react/lib/Icon';
export interface IPropertyFieldButtonControlProps {
    key: string;
    disabled?: boolean;
    styles?: IButtonStyles;
    className?: string;
    isVisible: boolean;
    isPrimary?: boolean;
    text?: string;
    iconProps?: IIconProps;
    onClick: (e: any) => void;
}
export interface IPropertyFieldButtonControlState extends IPropertyFieldButtonControlProps {
}
//# sourceMappingURL=IPropertyFieldButtonControl.d.ts.map