// src/webparts/services/Integration/TahweelService.ts

import { HttpClient, IHttpClientOptions, HttpClientResponse } from "@microsoft/sp-http";

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

export class TahweelService {
  private readonly httpClient: HttpClient;

  constructor(config: TahweelServiceConfig) {
    this.httpClient = config.httpClient;
  }

  // ---------------------------
  // Core: POST + decode helpers
  // ---------------------------

  private decodeBase64ToUtf8(base64String: string): string {
    const binary = window.atob(base64String || "");
    let s = "";
    for (let i = 0; i < binary.length; i++) s += String.fromCharCode(binary.charCodeAt(i));

    // best-effort UTF-8 decode
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

  /**
   * Reads numeric value ONLY from the given tag name (leaf nodes),
   * so PERSON_NUMBER can never be mistakenly used as BALANCE.
   */
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
  // Public: business methods
  // ---------------------------

  /** Email -> person number (<USERNAME>) */
  public async fetchPersonNumberByEmail(email: string): Promise<{ personNumber: string; decodedXml: string }> {
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

    const personNumber = this.getFirstText(doc, "USERNAME"); // decoded XML
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

    // hardcoded test version, keep it commented:
    // const request: TahweelReportRequest = {
    //   email: "",
    //   person_number: "",
    //   reportPath: TAHWEEL_CONFIG.leaveBalanceReportPath,
    //   parameters: { params: [{ name: "person_number", value: "150286" }] },
    // };

    const json = await this.postReport(request);
    const reportBytes = this.extractReportBytes(json);
    if (!reportBytes) throw new Error("Leave reportBytes not found.");

    const decodedXml = this.decodeBase64ToUtf8(reportBytes);
    const doc = this.parseXml(decodedXml);

    const balance = this.getFirstLeafNumberForTag(doc, "BALANCE"); 
    return { balance, decodedXml, hasBalance: !!balance };
  }
}
