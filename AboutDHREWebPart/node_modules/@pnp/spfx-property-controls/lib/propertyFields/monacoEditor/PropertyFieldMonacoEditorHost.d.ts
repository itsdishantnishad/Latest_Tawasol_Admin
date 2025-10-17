import * as React from 'react';
import { IPropertyFieldMonacoEditorHostProps, IPropertyFieldMonacoEditorHostState } from './IPropertyFieldMonacoEditorHost';
export default class PropertyFieldMonacoEditorHost extends React.Component<IPropertyFieldMonacoEditorHostProps, IPropertyFieldMonacoEditorHostState> {
    constructor(props: IPropertyFieldMonacoEditorHostProps);
    componentDidUpdate(prevProps: IPropertyFieldMonacoEditorHostProps, prevState: IPropertyFieldMonacoEditorHostState): void;
    protected showPanel: (indicator: boolean) => void;
    private controlClasses;
    protected _onValueChange: (newValue: string, errors: string[]) => void;
    protected onRenderFooterContent: () => JSX.Element;
    render(): React.ReactElement<IPropertyFieldMonacoEditorHostProps>;
}
//# sourceMappingURL=PropertyFieldMonacoEditorHost.d.ts.map