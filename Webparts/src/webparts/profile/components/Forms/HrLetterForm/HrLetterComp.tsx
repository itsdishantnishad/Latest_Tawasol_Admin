import * as React from "react";
import styles from "./HrLetter.module.scss";

import {
  IDropdownOption,
  TextField,
  PrimaryButton,
  DefaultButton,
} from "@fluentui/react";
import Dropdown from "../../../../Components/Dropdown/Dropdown";

const UploadIcon = require("../../../assets/uploadIcon.svg")

const documentTypeOptions: IDropdownOption[] = [
  { key: "DHRE Letter - Employment Certificate (English)", text: "DHRE Letter - Employment Certificate (English)" },
  { key: "Salary Certificate", text: "Salary Certificate" },
  { key: "Experience Letter", text: "Experience Letter" }
];

const cityOptions: IDropdownOption[] = [
  { key: "Select City", text: "Select City" },
  { key: "Dubai", text: "Dubai" },
  { key: "Abu Dhabi", text: "Abu Dhabi" },
  { key: "Sharjah", text: "Sharjah" }
];

const countryOptions: IDropdownOption[] = [
  { key: "Select Addressee Country", text: "Select Addressee Country" },
  { key: "United Arab Emirates", text: "United Arab Emirates" },
  { key: "Saudi Arabia", text: "Saudi Arabia" },
  { key: "Kuwait", text: "Kuwait" }
];

export interface IHRLetterState {
  documentType?: string;
  addressedTo?: string;
  city?: string;
  country?: string;
  comment?: string;
}

export default class HRLetterComponent
  extends React.Component<{}, IHRLetterState> {

  public state: IHRLetterState = {
    documentType: "DHRE Letter - Employment Certificate (English)",
    addressedTo: "",
    city: "Select City",
    country: "Select Addressee Country",
    comment: ""
  };

  private onSubmit = (): void => {
    console.log("Submit HR Letter → ", this.state);
  };

  public render(): React.ReactElement<{}> {
    return (
      <div className={styles.container}>
        {/* ===== HR Letter Card ===== */}
        <section className={styles.cardHRLetter}>
          <div className={styles.hrLetterInner}>
            {/* Document Type */}
            <div className={styles.documentTypeWrap}>
              <label className={styles.fieldLabel}>Document Type</label>
              <Dropdown
                options={documentTypeOptions}
                selectedKey={this.state.documentType}
                onChange={(_, o) => this.setState({ documentType: o?.key as string })}
              />
            </div>

            {/* Addressed To */}
            <div className={styles.addressedToWrap}>
              <label className={styles.fieldLabel}>Addressed to</label>
              <div className={styles.addressedToShell}>
                <TextField
                  className={styles.fuiInput}
                  placeholder="Enter address"
                  value={this.state.addressedTo}
                  onChange={(_, v) => this.setState({ addressedTo: v || "" })}
                />
              </div>
            </div>

            {/* City and Address Country Row */}
            <div className={styles.cityCountryRow}>
              <div className={styles.cityWrap}>
                <label className={styles.fieldLabel}>City</label>
                <Dropdown
                  options={cityOptions}
                  selectedKey={this.state.city}
                  onChange={(_, o) => this.setState({ city: o?.key as string })}
                />
              </div>

              <div className={styles.countryWrap}>
                <label className={styles.fieldLabel}>Address Country</label>
                <Dropdown
                  options={countryOptions}
                  selectedKey={this.state.country}
                  onChange={(_, o) => this.setState({ country: o?.key as string })}
                />
              </div>
            </div>

            {/* Comments */}
            <div className={styles.commentsWrap}>
              <label className={styles.commentLabel}>Comments</label>
              <div className={styles.commentBox}>
                <TextField
                  multiline
                  resizable={false}
                  className={styles.commentAreaFUI}
                  placeholder="Write comments here..."
                  value={this.state.comment}
                  onChange={(_, v) => this.setState({ comment: v || "" })}
                />
              </div>
            </div>

            {/* Upload */}
            <div className={styles.uploadWrap}>
              <div className={styles.uploadIcon} aria-hidden><img src={UploadIcon}></img></div>
              <div className={styles.uploadTextBlock}>
                <div className={styles.uploadTitle}>Upload files</div>
                <div className={styles.uploadHint}>
                  Drop files directly here or <a>browse</a> from your device
                </div>
                <div className={styles.uploadActionRow}>
                  <DefaultButton
                    className={styles.uploadBtn}
                    text="Upload"
                    onClick={() => console.log("Upload clicked")}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Buttons */}
        <div className={styles.ctaBar}>
          <DefaultButton
            className={styles.previewBtn}
            text="Preview Document"
            onClick={() => console.log("Preview clicked")}
          />
          <PrimaryButton
            className={styles.submitBtn}
            text="Submit"
            onClick={this.onSubmit}
          />
        </div>
      </div>
    );
  }
}