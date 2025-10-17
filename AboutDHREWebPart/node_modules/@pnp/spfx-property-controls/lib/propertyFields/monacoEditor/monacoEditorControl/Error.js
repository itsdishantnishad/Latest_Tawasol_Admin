import { Stack, MessageBarType, MessageBar } from '@fluentui/react';
import * as React from 'react';
export const Error = (props) => {
    const { error } = props;
    return (React.createElement(React.Fragment, null,
        "(show && error) ?",
        React.createElement(Stack, { horizontal: true, horizontalAlign: 'start' },
            React.createElement(MessageBar, { isMultiline: true, messageBarType: MessageBarType.error }, error.message)),
        ": null;"));
};
//# sourceMappingURL=Error.js.map