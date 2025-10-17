import * as React from 'react';
import { ITermProps, ITermState } from './IPropertyFieldTermPickerHost';
/**
 * Term component
 * Renders a selectable term
 */
export default class Term extends React.Component<ITermProps, ITermState> {
    constructor(props: ITermProps);
    /**
     * Handle the checkbox change trigger
     */
    private _handleChange;
    /**
     * Lifecycle event hook when component retrieves new properties
     * @param nextProps
     */
    UNSAFE_componentWillReceiveProps(nextProps: ITermProps): void;
    /**
     * Get the right class name for the term
     */
    private getClassName;
    render(): JSX.Element;
}
//# sourceMappingURL=Term.d.ts.map