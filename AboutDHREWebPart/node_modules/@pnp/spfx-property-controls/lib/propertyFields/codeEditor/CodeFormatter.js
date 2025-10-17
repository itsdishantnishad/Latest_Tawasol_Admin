import { CSSFormatter } from './CSSFormatter';
import { ScriptFormatter } from './ScriptFormatter';
/**
 * Helper class to format the code.
 */
export class CodeFormatter {
    /**
     * Formats CSS code
     * @param rawCSS
     */
    formatCSS(rawCSS) {
        const cssFormatter = new CSSFormatter();
        return cssFormatter.css_beautify(rawCSS, null);
    }
    /**
     * Formats JavaScript code
     * @param rawScript
     */
    formatScript(rawScript) {
        const scriptFormatter = new ScriptFormatter();
        return scriptFormatter.js_beautify(rawScript, null);
    }
    /**
     * Formats XML code
     * @param rawXML
     */
    formatXML(rawXML) {
        const tab = '\t';
        let result = '';
        let indent = '';
        rawXML.split(/>\s*</).forEach(element => {
            if (element.match(/^\/\w/)) {
                indent = indent.substring(tab.length);
            }
            result += indent + '<' + element + '>\r\n';
            if (element.match(/^<?\w[^>]*[^/]$/)) {
                indent += tab;
            }
        });
        return result.substring(1, result.length - 3);
    }
    /**
     * Formats HTML code
     * @param rawHTML
     */
    formatHTML(rawHTML) {
        return this.formatXML(rawHTML);
    }
    /**
     * Formats JSON code
     * @param rawJSON
     */
    formatJSON(rawJSON) {
        return JSON.stringify(JSON.parse(rawJSON), null, 2);
    }
}
//# sourceMappingURL=CodeFormatter.js.map