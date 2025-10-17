import { SPFI } from "@pnp/sp";
import "@pnp/sp/fields";
/**
 * Resolve the hidden Note field **InternalName** for the NADepartment taxonomy column on Site Pages.
 * Strategy:
 *  1) sessionStorage cache
 *  2) If DEPT_HIDDEN_TEXT_FIELD_ID (GUID) is provided -> fields.getById(GUID).InternalName
 *  3) Auto-discover: fields.getByInternalNameOrTitle('NADepartment').TextField (GUID) -> fields.getById(GUID).InternalName
 */
export declare function resolveDeptNoteInternalName(sp: SPFI, listTitle?: string): Promise<string | null>;
//# sourceMappingURL=resolveDeptNote.d.ts.map