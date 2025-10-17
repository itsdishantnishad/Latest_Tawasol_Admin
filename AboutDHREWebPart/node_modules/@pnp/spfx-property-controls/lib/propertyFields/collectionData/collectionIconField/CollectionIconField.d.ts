import * as React from 'react';
import { ICollectionIconFieldProps } from '.';
interface ICollectionIconFieldState {
    isPanelOpen?: boolean;
    errorMessage?: string;
}
export declare class CollectionIconField extends React.Component<ICollectionIconFieldProps, ICollectionIconFieldState> {
    constructor(props: ICollectionIconFieldProps);
    render(): React.ReactElement<ICollectionIconFieldProps>;
    private _onSelectIconClick;
    private _onIconChage;
    private _onPanelDismiss;
}
export {};
//# sourceMappingURL=CollectionIconField.d.ts.map