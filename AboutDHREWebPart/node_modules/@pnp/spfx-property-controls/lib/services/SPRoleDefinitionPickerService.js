var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SPHttpClient } from '@microsoft/sp-http';
/**
 * Service implementation to get list & list items from current SharePoint site
 */
export class SPRoleDefinitionPickerService {
    /**
     * Service constructor
     */
    constructor(_props, pageContext) {
        this.props = _props;
        this.context = pageContext;
    }
    /**
     * Gets the collection of view for a selected list
     */
    getRoleDefinitions() {
        return __awaiter(this, void 0, void 0, function* () {
            const webAbsoluteUrl = this.props.webAbsoluteUrl ? this.props.webAbsoluteUrl : this.context.pageContext.web.absoluteUrl;
            // If the running environment is SharePoint, request the lists REST service
            const queryUrl = `${webAbsoluteUrl}/_api/web/RoleDefinitions`;
            const response = yield this.context.spHttpClient.get(queryUrl, SPHttpClient.configurations.v1, {
                headers: [
                    ['accept', 'application/json;odata=nometadata'],
                    ['odata-version', '']
                ]
            });
            const roleDefinitions = (yield response.json());
            // Check if onViewsRetrieved callback is defined
            if (this.props.onRoleDefinitionsRetrieved) {
                //Call onViewsRetrieved
                const lr = this.props.onRoleDefinitionsRetrieved(roleDefinitions.value);
                let output;
                //Conditional checking to see of PromiseLike object or array
                if (lr instanceof Array) {
                    output = lr;
                }
                else {
                    output = yield lr;
                }
                roleDefinitions.value = output;
            }
            return roleDefinitions;
        });
    }
    /**
     * Returns an empty view for when a list isn't selected
     */
    getEmptyViews() {
        return new Promise((resolve) => {
            const roleDefinitionData = {
                value: []
            };
            resolve(roleDefinitionData);
        });
    }
}
//# sourceMappingURL=SPRoleDefinitionPickerService.js.map