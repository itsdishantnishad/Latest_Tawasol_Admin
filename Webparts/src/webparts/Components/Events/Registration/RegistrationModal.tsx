import * as React from "react";
import { useState, useMemo } from "react";
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

import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IEventRegistrationProps {
  isOpen: boolean;
  onDismiss: () => void;
  context: WebPartContext;
  eventId: string | number;
  onSuccess?: () => void;
  listTitle?: string;
  fieldRegisteredUsersInternal?: string;
  fieldDivisionInternal?: string;
  fieldJoinUsInternal?: string;
}

export interface IRegistrationData {
  name: string;
  division: string;
  department: string;
  joining: "Yes" | "No" | "";
}

const DEFAULTS = {
  listTitle: "Registered User Event",
  fieldRegisteredUsersInternal: "TIRRegisteredUsers",
  fieldDivisionInternal: "AssistantsName",
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
  const cfg = {
    listTitle: props.listTitle || DEFAULTS.listTitle,
    fieldRegisteredUsersInternal:
      props.fieldRegisteredUsersInternal || DEFAULTS.fieldRegisteredUsersInternal,
    fieldDivisionInternal:
      props.fieldDivisionInternal || DEFAULTS.fieldDivisionInternal,
    fieldJoinUsInternal: props.fieldJoinUsInternal || DEFAULTS.fieldJoinUsInternal,
  };

  const [formData, setFormData] = useState<IRegistrationData>({
    name: "",
    division: "",
    department: "",
    joining: "",
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: MessageBarType;
    text: string;
  } | null>(null);

  const sp: SPFI = useMemo(() => spfi().using(SPFx(props.context)), [props.context]);

  const divisionOptions: IDropdownOption[] = [
    { key: "North Division", text: "North Division" },
    { key: "South Division", text: "South Division" },
    { key: "East Division", text: "East Division" },
    { key: "West Division", text: "West Division" },
  ];

  const departmentOptions: IDropdownOption[] = [
    { key: "Human Resources", text: "Human Resources" },
    { key: "Information Technology", text: "Information Technology" },
    { key: "Sales", text: "Sales" },
    { key: "Marketing", text: "Marketing" },
    { key: "Finance", text: "Finance" },
  ];

  const joiningOptions: IChoiceGroupOption[] = [
    { key: "Yes", text: "Yes" },
    { key: "No", text: "No" },
  ];

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
          [cfg.fieldDivisionInternal]: formData.division,
          [cfg.fieldJoinUsInternal]: formData.joining === "Yes",
          [cfg.fieldRegisteredUsersInternal]: updatedIds,
        });

        setSubmitMessage({
          type: MessageBarType.success,
          text: "Registration updated successfully!",
        });
      } else {
        await list.items.add({
          Title: formData.name,
          [cfg.fieldDivisionInternal]: formData.division,
          [cfg.fieldJoinUsInternal]: formData.joining === "Yes",
          [cfg.fieldRegisteredUsersInternal]: String(incomingEventIdNum),
        });

        setSubmitMessage({
          type: MessageBarType.success,
          text: "Registration submitted successfully!",
        });
      }

      props.onSuccess?.();

      setTimeout(() => {
        setFormData({ name: "", division: "", department: "", joining: "" });
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
            // required
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>2. Division</label>
          <Dropdown
            placeholder="Select your division"
            options={divisionOptions}
            selectedKey={formData.division}
            onChange={(e, option) =>
              setFormData({ ...formData, division: (option?.key as string) || "" })
            }
            className={styles.dropdown}
            // required
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>3. Department</label>
          <Dropdown
            placeholder="Select your department"
            options={departmentOptions}
            selectedKey={formData.department}
            onChange={(e, option) =>
              setFormData({ ...formData, department: (option?.key as string) || "" })
            }
            className={styles.dropdown}
            // required
            disabled={isSubmitting}
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
          disabled={isSubmitting}
        />
      </div>
    </Modal>
  );
};

export default EventRegistration;
