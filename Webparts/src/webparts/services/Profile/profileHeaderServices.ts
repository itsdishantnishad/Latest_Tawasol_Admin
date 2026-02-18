import { getSP } from "./spSetup";
import "@pnp/sp/profiles";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import type { MSGraphClientV3 } from "@microsoft/sp-http";
import type { WebPartContext } from "@microsoft/sp-webpart-base";

/**
 * GRAPH HELPERS
 *  FIX: SPFx typings require getClient("3") (no-arg call will fail TS2554)
 */
const getGraphClient = async (context: WebPartContext): Promise<MSGraphClientV3 | null> => {
  const factory = context?.msGraphClientFactory;
  if (!factory?.getClient) return null;

  try {
    return (await factory.getClient("3")) as MSGraphClientV3;
  } catch (e) {
    console.log("[profileHeaderServices] Graph client failed:", e);
    return null;
  }
};

/**
 *  Helper: decide Graph endpoint for current user vs searched user
 * userKey can be:
 * - AAD Object Id (preferred)
 * - UPN / email
 */
const graphUserEndpoint = (userKey?: string): string => {
  const key = String(userKey || "").trim();
  return key ? `/users/${encodeURIComponent(key)}` : "/me";
};

/**
 *  NOTE: We keep your old export name fetchGraphMeInfo for backward compatibility,
 * but now it supports optional userKey so it can fetch another user too.
 */
export const fetchGraphMeInfo = async (
  context: WebPartContext,
  userKey?: string
): Promise<{ fullName: string; designation: string; department: string } | null> => {
  const client = await getGraphClient(context);
  if (!client) return null;

  try {
    const ep = graphUserEndpoint(userKey);
    const u = await client.api(ep).select("displayName,jobTitle,department").get();

    return {
      fullName: String(u?.displayName || "").trim(),
      designation: String(u?.jobTitle || "").trim(),
      department: String(u?.department || "").trim(),
    };
  } catch (e) {
    console.log("[profileHeaderServices] Graph user info failed:", e);
    return null;
  }
};

/**
 * CORE USER FIELDS
 * These are the common directory profile fields that are typically available.
 */
export type GraphCoreUserFields = {
  id?: string;
  displayName?: string;
  givenName?: string;
  surname?: string;
  jobTitle?: string;
  department?: string;
  companyName?: string;
  officeLocation?: string;
  mail?: string;
  userPrincipalName?: string;
  mobilePhone?: string;
  businessPhones?: string[];
  preferredLanguage?: string;
  employeeId?: string;
  employeeType?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  accountEnabled?: boolean;
};

/**
 *  Keep export name same, but now supports optional userKey:
 * - userKey undefined => /me
 * - userKey defined  => /users/{userKey}
 */
export const fetchGraphCoreUserFields = async (
  context: WebPartContext,
  userKey?: string
): Promise<GraphCoreUserFields | null> => {
  const client = await getGraphClient(context);
  if (!client) return null;

  try {
    const select = [
      "id",
      "displayName",
      "givenName",
      "surname",
      "jobTitle",
      "department",
      "companyName",
      "officeLocation",
      "mail",
      "userPrincipalName",
      "mobilePhone",
      "businessPhones",
      "preferredLanguage",
      "employeeId",
      "employeeType",
      "streetAddress",
      "city",
      "state",
      "postalCode",
      "country",
      "accountEnabled",
    ].join(",");

    const ep = graphUserEndpoint(userKey);
    const u: any = await client.api(ep).select(select).get();
    const businessPhones: string[] = Array.isArray(u?.businessPhones)
      ? u.businessPhones
          .filter((x: any) => String(x || "").trim())
          .map((x: any) => String(x).trim())
      : [];

    const out: GraphCoreUserFields = {
      id: String(u?.id || "").trim() || undefined,
      displayName: String(u?.displayName || "").trim() || undefined,
      givenName: String(u?.givenName || "").trim() || undefined,
      surname: String(u?.surname || "").trim() || undefined,
      jobTitle: String(u?.jobTitle || "").trim() || undefined,
      department: String(u?.department || "").trim() || undefined,
      companyName: String(u?.companyName || "").trim() || undefined,
      officeLocation: String(u?.officeLocation || "").trim() || undefined,
      mail: String(u?.mail || "").trim() || undefined,
      userPrincipalName: String(u?.userPrincipalName || "").trim() || undefined,
      mobilePhone: String(u?.mobilePhone || "").trim() || undefined,
      businessPhones: businessPhones.length ? businessPhones : undefined,
      preferredLanguage: String(u?.preferredLanguage || "").trim() || undefined,
      employeeId: String(u?.employeeId || "").trim() || undefined,
      employeeType: String(u?.employeeType || "").trim() || undefined,
      streetAddress: String(u?.streetAddress || "").trim() || undefined,
      city: String(u?.city || "").trim() || undefined,
      state: String(u?.state || "").trim() || undefined,
      postalCode: String(u?.postalCode || "").trim() || undefined,
      country: String(u?.country || "").trim() || undefined,
      accountEnabled: typeof u?.accountEnabled === "boolean" ? u.accountEnabled : undefined,
    };

    return out;
  } catch (e) {
    console.log("[profileHeaderServices] Graph core fields failed:", e);
    return null;
  }
};

/**
 * Photo: now supports optional userKey
 */
export const fetchGraphMyPhotoBlob = async (context: WebPartContext, userKey?: string): Promise<Blob | null> => {
  const client = await getGraphClient(context);
  if (!client) return null;

  try {
    const ep = userKey
      ? `/users/${encodeURIComponent(String(userKey).trim())}/photo/$value`
      : `/me/photo/$value`;

    const ab: ArrayBuffer = await (client.api(ep) as any).responseType("arraybuffer").get();
    if (!ab || !ab.byteLength) return null;

    return new Blob([ab], { type: "image/jpeg" });
  } catch (e) {
    // Photo often fails for some users; keep it silent-ish
    console.log("[profileHeaderServices] Graph photo failed:", e);
    return null;
  }
};

/**
 * SHAREPOINT PROFILE FALLBACKS
 * These are SELF-ONLY (myProperties, SetMyProfilePicture)
 */
export const fetchUserProfilePicture = async (): Promise<string | null> => {
  try {
    const sp = getSP();
    const profile: any = await sp.profiles.myProperties();

    const fromTopLevel = profile?.PictureUrl || profile?.PictureURL;
    const fromProps = profile?.UserProfileProperties?.find((p: any) => p.Key === "PictureURL")?.Value;

    return (fromTopLevel || fromProps || null) as string | null;
  } catch (error) {
    console.error("[profileHeaderServices] Failed to fetch profile picture:", error);
    return null;
  }
};

export const fetchCurrentUserInfo = async (): Promise<{ fullName: string; department: string } | null> => {
  try {
    const sp = getSP();
    const profile: any = await sp.profiles.myProperties();

    const fullName = profile?.DisplayName || profile?.AccountName || "";
    const department = profile?.UserProfileProperties?.find((p: any) => p.Key === "Department")?.Value || "";

    return { fullName, department };
  } catch (error) {
    console.error("[profileHeaderServices] Failed to fetch user info:", error);
    return null;
  }
};

export const getSiteUrl = async (): Promise<string> => {
  try {
    const ctx: any = (window as any)?._spPageContextInfo;
    if (ctx?.webServerRelativeUrl) return ctx.webServerRelativeUrl;

    if (ctx?.webAbsoluteUrl) {
      const url = new URL(ctx.webAbsoluteUrl);
      return url.pathname || "/";
    }

    const current = new URL(window.location.href);
    return current.pathname.replace(/\/SitePages\/.*/i, "");
  } catch (error) {
    console.error("[profileHeaderServices] Failed to fetch site URL:", error);
    return "";
  }
};

export const uploadProfilePicture = async (file: File, siteUrl: string): Promise<string | null> => {
  try {
    if (!file.type.startsWith("image/")) throw new Error("Please select a valid image file");
    if (file.size > 5 * 1024 * 1024) throw new Error("File size must be less than 5MB");

    const sp = getSP();
    const fileName = `${Date.now()}-${file.name}`;
    const fileContent = await file.arrayBuffer();

    const normalizedSiteUrl = siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
    const folderServerRelativePath = `${normalizedSiteUrl}/User Photos`;

    await sp.web
      .getFolderByServerRelativePath(folderServerRelativePath)
      .files.addUsingPath(fileName, fileContent, { Overwrite: true });

    return `${folderServerRelativePath}/${fileName}`;
  } catch (error) {
    console.error("[profileHeaderServices] Failed to upload profile picture:", error);
    throw error;
  }
};

export const updateUserProfilePicture = async (photoUrl: string): Promise<void> => {
  try {
    const absoluteUrl =
      (window as any)?._spPageContextInfo?.webAbsoluteUrl ?? document.location.origin;

    const response = await fetch(`${absoluteUrl}/_api/SP.UserProfiles.PeopleManager/SetMyProfilePicture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;odata=verbose",
        Accept: "application/json;odata=verbose",
        "X-RequestDigest": (document.getElementById("__REQUESTDIGEST") as HTMLInputElement)?.value || "",
      },
      body: JSON.stringify({ imageUrl: photoUrl }),
    });

    if (!response.ok) throw new Error("Failed to update profile picture");
  } catch (error) {
    console.error("[profileHeaderServices] Failed to update profile picture:", error);
    throw error;
  }
};

/**
 * Clipboard helper with fallback (some browsers block navigator.clipboard in non-secure contexts).
 */
export const copyTextToClipboard = async (text: string): Promise<void> => {
  const value = String(text || "").replace(/\r\n/g, "\n");
  if (!value.trim()) return;

  try {
    await navigator.clipboard.writeText(value);
    return;
  } catch {
    // fallback
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.setAttribute("readonly", "true");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
};

export const buildProfessionalProfileText = (args: {
  core?: GraphCoreUserFields | null;
  fallbackName?: string;
  fallbackDesignation?: string;
  fallbackDepartment?: string;
}): string => {
  const core = args.core || {};
  const name = (core.displayName || args.fallbackName || "").trim();
  const jobTitle = (core.jobTitle || args.fallbackDesignation || "").trim();
  const department = (core.department || args.fallbackDepartment || "").trim();
  const company = (core.companyName || "").trim();
  const office = (core.officeLocation || "").trim();
  const email = (core.mail || "").trim();
  const upn = (core.userPrincipalName || "").trim();
  const mobile = (core.mobilePhone || "").trim();
  const businessPhones = (core.businessPhones || []).filter(Boolean).join(", ").trim();
  const lang = (core.preferredLanguage || "").trim();
  const employeeId = (core.employeeId || "").trim();
  const employeeType = (core.employeeType || "").trim();
  const addrParts = [core.streetAddress, core.city, core.state, core.postalCode, core.country]
    .map((x) => String(x || "").trim())
    .filter(Boolean);
  const address = addrParts.join(", ");

  const status =
    typeof core.accountEnabled === "boolean" ? (core.accountEnabled ? "Active" : "Disabled") : "";

  const lines: string[] = [];
  lines.push("PROFILE INFORMATION");
  lines.push("──────────────────");

  const add = (label: string, value?: string) => {
    const v = String(value || "").trim();
    if (!v) return;
    lines.push(`${label}: ${v}`);
  };

  add("Name", name);
  add("Job Title", jobTitle);
  add("Department", department);
  add("Company", company);
  add("Office Location", office);
  add("Email", email || upn);
  if (email && upn && email.toLowerCase() !== upn.toLowerCase()) add("UPN", upn);

  add("Business Phone", businessPhones);
  add("Mobile Phone", mobile);
  add("Preferred Language", lang);
  add("Employee ID", employeeId);
  add("Employee Type", employeeType);
  add("Address", address);
  add("Account Status", status);

  lines.push("");
  lines.push(`Copied on: ${new Date().toLocaleString()}`);

  return lines.join("\n");
};

export type SelectedBadge = { name: string; imageUrl: string };
const SELECTED_BADGE_STORAGE_KEY = "tawasol_selected_badge";

export const saveSelectedBadge = (badge: SelectedBadge | null): void => {
  try {
    if (!badge) {
      window.localStorage.removeItem(SELECTED_BADGE_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(SELECTED_BADGE_STORAGE_KEY, JSON.stringify(badge));
  } catch (e) {
    console.warn("[profileHeaderServices] saveSelectedBadge failed:", e);
  }
};

export const loadSelectedBadge = (): SelectedBadge | null => {
  try {
    const raw = window.localStorage.getItem(SELECTED_BADGE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SelectedBadge;
    if (!parsed?.name || !parsed?.imageUrl) return null;

    return parsed;
  } catch (e) {
    console.warn("[profileHeaderServices] loadSelectedBadge failed:", e);
    return null;
  }
};
