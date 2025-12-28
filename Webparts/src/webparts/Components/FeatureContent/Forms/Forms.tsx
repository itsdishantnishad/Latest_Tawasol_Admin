import * as React from "react";
import styles from "./Forms.module.scss";
import ShuffledCards from "../../../widgets/ShuffledCards/ShuffledCards";
import ConditionalLink from "../../ConditionalLink/ConditionalLink";
import PrimaryButton from "../../PrimaryButton/PrimaryButton";

export interface IForm {
  id: string;
  header: string;
  url: string;
  backgroundImage: string;
}

export interface IFormsProps {
  forms?: IForm[];
  onViewAll?: () => void;
  seeAllURL?: string;
}

// ✅ SVG backgrounds (place these in: ../images/ folder relative to Forms.tsx)
const HumanCapitalBG: string = require("../assets/Human_Capital.svg");
const ContractsProcurementBG: string = require("../assets/Contract_Procurement_Hub.svg");
const BusinessExcellenceBG: string = require("../assets/Business_Excellence.svg");

const defaultForms: IForm[] = [
  {
    id: "1",
    header: "Human Capital",
    url: "#",
    backgroundImage: HumanCapitalBG,
  },
  {
    id: "2",
    header: "Contracts & Procurement Hub",
    url: "#",
    backgroundImage: ContractsProcurementBG,
  },
  {
    id: "3",
    header: "Business Excellence",
    url: "#",
    backgroundImage: BusinessExcellenceBG,
  },
];

export const Forms: React.FC<IFormsProps> = (props) => {
  const forms = props.forms || defaultForms;

  return (
    <div>
      <ShuffledCards cards={forms} />

      <div className={styles.ctaWrapper}>
        <ConditionalLink to={props.seeAllURL}>
          <PrimaryButton label="View All" />
        </ConditionalLink>
      </div>
    </div>
  );
};

export default Forms;
