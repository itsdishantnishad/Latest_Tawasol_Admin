import * as React from 'react';
import * as ReactDom from 'react-dom';
import { PropertyPaneFieldType } from '@microsoft/sp-property-pane';
import PropertyFieldTermPickerHost from './PropertyFieldTermPickerHost';
import SPTermStorePickerService from '../../services/SPTermStorePickerService';
/**
 * Represents a PropertyFieldTermPicker object.
 * NOTE: INTERNAL USE ONLY
 * @internal
 */
export class PropertyFieldTermPickerBuilder {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onPropertyChange(propertyPath, oldValue, newValue) { }
    /**
     * Constructor method
     */
    constructor(_targetProperty, _properties) {
        // Properties defined by IPropertyPaneField
        this.type = PropertyPaneFieldType.Custom;
        this.allowMultipleSelections = false;
        this.initialValues = [];
        this.excludeSystemGroup = false;
        this.limitByGroupNameOrID = null;
        this.limitByTermsetNameOrID = null;
        this.areTermsSelectable = true;
        this.disabled = false;
        this.deferredValidationTime = 200;
        this.render = this.render.bind(this);
        this.targetProperty = _targetProperty;
        this.properties = _properties;
        this.properties.onDispose = this.dispose;
        this.properties.onRender = this.render;
        this.label = _properties.label;
        this.context = _properties.context;
        this.onPropertyChange = _properties.onPropertyChange;
        this.customProperties = _properties.properties;
        this.key = _properties.key;
        this.onGetErrorMessage = _properties.onGetErrorMessage;
        this.panelTitle = _properties.panelTitle;
        this.limitByGroupNameOrID = _properties.limitByGroupNameOrID;
        this.limitByTermsetNameOrID = _properties.limitByTermsetNameOrID;
        this.hideTermStoreName = _properties.hideTermStoreName;
        this.isTermSetSelectable = _properties.isTermSetSelectable;
        this.areTermsHidden = _properties.areTermsHidden;
        this.disabledTermIds = _properties.disabledTermIds;
        this.termService = _properties.termService;
        this.anchorId = _properties.anchorId;
        if (_properties.disabled === true) {
            this.disabled = _properties.disabled;
        }
        if (_properties.deferredValidationTime) {
            this.deferredValidationTime = _properties.deferredValidationTime;
        }
        if (typeof _properties.allowMultipleSelections !== 'undefined') {
            this.allowMultipleSelections = _properties.allowMultipleSelections;
        }
        if (typeof _properties.initialValues !== 'undefined') {
            this.initialValues = _properties.initialValues;
        }
        if (typeof _properties.excludeSystemGroup !== 'undefined') {
            this.excludeSystemGroup = _properties.excludeSystemGroup;
        }
        if (typeof _properties.areTermsSelectable !== 'undefined') {
            this.areTermsSelectable = _properties.areTermsSelectable;
        }
    }
    /**
     * Renders the SPListPicker field content
     */
    render(elem, ctx, changeCallback) {
        // Construct the JSX properties
        const element = React.createElement(PropertyFieldTermPickerHost, {
            label: this.label,
            targetProperty: this.targetProperty,
            panelTitle: this.panelTitle,
            allowMultipleSelections: this.allowMultipleSelections,
            initialValues: this.initialValues,
            excludeSystemGroup: this.excludeSystemGroup,
            limitByGroupNameOrID: this.limitByGroupNameOrID,
            limitByTermsetNameOrID: this.limitByTermsetNameOrID,
            hideTermStoreName: this.hideTermStoreName,
            isTermSetSelectable: this.isTermSetSelectable,
            areTermsSelectable: this.areTermsSelectable,
            areTermsHidden: this.areTermsHidden,
            disabledTermIds: this.disabledTermIds,
            context: this.context,
            onDispose: this.dispose,
            onRender: this.render,
            onChange: changeCallback,
            onPropertyChange: this.onPropertyChange,
            properties: this.customProperties,
            key: this.key,
            disabled: this.disabled,
            onGetErrorMessage: this.onGetErrorMessage,
            deferredValidationTime: this.deferredValidationTime,
            termService: this.termService,
            anchorId: this.anchorId
        });
        // Calls the REACT content generator
        ReactDom.render(element, elem);
    }
    /**
     * Disposes the current object
     */
    dispose(elem) {
        // no-op;
    }
}
/**
 * Helper method to create a SPList Picker on the PropertyPane.
 * @param targetProperty - Target property the SharePoint list picker is associated to.
 * @param properties - Strongly typed SPList Picker properties.
 */
export function PropertyFieldTermPicker(targetProperty, properties) {
    // Calls the PropertyFieldTermPicker builder object
    // This object will simulate a PropertyFieldCustom to manage his rendering process
    return new PropertyFieldTermPickerBuilder(targetProperty, Object.assign(Object.assign({}, properties), { targetProperty: targetProperty, onRender: null, onDispose: null, termService: new SPTermStorePickerService(properties, properties.context) }));
}
//# sourceMappingURL=PropertyFieldTermPicker.js.map