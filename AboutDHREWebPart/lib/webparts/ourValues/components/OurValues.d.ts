import * as React from 'react';
import type { IOurValuesProps } from './IOurValuesProps';
type CardItem = {
    icon?: string;
    title: string;
    desc: string;
};
type State = {
    items: CardItem[];
    loading: boolean;
    error?: string;
};
export default class OurValues extends React.Component<IOurValuesProps, State> {
    state: State;
    componentDidMount(): void;
    /** Fetch items from the list and map to cards */
    private loadItems;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=OurValues.d.ts.map