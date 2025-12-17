// src/webparts/services/Task/TahweelService.ts

import {
  HttpClient,
  IHttpClientOptions,
  HttpClientResponse,
} from "@microsoft/sp-http";

const TAHWEEL_CONFIG = {
  baseUrl: "https://infaservicesuat.dubaiholding.com",
  endpoint:
    "/api/DHRETahweelFusionBireportGeneric100/v1/DHRETahweelFusionBireportGeneric",
  authorization: {
    type: "Basic" as const,
    basicBase64:
      "ZGlnaXRhbHBvcnRhbEBkcGcuY29tLnVhdDpHNEN1WXx6STFfSEQ1ZEJ0UHEodExIeElJJDc7",
  },
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

export interface TahweelReportResponse {
  // Define the expected response structure here if known
  [key: string]: any;
}

export interface TahweelServiceConfig {
  httpClient: HttpClient;
}

export class TahweelService {
  private httpClient: HttpClient;

  constructor(config: TahweelServiceConfig) {
    this.httpClient = config.httpClient;
  }

  public fetchLeaveBalance(
    request: TahweelReportRequest
  ): Promise<TahweelReportResponse> {
    const postURL = `${TAHWEEL_CONFIG.baseUrl.replace(/\/$/, "")}${
      TAHWEEL_CONFIG.endpoint
    }`;

    const body = JSON.stringify(request);

    const requestHeaders: Headers = new Headers();
    requestHeaders.append("Content-Type", "application/json");
    requestHeaders.append("Accept", "application/json");
    requestHeaders.append(
      "Authorization",
      `Basic ${TAHWEEL_CONFIG.authorization.basicBase64}`
    );

    const httpClientOptions: IHttpClientOptions = {
      body,
      headers: requestHeaders,
    };

    return this.httpClient
      .post(postURL, HttpClient.configurations.v1, httpClientOptions)
      .then((response: HttpClientResponse): Promise<any> => {
        if (!response.ok) {
          return response.text().then((t: string) => {
            throw new Error(
              `Tahweel API failed: ${response.status} ${response.statusText}. ${t}`
            );
          });
        }
        return response.json();
      });
  }

  //   public async fetchPersonNumberByEmail(email: string): Promise<any> {
  //     const postURL = `${TAHWEEL_CONFIG.baseUrl.replace(
  //       /\/$/,
  //       ""
  //     )}/api/DHRETahweelFusionBireport100/v1/DHRETahweelFusionBireport`;

  //     const body = JSON.stringify({
  //       email,
  //       reportPath:
  //         "/Custom/DH Integrations/AYA/DH_EXT1012_AYA/DH_GET_USER_NAME_REP.xdo",
  //     });

  //     const requestHeaders: Headers = new Headers();
  //     requestHeaders.append("Content-Type", "application/json");
  //     requestHeaders.append("Accept", "application/json");
  //     requestHeaders.append(
  //       "Authorization",
  //       `Basic ${TAHWEEL_CONFIG.authorization.basicBase64}`
  //     );

  //     const httpClientOptions: IHttpClientOptions = {
  //       body,
  //       headers: requestHeaders,
  //     };

  //     const response = await this.httpClient.post(
  //       postURL,
  //       HttpClient.configurations.v1,
  //       httpClientOptions
  //     );
  //     if (!response.ok) {
  //       const t = await response.text();
  //       throw new Error(
  //         `Tahweel Person Number API failed: ${response.status} ${response.statusText}. ${t}`
  //       );
  //     }
  //     return response.json();
  //   }
  public async fetchPersonNumberByEmail(email: string): Promise<any> {
    const postURL = `${TAHWEEL_CONFIG.baseUrl.replace(
      /\/$/,
      ""
    )}/api/DHRETahweelFusionBireportGeneric100/v1/DHRETahweelFusionBireportGeneric`;

    const body = JSON.stringify({
      email: "", // as per payload, keep blank
      person_number: "", // as per payload, keep blank
      reportPath:
        "/Custom/DH Integrations/AYA/DH_EXT1012_AYA/DH_GET_USER_NAME_REP.xdo",
      parameters: {
        params: [
          {
            name: "P_USER_EAMIL",
            value: email,
          },
        ],
      },
    });

    const requestHeaders: Headers = new Headers();
    requestHeaders.append("Content-Type", "application/json");
    requestHeaders.append("Accept", "application/json");
    requestHeaders.append(
      "Authorization",
      `Basic ${TAHWEEL_CONFIG.authorization.basicBase64}`
    );

    const httpClientOptions: IHttpClientOptions = {
      body,
      headers: requestHeaders,
    };

    const response = await this.httpClient.post(
      postURL,
      HttpClient.configurations.v1,
      httpClientOptions
    );
    if (!response.ok) {
      const t = await response.text();
      throw new Error(
        `Tahweel Person Number API failed: ${response.status} ${response.statusText}. ${t}`
      );
    }
    return response.json();
  }
}
 