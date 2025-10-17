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
import { PropertyFieldViewPickerOrderBy } from '../propertyFields/viewPicker';
/**
 * Service implementation to get list & list items from current SharePoint site
 */
export class SPViewPickerService {
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
    getViews() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.props.listId === undefined || this.props.listId === "") {
                return this.getEmptyViews();
            }
            const webAbsoluteUrl = this.props.webAbsoluteUrl ? this.props.webAbsoluteUrl : this.context.pageContext.web.absoluteUrl;
            // If the running environment is SharePoint, request the lists REST service
            let queryUrl = `${webAbsoluteUrl}/_api/lists(guid'${this.props.listId}')/Views?$select=Title,Id`;
            // Check if the orderBy property is provided
            if (this.props.orderBy !== null) {
                queryUrl += '&$orderby=';
                switch (this.props.orderBy) {
                    case PropertyFieldViewPickerOrderBy.Id:
                        queryUrl += 'Id';
                        break;
                    case PropertyFieldViewPickerOrderBy.Title:
                        queryUrl += 'Title';
                        break;
                }
                // Adds an OData Filter to the list
                if (this.props.filter) {
                    queryUrl += `&$filter=${encodeURIComponent(this.props.filter)}`;
                }
                const response = yield this.context.spHttpClient.get(queryUrl, SPHttpClient.configurations.v1);
                const views = (yield response.json());
                // Check if onViewsRetrieved callback is defined
                if (this.props.onViewsRetrieved) {
                    //Call onViewsRetrieved
                    const lr = this.props.onViewsRetrieved(views.value);
                    let output;
                    //Conditional checking to see of PromiseLike object or array
                    if (lr instanceof Array) {
                        output = lr;
                    }
                    else {
                        output = yield lr;
                    }
                    views.value = output;
                }
                return views;
            }
        });
    }
    /**
     * Returns an empty view for when a list isn't selected
     */
    getEmptyViews() {
        return new Promise((resolve) => {
            const listData = {
                value: []
            };
            resolve(listData);
        });
    }
}
//# sourceMappingURL=SPViewPickerService.js.map