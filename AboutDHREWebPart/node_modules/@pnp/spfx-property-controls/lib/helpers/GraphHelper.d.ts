import type { MSGraphClientV3 } from '@microsoft/sp-http';
import { BaseComponentContext } from '@microsoft/sp-component-base';
export interface IGraphBatchRequestItem {
    id: string;
    method: 'GET' | 'POST';
    url: string;
    dependsOn?: string[];
    body?: {
        [key: string]: string;
    };
}
export interface IGraphBatchResponseItem {
    id: string;
    status: number;
    body: any;
}
export declare function batch(batchRequestItems: IGraphBatchRequestItem[], version: string, context: BaseComponentContext): Promise<IGraphBatchResponseItem[]>;
export declare function getGraphClient(context: BaseComponentContext): Promise<MSGraphClientV3>;
//# sourceMappingURL=GraphHelper.d.ts.map