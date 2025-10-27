import * as React from 'react';
import { useState, useMemo } from 'react';
import styles from './Registrationmodal.module.scss';
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
  MessageBarType
} from '@fluentui/react';
import { SPFI, spfi, SPFx } from '@pnp/sp';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IEventRegistrationProps {
  isOpen: boolean;
  onDismiss: () => void;
  context: WebPartContext;
  eventId: string | number;  // Event ID to register for
}

export interface IRegistrationData {
  name: string;
  division: string;
  department: string;
  joining: 'Yes' | 'No';
}

const EventRegistration: React.FC<IEventRegistrationProps> = (props) => {
  const [formData, setFormData] = useState<IRegistrationData>({
    name: '',
    division: '',
    department: '',
    joining: 'Yes'
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: MessageBarType; text: string } | null>(null);

  const sp: SPFI = useMemo(() => spfi().using(SPFx(props.context)), [props.context]);

  const divisionOptions: IDropdownOption[] = [
    { key: 'North Division', text: 'North Division' },
    { key: 'South Division', text: 'South Division' },
    { key: 'East Division', text: 'East Division' },
    { key: 'West Division', text: 'West Division' }
  ];

  const departmentOptions: IDropdownOption[] = [
    { key: 'Human Resources', text: 'Human Resources' },
    { key: 'Information Technology', text: 'Information Technology' },
    { key: 'Sales', text: 'Sales' },
    { key: 'Marketing', text: 'Marketing' },
    { key: 'Finance', text: 'Finance' }
  ];

  const joiningOptions: IChoiceGroupOption[] = [
    { key: 'Yes', text: 'Yes' },
    { key: 'No', text: 'No' }
  ];

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setSubmitMessage({ type: MessageBarType.error, text: 'Please enter your name' });
      return false;
    }
    if (!formData.division) {
      setSubmitMessage({ type: MessageBarType.error, text: 'Please select a division' });
      return false;
    }
    if (!formData.department) {
      setSubmitMessage({ type: MessageBarType.error, text: 'Please select a department' });
      return false;
    }
    return true;
  };

  // Helper: Split comma-separated Event IDs
  const splitEventIds = (field: string | null): string[] => {
    if (!field) return [];
    return field
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  };

  const handleSubmit = async () => {
    setSubmitMessage(null);
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const userEmail = props.context.pageContext.user.loginName;
      const incomingEventId = props.eventId.toString();
      const list = sp.web.lists.getByTitle('Registered User Event');

      // Check existing registration
      const existingItems: any[] = await list.items
        .select('Id', 'TIRRegisteredUsers', 'Author/Title', 'Author/EMail')
        .expand('Author')
        .filter(`Author/EMail eq '${userEmail}'`)
        .top(1)();

      if (existingItems.length > 0) {
        const item = existingItems[0];
        const currentIds: any = splitEventIds(item.TIRRegisteredUsers);

        if (currentIds.includes(incomingEventId)) {
          setSubmitMessage({
            type: MessageBarType.warning,
            text: 'You have already registered for this event.'
          });
          setTimeout(() => {
            setSubmitMessage(null);
            props.onDismiss();
          }, 2000);
          return;
        }

        // Update: Append Event ID
        const updatedIds = [...currentIds, incomingEventId].join(', ');
        await list.items.getById(item.Id).update({
          Title: formData.name,
          AssistantsName: formData.division,
          // TIRDepartment: formData.department,
          TIRJoinUs: formData.joining === 'Yes',
          TIRRegisteredUsers: updatedIds
        });

        setSubmitMessage({ type: MessageBarType.success, text: 'Registration updated successfully!' });
      } else {
        // Create new
        await list.items.add({
          Title: formData.name,
          AssistantsName: formData.division,
          // TIRDepartment: formData.department,
          TIRJoinUs: formData.joining === 'Yes',
          TIRRegisteredUsers: incomingEventId
        });

        setSubmitMessage({ type: MessageBarType.success, text: 'Registration submitted successfully!' });
      }

      // Reset & close after 2 seconds
      setTimeout(() => {
        setFormData({ name: '', division: '', department: '', joining: 'Yes' });
        setSubmitMessage(null);
        props.onDismiss();
      }, 2000);

    } catch (error: any) {
      console.error('Error submitting registration:', error);
      setSubmitMessage({
        type: MessageBarType.error,
        text: `Error: ${error.message || 'Failed to submit registration. Please try again.'}`
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
      <div className={styles.eventRegistration}>
        <div className={styles.header}>
          <h2 className={styles.title}>Event Registration</h2>
          <IconButton
            iconProps={{ iconName: 'Cancel' }}
            ariaLabel="Close"
            onClick={handleDismiss}
            className={styles.closeButton}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.content}>
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
              onChange={(e, newValue) => setFormData({ ...formData, name: newValue || '' })}
              className={styles.textField}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>2. Division</label>
            <Dropdown
              placeholder="Select your division"
              options={divisionOptions}
              selectedKey={formData.division}
              onChange={(e, option) => setFormData({ ...formData, division: option?.key as string || '' })}
              className={styles.dropdown}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>3. Department</label>
            <Dropdown
              placeholder="Select your department"
              options={departmentOptions}
              selectedKey={formData.department}
              onChange={(e, option) => setFormData({ ...formData, department: option?.key as string || '' })}
              className={styles.dropdown}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>4. Are you joining us?</label>
            <ChoiceGroup
              options={joiningOptions}
              selectedKey={formData.joining}
              onChange={(e, option) => setFormData({ ...formData, joining: option?.key as 'Yes' | 'No' || 'Yes' })}
              className={styles.choiceGroup}
              disabled={isSubmitting}
            />
          </div>

          <PrimaryButton
            text={isSubmitting ? 'Submitting...' : 'Submit'}
            onClick={handleSubmit}
            className={styles.submitButton}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </Modal>
  );
};

export default EventRegistration;