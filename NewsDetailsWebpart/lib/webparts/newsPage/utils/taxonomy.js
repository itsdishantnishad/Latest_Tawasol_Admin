/**
 * Safely extract the display label for a single-valued taxonomy field.
 * Works with:
 * - <FieldInternalName>Label (modern REST)
 * - Expanded object { WssId, TermGuid, Label }
 * - TaxCatchAll fallback (WssId -> Term)
 */
export var labelFromTaxField = function (item, fieldInternalName) {
    // 1) direct modern alias e.g. NADepartmentLabel
    var alias = item["".concat(fieldInternalName, "Label")];
    if (alias)
        return alias;
    // 2) expanded value e.g. item.NADepartment?.Label
    var field = item[fieldInternalName];
    if (field === null || field === void 0 ? void 0 : field.Label)
        return field.Label;
    // 3) TaxCatchAll mapping by WssId
    var wssId = field === null || field === void 0 ? void 0 : field.WssId;
    if (wssId && Array.isArray(item.TaxCatchAll)) {
        var hit = item.TaxCatchAll.find(function (t) { return (t === null || t === void 0 ? void 0 : t.ID) === wssId; });
        if (hit === null || hit === void 0 ? void 0 : hit.Term)
            return hit.Term;
    }
    // 4) sometimes API returns just the label string already
    if (typeof field === "string")
        return field;
    return undefined;
};
//# sourceMappingURL=taxonomy.js.map