import * as React from "react";
import { useMemo, useState } from "react";
import styles from "./FeedbackModal.module.scss";

import {
  PrimaryButton,
  TextField,
  Dropdown,
  IDropdownOption,
  Modal,
  IconButton,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";

import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";

import type { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPHttpClient } from "@microsoft/sp-http";

export interface IFeedbackModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  context: WebPartContext;

  /** Training page item id (saved as TIRTrainingID in Registered Training / Feedback list) */
  trainingId: number;

  /** UI */
  title?: string; // default: "Feedback for Training Event"

  /** Target list */
  listTitle?: string; // default: "Training Feedback"

  /** Field internals (can be overridden if your internals differ) */
  fieldTrainingIdInternal?: string; // default: "TIRTrainingID"
  fieldDivisionInternal?: string; // default: "TIRDivision"
  fieldDepartmentInternal?: string; // default: "TIRDepartment" (Managed Metadata)
  fieldRatingInternal?: string; // default: "TIRRating"
}

interface IDepartmentTerm {
  id: string; // guid
  label: string;
}

interface IFeedbackForm {
  name: string;
  division: string;
  departmentId: string; // selected term guid
  rating: string;
}

const DEFAULTS = {
  title: "Feedback for Training Event",
  listTitle: "Training Feedback",
  fieldTrainingIdInternal: "TIRTrainingID",
  fieldDivisionInternal: "TIRDivision",
  fieldDepartmentInternal: "TIRDepartment",
  fieldRatingInternal: "TIRRating",
} as const;

const safeStr = (v: any): string => String(v ?? "").trim();

const uniqBy = <T,>(arr: T[], keyFn: (x: T) => string): T[] => {
  const m = new Map<string, T>();
  (arr || []).forEach((x) => {
    const k = keyFn(x);
    if (k && !m.has(k)) m.set(k, x);
  });
  return Array.from(m.values());
};

const extractGuid = (raw?: any): string => {
  const s = String(raw ?? "");
  const m = s.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return m ? m[0] : "";
};

const parseTaxonomyLabel = (raw?: any): string => {
  if (!raw) return "";
  if (typeof raw === "string") {
    const s = raw.trim();
    const after = s.includes(";#") ? s.split(";#").pop() || "" : s;
    const label = after.includes("|") ? after.split("|")[0] : after;
    return label.trim();
  }
  return safeStr(raw?.Label ?? raw?.label ?? raw?.TermLabel ?? raw?.termLabel);
};

const getDefaultLabelFromSPTerm = (t: any): string => {
  const labels = Array.isArray(t?.labels) ? t.labels : [];
  const def = labels.find((l: any) => l?.isDefault) || labels[0];
  return safeStr(def?.name ?? t?.name ?? t?.displayName);
};

async function getCurrentUserId(sp: SPFI, context: WebPartContext): Promise<number> {
  const legacyId = (context.pageContext as any)?.legacyPageContext?.userId;
  if (legacyId) return Number(legacyId);
  try {
    const me: any = await sp.web.currentUser.select("Id")();
    return Number(me?.Id || 0);
  } catch {
    return 0;
  }
}

function tryParseTermSetIdFromSchemaXml(schemaXml?: string): string {
  const xml = String(schemaXml || "");
  const m = xml.match(/TermSetId=\"([0-9a-fA-F-]{36})\"/);
  return m ? m[1] : "";
}

/**
 * Resolve BOTH:
 * - actual internal name of the department taxonomy field on the target list (if possible)
 * - termSetId
 */
async function resolveDepartmentFieldInfo(
  sp: SPFI,
  fieldInternalOrTitleGuess: string,
  listTitle: string
): Promise<{ resolvedInternalName: string; termSetId: string }> {
  // 1) Try site column directly (best when it is truly a site column)
  try {
    const f: any = await sp.web.fields.getByInternalNameOrTitle(fieldInternalOrTitleGuess)();
    const termSetId = tryParseTermSetIdFromSchemaXml(f?.SchemaXml) || extractGuid(f?.TermSetId);
    const internal = safeStr(f?.InternalName) || fieldInternalOrTitleGuess;
    if (termSetId) return { resolvedInternalName: internal, termSetId };
  } catch {
    // ignore
  }

  // 2) Try list field by internal/title
  try {
    const f: any = await sp.web.lists.getByTitle(listTitle).fields.getByInternalNameOrTitle(fieldInternalOrTitleGuess)();
    const termSetId = tryParseTermSetIdFromSchemaXml(f?.SchemaXml) || extractGuid(f?.TermSetId);
    const internal = safeStr(f?.InternalName) || fieldInternalOrTitleGuess;
    if (termSetId) return { resolvedInternalName: internal, termSetId };
  } catch {
    // ignore
  }

  // 3) Heuristic: scan list fields and find the taxonomy field that looks like Department
  try {
    const fields: any[] = await sp.web.lists
      .getByTitle(listTitle)
      .fields.select("InternalName", "Title", "TypeAsString", "SchemaXml")
      .top(500)();

    const pick = (fields || []).find((x) => {
      const title = safeStr(x?.Title).toLowerCase();
      const internal = safeStr(x?.InternalName).toLowerCase();
      const type = safeStr(x?.TypeAsString);
      const isTax = type === "TaxonomyFieldType" || type === "TaxonomyFieldTypeMulti";
      return isTax && (title === "department name" || title.includes("department") || internal.includes("department"));
    });

    if (pick) {
      const termSetId = tryParseTermSetIdFromSchemaXml(pick?.SchemaXml);
      const internal = safeStr(pick?.InternalName);
      return { resolvedInternalName: internal || fieldInternalOrTitleGuess, termSetId };
    }
  } catch {
    // ignore
  }

  return { resolvedInternalName: fieldInternalOrTitleGuess, termSetId: "" };
}

async function fetchDepartmentsFromSPTermStore(
  context: WebPartContext,
  termSetId: string
): Promise<IDepartmentTerm[]> {
  const webUrl = context.pageContext.web.absoluteUrl;

  // NOTE: This is SharePoint Term Store REST (no Graph permissions needed)
  let nextUrl: string | undefined = `${webUrl}/_api/v2.1/termStore/sets('${termSetId}')/terms?$select=id,labels&$top=999`;

  const all: any[] = [];
  while (nextUrl) {
    const res = await context.spHttpClient.get(nextUrl, SPHttpClient.configurations.v1, {
      headers: { Accept: "application/json;odata=nometadata" },
    });

    if (!res.ok) {
      throw new Error(`TermStore REST failed: ${res.status} ${res.statusText}`);
    }

    const json: any = await res.json();
    all.push(...(json?.value || []));

    const nl = json?.["@odata.nextLink"] as string | undefined;
    if (!nl) {
      nextUrl = undefined;
    } else {
      // nextLink can be absolute or relative
      nextUrl = nl.startsWith("http") ? nl : `${webUrl}${nl}`;
    }
  }

  const terms = (all || [])
    .map((t) => ({ id: safeStr(t?.id), label: getDefaultLabelFromSPTerm(t) }))
    .filter((t) => t.id && t.label);

  return uniqBy(terms, (t) => t.id);
}

async function fallbackDepartmentsFromSitePages(sp: SPFI, fieldInternal: string): Promise<IDepartmentTerm[]> {
  // Best-effort fallback: derive unique labels from existing Site Pages values
  try {
    const rows: any[] = await sp.web.lists.getByTitle("Site Pages").items.select(fieldInternal).top(500)();

    const labels = uniqBy(
      (rows || [])
        .map((r) => parseTaxonomyLabel(r?.[fieldInternal]))
        .filter(Boolean)
        .map((l) => ({ id: l, label: l })),
      (x) => x.id
    );

    return labels;
  } catch {
    return [];
  }
}

async function trySetFieldWithCandidates(item: any, fieldCandidates: string[], valueCandidates: string[]): Promise<boolean> {
  for (const fieldName of fieldCandidates) {
    for (const fieldValue of valueCandidates) {
      try {
        const res: any = await item.validateUpdateListItem([{ FieldName: fieldName, FieldValue: fieldValue }]);
        const hasException = Array.isArray(res) && res.some((r) => r?.HasException);
        if (!hasException) return true;
      } catch {
        // keep trying
      }
    }
  }
  return false;
}

async function getChoiceOptions(sp: SPFI, listTitle: string, fieldInternal: string): Promise<string[]> {
  try {
    const f: any = await sp.web.lists.getByTitle(listTitle).fields.getByInternalNameOrTitle(fieldInternal).select("Choices")();
    return Array.isArray(f?.Choices) ? f.Choices.filter(Boolean) : [];
  } catch {
    return [];
  }
}

const FeedbackModal: React.FC<IFeedbackModalProps> = (props) => {
  const cfg = {
    title: props.title || DEFAULTS.title,
    listTitle: props.listTitle || DEFAULTS.listTitle,
    fieldTrainingIdInternal: props.fieldTrainingIdInternal || DEFAULTS.fieldTrainingIdInternal,
    fieldDivisionInternal: props.fieldDivisionInternal || DEFAULTS.fieldDivisionInternal,
    fieldDepartmentInternal: props.fieldDepartmentInternal || DEFAULTS.fieldDepartmentInternal,
    fieldRatingInternal: props.fieldRatingInternal || DEFAULTS.fieldRatingInternal,
  };

  const sp: SPFI = useMemo(() => spfi().using(SPFx(props.context)), [props.context]);

  const [formData, setFormData] = useState<IFeedbackForm>(() => ({
    name: safeStr(props.context?.pageContext?.user?.displayName),
    division: "",
    departmentId: "",
    rating: "",
  }));

  const [departments, setDepartments] = useState<IDepartmentTerm[]>([]);
  const [deptLoading, setDeptLoading] = useState<boolean>(false);
  const [resolvedDeptInternal, setResolvedDeptInternal] = useState<string>(cfg.fieldDepartmentInternal);

  const [divisionOptions, setDivisionOptions] = useState<IDropdownOption[]>([]);
  const [ratingOptions, setRatingOptions] = useState<IDropdownOption[]>([]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: MessageBarType; text: string } | null>(null);

  const departmentOptions: IDropdownOption[] = (departments || []).map((d) => ({ key: d.id, text: d.label }));

  const loadStaticChoices = React.useCallback(async () => {
    // Pull choice options dynamically (so you don't have to hardcode)
    const [divs, ratings] = await Promise.all([
      getChoiceOptions(sp, cfg.listTitle, cfg.fieldDivisionInternal),
      getChoiceOptions(sp, cfg.listTitle, cfg.fieldRatingInternal),
    ]);

    setDivisionOptions(divs.length ? divs.map((x) => ({ key: x, text: x })) : [{ key: "", text: "(No options configured)" }]);
    setRatingOptions(ratings.length ? ratings.map((x) => ({ key: x, text: x })) : [{ key: "", text: "(No options configured)" }]);
  }, [sp, cfg.listTitle, cfg.fieldDivisionInternal, cfg.fieldRatingInternal]);

  const loadDepartments = React.useCallback(async () => {
    setDeptLoading(true);
    try {
      const info = await resolveDepartmentFieldInfo(sp, cfg.fieldDepartmentInternal, cfg.listTitle);
      setResolvedDeptInternal(info.resolvedInternalName || cfg.fieldDepartmentInternal);

      if (info.termSetId) {
        const terms = await fetchDepartmentsFromSPTermStore(props.context, info.termSetId);
        if (terms.length) {
          setDepartments(terms);
          return;
        }
      }

      // fallback: derive labels from Site Pages values
      const fb = await fallbackDepartmentsFromSitePages(sp, cfg.fieldDepartmentInternal);
      setDepartments(fb);
    } catch (e) {
      console.warn("[FeedbackModal] loadDepartments failed", e);
      setDepartments([]);
    } finally {
      setDeptLoading(false);
    }
  }, [sp, cfg.fieldDepartmentInternal, cfg.listTitle, props.context]);

  React.useEffect(() => {
    if (props.isOpen) {
      setSubmitMessage(null);
      setFormData((p) => ({
        ...p,
        name: p.name || safeStr(props.context?.pageContext?.user?.displayName),
      }));

      void loadStaticChoices();
      void loadDepartments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isOpen]);

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setSubmitMessage({ type: MessageBarType.error, text: "Please enter your name" });
      return false;
    }
    if (!formData.division) {
      setSubmitMessage({ type: MessageBarType.error, text: "Please select a division" });
      return false;
    }
    if (!formData.departmentId) {
      setSubmitMessage({ type: MessageBarType.error, text: "Please select a department" });
      return false;
    }
    if (!formData.rating) {
      setSubmitMessage({ type: MessageBarType.error, text: "Please select a rating" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    setSubmitMessage(null);
    if (!validateForm()) return;

    const trainingId = Number(props.trainingId);
    if (!Number.isFinite(trainingId) || trainingId <= 0) {
      setSubmitMessage({ type: MessageBarType.error, text: "Invalid training id." });
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = await getCurrentUserId(sp, props.context);
      if (!userId) throw new Error("Could not resolve current userId.");

      const list = sp.web.lists.getByTitle(cfg.listTitle);

      // 1) Find existing feedback for same training + author (1 per user per training)
      let existingId: number | null = null;
      try {
        const rows: any[] = await list.items
          .select("Id", "AuthorId", cfg.fieldTrainingIdInternal)
          .filter(`AuthorId eq ${userId} and ${cfg.fieldTrainingIdInternal} eq ${trainingId}`)
          .top(1)();
        existingId = rows?.[0]?.Id ?? null;
      } catch {
        existingId = null;
      }

      // 2) Create or update item
      let itemId = existingId;
      const isUpdate = !!existingId;

      if (!itemId) {
        const addRes: any = await list.items.add({ Title: formData.name });
        itemId = addRes?.data?.Id ?? addRes?.data?.ID ?? addRes?.item?.Id ?? addRes?.item?.ID ?? null;

        if (!itemId) {
          const latest: any[] = await list.items
            .select("Id", "AuthorId", "Created")
            .filter(`AuthorId eq ${userId}`)
            .orderBy("Created", false)
            .top(1)();
          itemId = latest?.[0]?.Id ?? null;
        }
      }

      if (!itemId) throw new Error("Could not create/update feedback item.");

      const item = list.items.getById(itemId);

      // 3) Set non-taxonomy fields
      await trySetFieldWithCandidates(item, ["Title"], [formData.name]);
      await trySetFieldWithCandidates(
        item,
        [cfg.fieldTrainingIdInternal, "TrainingId", "TrainingID", "TIRTrainingId"],
        [String(trainingId)]
      );

      await trySetFieldWithCandidates(item, [cfg.fieldDivisionInternal, "Division"], [formData.division]);
      await trySetFieldWithCandidates(item, [cfg.fieldRatingInternal, "Rating"], [formData.rating]);

      // 4) Department (Managed Metadata)
      const selected = departments.find((d) => d.id === formData.departmentId);
      const deptGuid = extractGuid(selected?.id || formData.departmentId) || safeStr(formData.departmentId);
      const deptLabel = safeStr(selected?.label);

      // Prefer the resolved internal name first
      const fieldCandidates = uniqBy(
        [resolvedDeptInternal, cfg.fieldDepartmentInternal, "Department_x0020_Name", "DepartmentName", "Department"].filter(Boolean),
        (x) => x
      );

      const valueCandidates = deptLabel
        ? [`-1;#${deptLabel}|${deptGuid}`, `${deptLabel}|${deptGuid}`, deptLabel]
        : [deptGuid];

      await trySetFieldWithCandidates(item, fieldCandidates, valueCandidates);

      setSubmitMessage({
        type: MessageBarType.success,
        text: isUpdate ? "Feedback updated successfully!" : "Feedback submitted successfully!",
      });

      setTimeout(() => {
        setSubmitMessage(null);
        props.onDismiss();
      }, 1600);
    } catch (error: any) {
      console.error("[FeedbackModal] submit failed", error);
      setSubmitMessage({
        type: MessageBarType.error,
        text: `Error: ${error?.message || "Failed to submit feedback."}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = (): void => {
    if (!isSubmitting) {
      setSubmitMessage(null);
      props.onDismiss();
    }
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onDismiss={handleDismiss}
      isBlocking={isSubmitting}
      containerClassName={styles.modalContainer}
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>{cfg.title}</h2>

          <IconButton
            iconProps={{ iconName: "Cancel" }}
            ariaLabel="Close"
            className={styles.closeButton}
            onClick={handleDismiss}
            disabled={isSubmitting}
          />
        </div>

        {submitMessage && (
          <MessageBar
            messageBarType={submitMessage.type}
            isMultiline={false}
            onDismiss={() => setSubmitMessage(null)}
            dismissButtonAriaLabel="Close"
            className={styles.messageBar}
          >
            {submitMessage.text}
          </MessageBar>
        )}

        <div className={styles.formField}>
          <label className={styles.label}>1. Your name</label>
          <TextField
            placeholder="Enter your name"
            value={formData.name}
            onChange={(_, newValue) => setFormData({ ...formData, name: newValue || "" })}
            className={styles.textField}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>2. Division</label>
          <Dropdown
            placeholder="Select your division"
            options={divisionOptions}
            selectedKey={formData.division}
            onChange={(_, option) => setFormData({ ...formData, division: (option?.key as string) || "" })}
            className={styles.dropdown}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>3. Department</label>
          <Dropdown
            placeholder={deptLoading ? "Loading departments..." : "Select your department"}
            options={departmentOptions}
            selectedKey={formData.departmentId}
            onChange={(_, option) => setFormData({ ...formData, departmentId: (option?.key as string) || "" })}
            className={styles.dropdown}
            disabled={isSubmitting || deptLoading}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>4. How would like to rate the training?</label>
          <Dropdown
            placeholder="Select your rating"
            options={ratingOptions}
            selectedKey={formData.rating}
            onChange={(_, option) => setFormData({ ...formData, rating: (option?.key as string) || "" })}
            className={styles.dropdown}
            disabled={isSubmitting}
          />
        </div>

        <PrimaryButton
          text={isSubmitting ? "Submitting..." : "Submit"}
          onClick={handleSubmit}
          className={styles.submitButton}
          disabled={isSubmitting}
        />
      </div>
    </Modal>
  );
};

export default FeedbackModal;
