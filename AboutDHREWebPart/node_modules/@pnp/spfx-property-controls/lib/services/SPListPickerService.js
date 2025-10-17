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
import { PropertyFieldListPickerOrderBy } from '../propertyFields/listPicker/IPropertyFieldListPicker';
/**
 * Service implementation to get list & list items from current SharePoint site
 */
export default class SPListPickerService {
    /**
     * Service constructor
     */
    constructor(_props, pageContext) {
        this.props = _props;
        this.context = pageContext;
    }
    /**
     * Gets the collection of libs in the current SharePoint site, or target site if specified by webRelativeUrl
     */
    getLibs() {
        return __awaiter(this, void 0, void 0, function* () {
            // use the web relative url if provided, otherwise default to current SharePoint site
            const webAbsoluteUrl = this.props.webAbsoluteUrl
                ? this.props.webAbsoluteUrl
                : this.context.pageContext.web.absoluteUrl;
            // If the running environment is SharePoint, request the lists REST service
            let queryUrl;
            if (this.props.contentTypeId) {
                queryUrl = `${webAbsoluteUrl}/_api/lists?$select=Title,id,BaseTemplate,RootFolder/ServerRelativeUrl,ContentTypes/StringId,ContentTypes/Name&$expand=RootFolder&$expand=ContentTypes`;
            }
            else {
                queryUrl = `${webAbsoluteUrl}/_api/lists?$select=Title,id,BaseTemplate,RootFolder/ServerRelativeUrl&$expand=RootFolder`;
            }
            // Check if the orderBy property is provided
            if (this.props.orderBy !== null) {
                queryUrl += '&$orderby=';
                switch (this.props.orderBy) {
                    case PropertyFieldListPickerOrderBy.Id:
                        queryUrl += 'Id';
                        break;
                    case PropertyFieldListPickerOrderBy.Title:
                        queryUrl += 'Title';
                        break;
                }
            }
            // Adds an OData Filter to the list
            if (this.props.filter) {
                queryUrl += `&$filter=${encodeURIComponent(this.props.filter)}`;
            }
            // Check if the list have get filtered based on the list base template type
            else if ((this.props.baseTemplate !== null && this.props.baseTemplate) || Array.isArray(this.props.baseTemplate)) {
                if (Array.isArray(this.props.baseTemplate)) {
                    queryUrl += '&$filter=(';
                    queryUrl += this.props.baseTemplate.map(temp => `(BaseTemplate%20eq%20${temp})`).join('%20or%20');
                    queryUrl += ')';
                }
                else {
                    queryUrl += '&$filter=BaseTemplate%20eq%20';
                    queryUrl += this.props.baseTemplate;
                }
                // Check if you also want to exclude hidden list in the list
                if (this.props.includeHidden === false) {
                    queryUrl += '%20and%20Hidden%20eq%20false';
                }
            }
            else {
                if (this.props.includeHidden === false) {
                    queryUrl += '&$filter=Hidden%20eq%20false';
                }
            }
            const response = yield this.context.spHttpClient.get(queryUrl, SPHttpClient.configurations.v1);
            let lists = (yield response.json());
            //remove unwanted contenttypes
            if (this.props.contentTypeId) {
                const testct = this.props.contentTypeId.toUpperCase();
                lists.value = lists.value.filter((l) => {
                    for (const ct of l.ContentTypes) {
                        const ctid = ct.StringId.toUpperCase();
                        if (ctid.substring(0, testct.length) === testct) {
                            return true;
                        }
                    }
                    return false;
                });
            }
            // Check if onListsRetrieved callback is defined
            if (this.props.onListsRetrieved) {
                //Call onListsRetrieved
                const lr = this.props.onListsRetrieved(lists.value);
                let output;
                //Conditional checking to see of PromiseLike object or array
                if (lr instanceof Array) {
                    output = lr;
                }
                else {
                    output = yield lr;
                }
                lists = {
                    value: output,
                };
            }
            return lists;
        });
    }
}
//# sourceMappingURL=SPListPickerService.js.map