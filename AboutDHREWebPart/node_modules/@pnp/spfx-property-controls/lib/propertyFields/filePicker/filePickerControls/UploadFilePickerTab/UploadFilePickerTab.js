import * as React from 'react';
import { GeneralHelper } from '../../../../helpers/GeneralHelper';
import { PrimaryButton, DefaultButton, css } from '@fluentui/react';
import * as strings from 'PropertyControlStrings';
import styles from './UploadFilePickerTab.module.scss';
export default class UploadFilePickerTab extends React.Component {
    constructor(props) {
        super(props);
        /**
         * Gets called when a file is uploaded
         */
        this._handleFileUpload = (event) => {
            if (!event.target.files || event.target.files.length < 1) {
                return;
            }
            // Get the files that were uploaded
            const files = event.target.files;
            // Grab the first file -- there should always only be one
            const file = files[0];
            const filePickerResult = {
                fileAbsoluteUrl: null,
                fileName: file.name,
                fileNameWithoutExtension: GeneralHelper.getFileNameWithoutExtension(file.name),
                downloadFileContent: () => { return Promise.resolve(file); }
            };
            if (GeneralHelper.isImage(file.name)) {
                // Convert to base64 image
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    this.setState({
                        filePreview: reader.result
                    });
                };
            }
            this.setState({
                filePickerResult,
                filePreview: undefined
            });
        };
        /**
         * Saves base64 encoded image back to property pane file picker
         */
        this._handleSave = () => {
            this.props.onSave(this.state.filePickerResult);
        };
        /**
         * Closes tab without saving
         */
        this._handleClose = () => {
            this.props.onClose();
        };
        this.state = {
            filePickerResult: undefined
        };
    }
    render() {
        const { filePickerResult, filePreview } = this.state;
        const fileName = filePickerResult ? filePickerResult.fileName : null;
        const acceptedFilesExtensions = this.props.accepts ? this.props.accepts.join(",") : null;
        return (React.createElement("div", { className: styles.tabContainer },
            React.createElement("div", { className: styles.tabHeaderContainer },
                React.createElement("h2", { className: styles.tabHeader }, strings.UploadFileHeader)),
            React.createElement("div", { className: css(styles.tab, styles.tabOffset) },
                React.createElement("input", { className: styles.localTabInput, type: "file", id: "fileInput", accept: acceptedFilesExtensions, multiple: false, onChange: (event) => this._handleFileUpload(event) }),
                fileName && filePreview &&
                    /** Display image preview */
                    React.createElement("div", { className: styles.localTabSinglePreview },
                        React.createElement("img", { className: styles.localTabSinglePreviewImage, src: filePreview, alt: filePickerResult.fileName }),
                        React.createElement("span", null, fileName)),
                React.createElement("div", null,
                    React.createElement("label", { className: styles.localTabFilename }, (!filePreview && fileName ? fileName : ""))),
                React.createElement("label", { className: styles.localTabLabel, htmlFor: "fileInput" }, (fileName ? strings.ChangeFileLinkLabel : strings.ChooseFileLinkLabel))),
            React.createElement("div", { className: styles.actionButtonsContainer },
                React.createElement("div", { className: styles.actionButtons },
                    React.createElement(PrimaryButton, { disabled: !filePickerResult, onClick: () => this._handleSave(), className: styles.actionButton }, strings.AddFileButtonLabel),
                    React.createElement(DefaultButton, { onClick: () => this._handleClose(), className: styles.actionButton }, strings.CancelButtonLabel)))));
    }
}
//# sourceMappingURL=UploadFilePickerTab.js.map