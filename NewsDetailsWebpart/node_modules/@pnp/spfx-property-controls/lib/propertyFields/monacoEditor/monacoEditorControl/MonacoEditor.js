import * as React from 'react';
import { isEmpty } from 'lodash';
import { Spinner, SpinnerSize, } from '@fluentui/react/lib/Spinner';
import { Stack } from '@fluentui/react/lib/Stack';
import { Elanguages } from './';
import { Error } from './Error';
import { EStatus, useMonaco, } from './useMonaco';
import { useMonacoEditorStyles } from './useMonacoEditorStyles';
export const MonacoEditor = (props) => {
    const { value, onValueChange, theme, readOnly, showLineNumbers, showMiniMap, language, jsonDiagnosticsOptions, jscriptDiagnosticsOptions, } = props || {};
    const containerRef = React.useRef(null);
    const editorRef = React.useRef(null);
    const { controlClasses } = useMonacoEditorStyles();
    const { monaco, status, error } = useMonaco();
    const onDidChangeModelContent = React.useCallback((e) => {
        if (editorRef.current) {
            const currentValue = editorRef.current.getValue();
            if (currentValue !== value) {
                const validationErrors = [];
                try {
                    if (language === Elanguages.json) {
                        JSON.parse(currentValue);
                    }
                }
                catch (e) {
                    validationErrors.push(e.message);
                }
                onValueChange(currentValue, validationErrors);
            }
        }
    }, [onValueChange]);
    React.useEffect(() => {
        if (status !== EStatus.LOADED)
            return;
        if (!isEmpty(jsonDiagnosticsOptions) && language === Elanguages.json) {
            monaco.languages.json.jsonDefaults.setDiagnosticsOptions(jsonDiagnosticsOptions);
        }
        if (!isEmpty(jscriptDiagnosticsOptions) && language === Elanguages.javascript) {
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(jscriptDiagnosticsOptions);
        }
        monaco.editor.onDidCreateModel((m) => {
            m.updateOptions({
                tabSize: 2,
            });
        });
        //Create the MonacoEditor
        editorRef.current = monaco.editor.create(containerRef.current, {
            value: value,
            scrollBeyondLastLine: false,
            theme: theme,
            language: language,
            folding: true,
            readOnly: readOnly,
            lineNumbersMinChars: 4,
            lineNumbers: showLineNumbers ? "on" : "off",
            minimap: {
                enabled: showMiniMap,
            },
        });
        editorRef.current.onDidChangeModelContent(onDidChangeModelContent);
        return () => {
            var _a;
            (_a = editorRef === null || editorRef === void 0 ? void 0 : editorRef.current) === null || _a === void 0 ? void 0 : _a.dispose();
        };
    }, [jsonDiagnosticsOptions, jscriptDiagnosticsOptions, monaco]);
    if (status === EStatus.LOADING) {
        return (React.createElement(Stack, { horizontal: true, horizontalAlign: "center", tokens: { padding: 25 } },
            React.createElement(Spinner, { size: SpinnerSize.medium })));
    }
    if (status === EStatus.ERROR) {
        return React.createElement(Error, { error: error, show: true });
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { ref: containerRef, className: controlClasses.containerStyles })));
};
//# sourceMappingURL=MonacoEditor.js.map