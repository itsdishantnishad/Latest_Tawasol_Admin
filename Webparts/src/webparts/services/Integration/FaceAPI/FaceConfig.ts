// services/FaceConfig.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IFaceIndexFields {
  albumId: string;
  fileRef: string;
  largeFaceListId: string;
  persistedFaceId: string;
}

export interface IFaceConfig {
  endpoint: string;
  key: string;
  faceIndexListTitle: string;
  faceIndexFields: IFaceIndexFields;
}

/**
 * Reads values from AzureFaceConfig.json (Postman collection style):
 * variable[] contains entries like { key: "face_api_endpoint", value: "..." }
 */
const postmanCollection: any = require("../FaceAPI/config/AzureFaceConfig.json"); // <-- adjust path/name if needed

function getVar(k: string): string | undefined {
  const vars: any[] = postmanCollection?.variable || [];
  const found = vars.find(v => String(v?.key).toLowerCase() === k.toLowerCase());
  return found?.value ? String(found.value) : undefined;
}

function normalizeEndpoint(ep: string): string {
  return ep.replace(/\/+$/, "");
}

export function loadFaceConfig(): IFaceConfig {
  const endpoint = getVar("face_api_endpoint") || "";
  const key = getVar("face_api_key") || "";

  if (!endpoint || !key) {
    throw new Error(
      "Face config missing. Please ensure face_api_endpoint and face_api_key exist in the JSON variable[] array."
    );
  }

  const faceIndexListTitle = getVar("faceindex_list_title") || "DHRE Gallery FaceIndex row";

  /**
   * IMPORTANT:
   * You renamed the *display name* of the built-in Title column to "AlbumId".
   * But its INTERNAL NAME is still "Title".
   * So albumId field mapping must be "Title" (unless you create a new real column whose internal name is AlbumId).
   */
  const faceIndexFields: IFaceIndexFields = {
    albumId: getVar("faceindex_field_albumId") || "Title", 
    fileRef: getVar("faceindex_field_fileRef") || "TIRFileRef",
    largeFaceListId: getVar("faceindex_field_largeFaceListId") || "TIRLargeFaceListId",
    persistedFaceId: getVar("faceindex_field_persistedFaceId") || "TIRPersistedFaceId",
  };

  return {
    endpoint: normalizeEndpoint(endpoint),
    key,
    faceIndexListTitle,
    faceIndexFields,
  };
}