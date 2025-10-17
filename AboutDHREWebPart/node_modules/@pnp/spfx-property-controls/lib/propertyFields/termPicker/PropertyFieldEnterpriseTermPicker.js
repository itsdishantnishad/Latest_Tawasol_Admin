import { PropertyFieldTermPickerBuilder } from "./PropertyFieldTermPicker";
import PnPTermStorePickerService from "../../services/PnPTermStorePickerService";
/**
 * Helper method to create a Enterprise Term Picker on the PropertyPane.
 * @param targetProperty - Target property the Term Picker is associated to.
 * @param properties - Strongly typed Term Picker Picker properties.
 */
export function PropertyFieldEnterpriseTermPicker(targetProperty, properties) {
    // Calls the PropertyFieldEnterpriseTermPicker builder object
    // This object will simulate a PropertyFieldCustom to manage its rendering process
    const termPickerInternalProps = properties;
    return new PropertyFieldTermPickerBuilder(targetProperty, Object.assign(Object.assign({}, termPickerInternalProps), { targetProperty: targetProperty, onRender: null, onDispose: null, termService: new PnPTermStorePickerService(properties, properties.context) }));
}
//# sourceMappingURL=PropertyFieldEnterpriseTermPicker.js.map