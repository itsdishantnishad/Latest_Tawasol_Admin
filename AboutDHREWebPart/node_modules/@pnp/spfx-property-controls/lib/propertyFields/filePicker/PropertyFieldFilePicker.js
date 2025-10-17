import * as React from 'react';
import * as ReactDom from 'react-dom';
import { PropertyPaneFieldType } from '@microsoft/sp-property-pane';
import PropertyPaneFilePickerHost from './PropertyFieldFilePickerHost';
/**
 * Represents a PropertyFieldFilePicker object
 */
class PropertyFieldFilePickerBuilder {
    constructor(_targetProperty, _properties) {
        this.type = PropertyPaneFieldType.Custom;
        this.disabled = false;
        this.required = false;
        this.storeLastActiveTab = true;
        this.render = (elem, ctx, changeCallback) => {
            const element = React.createElement(PropertyPaneFilePickerHost, {
                label: this.label,
                buttonLabel: this.buttonLabel,
                context: this.context,
                buttonIcon: this.buttonIcon,
                buttonClassName: this.buttonClassName,
                panelClassName: this.panelClassName,
                required: this.required,
                bingAPIKey: this.bingAPIKey,
                onSave: this.onSave,
                onChanged: this.onChanged,
                onCancel: this.onCancel,
                itemsCountQueryLimit: this.itemsCountQueryLimit,
                accepts: this.accepts,
                filePickerResult: this.filePickerResult,
                hideWebSearchTab: this.hideWebSearchTab,
                hideRecentTab: this.hideRecentTab,
                hideSiteFilesTab: this.hideSiteFilesTab,
                hideLocalUploadTab: this.hideLocalUploadTab,
                hideLinkUploadTab: this.hideLinkUploadTab,
                hideOrganisationalAssetTab: this.hideOrganisationalAssetTab,
                hideOneDriveTab: this.hideOneDriveTab,
                storeLastActiveTab: this.storeLastActiveTab,
                defaultSelectedTab: this.defaultSelectedTab,
                hideStockImages: this.hideStockImages,
                targetProperty: this.targetProperty,
                allowExternalLinks: this.allowExternalLinks,
                checkIfFileExists: this.checkIfFileExists,
                includePageLibraries: this.includePageLibraries,
                properties: this.customProperties,
                key: this.key,
                disabled: this.disabled,
                onDispose: this.dispose,
                onRender: this.render,
                onChange: changeCallback,
                onPropertyChange: this.onPropertyChange
            });
            ReactDom.render(element, elem);
        };
        this.targetProperty = _targetProperty;
        this.properties = _properties;
        this.properties.onDispose = this.dispose;
        this.properties.onRender = this.render;
        this.label = _properties.label;
        this.buttonLabel = _properties.buttonLabel;
        this.context = _properties.context;
        this.buttonIcon = _properties.buttonIcon;
        this.buttonClassName = _properties.buttonClassName;
        this.panelClassName = _properties.panelClassName;
        this.accepts = _properties.accepts;
        this.filePickerResult = _properties.filePickerResult;
        this.required = _properties.required;
        this.bingAPIKey = _properties.bingAPIKey;
        this.onSave = _properties.onSave;
        this.onChanged = _properties.onChanged;
        this.onCancel = _properties.onCancel;
        this.itemsCountQueryLimit = _properties.itemsCountQueryLimit !== undefined ? _properties.itemsCountQueryLimit : 100;
        this.hideWebSearchTab = _properties.hideWebSearchTab !== undefined ? _properties.hideWebSearchTab : true;
        this.hideRecentTab = _properties.hideRecentTab !== undefined ? _properties.hideRecentTab : false;
        this.hideSiteFilesTab = _properties.hideSiteFilesTab !== undefined ? _properties.hideSiteFilesTab : false;
        this.hideLocalUploadTab = _properties.hideLocalUploadTab !== undefined ? _properties.hideLocalUploadTab : false;
        this.hideLinkUploadTab = _properties.hideLinkUploadTab !== undefined ? _properties.hideLinkUploadTab : false;
        this.hideOrganisationalAssetTab = _properties.hideOrganisationalAssetTab !== undefined ? _properties.hideOrganisationalAssetTab : false;
        this.hideOneDriveTab = _properties.hideOneDriveTab !== undefined ? _properties.hideOneDriveTab : false;
        this.storeLastActiveTab = _properties.storeLastActiveTab !== undefined ? _properties.storeLastActiveTab : true;
        this.defaultSelectedTab = _properties.defaultSelectedTab;
        this.hideStockImages = _properties.hideStockImages !== undefined ? _properties.hideStockImages : false;
        this.allowExternalLinks = _properties.allowExternalLinks !== undefined ? _properties.allowExternalLinks : true;
        this.checkIfFileExists = _properties.checkIfFileExists !== undefined ? _properties.checkIfFileExists : true;
        this.includePageLibraries = _properties.includePageLibraries !== undefined ? _properties.includePageLibraries : false;
        this.onPropertyChange = _properties.onPropertyChange;
        this.customProperties = _properties.properties;
        this.key = _properties.key;
        this.context = _properties.context;
        if (_properties.disabled === true) {
            this.disabled = _properties.disabled;
        }
    }
    dispose(elem) {
        ReactDom.unmountComponentAtNode(elem);
    }
    onPropertyChange(propertyPath, oldValue, newValue) {
        // no-op;
    }
}
/**
 * Helper method to create a File Picker component on the PropertyPane.
 * @param targetProperty - Target property the File Picker component is associated to.
 * @param properties - Strongly typed File Picker component properties.
 */
export function PropertyFieldFilePicker(targetProperty, properties) {
    return new PropertyFieldFilePickerBuilder(targetProperty, Object.assign(Object.assign({}, properties), { targetProperty: targetProperty, onRender: null, onDispose: null }));
}
//# sourceMappingURL=PropertyFieldFilePicker.js.map