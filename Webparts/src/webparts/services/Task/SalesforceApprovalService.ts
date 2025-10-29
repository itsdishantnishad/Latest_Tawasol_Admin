import { HttpClient, IHttpClientOptions, HttpClientResponse } from "@microsoft/sp-http";

// ====== TOGGLE THIS AT CUTOVER ======
const USE_MOCK = true;

export type TaskActionType = "Approve" | "Reject";

export interface TaskActionRequest {
  actionType: TaskActionType;      // "Approve" | "Reject"
  contextId: string;               // workitemId from the row
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
  httpClient?: HttpClient;          // pass this at cutover (from WebPart context)
  salesforceBaseUrl: string;        // e.g., https://dubaiproperties--dev.sandbox.my.salesforce.com
  accessToken?: string;             // optional if you call directly; not needed if you proxy
}

export class SfApprovalService {
  private _http?: HttpClient;
  private _base: string;
  private _token?: string;

  constructor(init: SfApprovalServiceInit) {
    this._http = init.httpClient;
    this._base = init.salesforceBaseUrl.replace(/\/$/, "");
    this._token = init.accessToken;
  }

  /** GET /services/apexrest/approvalhistory?emailID=... */
  public async fetchApprovals(email: string): Promise<TaskListApiResponse> {
    if (USE_MOCK) {
      // Signal upstream to use local dummy data
      return Promise.reject(new Error("MOCK_MODE"));
    }

    if (!this._http) {
      throw new Error("HttpClient missing. Pass SPFx HttpClient at cutover.");
    }

    const url = `${this._base}/services/apexrest/approvalhistory?emailID=${encodeURIComponent(email)}`;

    const headers: HeadersInit = { Accept: "application/json" };
    if (this._token) headers["Authorization"] = `Bearer ${this._token}`;

    const res: HttpClientResponse = await this._http.get(url, HttpClient.configurations.v1, { headers });
    if (!res.ok) throw new Error(`List API failed: ${res.status} ${res.statusText}`);

    return res.json();
  }

  /** POST /services/data/v62.0/process/approvals */
  public async takeAction(req: TaskActionRequest): Promise<TaskActionResponse> {
    if (USE_MOCK) {
      // simulate success path
      return Promise.resolve({
        success: true,
        instanceStatus: req.actionType === "Approve" ? "Approved" : "Rejected",
      });
    }

    if (!this._http) {
      throw new Error("HttpClient missing. Pass SPFx HttpClient at cutover.");
    }

    const url = `${this._base}/services/data/v62.0/process/approvals`;
    const body = {
      requests: [
        {
          actionType: req.actionType,
          contextId: req.contextId,
          comments:
            req.comments ??
            (req.actionType === "Approve" ? "Approved via REST API" : "Rejected via REST API"),
        },
      ],
    };

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (this._token) headers["Authorization"] = `Bearer ${this._token}`;

    const options: IHttpClientOptions = { headers, body: JSON.stringify(body) };
    const res: HttpClientResponse = await this._http.post(url, HttpClient.configurations.v1, options);
    if (!res.ok) throw new Error(`Action API failed: ${res.status} ${res.statusText}`);
    const json = await res.json();

    const ok = Array.isArray(json) && json[0]?.success === true;
    return {
      success: !!ok,
      instanceStatus: json?.[0]?.instanceStatus,
      errors: ok ? undefined : json?.[0]?.errors,
    };
  }
}
