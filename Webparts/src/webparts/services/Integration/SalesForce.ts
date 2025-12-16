// src/webparts/services/Task/SalesforceApprovalService.ts

import { HttpClient, IHttpClientOptions, HttpClientResponse } from "@microsoft/sp-http";

const SALESFORCE_CONFIG = {
  salesforceBaseUrl: "https://infaservicesuat.dubaiholding.com",
  approvalHistoryEndpoint: "/api/DHRESFTWApprovalHistory100/v1/DHRESFTWApprovalHistory",
  userIdField: "emailId",
  defaultUserId: "aisha.amiri@dhre.ae",
  authorization: {
    type: "Basic" as const,
    basicBase64:
      "ZGlnaXRhbHBvcnRhbEBkcGcuY29tLnVhdDpHNEN1WXx6STFfSEQ1ZEJ0UHEodExIeElJJDc7",
  },
};

export interface SFApproval {
  workflowNumber: string;
  taskTitle: string;
  priority: string;
  dueDate: string;
  requestorName: string;
  workitemId: string;
  originSystem: string;
  redirectURL?: string;
}

export interface TaskListApiResponse {
  approvals: SFApproval[];
}

export interface SalesforceServiceConfig {
  httpClient: HttpClient;
}

export class SfApprovalService {
  private httpClient: HttpClient;

  constructor(config: SalesforceServiceConfig) {
    this.httpClient = config.httpClient;
  }

  public fetchApprovalsByEmail(email: string): Promise<TaskListApiResponse> {
    const finalEmail: string =
      email && email.trim() ? email.trim() : SALESFORCE_CONFIG.defaultUserId;

    const postURL: string =
      `${SALESFORCE_CONFIG.salesforceBaseUrl.replace(/\/$/, "")}${SALESFORCE_CONFIG.approvalHistoryEndpoint}`;

    const body: string = JSON.stringify({
      [SALESFORCE_CONFIG.userIdField]: finalEmail,
    });

    const requestHeaders: Headers = new Headers();
    requestHeaders.append("Content-type", "application/json");
    requestHeaders.append("Cache-Control", "no-cache");
    requestHeaders.append("Accept", "application/json");

    requestHeaders.append(
      "Authorization",
      `Basic ${SALESFORCE_CONFIG.authorization.basicBase64}`
    );

    const httpClientOptions: IHttpClientOptions = {
      body,
      headers: requestHeaders,
    };

    return this.httpClient
      .post(postURL, HttpClient.configurations.v1, httpClientOptions)
      .then((response: HttpClientResponse): Promise<any> => {
        console.log("REST API response received.");
        if (!response.ok) {
          return response.text().then((t: string) => {
            throw new Error(
              `Salesforce API failed: ${response.status} ${response.statusText}. ${t}`
            );
          });
        }
        return response.json();
      })
      .then((data: any): TaskListApiResponse => {
        const approvalsRaw: any[] = Array.isArray(data?.approvals) ? data.approvals : [];

        const approvals: SFApproval[] = approvalsRaw.map((item: any) => ({
          workflowNumber: item?.workflowNumber || "",
          taskTitle: item?.taskTitle || "",
          priority: item?.priority || "",
          dueDate: item?.dueDate || "",
          requestorName: item?.requestorName || "",
          workitemId: item?.workitemId || item?.parentId || item?.workflowNumber || "",
          originSystem: item?.originSystem || "Salesforce",
          redirectURL: item?.redirectURL || item?.redirectUrl || "",
        }));

        return { approvals };
      });
  }
}
