import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import styles from "./Registrationmodal.module.scss";
import {
  PrimaryButton,
  TextField,
  Dropdown,
  IDropdownOption,
  ChoiceGroup,
  IChoiceGroupOption,
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
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPHttpClient } from "@microsoft/sp-http";

export interface IEventRegistrationProps {
  isOpen: boolean;
  onDismiss: () => void;
  context: WebPartContext;
  eventId: string | number;
  onSuccess?: () => void;
  listTitle?: string;
  fieldRegisteredUsersInternal?: string;
  fieldDivisionInternal?: string;
  fieldDepartmentInternal?: string;
  fieldJoinUsInternal?: string;
}

type TaxonomyTermValue = {
  label: string;
  termGuid: string;
};

export interface IRegistrationData {
  name: string;
  division: TaxonomyTermValue | null;
  department: TaxonomyTermValue | null;
  joining: "Yes" | "No" | "";
}

const DEFAULTS = {
  listTitle: "Registered User Event",
  fieldRegisteredUsersInternal: "TIRRegisteredUsers",
  fieldDivisionInternal: "TIRDivsion",
  fieldDepartmentInternal: "TIRDepartment",
  fieldJoinUsInternal: "TIRJoinUs",
};

const uniqNums = (arr: number[]) =>
  Array.from(new Set(arr.filter((n) => Number.isFinite(n) && n > 0)));

const parseNumericIdList = (raw: any): number[] => {
  const text = String(raw || "");
  const tokens = text
    .split(/[,\n\r]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const ids = tokens
    .filter((t) => /^\d+$/.test(t))
    .map((t) => parseInt(t, 10))
    .filter((n) => Number.isFinite(n) && n > 0);

  return uniqNums(ids);
};

const EventRegistration: React.FC<IEventRegistrationProps> = (props) => {
  const cfg = useMemo(
    () => ({
      listTitle: props.listTitle || DEFAULTS.listTitle,
      fieldRegisteredUsersInternal:
        props.fieldRegisteredUsersInternal || DEFAULTS.fieldRegisteredUsersInternal,
      fieldDivisionInternal:
        props.fieldDivisionInternal || DEFAULTS.fieldDivisionInternal,
      fieldDepartmentInternal:
        props.fieldDepartmentInternal || DEFAULTS.fieldDepartmentInternal,
      fieldJoinUsInternal: props.fieldJoinUsInternal || DEFAULTS.fieldJoinUsInternal,
    }),
    [
      props.listTitle,
      props.fieldRegisteredUsersInternal,
      props.fieldDivisionInternal,
      props.fieldDepartmentInternal,
      props.fieldJoinUsInternal,
    ]
  );

  const [formData, setFormData] = useState<IRegistrationData>({
    name: "",
    division: null,
    department: null,
    joining: "",
  });

  const [divisionOptions, setDivisionOptions] = useState<IDropdownOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<IDropdownOption[]>([]);
  const [isLoadingTerms, setIsLoadingTerms] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: MessageBarType;
    text: string;
  } | null>(null);

  const sp: SPFI = useMemo(() => spfi().using(SPFx(props.context)), [props.context]);


  const joiningOptions: IChoiceGroupOption[] = [
    { key: "Yes", text: "Yes" },
    { key: "No", text: "No" },
  ];

  const cleanGuid = (value?: string): string =>
    String(value || "").replace(/[{}]/g, "").trim();

  const getXmlPropertyValue = (schemaXml: string, propertyName: string): string => {
    if (!schemaXml) return "";

    try {
      const xml = new DOMParser().parseFromString(schemaXml, "text/xml");
      const properties = Array.from(xml.getElementsByTagName("Property"));

      for (const property of properties) {
        const name = property.getElementsByTagName("Name")[0]?.textContent;
        const value = property.getElementsByTagName("Value")[0]?.textContent;

        if (name === propertyName) {
          return cleanGuid(value || "");
        }
      }

      return cleanGuid(xml.documentElement.getAttribute(propertyName) || "");
    } catch {
      const match = schemaXml.match(
        new RegExp(`<Name>${propertyName}</Name>\\s*<Value[^>]*>([^<]+)</Value>`, "i")
      );

      return cleanGuid(match?.[1] || "");
    }
  };

  const getFieldTermSetId = async (fieldInternalName: string): Promise<string> => {
    let field: any;

    try {
      // For a Site Column used in this list, SharePoint exposes it in list.fields too.
      field = await sp.web.lists
        .getByTitle(cfg.listTitle)
        .fields.getByInternalNameOrTitle(fieldInternalName)
        .select("Title", "InternalName", "TypeAsString", "SchemaXml")();
    } catch {
      // Fallback to the Site Column directly.
      field = await sp.web.fields
        .getByInternalNameOrTitle(fieldInternalName)
        .select("Title", "InternalName", "TypeAsString", "SchemaXml")();
    }

    const termSetId = getXmlPropertyValue(field?.SchemaXml || "", "TermSetId");

    if (!termSetId) {
      throw new Error(
        `Could not find TermSetId for Managed Metadata field "${fieldInternalName}".`
      );
    }

    return termSetId;
  };

  const getDefaultTermLabel = (term: any): string => {
    const label =
      term?.labels?.find((item: any) => item?.isDefault)?.name ||
      term?.labels?.[0]?.name ||
      term?.localizedNames?.find((item: any) => item?.languageTag === "en-US")?.name ||
      term?.localizedNames?.[0]?.name ||
      term?.name ||
      "";

    return String(label).trim();
  };

  const getJson = async (url: string): Promise<any> => {
    const response = await props.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: {
          Accept: "application/json;odata=nometadata",
        },
      }
    );

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`${response.status} ${response.statusText}: ${responseText}`);
    }

    return response.json();
  };

  const getTermsFromTermSet = async (termSetId: string): Promise<any[]> => {
    const siteUrl = props.context.pageContext.web.absoluteUrl;
    const id = cleanGuid(termSetId);

    // Different SharePoint tenants/packages can support slightly different
    // term store REST URL shapes, so try the common v2.1 endpoints first.
    const urls = [
      `${siteUrl}/_api/v2.1/termstore/sets('${id}')/children`,
      `${siteUrl}/_api/v2.1/termstore/sets/${id}/children`,
      `${siteUrl}/_api/v2.1/termstore/sets('${id}')/terms`,
      `${siteUrl}/_api/v2.1/termstore/sets/${id}/terms`,
    ];

    let lastError: any = null;

    for (const url of urls) {
      try {
        const json = await getJson(url);
        const terms = Array.isArray(json?.value) ? json.value : [];

        if (terms.length || json?.value) {
          return terms;
        }
      } catch (error) {
        lastError = error;
      }
    }

    throw new Error(
      `Unable to load terms for TermSetId ${id}. ${lastError?.message || ""}`
    );
  };

  const getTaxonomyOptionsForField = async (
    fieldInternalName: string
  ): Promise<IDropdownOption[]> => {
    const termSetId = await getFieldTermSetId(fieldInternalName);
    const terms: any[] = await getTermsFromTermSet(termSetId);

    return terms
      .filter((term: any) => term?.isAvailableForTagging !== false)
      .map((term: any) => {
        const label = getDefaultTermLabel(term);
        const termGuid = cleanGuid(term?.id);

        return {
          key: termGuid,
          text: label,
          data: {
            label,
            termGuid,
          } as TaxonomyTermValue,
        } as IDropdownOption;
      })
      .filter((option) => Boolean(option.text) && Boolean((option.data as TaxonomyTermValue)?.termGuid))
      .sort((a, b) => String(a.text).localeCompare(String(b.text)));
  };

  const toTaxonomyFormValue = (term: TaxonomyTermValue): string =>
    `${term.label}|${term.termGuid}`;

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setSubmitMessage({ type: MessageBarType.error, text: "Please enter your name" });
      return false;
    }
    if (!formData.division) {
      setSubmitMessage({ type: MessageBarType.error, text: "Please select a division" });
      return false;
    }
    if (!formData.department) {
      setSubmitMessage({ type: MessageBarType.error, text: "Please select a department" });
      return false;
    }
    if (!formData.joining) {
      setSubmitMessage({ type: MessageBarType.error, text: "Please select whether you will join" });
      return false;
    }
    return true;
  };

  const updateTaxonomyFields = async (itemId: number): Promise<void> => {
    if (!formData.division || !formData.department) {
      throw new Error("Division and Department are required before saving taxonomy fields.");
    }

    const result: any[] = await sp.web.lists
      .getByTitle(cfg.listTitle)
      .items.getById(itemId)
      .validateUpdateListItem([
        {
          FieldName: cfg.fieldDivisionInternal,
          FieldValue: toTaxonomyFormValue(formData.division),
        },
        {
          FieldName: cfg.fieldDepartmentInternal,
          FieldValue: toTaxonomyFormValue(formData.department),
        },
      ]);

    const errors = result.filter((row: any) => row?.ErrorMessage);

    if (errors.length) {
      throw new Error(
        errors.map((row: any) => `${row.FieldName}: ${row.ErrorMessage}`).join("; ")
      );
    }
  };

  const getCurrentUserId = async (): Promise<number> => {
    const legacyId = (props.context.pageContext as any)?.legacyPageContext?.userId;
    if (legacyId) return Number(legacyId);

    try {
      const me: any = await sp.web.currentUser.select("Id")();
      return Number(me?.Id || 0);
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadTerms = async () => {
      if (!props.isOpen) return;

      setIsLoadingTerms(true);
      setSubmitMessage(null);

      try {
        const [divisionTerms, departmentTerms] = await Promise.all([
          getTaxonomyOptionsForField(cfg.fieldDivisionInternal),
          getTaxonomyOptionsForField(cfg.fieldDepartmentInternal),
        ]);

        if (!isMounted) return;

        setDivisionOptions(divisionTerms);
        setDepartmentOptions(departmentTerms);
      } catch (error: any) {
        console.error("[RegistrationModal] Error loading taxonomy terms:", error);

        if (isMounted) {
          setSubmitMessage({
            type: MessageBarType.error,
            text: error.message || "Unable to load Division/Department terms.",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingTerms(false);
        }
      }
    };

    loadTerms();

    return () => {
      isMounted = false;
    };
  }, [props.isOpen, cfg.fieldDivisionInternal, cfg.fieldDepartmentInternal, sp]);

  const handleSubmit = async () => {
    setSubmitMessage(null);
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const incomingEventIdNum = Number(props.eventId);
      if (!Number.isFinite(incomingEventIdNum) || incomingEventIdNum <= 0) {
        throw new Error(`Invalid eventId passed to RegistrationModal: "${props.eventId}"`);
      }

      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Could not resolve current userId.");

      const list = sp.web.lists.getByTitle(cfg.listTitle);

      const existingItems: any[] = await list.items
        .select("Id", "Title", "AuthorId", cfg.fieldRegisteredUsersInternal)
        .filter(`AuthorId eq ${userId}`)
        .top(1)();

      if (existingItems.length > 0) {
        const item = existingItems[0];

        const currentIds = parseNumericIdList(item?.[cfg.fieldRegisteredUsersInternal]);

        if (currentIds.includes(incomingEventIdNum)) {
          setSubmitMessage({
            type: MessageBarType.warning,
            text: "You have already registered for this event.",
          });
          setTimeout(() => {
            setSubmitMessage(null);
            props.onDismiss();
          }, 2000);
          return;
        }

        const updatedIds = uniqNums([...currentIds, incomingEventIdNum]).join(", ");

        await list.items.getById(item.Id).update({
          Title: formData.name,
          [cfg.fieldJoinUsInternal]: formData.joining === "Yes",
          [cfg.fieldRegisteredUsersInternal]: updatedIds,
        });

        await updateTaxonomyFields(item.Id);

        setSubmitMessage({
          type: MessageBarType.success,
          text: "Registration updated successfully!",
        });
      } else {
        const added: any = await list.items.add({
          Title: formData.name,
          [cfg.fieldJoinUsInternal]: formData.joining === "Yes",
          [cfg.fieldRegisteredUsersInternal]: String(incomingEventIdNum),
        });

        const addedItemId = Number(added?.data?.Id || added?.data?.ID || added?.Id || 0);

        if (!addedItemId) {
          throw new Error(
            "Registration item was created, but the new item ID could not be resolved."
          );
        }

        await updateTaxonomyFields(addedItemId);

        setSubmitMessage({
          type: MessageBarType.success,
          text: "Registration submitted successfully!",
        });
      }

      props.onSuccess?.();

      setTimeout(() => {
        setFormData({ name: "", division: null, department: null, joining: "" });
        setSubmitMessage(null);
        props.onDismiss();
      }, 2000);
    } catch (error: any) {
      console.error("[RegistrationModal] Error submitting registration:", error);
      setSubmitMessage({
        type: MessageBarType.error,
        text: `Error: ${error.message || "Failed to submit registration. Please try again."}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
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
          <h2 className={styles.title}>Event Registration</h2>

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
            onChange={(e, newValue) => setFormData({ ...formData, name: newValue || "" })}
            className={styles.textField}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>2. Division</label>
          <Dropdown
            placeholder={isLoadingTerms ? "Loading divisions..." : "Select your division"}
            options={divisionOptions}
            selectedKey={formData.division?.termGuid}
            onChange={(e, option) =>
              setFormData({
                ...formData,
                division: (option?.data as TaxonomyTermValue) || null,
              })
            }
            className={styles.dropdown}
            disabled={isSubmitting || isLoadingTerms}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>3. Department</label>
          <Dropdown
            placeholder={isLoadingTerms ? "Loading departments..." : "Select your department"}
            options={departmentOptions}
            selectedKey={formData.department?.termGuid}
            onChange={(e, option) =>
              setFormData({
                ...formData,
                department: (option?.data as TaxonomyTermValue) || null,
              })
            }
            className={styles.dropdown}
            disabled={isSubmitting || isLoadingTerms}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>4. Are you joining us?</label>
          <ChoiceGroup
            options={joiningOptions}
            selectedKey={formData.joining || undefined}
            onChange={(e, option) =>
              setFormData({ ...formData, joining: (option?.key as "Yes" | "No") ?? "" })
            }
            className={styles.choiceGroup}
            disabled={isSubmitting}
          />
        </div>

        <PrimaryButton
          text={isSubmitting ? "Submitting..." : "Submit"}
          onClick={handleSubmit}
          className={styles.submitButton}
          disabled={isSubmitting || isLoadingTerms}
        />
      </div>
    </Modal>
  );
};

export default EventRegistration;
