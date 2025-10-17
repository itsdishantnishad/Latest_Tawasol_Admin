import * as React from 'react';
import { IItem } from './IItem';
export interface IGridProps {
    items: IItem[];
    onSelected: (items: IItem[]) => void;
    defaultSelectedItems?: IItem[];
    multiSelect?: boolean;
    column1Label?: string;
    column2Label?: string;
}
export declare const Grid: React.FunctionComponent<IGridProps>;
//# sourceMappingURL=Grid.d.ts.map