var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as React from 'react';
import { GeneralHelper } from '../../../../helpers/GeneralHelper';
import { PrimaryButton, DefaultButton, TextField, css } from '@fluentui/react';
import * as strings from 'PropertyControlStrings';
import styles from './LinkFilePickerTab.module.scss';
export default class LinkFilePickerTab extends React.Component {
    constructor(props) {
        super(props);
        /**
         * Called as user types in a new value
         */
        this._handleChange = (fileUrl) => {
            const filePickerResult = fileUrl && this._isUrl(fileUrl)
                ? {
                    fileAbsoluteUrl: fileUrl,
                    fileName: GeneralHelper.getFileNameFromUrl(fileUrl),
                    fileNameWithoutExtension: GeneralHelper.getFileNameWithoutExtension(fileUrl),
                    downloadFileContent: () => {
                        return this.props.fileSearchService.downloadBingContent(fileUrl, GeneralHelper.getFileNameFromUrl(fileUrl));
                    },
                }
                : null;
            this.setState({
                filePickerResult,
            });
        };
        /**
         * Verifies the url that was typed in
         * @param value
         */
        this._getErrorMessagePromise = (value) => __awaiter(this, void 0, void 0, function* () {
            // DOn't give an error for blank or placeholder value, but don't make it a valid entry either
            if (value === undefined || value === 'https://') {
                this.setState({ isValid: false });
                return '';
            }
            // Make sure that user is typing a valid URL format
            if (!this._isUrl(value)) {
                this.setState({ isValid: false });
                return '';
            }
            // If we don't allow external links, verify that we're in the same domain
            if (!this.props.allowExternalLinks && !this._isSameDomain(value)) {
                this.setState({ isValid: false });
                return strings.NoExternalLinksValidationMessage;
            }
            if (!this.props.checkIfFileExists) {
                this.setState({ isValid: true });
                return '';
            }
            const fileExists = yield this.props.fileSearchService.checkFileExists(value);
            this.setState({ isValid: fileExists });
            const strResult = fileExists ? '' : strings.ProvidedValueIsInvalid;
            return strResult;
        });
        /**
         * Handles when user saves
         */
        this._handleSave = () => {
            this.props.onSave(this.state.filePickerResult);
        };
        /**
         * HAndles when user closes without saving
         */
        this._handleClose = () => {
            this.props.onClose();
        };
        /**
         * Is this a URL ?
         * (insert guy holding a butterfly meme)
         */
        this._isUrl = (fileUrl) => {
            try {
                const myURL = new URL(fileUrl.toLowerCase());
                return myURL.host !== undefined;
            }
            catch (_a) {
                return false;
            }
        };
        this._isSameDomain = (fileUrl) => {
            const siteUrl = this.props.context.pageContext.web.absoluteUrl;
            return (GeneralHelper.getAbsoluteDomainUrl(siteUrl) ===
                GeneralHelper.getAbsoluteDomainUrl(fileUrl));
        };
        this.state = { isValid: false };
    }
    render() {
        const fileUrl = this.state.filePickerResult
            ? this.state.filePickerResult.fileAbsoluteUrl
            : null;
        return (React.createElement("div", { className: styles.tabContainer },
            React.createElement("div", { className: styles.tabHeaderContainer },
                React.createElement("h2", { className: styles.tabHeader }, strings.LinkHeader)),
            React.createElement("div", { className: css(styles.tab, styles.tabOffset) },
                React.createElement(TextField, { multiline: true, required: true, resizable: false, deferredValidationTime: 300, className: styles.linkTextField, label: this.props.allowExternalLinks
                        ? strings.ExternalLinkFileInstructions
                        : strings.LinkFileInstructions, ariaLabel: this.props.allowExternalLinks
                        ? strings.ExternalLinkFileInstructions
                        : strings.LinkFileInstructions, defaultValue: 'https://', onGetErrorMessage: (value) => this._getErrorMessagePromise(value), autoAdjustHeight: false, underlined: false, borderless: false, validateOnFocusIn: false, validateOnFocusOut: false, validateOnLoad: true, value: fileUrl, onChange: (e, newValue) => this._handleChange(newValue) })),
            React.createElement("div", { className: styles.actionButtonsContainer },
                React.createElement("div", { className: styles.actionButtons },
                    React.createElement(PrimaryButton, { disabled: !this.state.isValid, onClick: () => this._handleSave(), className: styles.actionButton }, strings.OpenButtonLabel),
                    React.createElement(DefaultButton, { onClick: () => this._handleClose(), className: styles.actionButton }, strings.CancelButtonLabel)))));
    }
}
//# sourceMappingURL=LinkFilePickerTab.js.map