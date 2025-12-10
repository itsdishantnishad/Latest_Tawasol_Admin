import { HttpClient } from '@microsoft/sp-http';

export interface SFApproval {
  workflowNumber: string;      // Maps to "number" from API
  taskTitle: string;            // Maps to "taskTitle" from API
  priority: string;             // Maps to "priority" from API
  dueDate: string;              // Maps to "dueDate" from API
  requestorName: string;        // Maps to "requestorName" from API
  workitemId: string;           // Maps to "workitemId" from API
  originSystem: string;         // Maps to "originSystem" from API
}

export interface TaskListApiResponse {
  approvals: SFApproval[];
}

export interface SalesforceServiceConfig {
  httpClient: HttpClient;
  salesforceBaseUrl: string;
}

export class SfApprovalService {
  private httpClient: HttpClient;
  private salesforceBaseUrl: string;

  constructor(config: SalesforceServiceConfig) {
    this.httpClient = config.httpClient;
    this.salesforceBaseUrl = config.salesforceBaseUrl;
  }

  public async fetchApprovalsByEmail(email: string): Promise<TaskListApiResponse> {
    try {
      // This will use the configuration from salesforceConfig.json
      const endpoint = `${this.salesforceBaseUrl}/api/DHRESFTWApprovalHistory100/v1/DHRESFTWApprovalHistory`;
      
      const response = await this.httpClient.get(
        endpoint,
        HttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch Salesforce approvals: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Map API response to our interface
      const approvals: SFApproval[] = (data.result || []).map((item: any) => ({
        workflowNumber: item.workflowNumber || item.number || '',
        taskTitle: item.taskTitle || '',
        priority: item.priority || '',
        dueDate: item.dueDate || '',
        requestorName: item.requestorName || item.requestedBy || '',
        workitemId: item.workitemId || '',
        originSystem: item.originSystem || 'salesforce'
      }));

      return { approvals };
    } catch (error) {
      console.error('Error fetching Salesforce approvals:', error);
      throw error;
    }
  }
}