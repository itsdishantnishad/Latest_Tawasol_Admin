import * as React from "react";
import styles from "./HolidayList.module.scss";
import UAE_HOLIDAYS_2025 from "./HolidaysData";

const InfoIcon = require("../../../assets/infoIcon.svg")

interface IHoliday {
  name: string;
  date: string;
}

interface IHolidayListData {
  year: string;
  infoMessage: string;
  noteMessage: string;
  holidays: IHoliday[];
}

export default class HolidayListComponent extends React.Component {
  private holidayData: IHolidayListData = UAE_HOLIDAYS_2025;

  public render(): React.ReactElement<{}> {
    return (
      <div className={styles.container}>
        {/* ===== Holiday List Card ===== */}
        <section className={styles.cardHolidayList}>
          {/* Header Row */}
          <div className={styles.holidayListHeader}>
            <span className={styles.holidayListTitle}>Holiday List {this.holidayData.year}</span>
          </div>

          {/* Info Row */}
          <div className={styles.infoRow}>
            <div className={styles.infoIcon}>
              <img src={InfoIcon} alt="info" />
            </div>
            <div className={styles.infoText}>
              {this.holidayData.infoMessage}
            </div>
          </div>

          {/* Holidays List */}
          <div className={styles.holidaysList}>
            {this.holidayData.holidays.map((holiday, index) => (
              <div key={index} className={styles.holidayRow}>
                <div className={styles.holidayName}>{holiday.name}</div>
                <div className={styles.holidayDate}>{holiday.date}</div>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className={styles.noteText}>
            {this.holidayData.noteMessage}
          </div>
        </section>
      </div>
    );
  }
}