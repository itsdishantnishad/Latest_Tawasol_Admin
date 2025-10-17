import * as React from 'react';
import Markdown from 'markdown-to-jsx';
import * as telemetry from '../../common/telemetry';
export default class PropertyPaneMarkdownContentHost extends React.Component {
    constructor(props) {
        super(props);
        telemetry.track('PropertyPaneMarkdownContent', {});
    }
    render() {
        return (React.createElement("div", { className: this.props.className },
            this.props.description && this.props.description !== '' &&
                React.createElement("div", { dangerouslySetInnerHTML: { __html: this.props.description } }),
            React.createElement(Markdown, { options: this.props.markdownProps }, this.props.markdown)));
    }
}
//# sourceMappingURL=PropertyPaneMarkdownContentHost.js.map