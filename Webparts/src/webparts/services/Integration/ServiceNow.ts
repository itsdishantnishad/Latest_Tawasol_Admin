// src/webparts/services/Integrations/ServiceNow.ts

import { HttpClient, IHttpClientOptions, HttpClientResponse } from "@microsoft/sp-http";

const SERVICE_NOW_API_CONFIG = {
  apiBaseUrl: "https://wapp-corpdms-dev-001.azurewebsites.net",
  approvalListEndpoint: "/api/Tawasol/GetServiceNowApprovalList",

  userIdField: "userID",
  defaultUserId: "Taha.Abizar@dhre.ae",

  // 🔜 FUTURE (when you get authorization)
  // basicAuthBase64: "PASTE_BASE64_HERE",
};

export interface ServiceNowApproval {
  workflowNumber: string;
  taskTitle: string;
  priority: string;
  dueDate: string;
  requestorName: string;
  workitemId: string;
  originSystem: string;
  redirectURL?: string;
}

export interface ServiceNowTaskListApiResponse {
  approvals: ServiceNowApproval[];
}

type ServiceNowRawItem = {
  shortDescription?: string;
  openedBy?: string;
  priority?: string;
  due_date?: string;
  number?: string;
  link?: string;

  created_date?: string;
  state?: string;
  requestedfor_department?: string;
  description?: string;
};

type ServiceNowApiResponse = {
  result?: ServiceNowRawItem[];
  [key: string]: any;
};

export interface ServiceNowServiceConfig {
  httpClient: HttpClient;
}

export class ServiceNowApprovalService {
  private httpClient: HttpClient;

  constructor(config: ServiceNowServiceConfig) {
    this.httpClient = config.httpClient;
  }

  public async fetchApprovalsByEmail(email: string): Promise<ServiceNowTaskListApiResponse> {
    const userIdToSend =
      email && email.trim() ? email.trim() : SERVICE_NOW_API_CONFIG.defaultUserId;

    const requestUrl =
      `${SERVICE_NOW_API_CONFIG.apiBaseUrl.replace(/\/$/, "")}${SERVICE_NOW_API_CONFIG.approvalListEndpoint}`;

    const requestBody: string = JSON.stringify({
      [SERVICE_NOW_API_CONFIG.userIdField]: userIdToSend,
    });

    const requestHeaders: Headers = new Headers();
    requestHeaders.append("Content-type", "application/json");
    requestHeaders.append("Accept", "application/json");
    requestHeaders.append("Cache-Control", "no-cache");

    //  FUTURE
    // requestHeaders.append(
    //   "Authorization",
    //   `Basic ${SERVICE_NOW_API_CONFIG.basicAuthBase64}`
    // );

    const httpClientOptions: IHttpClientOptions = {
      body: requestBody,
      headers: requestHeaders,
    };

    const response: HttpClientResponse = await this.httpClient.post(
      requestUrl,
      HttpClient.configurations.v1,
      httpClientOptions
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `ServiceNow approvals failed: ${response.status} ${response.statusText}. ${errorText}`
      );
    }

    // API sometimes returns JSON double-encoded as string -> parse safely
    const responseText = await response.text().catch(() => "");
    const parsedPayload = this.safeParsePossiblyDoubleEncodedJson(responseText);

    const apiResponse: ServiceNowApiResponse = parsedPayload || {};
    const rawItems: ServiceNowRawItem[] = Array.isArray(apiResponse.result) ? apiResponse.result : [];

    const approvals: ServiceNowApproval[] = rawItems.map((item) => ({
      workflowNumber: item?.number || "",
      taskTitle: item?.shortDescription || "",
      priority: this.normalizePriorityLabel(item?.priority || ""),
      dueDate: item?.due_date || "",
      requestorName: item?.openedBy || "",
      workitemId: item?.number || "",
      originSystem: "ServiceNow",
      redirectURL: item?.link || "",
    }));

    return { approvals };
  }

  private safeParsePossiblyDoubleEncodedJson(rawText: string): any {
    let firstParse: any;

    try {
      firstParse = JSON.parse(rawText);
    } catch {
      throw new Error("ServiceNow approvals failed: response is not valid JSON. Raw: " + rawText);
    }

    if (typeof firstParse === "string") {
      try {
        return JSON.parse(firstParse);
      } catch {
        throw new Error(
          "ServiceNow approvals failed: response is double-encoded JSON but inner JSON is invalid."
        );
      }
    }

    return firstParse;
  }

  private normalizePriorityLabel(priority: string): string {
    if (!priority) return "";
    const match = priority.match(/^\s*\d+\s*-\s*(.+)\s*$/);
    return match && match[1] ? match[1].trim() : priority;
  }
}
