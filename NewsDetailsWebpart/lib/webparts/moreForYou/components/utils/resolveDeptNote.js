var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import "@pnp/sp/fields"; // << make sure .fields works
import { DEPT_HIDDEN_TEXT_FIELD_ID } from "../../components/TS/constants";
var CACHE_KEY = "mf_dept_note_internalname";
/**
 * Resolve the hidden Note field **InternalName** for the NADepartment taxonomy column on Site Pages.
 * Strategy:
 *  1) sessionStorage cache
 *  2) If DEPT_HIDDEN_TEXT_FIELD_ID (GUID) is provided -> fields.getById(GUID).InternalName
 *  3) Auto-discover: fields.getByInternalNameOrTitle('NADepartment').TextField (GUID) -> fields.getById(GUID).InternalName
 */
export function resolveDeptNoteInternalName(sp, listTitle) {
    if (listTitle === void 0) { listTitle = "Site Pages"; }
    return __awaiter(this, void 0, void 0, function () {
        var cached, note, internal, tax, textFieldId, note2, internal2, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    cached = sessionStorage.getItem(CACHE_KEY);
                    if (cached)
                        return [2 /*return*/, cached];
                    if (!DEPT_HIDDEN_TEXT_FIELD_ID) return [3 /*break*/, 2];
                    return [4 /*yield*/, sp.web.lists
                            .getByTitle(listTitle)
                            .fields.getById(DEPT_HIDDEN_TEXT_FIELD_ID)
                            .select("InternalName")()];
                case 1:
                    note = _a.sent();
                    internal = note === null || note === void 0 ? void 0 : note.InternalName;
                    if (internal) {
                        sessionStorage.setItem(CACHE_KEY, internal);
                        return [2 /*return*/, internal];
                    }
                    _a.label = 2;
                case 2: return [4 /*yield*/, sp.web.lists
                        .getByTitle(listTitle)
                        .fields.getByInternalNameOrTitle("NADepartment")
                        .select("TextField")()];
                case 3:
                    tax = _a.sent();
                    textFieldId = (tax === null || tax === void 0 ? void 0 : tax.TextField) || null;
                    if (!textFieldId)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, sp.web.lists
                            .getByTitle(listTitle)
                            .fields.getById(textFieldId)
                            .select("InternalName")()];
                case 4:
                    note2 = _a.sent();
                    internal2 = note2 === null || note2 === void 0 ? void 0 : note2.InternalName;
                    if (internal2) {
                        sessionStorage.setItem(CACHE_KEY, internal2);
                        return [2 /*return*/, internal2];
                    }
                    return [2 /*return*/, null];
                case 5:
                    e_1 = _a.sent();
                    console.warn("resolveDeptNoteInternalName failed:", e_1);
                    return [2 /*return*/, null];
                case 6: return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=resolveDeptNote.js.map