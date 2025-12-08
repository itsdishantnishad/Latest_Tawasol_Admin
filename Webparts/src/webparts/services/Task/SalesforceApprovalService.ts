// src/webparts/task/services/SalesforceApprovalService.ts
// Service for Task Listing + Approve/Reject actions.
// Uses SPFx HttpClient for real Salesforce calls.
// Set USE_MOCK_DATA = true only if you want to run with local dummy data.

import { HttpClient, IHttpClientOptions, HttpClientResponse } from "@microsoft/sp-http";

// ====== TOGGLE THIS ======
const USE_MOCK_DATA = false;   // ⬅️ now using REAL Salesforce, not mock

export type TaskActionType = "Approve" | "Reject";

export interface TaskActionRequest {
  actionType: TaskActionType;
  contextId: string;
  comments?: string;
}

export interface TaskActionResponse {
  success: boolean;
  instanceStatus?: string;
  errors?: any;
}

export interface TaskListItem {
  workitemId: string;
  workflowNumber: string;
  taskType: string;
  taskTitle: string;
  taskDescription: string | null | "";
  status: "Pending" | "Approved" | "Rejected" | string;
  requestorName: string;
  requestorDepartment: string | null;
  priority: "" | "High" | "Medium" | "Low";
  originSystem: "Salesforce" | "Oracle" | string;
  dueDate: string;   // ISO
  createdOn: string; // ISO
  assignedTo: string;
  action: string;
}

export interface TaskListApiResponse {
  success: boolean;
  message: string;
  approvals: TaskListItem[];
}

export interface SfApprovalServiceInit {
  httpClient?: HttpClient;          // Pass this at cutover (from WebPart context)
  salesforceBaseUrl: string;        // e.g., https://dubaiproperties--dev.sandbox.my.salesforce.com
  accessToken?: string;             // Bearer token if calling SF directly
}

export class SfApprovalService {
  private readonly httpClient?: HttpClient;
  private readonly salesforceBaseUrl: string;
  private readonly accessToken?: string;

  constructor(initialization: SfApprovalServiceInit) {
    this.httpClient = initialization.httpClient;
    this.salesforceBaseUrl = initialization.salesforceBaseUrl.replace(/\/$/, "");
    this.accessToken = initialization.accessToken;
  }

  /** GET /services/apexrest/approvalhistory?emailID=... */
  public async fetchApprovalsByEmail(userEmail: string): Promise<TaskListApiResponse> {
    if (USE_MOCK_DATA) {
      // Signal upstream to use local dummy data
      return Promise.reject(new Error("MOCK_MODE"));
    }

    if (!this.httpClient) {
      throw new Error("HttpClient not provided. Pass SPFx HttpClient at cutover.");
    }

    const requestUrl =
      `${this.salesforceBaseUrl}/services/apexrest/approvalhistory?emailID=${encodeURIComponent(userEmail)}`;

    const requestHeaders: HeadersInit = { Accept: "application/json" };
    if (this.accessToken) {
      requestHeaders["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const httpResponse: HttpClientResponse =
      await this.httpClient.get(requestUrl, HttpClient.configurations.v1, {
        headers: requestHeaders
      });

    if (!httpResponse.ok) {
      throw new Error(`List API failed: ${httpResponse.status} ${httpResponse.statusText}`);
    }

    return httpResponse.json();
  }

  /** POST /services/data/v62.0/process/approvals */
  public async submitTaskAction(request: TaskActionRequest): Promise<TaskActionResponse> {
    if (USE_MOCK_DATA) {
      // Simulate success path
      return Promise.resolve({
        success: true,
        instanceStatus: request.actionType === "Approve" ? "Approved" : "Rejected",
      });
    }

    if (!this.httpClient) {
      throw new Error("HttpClient not provided. Pass SPFx HttpClient at cutover.");
    }

    const requestUrl = `${this.salesforceBaseUrl}/services/data/v62.0/process/approvals`;
    const requestBody = {
      requests: [
        {
          actionType: request.actionType,
          contextId: request.contextId,
          comments:
            request.comments ??
            (request.actionType === "Approve"
              ? "Approved via REST API"
              : "Rejected via REST API"),
        },
      ],
    };

    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (this.accessToken) {
      requestHeaders["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const httpOptions: IHttpClientOptions = {
      headers: requestHeaders,
      body: JSON.stringify(requestBody)
    };

    const httpResponse: HttpClientResponse =
      await this.httpClient.post(requestUrl, HttpClient.configurations.v1, httpOptions);

    if (!httpResponse.ok) {
      throw new Error(`Action API failed: ${httpResponse.status} ${httpResponse.statusText}`);
    }

    const jsonResponse: any = await httpResponse.json();
    const wasSuccessful = Array.isArray(jsonResponse) && jsonResponse[0]?.success === true;

    return {
      success: !!wasSuccessful,
      instanceStatus: jsonResponse?.[0]?.instanceStatus,
      errors: wasSuccessful ? undefined : jsonResponse?.[0]?.errors,
    };
  }
}
