import * as React from 'react';

export interface ITaskRowProps {
    row: any;
}


export default class TaskRow extends React.Component<ITaskRowProps> {


    public render(): React.ReactElement<ITaskRowProps> {
        const {
            row
        } = this.props;
        return (
            <div>
                {JSON.stringify(row)}
            </div>
        );
    }
}
