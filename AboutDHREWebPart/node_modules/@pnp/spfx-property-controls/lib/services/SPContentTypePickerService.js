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
import { PropertyFieldContentTypeOrderBy } from '../propertyFields/contentTypePicker';
/**
 * Service implementation to get Content Types from SharePoint site or selected SharePoint List
 */
export class SPContentTypePickerService {
    /**
     * Service constructor
     */
    constructor(_props, pageContext) {
        this.props = _props;
        this.context = pageContext;
    }
    /**
     * Gets the collection of ContentTypes from SharePoint site or selected SharePoint List
     */
    getContentTypes() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.context.pageContext.web.absoluteUrl === undefined || this.context.pageContext.web.absoluteUrl === "") {
                return this.getEmptycontentTypes();
            }
            const webAbsoluteUrl = this.props.webAbsoluteUrl ? this.props.webAbsoluteUrl : this.context.pageContext.web.absoluteUrl;
            // If the listId is selected, then get the contentTypes from the list or get the contentTypes from site level
            let queryUrl = this.props.listId ? `${webAbsoluteUrl}/_api/lists(guid'${this.props.listId}')/ContentTypes?$select=Name,Id` : `${webAbsoluteUrl}/_api/web/ContentTypes?$select=Name,Id`;
            // Check if the orderBy property is provided
            if (this.props.orderBy !== null || this.props.orderBy !== undefined) {
                queryUrl += '&$orderby=';
                switch (this.props.orderBy) {
                    case PropertyFieldContentTypeOrderBy.Id:
                        queryUrl += 'Id';
                        break;
                    case PropertyFieldContentTypeOrderBy.Name:
                        queryUrl += 'Name';
                        break;
                }
                // Adds an OData Filter to the list
                if (this.props.filter) {
                    queryUrl += `&$filter=${encodeURIComponent(this.props.filter)}`;
                }
                const response = yield this.context.spHttpClient.get(queryUrl, SPHttpClient.configurations.v1);
                const views = (yield response.json());
                // Check if onContentTypesRetrieved callback is defined
                if (this.props.onContentTypesRetrieved) {
                    //Call onContentTypesRetrieved
                    const lr = this.props.onContentTypesRetrieved(views.value);
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
     * Returns an empty contentType for when no selection is done
     */
    getEmptycontentTypes() {
        return new Promise((resolve) => {
            const listData = {
                value: []
            };
            resolve(listData);
        });
    }
}
//# sourceMappingURL=SPContentTypePickerService.js.map