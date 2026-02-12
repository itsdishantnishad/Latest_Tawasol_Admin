// CardQRService.ts
import * as QRCode from "qrcode";
import type { WebPartContext } from "@microsoft/sp-webpart-base";

import {
  fetchGraphCoreUserFields,
  type GraphCoreUserFields
} from "./profileHeaderServices";

export type ContactQrResult = {
  core: GraphCoreUserFields;
  vcard: string;
  dataUrl: string;
};

type QrOptions = {
  width?: number;   // default 720 (generate high-res, render smaller)
  margin?: number;  // default 4 (quiet zone)
  ecLevel?: "L" | "M" | "Q" | "H";
};

const clean = (v?: string): string => String(v || "").trim();

const escapeVCardValue = (value: string): string => {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
};

const normalizePhone = (phone: string): string => {
  const p = clean(phone);
  if (!p) return "";
  return p.replace(/[^\d+\-() ]/g, "").trim();
};

const pickBestPhone = (core: GraphCoreUserFields): { mobile: string; work: string } => {
  const mobile = normalizePhone(clean(core.mobilePhone));
  const work =
    (core.businessPhones && core.businessPhones.length
      ? normalizePhone(clean(core.businessPhones[0]))
      : "") || "";

  return { mobile, work };
};

const splitName = (
  displayName: string,
  givenName?: string,
  surname?: string
): { given: string; sur: string } => {
  const g = clean(givenName);
  const s = clean(surname);

  if (g || s) return { given: g, sur: s };

  const dn = clean(displayName).replace(/,/g, " ").replace(/\s+/g, " ");
  if (!dn) return { given: "", sur: "" };

  const parts = dn.split(" ").filter(Boolean);
  if (parts.length === 1) return { given: parts[0], sur: "" };

  return { given: parts[0], sur: parts[parts.length - 1] };
};

/**
 * FAST vCard (small payload => less dense QR => faster scanning)
 * Name + phone + email only
 */
export const buildVCardFromGraphCore = (
  core: GraphCoreUserFields,
  fallbackDisplayName?: string
): string => {
  const displayName = clean(core.displayName) || clean(fallbackDisplayName);
  const { given, sur } = splitName(displayName, core.givenName, core.surname);

  const email = clean(core.mail) || clean(core.userPrincipalName);
  const { mobile, work } = pickBestPhone(core);

  const lines: string[] = [];
  lines.push("BEGIN:VCARD");
  lines.push("VERSION:3.0");

  lines.push(`N:${escapeVCardValue(sur)};${escapeVCardValue(given)};;;`);
  if (displayName) lines.push(`FN:${escapeVCardValue(displayName)}`);

  if (email) lines.push(`EMAIL;TYPE=INTERNET:${escapeVCardValue(email)}`);
  if (mobile) lines.push(`TEL;TYPE=CELL:${escapeVCardValue(mobile)}`);
  if (work) lines.push(`TEL;TYPE=WORK,VOICE:${escapeVCardValue(work)}`);

  lines.push("END:VCARD");

  return lines.join("\r\n");
};

/**
 * Generates a QR code DataURL.
 * NOTE: We intentionally DO NOT pass `type: "image/png"` because some qrcode typings
 * (in SPFx projects) only allow jpeg/webp and then overload resolution breaks.
 * Default output is PNG DataURL anyway.
 */
export const generateQrDataUrl = async (
  payload: string,
  opts?: QrOptions
): Promise<string> => {
  const width = opts?.width ?? 720;
  const margin = opts?.margin ?? 4;
  const errorCorrectionLevel = opts?.ecLevel ?? "Q";

  const options: any = {
    width,
    margin,
    errorCorrectionLevel,
    color: { dark: "#000000", light: "#FFFFFF" }
  };

  // Use callback overload (most compatible with typings), wrap in Promise:
  return new Promise<string>((resolve, reject) => {
    (QRCode as any).toDataURL(payload, options, (err: any, url: string) => {
      if (err) reject(err);
      else resolve(url);
    });
  });
};

/**
 * Optional fallback: download as .vcf when scanning fails.
 */
export const downloadVcf = (vcard: string, fileName = "contact.vcf"): void => {
  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * One-call helper:
 * - Fetch Graph core
 * - Build vCard
 * - Generate QR DataURL
 */
export const getContactQrForUser = async (
  context: WebPartContext,
  userKey?: string,
  opts?: QrOptions
): Promise<ContactQrResult | null> => {
  const core = await fetchGraphCoreUserFields(context, userKey);
  if (!core) return null;

  const vcard = buildVCardFromGraphCore(core);
  const dataUrl = await generateQrDataUrl(vcard, opts);

  return { core, vcard, dataUrl };
};
