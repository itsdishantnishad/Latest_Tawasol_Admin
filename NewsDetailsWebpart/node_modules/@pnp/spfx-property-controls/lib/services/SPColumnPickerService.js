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
import { Environment, EnvironmentType } from '@microsoft/sp-core-library';
import { PropertyFieldColumnPickerOrderBy } from '../propertyFields/columnPicker';
/**
 * Service implementation to get list & list items from current SharePoint site
 */
export class SPColumnPickerService {
    /**
     * Service constructor
     */
    constructor(_props, pageContext) {
        this.props = _props;
        this.context = pageContext;
    }
    /**
     * Gets the collection of column for a selected list
     */
    getColumns(displayHiddenColumns) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Environment.type === EnvironmentType.Local) {
                // If the running environment is local, load the data from the mock
                return this.getColumnsFromMock();
            }
            else {
                if (this.props.listId === undefined || this.props.listId === "") {
                    return this.getEmptyColumns();
                }
                const webAbsoluteUrl = this.props.webAbsoluteUrl ? this.props.webAbsoluteUrl : this.context.pageContext.web.absoluteUrl;
                // If the running environment is SharePoint, request the lists REST service
                let queryUrl = `${webAbsoluteUrl}/_api/lists(guid'${this.props.listId}')/Fields?$select=Title,Id,InternalName`;
                // Check if the orderBy property is provided
                if (this.props.orderBy !== null) {
                    queryUrl += '&$orderby=';
                    switch (this.props.orderBy) {
                        case PropertyFieldColumnPickerOrderBy.Id:
                            queryUrl += 'Id';
                            break;
                        case PropertyFieldColumnPickerOrderBy.Title:
                            queryUrl += 'Title';
                            break;
                    }
                    // Adds an OData Filter to the list
                    if (this.props.filter) {
                        if (displayHiddenColumns)
                            queryUrl += `&$filter=${encodeURIComponent(this.props.filter)}`;
                        else
                            queryUrl += `&$filter=Hidden eq false and ${encodeURIComponent(this.props.filter)}`;
                    }
                    else {
                        if (!displayHiddenColumns)
                            queryUrl += `&$filter=Hidden eq false`;
                    }
                    const response = yield this.context.spHttpClient.get(queryUrl, SPHttpClient.configurations.v1);
                    const columns = (yield response.json());
                    // Check if onColumnsRetrieved callback is defined
                    if (this.props.onColumnsRetrieved) {
                        //Call onColumnsRetrieved
                        const lr = this.props.onColumnsRetrieved(columns.value);
                        let output;
                        //Conditional checking to see of PromiseLike object or array
                        if (lr instanceof Array) {
                            output = lr;
                        }
                        else {
                            output = yield lr;
                        }
                        columns.value = output;
                    }
                    return columns;
                }
            }
        });
    }
    /**
     * Returns an empty column for when a list isn't selected
     */
    getEmptyColumns() {
        return new Promise((resolve) => {
            const listData = {
                value: []
            };
            resolve(listData);
        });
    }
    /**
     * Returns 3 fake SharePoint Columns for the Mock mode
     */
    getColumnsFromMock() {
        return new Promise((resolve) => {
            const listData = {
                value: [
                    { Title: 'Mock Column One', Id: '3bacd87b-b7df-439a-bb20-4d4d13523431', InternalName: 'MockColumnOne' },
                    { Title: 'Mock Column Two', Id: '5e37c820-e2cb-49f7-93f5-14003c07788b', InternalName: 'Mock_x0020_Column_x0020_Two' },
                    { Title: 'Mock Column Three', Id: '5fda7245-c4a7-403b-adc1-8bd8b481b4ee', InternalName: 'MockColumnThree' }
                ]
            };
            resolve(listData);
        });
    }
}
//# sourceMappingURL=SPColumnPickerService.js.map