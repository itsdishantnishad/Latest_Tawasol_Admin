import React from 'react';
import { mergeStyleSets } from '@fluentui/react';
export const useMonacoEditorStyles = () => {
    const controlClasses = React.useMemo(() => {
        return mergeStyleSets({
            containerStyles: {
                height: "90vh",
            }
        });
    }, []);
    return { controlClasses };
};
//# sourceMappingURL=useMonacoEditorStyles.js.map