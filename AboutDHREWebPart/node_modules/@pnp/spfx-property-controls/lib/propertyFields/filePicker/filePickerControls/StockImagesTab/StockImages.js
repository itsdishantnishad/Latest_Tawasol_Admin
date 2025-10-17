import * as React from 'react';
import styles from './StockImages.module.scss';
import { GeneralHelper } from '../../../../helpers/GeneralHelper';
export class StockImages extends React.Component {
    constructor() {
        super(...arguments);
        this._handleImageIframeEvent = (event) => {
            if (!event || !event.origin || event.origin.indexOf("https://hubblecontent.osi.office.net") !== 0) {
                return;
            }
            const eventData = JSON.parse(event.data);
            if (eventData.MessageId === "AddItem") {
                this._handleSave(eventData);
            }
            else if (eventData.MessageId === "CancelDialog") {
                this._handleClose();
            }
        };
        /**
         * Called when user saves
         */
        this._handleSave = (event) => {
            let filePickerResult = null;
            const cdnFileInfo = event.Values && event.Values.length > 0 ? event.Values[0] : null;
            if (cdnFileInfo) {
                filePickerResult = {
                    downloadFileContent: () => { return this.props.fileSearchService.downloadBingContent(cdnFileInfo.sourceUrl, GeneralHelper.getFileNameFromUrl(GeneralHelper.getFileNameFromUrl(cdnFileInfo.sourceUrl))); },
                    fileAbsoluteUrl: cdnFileInfo.sourceUrl,
                    fileName: GeneralHelper.getFileNameFromUrl(cdnFileInfo.sourceUrl),
                    fileNameWithoutExtension: GeneralHelper.getFileNameWithoutExtension(cdnFileInfo.sourceUrl)
                };
            }
            this.props.onSave(filePickerResult);
        };
        /**
         * Called when user closes tab
         */
        this._handleClose = () => {
            this.props.onClose();
        };
    }
    componentDidMount() {
        window.addEventListener("message", this._handleImageIframeEvent);
    }
    componentWillUnmount() {
        window.removeEventListener("message", this._handleImageIframeEvent);
    }
    render() {
        const { language } = this.props;
        const themesColor = `&themecolors=${encodeURIComponent(this.getCurrentThemeConfiguration())}`;
        const contentPickerUrl = `https://hubblecontent.osi.office.net/contentsvc/m365contentpicker/index.html?p=3&app=1001&aud=prod&channel=devmain&setlang=${language}&msel=0&env=prod&premium=1${themesColor}`;
        return (React.createElement("div", { className: styles.tabContainer },
            React.createElement("div", { className: styles.tab },
                React.createElement("div", { className: styles.stockImagesPickerContainer },
                    React.createElement("iframe", { className: styles.stockImagesPicker, role: "application", id: "stockImagesIFrame", src: contentPickerUrl })))));
    }
    getCurrentThemeConfiguration() {
        /* eslint-disable dot-notation */
        if (!window["__themeState__"] || !window["__themeState__"].theme) {
            return "";
        }
        const primaryColor = window["__themeState__"].theme["themePrimary"];
        const textColor = window["__themeState__"].theme["primaryText"];
        const primaryBackground = window["__themeState__"].theme["bodyBackground"];
        const neutralLighter = window["__themeState__"].theme["neutralLighter"];
        /* eslint-enable dot-notation */
        const theme = `{"primaryColor":"${primaryColor}","textColor":"${textColor}","backgroundColor":"${primaryBackground}","neutralLighterColor":"${neutralLighter}"}`;
        return theme;
    }
}
//# sourceMappingURL=StockImages.js.map