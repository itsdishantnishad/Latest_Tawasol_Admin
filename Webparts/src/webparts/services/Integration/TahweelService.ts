// import { HttpClient, IHttpClientOptions, HttpClientResponse } from "@microsoft/sp-http";

// /**
//  * Tahweel Azure Web App config
//  * (Tasks, Profile AD Details, Leave Balance, Active Employees)
//  */
// const TAHWEEL_AZURE_API_CONFIG = {
//   apiBaseUrl: "https://wapp-corpdms-dev-001.azurewebsites.net",

//   // Tasks
//   taskListEndpoint: "/api/Tahweel/GetTahweelApprovalList",
//   taskApprovalUrlEndpoint: "/api/Tahweel/GetTahweelTaskApprovalUrl",

//   // Profile
//   adDetailsEndpoint: "/api/Tahweel/GetADDetails",

//   // Leave
//   leaveBalanceEndpoint: "/api/Tahweel/GetEmployeeLeaveBalance",

//   // Employees (Birthdays / Anniversaries)
//   activeEmployeesEndpoint: "/api/Tahweel/GetActiveEmployees",

//   // Auth
//   apiKeyHeaderName: "x-api-key",
//   apiKey: "qnwCDLTzcXO50lteD3S5By408lqputhj89ihYtiHW6o=",

//   // Fields
//   employeeNumberField: "EmployeeNumber",
//   taskNumberField: "TaskNumber",
//   employeeEmailField: "EmployeeEmailaddress",
// };

// export interface TahweelServiceConfig {
//   httpClient: HttpClient;
// }

// /**
//  * Tahweel task item mapped for Task.tsx
//  */
// export interface TahweelApproval {
//   workflowNumber: string;
//   taskTitle: string;
//   priority: string;
//   dueDate: string;
//   requestorName: string;
//   workitemId: string;
//   originSystem: string;
//   redirectURL?: string;
// }

// export interface TahweelTaskListApiResponse {
//   approvals: TahweelApproval[];
// }

// /**
//  * Tahweel AD details mapped for Profile Header
//  */
// export interface TahweelAdDetails {
//   employeeNumber: string; // the number we send to API
//   personNumber: string; // person_number from API (fallback to employeeNumber)

//   fullName: string;
//   designation: string;
//   department: string;

//   imageBase64?: string;
//   imageDataUrl?: string;
// }

// /**
//  * Leave balance result used by ApplyLeave
//  * NOTE: as per your note, PERSON_NUMBER is what you treat as employee/person number
//  */
// export interface TahweelEmployeeLeaveBalance {
//   personNumber: string; // PERSON_NUMBER
//   leaveBalance: string; // LEAVE_BALANCE
//   tillDate: string; // TILL_DATE

//   hasPersonNumber: boolean;
//   hasBalance: boolean;
// }

// /**
//  * Active Employees used by LetsCelebrate (Birthdays / Anniversaries)
//  */
// export interface TahweelActiveEmployee {
//   personNumber: string;
//   fullName: string;

//   doj: string;
//   dateOfBirth: string;

//   designation?: string;
//   department?: string;
//   division?: string;

//   email?: string;

//   /** raw (can be base64 or url) */
//   imageRaw?: string;

//   /** final usable URL (http(s) / server relative / data:image...) */
//   imageUrl?: string;
//   imageDataUrl?: string;

//   // extras if needed later
//   location?: string;
//   skill?: string;
// }

// /** ------------ Raw shapes (Azure API) ------------ */

// type TahweelRawTaskItem = {
//   taskId?: string;
//   number?: string;
//   title?: string;
//   priority?: string | number;
//   assignedDate?: string;
//   createdBy?: string;
// };

// type TahweelTaskListApiRawResponse = {
//   items?: TahweelRawTaskItem[];
//   [key: string]: any;
// };

// type TahweelTaskUrlApiRawResponse = {
//   url?: {
//     result?: { text?: string };
//     xml?: string | boolean;
//   };
//   [key: string]: any;
// };

// type TahweelAdDetailsApiItem = {
//   person_number?: string;
//   full_name?: string;
//   designation?: string;
//   department?: string;
//   image?: string;
//   [key: string]: any;
// };

// type TahweelAdDetailsApiResponse = {
//   status_code?: number;
//   data?: TahweelAdDetailsApiItem[];
//   [key: string]: any;
// };

// type TahweelLeaveBalanceApiItem = {
//   PERSON_NUMBER?: string;
//   LEAVE_BALANCE?: string | number;
//   TILL_DATE?: string;
//   [key: string]: any;
// };

// type TahweelLeaveBalanceApiResponse = {
//   status_code?: number;
//   data?: TahweelLeaveBalanceApiItem[];
//   [key: string]: any;
// };

// type TahweelActiveEmployeesApiItem = {
//   person_number?: string;
//   full_name?: string;
//   doj?: string;
//   date_of_birth?: string;
//   designation?: string;
//   department?: string;
//   division?: string;
//   location?: string;
//   skill?: string;
//   image?: string;
//   email_address?: string;
//   [key: string]: any;
// };

// type TahweelActiveEmployeesApiResponse = {
//   response?: TahweelActiveEmployeesApiItem[];
//   [key: string]: any;
// };

// export class TahweelService {
//   private readonly httpClient: HttpClient;

//   // shared cache across instances (Task + Profile + Leave balance)
//   private static _personNumberPromiseByEmail: {
//     [email: string]: Promise<{ personNumber: string; decodedXml: string }>;
//   } = {};

//   constructor(config: TahweelServiceConfig) {
//     this.httpClient = config.httpClient;
//   }

//   // ---------------------------
//   // Common helpers
//   // ---------------------------

//   private safeParsePossiblyDoubleEncodedJson(rawText: string): any {
//     let firstParse: any;
//     try {
//       firstParse = JSON.parse(rawText);
//     } catch {
//       throw new Error("Tahweel failed: response is not valid JSON. Raw: " + rawText);
//     }

//     if (typeof firstParse === "string") {
//       try {
//         return JSON.parse(firstParse);
//       } catch {
//         throw new Error("Tahweel failed: double-encoded JSON but inner JSON is invalid.");
//       }
//     }
//     return firstParse;
//   }

//   private buildTahweelAzureHeaders(): Headers {
//     const headers = new Headers();
//     headers.append("Content-type", "application/json");
//     headers.append("Accept", "application/json");
//     headers.append("Cache-Control", "no-cache");

//     const apiKey = (TAHWEEL_AZURE_API_CONFIG.apiKey || "").trim();
//     if (!apiKey) throw new Error("Tahweel failed: API key is missing.");

//     headers.append(TAHWEEL_AZURE_API_CONFIG.apiKeyHeaderName, apiKey);
//     return headers;
//   }

//   /** Base64 image support (AD Details / Active Employees can return base64) */
//   private buildImageDataUrl(imageBase64?: string): string {
//     const b64 = (imageBase64 || "").replace(/\s+/g, "");
//     if (!b64) return "";

//     // if already a data url, keep it
//     if (/^data:image\//i.test(b64)) return b64;

//     const isPng = b64.indexOf("iVBOR") === 0;
//     const isJpg = b64.indexOf("/9j/") === 0;
//     const mime = isPng ? "image/png" : isJpg ? "image/jpeg" : "image/png";

//     return `data:${mime};base64,${b64}`;
//   }

//   private isHttpUrl(v: string): boolean {
//     return /^https?:\/\//i.test(v || "");
//   }

//   private isServerRelative(v: string): boolean {
//     return !!v && v[0] === "/";
//   }

//   // ---------------------------
//   // Leave Balance (Azure Web App)
//   // ---------------------------

//   /** Email -> { PERSON_NUMBER, LEAVE_BALANCE, TILL_DATE } */
//   public async fetchEmployeeLeaveBalanceByEmail(email: string): Promise<TahweelEmployeeLeaveBalance> {
//     const effectiveEmail = (email || "").trim();
//     if (!effectiveEmail) throw new Error("Email is required for leave balance.");

//     const requestUrl =
//       `${TAHWEEL_AZURE_API_CONFIG.apiBaseUrl.replace(/\/$/, "")}${TAHWEEL_AZURE_API_CONFIG.leaveBalanceEndpoint}`;

//     const headers = this.buildTahweelAzureHeaders();

//     const options: IHttpClientOptions = {
//       headers,
//       body: JSON.stringify({
//         [TAHWEEL_AZURE_API_CONFIG.employeeEmailField]: effectiveEmail,
//       }),
//     };

//     const response: HttpClientResponse = await this.httpClient.post(
//       requestUrl,
//       HttpClient.configurations.v1,
//       options
//     );

//     if (!response.ok) {
//       const t = await response.text().catch(() => "");
//       throw new Error(`Tahweel Leave Balance failed: ${response.status} ${response.statusText}. ${t}`);
//     }

//     const txt = await response.text().catch(() => "");
//     const parsed = this.safeParsePossiblyDoubleEncodedJson(txt) as TahweelLeaveBalanceApiResponse;

//     const first: TahweelLeaveBalanceApiItem | undefined =
//       Array.isArray(parsed?.data) && parsed.data.length > 0 ? parsed.data[0] : undefined;

//     const personNumber = (first?.PERSON_NUMBER || "").toString().trim();

//     const leaveBalanceRaw = first?.LEAVE_BALANCE;
//     const leaveBalance =
//       leaveBalanceRaw === null || leaveBalanceRaw === undefined ? "" : leaveBalanceRaw.toString().trim();

//     const tillDate = (first?.TILL_DATE || "").toString().trim();

//     return {
//       personNumber,
//       leaveBalance,
//       tillDate,
//       hasPersonNumber: !!personNumber,
//       hasBalance: !!leaveBalance,
//     };
//   }

//   /**
//    * Task.tsx and ProfileHeaderComp.tsx still call this.
//    * Now sourced from Leave Balance API (PERSON_NUMBER).
//    * decodedXml kept for backward-compat (empty string).
//    */
//   public async fetchPersonNumberByEmail(email: string): Promise<{ personNumber: string; decodedXml: string }> {
//     const effectiveEmail = (email || "").trim();
//     if (!effectiveEmail) throw new Error("Email is required to fetch person number.");

//     if (!TahweelService._personNumberPromiseByEmail[effectiveEmail]) {
//       TahweelService._personNumberPromiseByEmail[effectiveEmail] = (async () => {
//         const leave = await this.fetchEmployeeLeaveBalanceByEmail(effectiveEmail);

//         if (!leave.hasPersonNumber) {
//           throw new Error("Employee Number Not Present");
//         }

//         return { personNumber: leave.personNumber, decodedXml: "" };
//       })();
//     }

//     return TahweelService._personNumberPromiseByEmail[effectiveEmail];
//   }

//   // ---------------------------
//   // Tahweel Tasks
//   // ---------------------------

//   /** Action URL generator */
//   public async fetchTahweelTaskApprovalUrl(employeeNumber: string, taskNumber: string): Promise<string> {
//     const emp = (employeeNumber || "").trim();
//     const taskNo = (taskNumber || "").trim();

//     if (!emp) throw new Error("Tahweel task approval URL failed: EmployeeNumber is required.");
//     if (!taskNo) throw new Error("Tahweel task approval URL failed: TaskNumber is required.");

//     const requestUrl =
//       `${TAHWEEL_AZURE_API_CONFIG.apiBaseUrl.replace(/\/$/, "")}${TAHWEEL_AZURE_API_CONFIG.taskApprovalUrlEndpoint}`;

//     const headers = this.buildTahweelAzureHeaders();

//     const options: IHttpClientOptions = {
//       headers,
//       body: JSON.stringify({
//         [TAHWEEL_AZURE_API_CONFIG.employeeNumberField]: emp,
//         [TAHWEEL_AZURE_API_CONFIG.taskNumberField]: taskNo,
//       }),
//     };

//     const response: HttpClientResponse = await this.httpClient.post(
//       requestUrl,
//       HttpClient.configurations.v1,
//       options
//     );

//     if (!response.ok) {
//       const t = await response.text().catch(() => "");
//       throw new Error(`Tahweel task approval URL failed: ${response.status} ${response.statusText}. ${t}`);
//     }

//     const txt = await response.text().catch(() => "");
//     const parsed = this.safeParsePossiblyDoubleEncodedJson(txt) as TahweelTaskUrlApiRawResponse;

//     const url = parsed?.url?.result?.text || "";
//     return (url || "").toString().trim();
//   }

//   /** Tahweel task listing */
//   public async fetchTahweelApprovalsByEmployeeNumber(employeeNumber: string): Promise<TahweelTaskListApiResponse> {
//     const emp = (employeeNumber || "").trim();
//     if (!emp) throw new Error("Tahweel approvals failed: EmployeeNumber is required.");

//     const requestUrl =
//       `${TAHWEEL_AZURE_API_CONFIG.apiBaseUrl.replace(/\/$/, "")}${TAHWEEL_AZURE_API_CONFIG.taskListEndpoint}`;

//     const headers = this.buildTahweelAzureHeaders();

//     const options: IHttpClientOptions = {
//       headers,
//       body: JSON.stringify({
//         [TAHWEEL_AZURE_API_CONFIG.employeeNumberField]: emp,
//       }),
//     };

//     const response: HttpClientResponse = await this.httpClient.post(
//       requestUrl,
//       HttpClient.configurations.v1,
//       options
//     );

//     if (!response.ok) {
//       const t = await response.text().catch(() => "");
//       throw new Error(`Tahweel approvals failed: ${response.status} ${response.statusText}. ${t}`);
//     }

//     const txt = await response.text().catch(() => "");
//     const parsed = this.safeParsePossiblyDoubleEncodedJson(txt) as TahweelTaskListApiRawResponse;

//     const items: TahweelRawTaskItem[] = Array.isArray(parsed?.items) ? parsed.items : [];

//     const approvals: TahweelApproval[] = await Promise.all(
//       items.map(async (item) => {
//         const number = (item?.number || "").toString();
//         let redirectURL = "";

//         if (number) {
//           try {
//             redirectURL = await this.fetchTahweelTaskApprovalUrl(emp, number);
//           } catch {
//             redirectURL = "";
//           }
//         }

//         return {
//           workflowNumber: number || "",
//           taskTitle: (item?.title || "").toString(),
//           priority: (item?.priority ?? "").toString(),
//           dueDate: (item?.assignedDate || "").toString(),
//           requestorName: (item?.createdBy || "").toString(),
//           workitemId: number || (item?.taskId || "").toString(),
//           originSystem: "Tahweel",
//           redirectURL,
//         };
//       })
//     );

//     return { approvals };
//   }

//   // ---------------------------
//   // Tahweel Profile: AD Details
//   // ---------------------------

//   /** Email -> personNumber -> GetADDetails */
//   public async fetchAdDetailsByEmail(email: string): Promise<TahweelAdDetails | null> {
//     const effectiveEmail = (email || "").trim();
//     if (!effectiveEmail) throw new Error("Email is required to fetch AD details.");

//     const personRes = await this.fetchPersonNumberByEmail(effectiveEmail);
//     const employeeNumber = (personRes?.personNumber || "").trim();
//     if (!employeeNumber) throw new Error("Employee/Person number not found for AD details.");

//     return this.fetchAdDetailsByEmployeeNumber(employeeNumber);
//   }

//   public async fetchAdDetailsByEmployeeNumber(employeeNumber: string): Promise<TahweelAdDetails | null> {
//     const emp = (employeeNumber || "").trim();
//     if (!emp) throw new Error("EmployeeNumber is required for AD details.");

//     const requestUrl =
//       `${TAHWEEL_AZURE_API_CONFIG.apiBaseUrl.replace(/\/$/, "")}${TAHWEEL_AZURE_API_CONFIG.adDetailsEndpoint}`;

//     const headers = this.buildTahweelAzureHeaders();

//     const options: IHttpClientOptions = {
//       headers,
//       body: JSON.stringify({
//         [TAHWEEL_AZURE_API_CONFIG.employeeNumberField]: emp,
//       }),
//     };

//     const response: HttpClientResponse = await this.httpClient.post(
//       requestUrl,
//       HttpClient.configurations.v1,
//       options
//     );

//     if (!response.ok) {
//       const t = await response.text().catch(() => "");
//       throw new Error(`Tahweel GetADDetails failed: ${response.status} ${response.statusText}. ${t}`);
//     }

//     const responseText = await response.text().catch(() => "");
//     const parsed = this.safeParsePossiblyDoubleEncodedJson(responseText) as TahweelAdDetailsApiResponse;

//     const first: TahweelAdDetailsApiItem | undefined =
//       Array.isArray(parsed?.data) && parsed.data.length > 0 ? parsed.data[0] : undefined;

//     if (!first) return null;

//     const fullName = (first.full_name || "").toString().trim();
//     const designation = (first.designation || "").toString().trim();
//     const department = (first.department || "").toString().trim();
//     const personNumberFromApi = (first.person_number || "").toString().trim();

//     let imageBase64 = (first.image || "").toString();
//     if (imageBase64) imageBase64 = imageBase64.replace(/\s+/g, "");

//     const imageDataUrl = this.buildImageDataUrl(imageBase64);

//     return {
//       employeeNumber: emp,
//       personNumber: personNumberFromApi || emp,
//       fullName,
//       designation,
//       department,
//       imageBase64: imageBase64 || undefined,
//       imageDataUrl: imageDataUrl || undefined,
//     };
//   }

//   // ---------------------------
//   // Active Employees (Birthdays / Anniversaries)
//   // ---------------------------

//   /**
//    * Fetch active employees for DOB/DOJ celebrations.
//    * You were testing GET with body in Postman; here we use POST (more reliable).
//    */
//   public async fetchActiveEmployees(payload: { DOB: string; DOJ: string }): Promise<TahweelActiveEmployee[]> {
//     const requestUrl =
//       `${TAHWEEL_AZURE_API_CONFIG.apiBaseUrl.replace(/\/$/, "")}${TAHWEEL_AZURE_API_CONFIG.activeEmployeesEndpoint}`;

//     const headers = this.buildTahweelAzureHeaders();

//     const options: IHttpClientOptions = {
//       headers,
//       body: JSON.stringify({
//         DOB: (payload?.DOB || "").toString(),
//         DOJ: (payload?.DOJ || "").toString(),
//       }),
//     };

//     const response: HttpClientResponse = await this.httpClient.post(
//       requestUrl,
//       HttpClient.configurations.v1,
//       options
//     );

//     if (!response.ok) {
//       const t = await response.text().catch(() => "");
//       throw new Error(`Tahweel Active Employees failed: ${response.status} ${response.statusText}. ${t}`);
//     }

//     const txt = await response.text().catch(() => "");
//     const parsed = this.safeParsePossiblyDoubleEncodedJson(txt) as TahweelActiveEmployeesApiResponse;

//     const rows: TahweelActiveEmployeesApiItem[] = Array.isArray(parsed?.response) ? parsed.response : [];

//     return rows.map((r) => {
//       const personNumber = (r.person_number || "").toString().trim();
//       const fullName = (r.full_name || "").toString().trim();

//       const doj = (r.doj || "").toString().trim();
//       const dateOfBirth = (r.date_of_birth || "").toString().trim();

//       const designation = (r.designation || "").toString().trim();
//       const department = (r.department || "").toString().trim();
//       const division = (r.division || "").toString().trim();

//       const email = (r.email_address || "").toString().trim();

//       const imageRaw = (r.image || "").toString().trim();

//       // Determine final usable image
//       let finalUrl = "";
//       if (imageRaw) {
//         if (this.isHttpUrl(imageRaw) || /^data:image\//i.test(imageRaw) || this.isServerRelative(imageRaw)) {
//           finalUrl = imageRaw;
//         } else {
//           // assume base64
//           finalUrl = this.buildImageDataUrl(imageRaw);
//         }
//       }

//       return {
//         personNumber,
//         fullName,
//         doj,
//         dateOfBirth,
//         designation,
//         department,
//         division,
//         email,
//         imageRaw: imageRaw || undefined,
//         imageUrl: finalUrl || undefined,
//         imageDataUrl: finalUrl || undefined,
//         location: (r.location || "").toString().trim() || undefined,
//         skill: (r.skill || "").toString().trim() || undefined,
//       };
//     });
//   }
// }




































import { HttpClient, IHttpClientOptions, HttpClientResponse } from "@microsoft/sp-http";

/**
 * Tahweel Azure Web App config
 * (Tasks, Profile AD Details, Leave Balance, Active Employees)
 */
const TAHWEEL_AZURE_API_CONFIG = {
  apiBaseUrl: "https://wapp-corpdms-dev-001.azurewebsites.net",
  // Tasks
  taskListEndpoint: "/api/Tahweel/GetTahweelApprovalList",
  taskApprovalUrlEndpoint: "/api/Tahweel/GetTahweelTaskApprovalUrl",
  // Profile
  adDetailsEndpoint: "/api/Tahweel/GetADDetails",
  // Leave
  leaveBalanceEndpoint: "/api/Tahweel/GetEmployeeLeaveBalance",
  // Employees (Birthdays / Anniversaries)
  activeEmployeesEndpoint: "/api/Tahweel/GetActiveEmployees",
  // Auth
  apiKeyHeaderName: "x-api-key",
  apiKey: "qnwCDLTzcXO50lteD3S5By408lqputhj89ihYtiHW6o=",
  // Fields
  employeeNumberField: "EmployeeNumber",
  taskNumberField: "TaskNumber",
  employeeEmailField: "EmployeeEmailaddress",
};

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
  totalCount?: number; 
}

/**
 * Tahweel AD details mapped for Profile Header
 */
export interface TahweelAdDetails {
  employeeNumber: string; 
  personNumber: string;
  fullName: string;
  designation: string;
  department: string;
  imageBase64?: string;
  imageDataUrl?: string;
}

/**
 * Leave balance result used by ApplyLeave
 * NOTE: as per your note, PERSON_NUMBER is what you treat as employee/person number
 */
export interface TahweelEmployeeLeaveBalance {
  personNumber: string; 
  leaveBalance: string; 
  tillDate: string; 
  hasPersonNumber: boolean;
  hasBalance: boolean;
}

/**
 * Active Employees used by LetsCelebrate (Birthdays / Anniversaries)
 */
export interface TahweelActiveEmployee {
  personNumber: string;
  fullName: string;
  doj: string;
  dateOfBirth: string;
  designation?: string;
  department?: string;
  division?: string;
  email?: string;
  imageRaw?: string;
  imageUrl?: string;
  imageDataUrl?: string;
  location?: string;
  skill?: string;
}

/** ------------ Raw shapes (Azure API) ------------ */

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

type TahweelAdDetailsApiItem = {
  person_number?: string;
  full_name?: string;
  designation?: string;
  department?: string;
  image?: string;
  [key: string]: any;
};

type TahweelAdDetailsApiResponse = {
  status_code?: number;
  data?: TahweelAdDetailsApiItem[];
  [key: string]: any;
};

type TahweelLeaveBalanceApiItem = {
  PERSON_NUMBER?: string;
  LEAVE_BALANCE?: string | number;
  TILL_DATE?: string;
  [key: string]: any;
};

type TahweelLeaveBalanceApiResponse = {
  status_code?: number;
  data?: TahweelLeaveBalanceApiItem[];
  [key: string]: any;
};

type TahweelActiveEmployeesApiItem = {
  person_number?: string;
  full_name?: string;
  doj?: string;
  date_of_birth?: string;
  designation?: string;
  department?: string;
  division?: string;
  location?: string;
  skill?: string;
  image?: string;
  email_address?: string;
  [key: string]: any;
};

type TahweelActiveEmployeesApiResponse = {
  response?: TahweelActiveEmployeesApiItem[];
  [key: string]: any;
};

export class TahweelService {
  private readonly httpClient: HttpClient;
  // shared cache across instances (Task + Profile + Leave balance)
  private static _personNumberPromiseByEmail: {
    [email: string]: Promise<{ personNumber: string; decodedXml: string }>;
  } = {};

  constructor(config: TahweelServiceConfig) {
    this.httpClient = config.httpClient;
  }

  // ---------------------------
  // Common helpers
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

    const apiKey = (TAHWEEL_AZURE_API_CONFIG.apiKey || "").trim();
    if (!apiKey) throw new Error("Tahweel failed: API key is missing.");

    headers.append(TAHWEEL_AZURE_API_CONFIG.apiKeyHeaderName, apiKey);
    return headers;
  }

  /** Base64 image support (AD Details / Active Employees can return base64) */
  private buildImageDataUrl(imageBase64?: string): string {
    const b64 = (imageBase64 || "").replace(/\s+/g, "");
    if (!b64) return "";

    // if already a data url, keep it
    if (/^data:image\//i.test(b64)) return b64;

    const isPng = b64.indexOf("iVBOR") === 0;
    const isJpg = b64.indexOf("/9j/") === 0;
    const mime = isPng ? "image/png" : isJpg ? "image/jpeg" : "image/png";

    return `data:${mime};base64,${b64}`;
  }

  private isHttpUrl(v: string): boolean {
    return /^https?:\/\//i.test(v || "");
  }

  private isServerRelative(v: string): boolean {
    return !!v && v[0] === "/";
  }

  // ---------------------------
  // Leave Balance (Azure Web App)
  // ---------------------------

  /** Email -> { PERSON_NUMBER, LEAVE_BALANCE, TILL_DATE } */
  public async fetchEmployeeLeaveBalanceByEmail(email: string): Promise<TahweelEmployeeLeaveBalance> {
    const effectiveEmail = (email || "").trim();
    if (!effectiveEmail) throw new Error("Email is required for leave balance.");

    const requestUrl =
      `${TAHWEEL_AZURE_API_CONFIG.apiBaseUrl.replace(/\/$/, "")}${TAHWEEL_AZURE_API_CONFIG.leaveBalanceEndpoint}`;

    const headers = this.buildTahweelAzureHeaders();

    const options: IHttpClientOptions = {
      headers,
      body: JSON.stringify({
        [TAHWEEL_AZURE_API_CONFIG.employeeEmailField]: effectiveEmail,
      }),
    };

    const response: HttpClientResponse = await this.httpClient.post(
      requestUrl,
      HttpClient.configurations.v1,
      options
    );

    if (!response.ok) {
      const t = await response.text().catch(() => "");
      throw new Error(`Tahweel Leave Balance failed: ${response.status} ${response.statusText}. ${t}`);
    }

    const txt = await response.text().catch(() => "");
    const parsed = this.safeParsePossiblyDoubleEncodedJson(txt) as TahweelLeaveBalanceApiResponse;

    const first: TahweelLeaveBalanceApiItem | undefined =
      Array.isArray(parsed?.data) && parsed.data.length > 0 ? parsed.data[0] : undefined;

    const personNumber = (first?.PERSON_NUMBER || "").toString().trim();

    const leaveBalanceRaw = first?.LEAVE_BALANCE;
    const leaveBalance =
      leaveBalanceRaw === null || leaveBalanceRaw === undefined ? "" : leaveBalanceRaw.toString().trim();

    const tillDate = (first?.TILL_DATE || "").toString().trim();

    return {
      personNumber,
      leaveBalance,
      tillDate,
      hasPersonNumber: !!personNumber,
      hasBalance: !!leaveBalance,
    };
  }

  /**
   * Task.tsx and ProfileHeaderComp.tsx still call this.
   * Now sourced from Leave Balance API (PERSON_NUMBER).
   * decodedXml kept for backward-compat (empty string).
   */
  public async fetchPersonNumberByEmail(email: string): Promise<{ personNumber: string; decodedXml: string }> {
    const effectiveEmail = (email || "").trim();
    if (!effectiveEmail) throw new Error("Email is required to fetch person number.");

    if (!TahweelService._personNumberPromiseByEmail[effectiveEmail]) {
      TahweelService._personNumberPromiseByEmail[effectiveEmail] = (async () => {
        const leave = await this.fetchEmployeeLeaveBalanceByEmail(effectiveEmail);

        if (!leave.hasPersonNumber) {
          throw new Error("Employee Number Not Present");
        }

        return { personNumber: leave.personNumber, decodedXml: "" };
      })();
    }

    return TahweelService._personNumberPromiseByEmail[effectiveEmail];
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
      `${TAHWEEL_AZURE_API_CONFIG.apiBaseUrl.replace(/\/$/, "")}${TAHWEEL_AZURE_API_CONFIG.taskApprovalUrlEndpoint}`;

    const headers = this.buildTahweelAzureHeaders();

    const options: IHttpClientOptions = {
      headers,
      body: JSON.stringify({
        [TAHWEEL_AZURE_API_CONFIG.employeeNumberField]: emp,
        [TAHWEEL_AZURE_API_CONFIG.taskNumberField]: taskNo,
      }),
    };

    const response: HttpClientResponse = await this.httpClient.post(
      requestUrl,
      HttpClient.configurations.v1,
      options
    );

    if (!response.ok) {
      const t = await response.text().catch(() => "");
      throw new Error(`Tahweel task approval URL failed: ${response.status} ${response.statusText}. ${t}`);
    }

    const txt = await response.text().catch(() => "");
    const parsed = this.safeParsePossiblyDoubleEncodedJson(txt) as TahweelTaskUrlApiRawResponse;

    const url = parsed?.url?.result?.text || "";
    return (url || "").toString().trim();
  }

  /**
   * ✅ NEW (Widget/Homepage optimized)
   * - Returns totalCount of ALL tasks
   * - Generates redirectURL only for topN items (performance)
   */
  public async fetchTahweelApprovalsForWidget(
    employeeNumber: string,
    topN: number = 4
  ): Promise<TahweelTaskListApiResponse> {
    const emp = (employeeNumber || "").trim();
    if (!emp) throw new Error("Tahweel approvals failed: EmployeeNumber is required.");

    const requestUrl =
      `${TAHWEEL_AZURE_API_CONFIG.apiBaseUrl.replace(/\/$/, "")}${TAHWEEL_AZURE_API_CONFIG.taskListEndpoint}`;

    const headers = this.buildTahweelAzureHeaders();

    const options: IHttpClientOptions = {
      headers,
      body: JSON.stringify({
        [TAHWEEL_AZURE_API_CONFIG.employeeNumberField]: emp,
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
    const totalCount = items.length;

    const safeTopN = Math.max(0, topN || 0);
    const topItems = items.slice(0, safeTopN);

    const approvals: TahweelApproval[] = await Promise.all(
      topItems.map(async (item) => {
        const number = (item?.number || "").toString().trim();
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

    return { approvals, totalCount };
  }

  /** Tahweel task listing (FULL - generates URL for every item) */
  public async fetchTahweelApprovalsByEmployeeNumber(employeeNumber: string): Promise<TahweelTaskListApiResponse> {
    const emp = (employeeNumber || "").trim();
    if (!emp) throw new Error("Tahweel approvals failed: EmployeeNumber is required.");

    const requestUrl =
      `${TAHWEEL_AZURE_API_CONFIG.apiBaseUrl.replace(/\/$/, "")}${TAHWEEL_AZURE_API_CONFIG.taskListEndpoint}`;

    const headers = this.buildTahweelAzureHeaders();

    const options: IHttpClientOptions = {
      headers,
      body: JSON.stringify({
        [TAHWEEL_AZURE_API_CONFIG.employeeNumberField]: emp,
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
    const totalCount = items.length;

    const approvals: TahweelApproval[] = await Promise.all(
      items.map(async (item) => {
        const number = (item?.number || "").toString().trim();
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

    return { approvals, totalCount };
  }

  // ---------------------------
  // Tahweel Profile: AD Details
  // ---------------------------

  /** Email -> personNumber -> GetADDetails */
  public async fetchAdDetailsByEmail(email: string): Promise<TahweelAdDetails | null> {
    const effectiveEmail = (email || "").trim();
    if (!effectiveEmail) throw new Error("Email is required to fetch AD details.");

    const personRes = await this.fetchPersonNumberByEmail(effectiveEmail);
    const employeeNumber = (personRes?.personNumber || "").trim();
    if (!employeeNumber) throw new Error("Employee/Person number not found for AD details.");

    return this.fetchAdDetailsByEmployeeNumber(employeeNumber);
  }

  public async fetchAdDetailsByEmployeeNumber(employeeNumber: string): Promise<TahweelAdDetails | null> {
    const emp = (employeeNumber || "").trim();
    if (!emp) throw new Error("EmployeeNumber is required for AD details.");

    const requestUrl =
      `${TAHWEEL_AZURE_API_CONFIG.apiBaseUrl.replace(/\/$/, "")}${TAHWEEL_AZURE_API_CONFIG.adDetailsEndpoint}`;

    const headers = this.buildTahweelAzureHeaders();

    const options: IHttpClientOptions = {
      headers,
      body: JSON.stringify({
        [TAHWEEL_AZURE_API_CONFIG.employeeNumberField]: emp,
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
    const parsed = this.safeParsePossiblyDoubleEncodedJson(responseText) as TahweelAdDetailsApiResponse;

    const first: TahweelAdDetailsApiItem | undefined =
      Array.isArray(parsed?.data) && parsed.data.length > 0 ? parsed.data[0] : undefined;

    if (!first) return null;

    const fullName = (first.full_name || "").toString().trim();
    const designation = (first.designation || "").toString().trim();
    const department = (first.department || "").toString().trim();
    const personNumberFromApi = (first.person_number || "").toString().trim();

    let imageBase64 = (first.image || "").toString();
    if (imageBase64) imageBase64 = imageBase64.replace(/\s+/g, "");

    const imageDataUrl = this.buildImageDataUrl(imageBase64);

    return {
      employeeNumber: emp,
      personNumber: personNumberFromApi || emp,
      fullName,
      designation,
      department,
      imageBase64: imageBase64 || undefined,
      imageDataUrl: imageDataUrl || undefined,
    };
  }

  // ---------------------------
  // Active Employees (Birthdays / Anniversaries)
  // ---------------------------

  /**
   * POST now, so SPFx should call POST with JSON body.
   * Body example: { "DOB": "1", "DOJ": "0" }
   */
  public async fetchActiveEmployees(payload: { DOB: string; DOJ: string }): Promise<TahweelActiveEmployee[]> {
    const requestUrl =
      `${TAHWEEL_AZURE_API_CONFIG.apiBaseUrl.replace(/\/$/, "")}${TAHWEEL_AZURE_API_CONFIG.activeEmployeesEndpoint}`;

    const headers = this.buildTahweelAzureHeaders();

    const options: IHttpClientOptions = {
      headers,
      body: JSON.stringify({
        DOB: (payload?.DOB || "").toString(),
        DOJ: (payload?.DOJ || "").toString(),
      }),
    };

    const response: HttpClientResponse = await this.httpClient.post(
      requestUrl,
      HttpClient.configurations.v1,
      options
    );

    if (!response.ok) {
      const t = await response.text().catch(() => "");
      throw new Error(`Tahweel Active Employees failed: ${response.status} ${response.statusText}. ${t}`);
    }

    const txt = await response.text().catch(() => "");
    const parsed = this.safeParsePossiblyDoubleEncodedJson(txt) as TahweelActiveEmployeesApiResponse;

    const rows: TahweelActiveEmployeesApiItem[] = Array.isArray(parsed?.response) ? parsed.response : [];

    return rows.map((r) => {
      const personNumber = (r.person_number || "").toString().trim();
      const fullName = (r.full_name || "").toString().trim();

      const dojVal = (r.doj || "").toString().trim();
      const dateOfBirth = (r.date_of_birth || "").toString().trim();

      const designation = (r.designation || "").toString().trim();
      const department = (r.department || "").toString().trim();
      const division = (r.division || "").toString().trim();

      const email = (r.email_address || "").toString().trim();

      const imageRaw = (r.image || "").toString().trim();

      // Determine final usable image
      let finalUrl = "";
      if (imageRaw) {
        if (this.isHttpUrl(imageRaw) || /^data:image\//i.test(imageRaw) || this.isServerRelative(imageRaw)) {
          finalUrl = imageRaw;
        } else {
          // assume base64
          finalUrl = this.buildImageDataUrl(imageRaw);
        }
      }

      return {
        personNumber,
        fullName,
        doj: dojVal,
        dateOfBirth,
        designation,
        department,
        division,
        email,
        imageRaw: imageRaw || undefined,
        imageUrl: finalUrl || undefined,
        imageDataUrl: finalUrl || undefined,
        location: (r.location || "").toString().trim() || undefined,
        skill: (r.skill || "").toString().trim() || undefined,
      };
    });
  }
}
