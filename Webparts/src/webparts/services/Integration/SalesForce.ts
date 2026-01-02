import { HttpClient, IHttpClientOptions, HttpClientResponse } from "@microsoft/sp-http";

const SALESFORCE_API_SETTINGS = {
  baseApiUrl: "https://infaservicesuat.dubaiholding.com",
  approvalHistoryPath: "/api/DHRESFTWApprovalHistory100/v1/DHRESFTWApprovalHistory",
  emailBodyFieldName: "emailId",
  basicAuthBase64:
    "ZGlnaXRhbHBvcnRhbEBkcGcuY29tLnVhdDpHNEN1WXx6STFfSEQ1ZEJ0UHEodExIeElJJDc7",
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
  private readonly httpClient: HttpClient;

  constructor(config: SalesforceServiceConfig) {
    this.httpClient = config.httpClient;
  }

  public fetchApprovalsByEmail(userEmail: string): Promise<TaskListApiResponse> {
    const effectiveEmail: string = (userEmail || "").trim();
    if (!effectiveEmail) {
      return Promise.reject(new Error("User email is required to fetch Salesforce approvals."));
    }

    const approvalHistoryUrl: string =
      `${SALESFORCE_API_SETTINGS.baseApiUrl.replace(/\/$/, "")}${SALESFORCE_API_SETTINGS.approvalHistoryPath}`;

    const requestBodyJson: string = JSON.stringify({
      [SALESFORCE_API_SETTINGS.emailBodyFieldName]: effectiveEmail,
    });

    const httpRequestHeaders: Headers = new Headers();
    httpRequestHeaders.append("Content-type", "application/json");
    httpRequestHeaders.append("Cache-Control", "no-cache");
    httpRequestHeaders.append("Accept", "application/json");
    httpRequestHeaders.append(
      "Authorization",
      `Basic ${SALESFORCE_API_SETTINGS.basicAuthBase64}`
    );

    const postOptions: IHttpClientOptions = {
      body: requestBodyJson,
      headers: httpRequestHeaders,
    };

    return this.httpClient
      .post(approvalHistoryUrl, HttpClient.configurations.v1, postOptions)
      .then((httpResponse: HttpClientResponse): Promise<any> => {
        if (!httpResponse.ok) {
          return httpResponse.text().then((errorText: string) => {
            throw new Error(
              `Salesforce API failed: ${httpResponse.status} ${httpResponse.statusText}. ${errorText}`
            );
          });
        }
        return httpResponse.json();
      })
      .then((apiResponseJson: any): TaskListApiResponse => {
        const approvalsNode: any = apiResponseJson?.approvals;
        const approvalItems: any[] = this.normalizeApprovalsToArray(approvalsNode);
        const approvals: SFApproval[] = approvalItems.map(this.mapApiItemToSFApproval);
        return { approvals };
      });
  }

  private normalizeApprovalsToArray(approvalsNode: any): any[] {
    if (Array.isArray(approvalsNode)) return approvalsNode;
    if (approvalsNode && typeof approvalsNode === "object") return [approvalsNode];
    return [];
  }

  private mapApiItemToSFApproval(apiItem: any): SFApproval {
    const workflowNumber: string = apiItem?.workflowNumber || apiItem?.workFlowNumber || "";
    const workitemId: string = apiItem?.workitemId || apiItem?.parentId || workflowNumber || "";

    return {
      workflowNumber,
      taskTitle: apiItem?.taskTitle || "",
      priority: apiItem?.priority || "",
      dueDate: apiItem?.dueDate || "",
      requestorName: apiItem?.requestorName || "",
      workitemId,
      originSystem: apiItem?.originSystem || "Salesforce",
      redirectURL: apiItem?.redirectURL || apiItem?.redirectUrl || "",
    };
  }
}
