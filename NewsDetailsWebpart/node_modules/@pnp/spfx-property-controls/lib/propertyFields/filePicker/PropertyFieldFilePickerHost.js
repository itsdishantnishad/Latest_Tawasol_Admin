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
import { IconButton } from '@fluentui/react';
import * as strings from 'PropertyControlStrings';
import { FilePicker } from './filePickerControls';
import styles from './PropertyFieldFilePickerHost.module.scss';
import { GeneralHelper, setPropertyValue } from '../../helpers/GeneralHelper';
import * as telemetry from '../../common/telemetry';
/**
 * Renders the control for PropertyFieldFilePicker component
 */
export default class PropertyFieldFilePickerHost extends React.Component {
    constructor(props) {
        super(props);
        this.handleFileSave = (filePickerResult) => __awaiter(this, void 0, void 0, function* () {
            this.props.onSave(filePickerResult);
            setPropertyValue(this.props.properties, this.props.targetProperty, filePickerResult);
            this.props.onPropertyChange(this.props.targetProperty, this.props.filePickerResult, filePickerResult);
            if (typeof this.props.onChange !== 'undefined' &&
                this.props.onChange !== null) {
                this.props.onChange(this.props.targetProperty, filePickerResult);
            }
        });
        this.handleFileChange = (filePickerResult) => __awaiter(this, void 0, void 0, function* () {
            this.props.onChanged(filePickerResult);
            if (typeof this.props.onChange !== 'undefined' &&
                this.props.onChange !== null) {
                this.props.onChange(this.props.targetProperty, filePickerResult);
            }
        });
        this.handleCancel = () => {
            if (this.props.onCancel) {
                this.props.onCancel();
            }
        };
        telemetry.track('PropertyFieldFilePicker', {
            disabled: props.disabled,
        });
    }
    render() {
        return (React.createElement("div", null,
            this.props.filePickerResult &&
                this.props.filePickerResult.fileAbsoluteUrl && (React.createElement("div", { className: styles.filePreview },
                GeneralHelper.isImage(this.props.filePickerResult.fileName) && (React.createElement("img", { className: styles.filePreviewImage, src: this.props.filePickerResult.fileAbsoluteUrl, alt: this.props.filePickerResult.fileName })),
                React.createElement("div", { className: styles.filePreviewDelete },
                    React.createElement(IconButton, { iconProps: { iconName: 'Delete' }, title: strings.DeleteSelectedFileButtonLabel, ariaLabel: strings.DeleteSelectedFileButtonLabel, onClick: () => {
                            this.handleFileSave(null)
                                .then(() => {
                                /* no-op; */
                            })
                                .catch(() => {
                                /* no-op; */
                            });
                        }, disabled: this.props.disabled }),
                    this.props.filePickerResult.fileName))),
            React.createElement(FilePicker, { required: this.props.required, disabled: this.props.disabled, bingAPIKey: this.props.bingAPIKey, accepts: this.props.accepts ? this.props.accepts : [], buttonIcon: this.props.buttonIcon ? this.props.buttonIcon : 'FileImage', onSave: (filePickerResult) => {
                    this.handleFileSave(filePickerResult)
                        .then(() => {
                        /* no-op; */
                    })
                        .catch(() => {
                        /* no-op; */
                    });
                }, onChanged: (filePickerResult) => {
                    this.handleFileChange(filePickerResult)
                        .then(() => {
                        /* no-op; */
                    })
                        .catch(() => {
                        /* no-op; */
                    });
                }, onCancel: this.handleCancel, context: this.props.context, filePickerResult: this.props.filePickerResult, buttonClassName: this.props.buttonClassName, buttonLabel: this.props.buttonLabel, label: this.props.label, key: this.props.key, itemsCountQueryLimit: this.props.itemsCountQueryLimit !== undefined
                    ? this.props.itemsCountQueryLimit
                    : 100, hideWebSearchTab: this.props.hideWebSearchTab !== undefined
                    ? this.props.hideWebSearchTab
                    : true, hideRecentTab: this.props.hideRecentTab !== undefined
                    ? this.props.hideRecentTab
                    : false, hideSiteFilesTab: this.props.hideSiteFilesTab !== undefined
                    ? this.props.hideSiteFilesTab
                    : false, hideLocalUploadTab: this.props.hideLocalUploadTab !== undefined
                    ? this.props.hideLocalUploadTab
                    : false, hideLinkUploadTab: this.props.hideLinkUploadTab !== undefined
                    ? this.props.hideLinkUploadTab
                    : false, hideOneDriveTab: this.props.hideOneDriveTab !== undefined
                    ? this.props.hideOneDriveTab
                    : false, hideOrganisationalAssetTab: this.props.hideOrganisationalAssetTab !== undefined
                    ? this.props.hideOrganisationalAssetTab
                    : false, hideStockImages: this.props.hideStockImages !== undefined
                    ? this.props.hideStockImages
                    : false, panelClassName: this.props.panelClassName, storeLastActiveTab: this.props.storeLastActiveTab, defaultSelectedTab: this.props.defaultSelectedTab, allowExternalLinks: this.props.allowExternalLinks, checkIfFileExists: this.props.checkIfFileExists, includePageLibraries: this.props.includePageLibraries })));
    }
}
//# sourceMappingURL=PropertyFieldFilePickerHost.js.map