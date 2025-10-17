import * as React from 'react';
import { PanelType } from '@fluentui/react/lib/Panel';
import { IconSelectorRenderOption } from '../Types';
import { DialogType } from '@fluentui/react/lib/Dialog';
export interface IIconSelectorProps {
    renderOption?: IconSelectorRenderOption;
    currentIcon?: string;
    panelClassName?: string;
    panelType?: PanelType;
    dialogType?: DialogType;
    isOpen?: boolean;
    onChange?: (iconName: string) => void;
    onDismiss?: () => void;
    onSave?: (iconName: string) => void;
}
export declare const IconSelector: React.FunctionComponent<IIconSelectorProps>;
//# sourceMappingURL=IconSelector.d.ts.map