// import { HttpClient } from '@microsoft/sp-http';

// export interface ServiceNowTaskListItem {
//   workflowNumber: string;     
//   taskTitle: string;           
//   priority: string;           
//   dueDate: string;             
//   requestorName: string;       
//   workitemId: string;          
//   originSystem: string;    
//   redirectURL?: string;        
// }

// export interface ServiceNowServiceConfig {
//   httpClient: HttpClient;
//   baseUrl: string;
// }

// export class ServiceNowApprovalService {
//   private httpClient: HttpClient;
//   private baseUrl: string;

//   constructor(config: ServiceNowServiceConfig) {
//     this.httpClient = config.httpClient;
//     this.baseUrl = config.baseUrl;
//   }

//   public async fetchApprovalsByEmail(email: string): Promise<ServiceNowTaskListItem[]> {
//     try {
//       const endpoint = `${this.baseUrl}/api/DHRETawasolSNApprovalList100/v1/DHRETawasolSNApprovalList`;
      
//       const response = await this.httpClient.post(
//         endpoint,
//         HttpClient.configurations.v1,
//         {
//           headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Failed to fetch ServiceNow approvals: ${response.statusText}`);
//       }

//       const data = await response.json();
      
//       // Map API response to our interface
//       const items: ServiceNowTaskListItem[] = (data.result || []).map((item: any) => ({
//         workflowNumber: item.number || '',
//         taskTitle: item.shortDescription || '',
//         priority: this.formatPriority(item.priority),
//         dueDate: item.due_date || '',
//         requestorName: item.openedBy || '',
//         workitemId: item.number || `sn_${Date.now()}`,
//         originSystem: 'servicenow'
//       }));

//       return items;
//     } catch (error) {
//       console.error('Error fetching ServiceNow approvals:', error);
//       throw error;
//     }
//   }

//   private formatPriority(priority: string): string {
//     // API returns "4 - Low", "3 - Medium", etc.
//     // Extract just the text part
//     if (!priority) return '';
    
//     const match = priority.match(/\d+\s*-\s*(.+)/);
//     if (match && match[1]) {
//       return match[1].trim(); // Returns "Low", "Medium", "High"
//     }
    
//     return priority;
//   }
// }

























import { HttpClient, IHttpClientOptions, HttpClientResponse } from "@microsoft/sp-http";

const SERVICE_NOW_SETTINGS = {
  tokenUrl: "https://dm-em.informaticacloud.com/authz-service/oauth/token",
  grantType: "client_credentials",
  basicAuthBase64: "REPLACE_WITH_POSTMAN_BASIC_BASE64",
  refreshSkewMs: 60 * 1000,

  baseApiUrl: "https://infaservicesuat.dubaiholding.com",
  approvalsPath: "/api/DHRETawasolSNApprovalList100/v1/DHRETawasolSNApprovalList",
  userIdFieldName: "userID",
};

export interface ServiceNowTaskListItem {
  workflowNumber: string;
  taskTitle: string;
  priority: string;
  dueDate: string;
  requestorName: string;
  workitemId: string;
  originSystem: string;
  redirectURL?: string;
}

export interface ServiceNowApprovalServiceConfig {
  httpClient: HttpClient;
}

interface ServiceNowTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

class ServiceNowTokenProvider {
  private readonly httpClient: HttpClient;

  private accessToken: string | undefined;
  private expiresAtMs: number = 0;
  private inFlight: Promise<string> | undefined;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  public getValidAccessToken(): Promise<string> {
    const now = Date.now();

    if (this.accessToken && now < this.expiresAtMs) {
      return Promise.resolve(this.accessToken);
    }

    if (this.inFlight) {
      return this.inFlight;
    }

    this.inFlight = this.fetchNewToken().then(
      (token: string) => {
        this.inFlight = undefined;
        return token;
      },
      (err: any) => {
        this.inFlight = undefined;
        throw err;
      }
    );

    return this.inFlight;
  }

  private fetchNewToken(): Promise<string> {
    const tokenRequestUrl: string =
      `${SERVICE_NOW_SETTINGS.tokenUrl}?grant_type=${encodeURIComponent(SERVICE_NOW_SETTINGS.grantType)}`;

    const headers: Headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Authorization", `Basic ${SERVICE_NOW_SETTINGS.basicAuthBase64}`);

    const options: IHttpClientOptions = {
      headers,
      body: `grant_type=${encodeURIComponent(SERVICE_NOW_SETTINGS.grantType)}`,
    };

    return this.httpClient
      .post(tokenRequestUrl, HttpClient.configurations.v1, options)
      .then((r: HttpClientResponse) => {
        if (!r.ok) {
          return r.text().then((t: string) => {
            throw new Error(`ServiceNow token API failed: ${r.status} ${r.statusText}. ${t}`);
          });
        }
        return r.json();
      })
      .then((json: ServiceNowTokenResponse) => {
        const token: string = (json?.access_token || "").trim();
        const expiresInSeconds: number = Number(json?.expires_in || 0);

        if (!token) {
          throw new Error("ServiceNow token API returned empty access_token.");
        }

        const safetyMs: number = SERVICE_NOW_SETTINGS.refreshSkewMs;
        const ttlMs: number = Math.max(0, expiresInSeconds * 1000 - safetyMs);

        this.accessToken = token;
        this.expiresAtMs = Date.now() + ttlMs;

        return token;
      });
  }
}

export class ServiceNowApprovalService {
  private readonly httpClient: HttpClient;
  private readonly tokenProvider: ServiceNowTokenProvider;

  constructor(config: ServiceNowApprovalServiceConfig) {
    this.httpClient = config.httpClient;
    this.tokenProvider = new ServiceNowTokenProvider(this.httpClient);
  }

  public fetchApprovalsByEmail(userEmail: string): Promise<ServiceNowTaskListItem[]> {
    const effectiveEmail: string = (userEmail || "").trim();
    if (!effectiveEmail) {
      return Promise.reject(new Error("User email is required to fetch ServiceNow approvals."));
    }

    const approvalsUrl: string =
      `${SERVICE_NOW_SETTINGS.baseApiUrl.replace(/\/$/, "")}${SERVICE_NOW_SETTINGS.approvalsPath}`;

    return this.tokenProvider.getValidAccessToken().then((accessToken: string) => {
      const headers: Headers = new Headers();
      headers.append("Accept", "application/json");
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", `Bearer ${accessToken}`);

      const options: IHttpClientOptions = {
        headers,
        body: JSON.stringify({ [SERVICE_NOW_SETTINGS.userIdFieldName]: effectiveEmail }),
      };

      return this.httpClient
        .post(approvalsUrl, HttpClient.configurations.v1, options)
        .then((r: HttpClientResponse) => {
          if (!r.ok) {
            return r.text().then((t: string) => {
              throw new Error(`ServiceNow approvals API failed: ${r.status} ${r.statusText}. ${t}`);
            });
          }
          return r.json();
        })
        .then((data: any) => {
          const resultList: any[] = Array.isArray(data?.result) ? data.result : [];

          return resultList.map((item: any): ServiceNowTaskListItem => {
            const workflowNumber: string = (item?.number || "").toString();

            return {
              workflowNumber,
              taskTitle: (item?.shortDescription || item?.description || "").toString(),
              priority: (item?.priority || "").toString(),
              dueDate: (item?.due_date || "").toString(),
              requestorName: (item?.openedBy || "").toString(),
              workitemId: workflowNumber || (item?.sys_id || "").toString(),
              originSystem: "ServiceNow",
              redirectURL: (item?.link || "").toString(),
            };
          });
        });
    });
  }
}
