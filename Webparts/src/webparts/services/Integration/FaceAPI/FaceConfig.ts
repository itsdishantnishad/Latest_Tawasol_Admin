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
 * This reads values from your Postman collection JSON file:
 * - variable[] contains entries like { key: "face_api_endpoint", value: "..." }
 *
 * IMPORTANT: Rename the JSON to avoid spaces if possible.
 * Example: src/config/azure-face-config.json
 */
const postmanCollection: any = require("../FaceAPI/config/AzureFaceConfig.json"); // <-- adjust path/name

function getVar(k: string): string | undefined {
  const vars: any[] = postmanCollection?.variable || [];
  const found = vars.find(v => String(v?.key).toLowerCase() === k.toLowerCase());
  return found?.value ? String(found.value) : undefined;
}

function normalizeEndpoint(ep: string): string {
  return ep.replace(/\/+$/, ""); // remove trailing slashes
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

  const faceIndexFields: IFaceIndexFields = {
    albumId: getVar("faceindex_field_albumId") || "AlbumId",
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