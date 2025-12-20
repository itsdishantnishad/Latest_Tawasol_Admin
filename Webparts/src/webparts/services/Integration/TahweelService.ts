// src/webparts/services/Integration/TahweelService.ts

import { HttpClient, IHttpClientOptions, HttpClientResponse } from "@microsoft/sp-http";

/**
 * Tahweel config
 */
const TAHWEEL_CONFIG = {
  baseUrl: "https://infaservicesuat.dubaiholding.com",
  endpoint: "/api/DHRETahweelFusionBireportGeneric100/v1/DHRETahweelFusionBireportGeneric",

  authorization: {
    type: "Basic" as const,
    basicBase64:
      "ZGlnaXRhbHBvcnRhbEBkcGcuY29tLnVhdDpHNEN1WXx6STFfSEQ1ZEJ0UHEodExIeElJJDc7",
  },

  // Reports
  personNumberReportPath: "/Custom/DH Integrations/AYA/DH_EXT1012_AYA/DH_GET_USER_NAME_REP.xdo",
  leaveBalanceReportPath: "/Custom/DH Integrations/HCM/OneApp/DHH/DH Get Leave Balance Report.xdo",

  // Param name as per payload
  personEmailParamName: "P_USER_EAMIL",
};

/**
 * Tahweel Tasks config
 */
const TAHWEEL_TASKS_API_CONFIG = {
  apiBaseUrl: "https://wapp-corpdms-dev-001.azurewebsites.net",

  taskListEndpoint: "/api/Tahweel/GetTahweelApprovalList",
  taskApprovalUrlEndpoint: "/api/Tahweel/GetTahweelTaskApprovalUrl",

  apiKeyHeaderName: "x-api-key",
  apiKey: "PASTE_API_KEY_HERE",

  employeeNumberField: "EmployeeNumber",
  taskNumberField: "TaskNumber",
};

export interface TahweelReportRequest {
  email: string;
  person_number: string;
  reportPath: string;
  parameters: {
    params: Array<{
      name: string;
      value: string;
    }>;
  };
}

export interface TahweelServiceConfig {
  httpClient: HttpClient;
}

/**
 * Tahweel task item mapped for Task.tsx
 */
export interface TahweelApproval {
  workflowNumber: string; 
  taskTitle: string;     
  priority: string;       
  dueDate: string;        
  requestorName: string;  
  workitemId: string;     
  originSystem: string;   
  redirectURL?: string;   
}

export interface TahweelTaskListApiResponse {
  approvals: TahweelApproval[];
}

type TahweelRawTaskItem = {
  taskId?: string;

  number?: string;
  title?: string;
  priority?: string | number;

  assignedDate?: string; 
  createdBy?: string;    
};

type TahweelTaskListApiRawResponse = {
  items?: TahweelRawTaskItem[];
  [key: string]: any;
};

type TahweelTaskUrlApiRawResponse = {
  url?: {
    result?: { text?: string };
    xml?: string | boolean;
  };
  [key: string]: any;
};

export class TahweelService {
  private readonly httpClient: HttpClient;

  constructor(config: TahweelServiceConfig) {
    this.httpClient = config.httpClient;
  }

  // ---------------------------
  // BI Report helpers
  // ---------------------------

  private decodeBase64ToUtf8(base64String: string): string {
    const binary = window.atob(base64String || "");
    let s = "";
    for (let i = 0; i < binary.length; i++) s += String.fromCharCode(binary.charCodeAt(i));

    try {
      // escape() is deprecated but works for this decoding pattern
      return decodeURIComponent(escape(s));
    } catch {
      return s;
    }
  }

  private async postReport(request: TahweelReportRequest): Promise<any> {
    const postURL = `${TAHWEEL_CONFIG.baseUrl.replace(/\/$/, "")}${TAHWEEL_CONFIG.endpoint}`;

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Authorization", `Basic ${TAHWEEL_CONFIG.authorization.basicBase64}`);

    const options: IHttpClientOptions = {
      body: JSON.stringify(request),
      headers,
    };

    const response: HttpClientResponse = await this.httpClient.post(
      postURL,
      HttpClient.configurations.v1,
      options
    );

    if (!response.ok) {
      const t = await response.text();
      throw new Error(`Tahweel API failed: ${response.status} ${response.statusText}. ${t}`);
    }

    return response.json();
  }

  private extractReportBytes(apiJson: any): string {
    return (
      apiJson?.response?.Body?.runReportResponse?.runReportReturn?.reportBytes ||
      apiJson?.Body?.runReportResponse?.runReportReturn?.reportBytes ||
      ""
    );
  }

  private parseXml(xmlText: string): Document {
    return new DOMParser().parseFromString(xmlText, "text/xml");
  }

  private getFirstText(doc: Document, tagName: string): string {
    const node = doc.getElementsByTagName(tagName)[0];
    return (node && node.textContent ? node.textContent : "").trim();
  }

  private getFirstLeafNumberForTag(doc: Document, tagName: string): string {
    const nodes = doc.getElementsByTagName(tagName);

    for (let i = 0; i < nodes.length; i++) {
      const el: any = nodes[i];
      const hasChildren = el && el.children && el.children.length > 0;
      if (hasChildren) continue;

      const t = (el.textContent || "").trim();
      if (/^-?\d+(\.\d+)?$/.test(t)) return t;
    }

    return "";
  }

  // ---------------------------
  // public methods
  // ---------------------------

  /** Email -> person number (<USERNAME>) */
  public async fetchPersonNumberByEmail(
    email: string
  ): Promise<{ personNumber: string; decodedXml: string }> {
    const request: TahweelReportRequest = {
      email: "",
      person_number: "",
      reportPath: TAHWEEL_CONFIG.personNumberReportPath,
      parameters: {
        params: [{ name: TAHWEEL_CONFIG.personEmailParamName, value: email }],
      },
    };

    const json = await this.postReport(request);
    const reportBytes = this.extractReportBytes(json);
    if (!reportBytes) throw new Error("Person reportBytes not found.");

    const decodedXml = this.decodeBase64ToUtf8(reportBytes);
    const doc = this.parseXml(decodedXml);

    const personNumber = this.getFirstText(doc, "USERNAME");
    if (!personNumber) throw new Error("Person number not found in decoded XML (<USERNAME>).");

    return { personNumber, decodedXml };
  }

  /** Person number -> leave balance (<BALANCE>) */
  public async fetchLeaveBalanceByPersonNumber(
    personNumber: string
  ): Promise<{ balance: string; decodedXml: string; hasBalance: boolean }> {
    const request: TahweelReportRequest = {
      email: "",
      person_number: "",
      reportPath: TAHWEEL_CONFIG.leaveBalanceReportPath,
      parameters: {
        params: [{ name: "person_number", value: personNumber }],
      },
    };

    const json = await this.postReport(request);
    const reportBytes = this.extractReportBytes(json);
    if (!reportBytes) throw new Error("Leave reportBytes not found.");

    const decodedXml = this.decodeBase64ToUtf8(reportBytes);
    const doc = this.parseXml(decodedXml);

    const balance = this.getFirstLeafNumberForTag(doc, "BALANCE");
    return { balance, decodedXml, hasBalance: !!balance };
  }

  // ---------------------------
  // Tahweel Tasks helpers
  // ---------------------------

  private safeParsePossiblyDoubleEncodedJson(rawText: string): any {
    let firstParse: any;
    try {
      firstParse = JSON.parse(rawText);
    } catch {
      throw new Error("Tahweel tasks failed: response is not valid JSON. Raw: " + rawText);
    }

    if (typeof firstParse === "string") {
      try {
        return JSON.parse(firstParse);
      } catch {
        throw new Error("Tahweel tasks failed: double-encoded JSON but inner JSON is invalid.");
      }
    }
    return firstParse;
  }

  private buildTahweelTasksHeaders(): Headers {
    const headers = new Headers();
    headers.append("Content-type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Cache-Control", "no-cache");

    const apiKey = (TAHWEEL_TASKS_API_CONFIG.apiKey || "").trim();
    if (!apiKey) throw new Error("Tahweel tasks failed: API key is missing.");
    headers.append(TAHWEEL_TASKS_API_CONFIG.apiKeyHeaderName, apiKey);

    return headers;
  }

  /**
   * Action URL generator
   * Uses EmployeeNumber + TaskNumber (task "number") and returns URL string
   */
  public async fetchTahweelTaskApprovalUrl(employeeNumber: string, taskNumber: string): Promise<string> {
    const emp = (employeeNumber || "").trim();
    const taskNo = (taskNumber || "").trim();

    if (!emp) throw new Error("Tahweel task approval URL failed: EmployeeNumber is required.");
    if (!taskNo) throw new Error("Tahweel task approval URL failed: TaskNumber is required.");

    const requestUrl =
      `${TAHWEEL_TASKS_API_CONFIG.apiBaseUrl.replace(/\/$/, "")}${TAHWEEL_TASKS_API_CONFIG.taskApprovalUrlEndpoint}`;

    const headers = this.buildTahweelTasksHeaders();

    const options: IHttpClientOptions = {
      headers,
      body: JSON.stringify({
        [TAHWEEL_TASKS_API_CONFIG.employeeNumberField]: emp,
        [TAHWEEL_TASKS_API_CONFIG.taskNumberField]: taskNo,
      }),
    };

    const response: HttpClientResponse = await this.httpClient.post(
      requestUrl,
      HttpClient.configurations.v1,
      options
    );

    if (!response.ok) {
      const t = await response.text().catch(() => "");
      throw new Error(
        `Tahweel task approval URL failed: ${response.status} ${response.statusText}. ${t}`
      );
    }

    const txt = await response.text().catch(() => "");
    const parsed = this.safeParsePossiblyDoubleEncodedJson(txt) as TahweelTaskUrlApiRawResponse;

    const url = parsed?.url?.result?.text || "";
    return (url || "").toString().trim();
  }

  /**
   * Tahweel task listing (for Task.tsx Tahweel tab)
   * Mapping:
   * Workflow Number = number
   * TaskTitle       = title
   * Priority        = priority
   * Due Date        = assignedDate
   * requested by    = createdBy
   * Action          = generated URL via fetchTahweelTaskApprovalUrl()
   */
  public async fetchTahweelApprovalsByEmployeeNumber(
    employeeNumber: string
  ): Promise<TahweelTaskListApiResponse> {
    const emp = (employeeNumber || "").trim();
    if (!emp) throw new Error("Tahweel approvals failed: EmployeeNumber is required.");

    const requestUrl =
      `${TAHWEEL_TASKS_API_CONFIG.apiBaseUrl.replace(/\/$/, "")}${TAHWEEL_TASKS_API_CONFIG.taskListEndpoint}`;

    const headers = this.buildTahweelTasksHeaders();

    const options: IHttpClientOptions = {
      headers,
      body: JSON.stringify({
        [TAHWEEL_TASKS_API_CONFIG.employeeNumberField]: emp,
      }),
    };

    const response: HttpClientResponse = await this.httpClient.post(
      requestUrl,
      HttpClient.configurations.v1,
      options
    );

    if (!response.ok) {
      const t = await response.text().catch(() => "");
      throw new Error(`Tahweel approvals failed: ${response.status} ${response.statusText}. ${t}`);
    }

    const txt = await response.text().catch(() => "");
    const parsed = this.safeParsePossiblyDoubleEncodedJson(txt) as TahweelTaskListApiRawResponse;

    const items: TahweelRawTaskItem[] = Array.isArray(parsed?.items) ? parsed.items : [];

    // ✅ Generate Action URL for each task using TaskNumber = item.number
    const approvals: TahweelApproval[] = await Promise.all(
      items.map(async (item) => {
        const number = (item?.number || "").toString();
        let redirectURL = "";

        if (number) {
          try {
            redirectURL = await this.fetchTahweelTaskApprovalUrl(emp, number);
          } catch {
            redirectURL = "";
          }
        }

        return {
          workflowNumber: number || "",
          taskTitle: (item?.title || "").toString(),
          priority: (item?.priority ?? "").toString(),
          dueDate: (item?.assignedDate || "").toString(),
          requestorName: (item?.createdBy || "").toString(),
          workitemId: number || (item?.taskId || "").toString(),
          originSystem: "Tahweel",
          redirectURL,
        };
      })
    );

    return { approvals };
  }
}
