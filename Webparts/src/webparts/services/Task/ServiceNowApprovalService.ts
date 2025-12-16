import { HttpClient } from '@microsoft/sp-http';

export interface ServiceNowTaskListItem {
  workflowNumber: string;      // Maps to "number" from API
  taskTitle: string;            // Maps to "shortDescription" from API
  priority: string;             // Maps to "priority" from API (needs formatting)
  dueDate: string;              // Maps to "due_date" from API
  requestorName: string;        // Maps to "openedBy" from API
  workitemId: string;           // For unique key
  originSystem: string;         // Always 'servicenow' for ServiceNow items
  redirectURL?: string;        // URL to view details in ServiceNow
}

export interface ServiceNowServiceConfig {
  httpClient: HttpClient;
  baseUrl: string;
}

export class ServiceNowApprovalService {
  private httpClient: HttpClient;
  private baseUrl: string;

  constructor(config: ServiceNowServiceConfig) {
    this.httpClient = config.httpClient;
    this.baseUrl = config.baseUrl;
  }

  public async fetchApprovalsByEmail(email: string): Promise<ServiceNowTaskListItem[]> {
    try {
      const endpoint = `${this.baseUrl}/api/DHRETawasolSNApprovalList100/v1/DHRETawasolSNApprovalList`;
      
      const response = await this.httpClient.post(
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
        throw new Error(`Failed to fetch ServiceNow approvals: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Map API response to our interface
      const items: ServiceNowTaskListItem[] = (data.result || []).map((item: any) => ({
        workflowNumber: item.number || '',
        taskTitle: item.shortDescription || '',
        priority: this.formatPriority(item.priority),
        dueDate: item.due_date || '',
        requestorName: item.openedBy || '',
        workitemId: item.number || `sn_${Date.now()}`,
        originSystem: 'servicenow'
      }));

      return items;
    } catch (error) {
      console.error('Error fetching ServiceNow approvals:', error);
      throw error;
    }
  }

  private formatPriority(priority: string): string {
    // API returns "4 - Low", "3 - Medium", etc.
    // Extract just the text part
    if (!priority) return '';
    
    const match = priority.match(/\d+\s*-\s*(.+)/);
    if (match && match[1]) {
      return match[1].trim(); // Returns "Low", "Medium", "High"
    }
    
    return priority;
  }
}