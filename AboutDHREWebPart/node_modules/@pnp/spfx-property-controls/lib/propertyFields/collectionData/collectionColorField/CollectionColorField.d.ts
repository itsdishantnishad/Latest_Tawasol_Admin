import * as React from 'react';
import { ICollectionColorFieldProps } from './ICollectionColorFieldProps';
interface ICollectionColorFieldState {
    isCalloutVisible: boolean;
    color: string;
    errorMessage: string;
}
export declare class CollectionColorField extends React.Component<ICollectionColorFieldProps, ICollectionColorFieldState> {
    private async;
    private delayedValidate;
    private _colorElement;
    constructor(props: ICollectionColorFieldProps, state: ICollectionColorFieldState);
    /**
     * UNSAFE_componentWillMount lifecycle hook
     */
    UNSAFE_componentWillMount(): void;
    /**
     * componentWillUnmount lifecycle hook
     */
    componentWillUnmount(): void;
    private _onCalloutDismiss;
    private _onCalloutToggle;
    /**
    * Value change event handler
    *
    * @param field
    * @param value
    */
    private valueChange;
    /**
     * Delayed field validation
     */
    private valueValidation;
    render(): React.ReactElement<ICollectionColorFieldProps>;
}
export {};
//# sourceMappingURL=CollectionColorField.d.ts.map