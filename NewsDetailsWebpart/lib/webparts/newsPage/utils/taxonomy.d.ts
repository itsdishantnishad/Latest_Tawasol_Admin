/**
 * Safely extract the display label for a single-valued taxonomy field.
 * Works with:
 * - <FieldInternalName>Label (modern REST)
 * - Expanded object { WssId, TermGuid, Label }
 * - TaxCatchAll fallback (WssId -> Term)
 */
export declare const labelFromTaxField: (item: any, fieldInternalName: string) => string | undefined;
//# sourceMappingURL=taxonomy.d.ts.map