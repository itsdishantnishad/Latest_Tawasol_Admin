import './String.extensions';
import * as _ from '@microsoft/sp-lodash-subset';
import * as strings from 'PropertyControlStrings';
export const IMG_SUPPORTED_EXTENSIONS = ".gif,.jpg,.jpeg,.bmp,.dib,.tif,.tiff,.ico,.png,.jxr,.svg";
/**
 * Helper with general methods to simplify some routines
 */
export class GeneralHelper {
    /**
     * Trims slash at the end of URL if needed
     * @param url URL
     */
    static trimSlash(url) {
        if (url.lastIndexOf('/') === url.length - 1)
            return url.slice(0, -1);
        return url;
    }
    /**
     * Encodes text
     * @param text text to encode
     */
    static encodeText(text) {
        const n = /[<>&'"\\]/g;
        return text ? text.replace(n, this._getEncodedChar) : '';
    }
    /**
     * Copy of Microsoft's GetRelativeDateTimeString from SP.dateTimeUtil
     */
    static getRelativeDateTimeString(format) {
        const formatParts = format.split('|');
        let result = null;
        let placeholdersString = null;
        if (formatParts[0] === '0')
            return format.substring(2);
        const isFuture = formatParts[1] === '1';
        const formatType = formatParts[2];
        const timeString = formatParts.length >= 4 ? formatParts[3] : null;
        const dayString = formatParts.length >= 5 ? formatParts[4] : null;
        switch (formatType) {
            case '1':
                result = isFuture ? strings.DateTime.L_RelativeDateTime_AFewSecondsFuture : strings.DateTime.L_RelativeDateTime_AFewSeconds;
                break;
            case '2':
                result = isFuture ? strings.DateTime.L_RelativeDateTime_AboutAMinuteFuture : strings.DateTime.L_RelativeDateTime_AboutAMinute;
                break;
            case '3':
                placeholdersString = this.getLocalizedCountValue(isFuture ? strings.DateTime.L_RelativeDateTime_XMinutesFuture : strings.DateTime.L_RelativeDateTime_XMinutes, isFuture ? strings.DateTime.L_RelativeDateTime_XMinutesFutureIntervals : strings.DateTime.L_RelativeDateTime_XMinutesIntervals, Number(timeString));
                break;
            case '4':
                result = isFuture ? strings.DateTime.L_RelativeDateTime_AboutAnHourFuture : strings.DateTime.L_RelativeDateTime_AboutAnHour;
                break;
            case '5':
                if (timeString === null) {
                    result = isFuture ? strings.DateTime.L_RelativeDateTime_Tomorrow : strings.DateTime.L_RelativeDateTime_Yesterday;
                }
                else {
                    placeholdersString = isFuture ? strings.DateTime.L_RelativeDateTime_TomorrowAndTime : strings.DateTime.L_RelativeDateTime_YesterdayAndTime;
                }
                break;
            case '6':
                placeholdersString = this.getLocalizedCountValue(isFuture ? strings.DateTime.L_RelativeDateTime_XHoursFuture : strings.DateTime.L_RelativeDateTime_XHours, isFuture ? strings.DateTime.L_RelativeDateTime_XHoursFutureIntervals : strings.DateTime.L_RelativeDateTime_XHoursIntervals, Number(timeString));
                break;
            case '7':
                if (dayString === null) {
                    result = timeString;
                }
                else {
                    placeholdersString = strings.DateTime.L_RelativeDateTime_DayAndTime;
                }
                break;
            case '8':
                placeholdersString = this.getLocalizedCountValue(isFuture ? strings.DateTime.L_RelativeDateTime_XDaysFuture : strings.DateTime.L_RelativeDateTime_XDays, isFuture ? strings.DateTime.L_RelativeDateTime_XDaysFutureIntervals : strings.DateTime.L_RelativeDateTime_XDaysIntervals, Number(timeString));
                break;
            case '9':
                result = strings.DateTime.L_RelativeDateTime_Today;
        }
        if (placeholdersString !== null) {
            result = placeholdersString.replace("{0}", timeString);
            if (dayString !== null) {
                result = result.replace("{1}", dayString);
            }
        }
        return result;
    }
    /**
     * Copy of Microsoft's GetLocalizedCountValue from SP.dateTimeUtil.
     * I've tried to rename all the vars to have meaningful names... but some were too unclear
     */
    static getLocalizedCountValue(format, first, second) {
        if (format === undefined || first === undefined || second === undefined)
            return null;
        let result = '';
        let a = -1;
        const firstOperandOptions = first.split('||');
        for (let firstOperandOptionsIdx = 0, firstOperandOptionsLen = firstOperandOptions.length; firstOperandOptionsIdx < firstOperandOptionsLen; firstOperandOptionsIdx++) {
            const firstOperandOption = firstOperandOptions[firstOperandOptionsIdx];
            if (firstOperandOption === null || firstOperandOption === '')
                continue;
            const optionParts = firstOperandOption.split(',');
            for (let optionPartsIdx = 0, optionPartsLen = optionParts.length; optionPartsIdx < optionPartsLen; optionPartsIdx++) {
                const optionPart = optionParts[optionPartsIdx];
                if (optionPart === null || optionPart === '')
                    continue;
                if (isNaN(optionPart.parseNumberInvariant())) {
                    const dashParts = optionPart.split('-');
                    if (dashParts === null || dashParts.length !== 2)
                        continue;
                    let j, n;
                    if (dashParts[0] === '')
                        j = 0;
                    else if (isNaN(dashParts[0].parseNumberInvariant()))
                        continue;
                    else
                        j = parseInt(dashParts[0]);
                    if (second >= j) {
                        if (dashParts[1] === '') {
                            a = firstOperandOptionsIdx;
                            break;
                        }
                        else if (isNaN(dashParts[1].parseNumberInvariant()))
                            continue;
                        else
                            n = parseInt(dashParts[1]);
                        if (second <= n) {
                            a = firstOperandOptionsIdx;
                            break;
                        }
                    }
                }
                else {
                    const p = parseInt(optionPart);
                    if (second === p) {
                        a = firstOperandOptionsIdx;
                        break;
                    }
                }
            }
            if (a !== -1)
                break;
        }
        if (a !== -1) {
            const e = format.split('||');
            if (e !== null && e[a] !== null && e[a] !== '')
                result = e[a];
        }
        return result;
    }
    /**
     * Extracts text from HTML strings without creating HTML elements
     * @param html HTML string
     */
    static getTextFromHTML(html) {
        let result = html;
        let oldResult = result;
        const tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';
        const tagOrComment = new RegExp('<(?:'
            // Comment body.
            + '!--(?:(?:-*[^->])*--+|-?)'
            // Special "raw text" elements whose content should be elided.
            + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
            + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
            // Regular name
            + '|/?[a-z]'
            + tagBody
            + ')>', 'gi');
        do {
            oldResult = result;
            result = result.replace(tagOrComment, '');
        } while (result !== oldResult);
        return result;
    }
    /**
     * Checks if value is defined (not null and not undefined)
     * @param value value
     */
    static isDefined(value) {
        return typeof value !== 'undefined' && value !== null;
    }
    /**
     * Creates Document element based on Xml string
     * @param xmlString XML string to parse
     */
    static parseXml(xmlString) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlString, 'text/xml');
        return xml;
    }
    /**
     * Returns absoulute domain URL.
     * @param url
     */
    static getAbsoluteDomainUrl(url) {
        if (url !== undefined) {
            const myURL = new URL(url.toLowerCase());
            return myURL.protocol + "//" + myURL.host;
        }
        else {
            return undefined;
        }
    }
    /**
     * To support IE11 that has no support for File constructor
     * @param blob
     */
    static getFileFromBlob(blob, fileName) {
        let result = null; // eslint-disable-line @typescript-eslint/no-explicit-any
        // IE 11 foesn't support File API, create a workaround to return Blob with fileName assigned.
        try {
            result = new File([blob], fileName);
        }
        catch (_a) {
            result = blob;
            result.fileName = fileName;
        }
        return result;
    }
    static formatBytes(bytes, decimals) {
        if (bytes === 0) {
            return strings.EmptyFileSize;
        }
        const k = 1024;
        const dm = decimals <= 0 ? 0 : decimals || 2;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + strings.SizeUnit[i];
    }
    /**
     * Returns file name without extension.
     */
    static getFileNameWithoutExtension(itemUrl) {
        const fileNameWithExtension = GeneralHelper.getFileNameFromUrl(itemUrl);
        const fileNameTokens = fileNameWithExtension.split(".");
        const fileName = fileNameTokens[0];
        return fileName;
    }
    /**
     * Returns file name with the extension
     */
    static getFileNameFromUrl(itemUrl) {
        const urlTokens = itemUrl.split("?");
        const url = urlTokens[0];
        const tokens = url.split("/");
        const fileNameWithExtension = tokens[tokens.length - 1];
        return fileNameWithExtension;
    }
    static isImage(fileName) {
        const acceptableExtensions = IMG_SUPPORTED_EXTENSIONS.split(",");
        const thisExtension = GeneralHelper.getFileExtension(fileName);
        return acceptableExtensions.indexOf(thisExtension) > -1;
    }
    /**
     * Returns extension of the file
     */
    static getFileExtension(fileName) {
        // Split the URL on the dots
        const splitFileName = fileName.toLowerCase().split('.');
        // Take the last value
        let extensionValue = splitFileName.pop();
        // Check if there are query string params in place
        if (extensionValue.indexOf('?') !== -1) {
            // Split the string on the question mark and return the first part
            const querySplit = extensionValue.split('?');
            extensionValue = querySplit[0];
        }
        return `.${extensionValue}`;
    }
    static _getEncodedChar(c) {
        const o = {
            "<": "&lt;",
            ">": "&gt;",
            "&": "&amp;",
            '"': "&quot;",
            "'": "&#39;",
            "\\": "&#92;"
        };
        return o[c];
    }
}
export const setPropertyValue = (properties, targetProperty, value) => {
    if (!properties) {
        return;
    }
    if (targetProperty.indexOf('.') === -1) { // simple prop
        properties[targetProperty] = value;
    }
    else {
        _.set(properties, targetProperty, value);
    }
};
export const getPropertyValue = (properties, targetProperty) => {
    if (!properties) {
        return undefined;
    }
    if (targetProperty.indexOf('.') === -1) {
        return properties[targetProperty];
    }
    return _.get(properties, targetProperty);
};
export const toRelativeUrl = (absoluteUrl) => {
    if (!absoluteUrl) {
        return '';
    }
    return new URL(absoluteUrl).pathname;
};
//# sourceMappingURL=GeneralHelper.js.map