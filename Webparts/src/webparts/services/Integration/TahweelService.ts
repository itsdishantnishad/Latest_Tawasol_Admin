// src/webparts/services/Integration/TahweelService.ts

import { HttpClient, IHttpClientOptions, HttpClientResponse } from "@microsoft/sp-http";

/**
 * Tahweel config (BI Reports)
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
 * Tahweel Azure Web App config (Tasks etc.)
 */
const TAHWEEL_TASKS_API_CONFIG = {
  apiBaseUrl: "https://wapp-corpdms-dev-001.azurewebsites.net",

  taskListEndpoint: "/api/Tahweel/GetTahweelApprovalList",
  taskApprovalUrlEndpoint: "/api/Tahweel/GetTahweelTaskApprovalUrl",


  apiKeyHeaderName: "x-api-key",
  apiKey: "qnwCDLTzcXO50lteD3S5By408lqputhj89ihYtiHW6o=",

  employeeNumberField: "EmployeeNumber",
  taskNumberField: "TaskNumber",
};

/**
 * Tahweel Profile config (AD details)
 * Uses same x-api-key + same base URL
 */
const TAHWEEL_PROFILE_API_CONFIG = {
  apiBaseUrl: TAHWEEL_TASKS_API_CONFIG.apiBaseUrl,
  adDetailsEndpoint: "/api/Tahweel/GetADDetails",

  apiKeyHeaderName: TAHWEEL_TASKS_API_CONFIG.apiKeyHeaderName,
  apiKey: TAHWEEL_TASKS_API_CONFIG.apiKey,

  employeeNumberField: TAHWEEL_TASKS_API_CONFIG.employeeNumberField,

  // if later backend requires Basic auth, keep ready like Salesforce.ts
  // basicAuthBase64: "PASTE_BASE64_HERE",
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

/**
 * Tahweel AD details mapped for Profile Header
 */
export interface TahweelAdDetails {
  employeeNumber: string; // same value we send to API
  personNumber: string;   // PERSON_NUMBER from XML (verification)
  fullName: string;
  designation: string;
  department: string;
  imageBase64?: string;   // IMAGE from XML (raw base64)
  imageDataUrl?: string;  // data:image/...;base64,...
  decodedXml?: string;    // helpful for debugging
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

  // ✅ shared cache across instances (Profile + Leave Balance both can reuse)
  private static _personNumberPromiseByEmail: { [email: string]: Promise<{ personNumber: string; decodedXml: string }> } = {};

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
  // public methods (BI Reports)
  // ---------------------------

  /** Email -> person number (<USERNAME>) */
  public async fetchPersonNumberByEmail(
    email: string
  ): Promise<{ personNumber: string; decodedXml: string }> {
    const effectiveEmail = (email || "").trim();
    if (!effectiveEmail) throw new Error("Email is required to fetch person number.");

    // ✅ cache to avoid duplicate calls (Profile + LeaveBalance)
    if (!TahweelService._personNumberPromiseByEmail[effectiveEmail]) {
      TahweelService._personNumberPromiseByEmail[effectiveEmail] = (async () => {
        const request: TahweelReportRequest = {
          email: "",
          person_number: "",
          reportPath: TAHWEEL_CONFIG.personNumberReportPath,
          parameters: {
            params: [{ name: TAHWEEL_CONFIG.personEmailParamName, value: effectiveEmail }],
          },
        };

        const json = await this.postReport(request);
        const reportBytes = this.extractReportBytes(json);
        if (!reportBytes) throw new Error("Person reportBytes not found.");

        const decodedXml = this.decodeBase64ToUtf8(reportBytes);
        const doc = this.parseXml(decodedXml);

        const personNumber = this.getFirstText(doc, "USERNAME");
        if (!personNumber) throw new Error("Person number not found in Records.");

        return { personNumber, decodedXml };
      })();
    }

    return TahweelService._personNumberPromiseByEmail[effectiveEmail];
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
  // Azure Web App helpers (Tasks + Profile)
  // ---------------------------

  private safeParsePossiblyDoubleEncodedJson(rawText: string): any {
    let firstParse: any;
    try {
      firstParse = JSON.parse(rawText);
    } catch {
      throw new Error("Tahweel failed: response is not valid JSON. Raw: " + rawText);
    }

    if (typeof firstParse === "string") {
      try {
        return JSON.parse(firstParse);
      } catch {
        throw new Error("Tahweel failed: double-encoded JSON but inner JSON is invalid.");
      }
    }
    return firstParse;
  }

  private buildTahweelAzureHeaders(): Headers {
    const headers = new Headers();
    headers.append("Content-type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Cache-Control", "no-cache");

    const apiKey = (TAHWEEL_TASKS_API_CONFIG.apiKey || "").trim();
    if (!apiKey) throw new Error("Tahweel failed: API key is missing.");
    headers.append(TAHWEEL_TASKS_API_CONFIG.apiKeyHeaderName, apiKey);

    return headers;
  }

  // ---------------------------
  // Tahweel Tasks
  // ---------------------------

  /** Action URL generator */
  public async fetchTahweelTaskApprovalUrl(employeeNumber: string, taskNumber: string): Promise<string> {
    const emp = (employeeNumber || "").trim();
    const taskNo = (taskNumber || "").trim();

    if (!emp) throw new Error("Tahweel task approval URL failed: EmployeeNumber is required.");
    if (!taskNo) throw new Error("Tahweel task approval URL failed: TaskNumber is required.");

    const requestUrl =
      `${TAHWEEL_TASKS_API_CONFIG.apiBaseUrl.replace(/\/$/, "")}${TAHWEEL_TASKS_API_CONFIG.taskApprovalUrlEndpoint}`;

    const headers = this.buildTahweelAzureHeaders();

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

  /** Tahweel task listing */
  public async fetchTahweelApprovalsByEmployeeNumber(
    employeeNumber: string
  ): Promise<TahweelTaskListApiResponse> {
    const emp = (employeeNumber || "").trim();
    if (!emp) throw new Error("Tahweel approvals failed: EmployeeNumber is required.");

    const requestUrl =
      `${TAHWEEL_TASKS_API_CONFIG.apiBaseUrl.replace(/\/$/, "")}${TAHWEEL_TASKS_API_CONFIG.taskListEndpoint}`;

    const headers = this.buildTahweelAzureHeaders();

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

  // ---------------------------
  // ✅ Tahweel Profile: AD Details
  // ---------------------------

  /**
   * Email -> EmployeeNumber -> GetADDetails -> parse XML
   * Most efficient because Email->USERNAME is already used for leave balance too (and cached).
   */
  public async fetchAdDetailsByEmail(email: string): Promise<TahweelAdDetails | null> {
    const effectiveEmail = (email || "").trim();
    if (!effectiveEmail) throw new Error("Email is required to fetch AD details.");

    const personRes = await this.fetchPersonNumberByEmail(effectiveEmail);
    const employeeNumber = (personRes?.personNumber || "").trim();
    if (!employeeNumber) throw new Error("Employee/Person number not found for AD details.");

    return this.fetchAdDetailsByEmployeeNumber(employeeNumber);
  }

  /**
   * EmployeeNumber -> GetADDetails API -> reportBytes(base64) -> XML -> values
   */
  public async fetchAdDetailsByEmployeeNumber(employeeNumber: string): Promise<TahweelAdDetails | null> {
    const emp = (employeeNumber || "").trim();
    if (!emp) throw new Error("EmployeeNumber is required for AD details.");

    const requestUrl =
      `${TAHWEEL_PROFILE_API_CONFIG.apiBaseUrl.replace(/\/$/, "")}${TAHWEEL_PROFILE_API_CONFIG.adDetailsEndpoint}`;

    const headers = this.buildTahweelAzureHeaders();

    // 🔜 FUTURE: if Basic auth required, uncomment like Salesforce.ts
    // headers.append("Authorization", `Basic ${TAHWEEL_PROFILE_API_CONFIG.basicAuthBase64}`);

    const options: IHttpClientOptions = {
      headers,
      body: JSON.stringify({
        [TAHWEEL_PROFILE_API_CONFIG.employeeNumberField]: emp,
      }),
    };

    const response: HttpClientResponse = await this.httpClient.post(
      requestUrl,
      HttpClient.configurations.v1,
      options
    );

    if (!response.ok) {
      const t = await response.text().catch(() => "");
      throw new Error(`Tahweel GetADDetails failed: ${response.status} ${response.statusText}. ${t}`);
    }

    const responseText = await response.text().catch(() => "");
    const parsed = this.safeParsePossiblyDoubleEncodedJson(responseText);

    // Try different shapes (backend may vary)
    const reportBytes =
      parsed?.result?.reportBytes ||
      parsed?.result?.ReportBytes ||
      parsed?.reportBytes ||
      parsed?.ReportBytes ||
      "";

    if (!reportBytes || typeof reportBytes !== "string") {
      // DEBUG_REMOVE_LATER: reportBytes missing log (GetADDetails)
      console.log("[Tahweel GetADDetails] reportBytes missing:", parsed);
      return null;
    }

    const decodedXml = this.decodeBase64ToUtf8(reportBytes);
    const doc = this.parseXml(decodedXml);

    const fullName = this.getFirstText(doc, "FULL_NAME");
    const designation = this.getFirstText(doc, "DESIGNATION");
    const department = this.getFirstText(doc, "DEPARTMENT");
    const personNumberFromXml = this.getFirstText(doc, "PERSON_NUMBER");

    let imageBase64 = this.getFirstText(doc, "IMAGE");
    if (imageBase64) {
      imageBase64 = imageBase64.replace(/\s+/g, "");
    }

    const imageDataUrl = this.buildImageDataUrl(imageBase64);

    // DEBUG_REMOVE_LATER: Parsed AD details log (GetADDetails)
    console.log("[Tahweel GetADDetails] Parsed:", {
      employeeNumber: emp,
      personNumberFromXml,
      fullName,
      designation,
      department,
      hasImage: !!imageDataUrl,
    });

    return {
      employeeNumber: emp,
      personNumber: personNumberFromXml || emp,
      fullName: fullName || "",
      designation: designation || "",
      department: department || "",
      imageBase64: imageBase64 || undefined,
      imageDataUrl: imageDataUrl || undefined,
      decodedXml,
    };
  }

  private buildImageDataUrl(imageBase64?: string): string {
    const b64 = (imageBase64 || "").replace(/\s+/g, "");
    if (!b64) return "";

    // avoid startsWith/includes for older targets
    const isPng = b64.indexOf("iVBOR") === 0;
    const isJpg = b64.indexOf("/9j/") === 0;
    const mime = isPng ? "image/png" : isJpg ? "image/jpeg" : "image/png";

    return `data:${mime};base64,${b64}`;
  }
}
