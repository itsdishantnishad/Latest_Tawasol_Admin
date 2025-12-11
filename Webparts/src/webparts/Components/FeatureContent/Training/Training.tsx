// src/webparts/featureWheel/Components/FeatureContent/Training/Training.tsx

import * as React from "react";
import styles from "./Training.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";

const Location_Icon_URL = require("../assets/LocationIcon.png");
const Time_Icon_URL = require("../assets/clockIcon.png");

export interface ITraining {
  id: string;
  title: string;
  description: string;
  image: string;
  duration?: string;
  level?: string;
  url: string;
  dateDay: string;
  dateMonth: string;
  location?: string;
  instructorName?: string;
  instructorTitle?: string;
}

export interface ITrainingProps {
  trainings?: ITraining[];
  onViewAll?: () => void;
  seeAllURL?: string;
  context?: WebPartContext;
  listTitle?: string;
  siteUrl?: string;
  topCount?: number;
}

const formatTime = (date: Date | null): string => {
  if (!date) return "";
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDateRange = (
  start: Date | null,
  end: Date | null
): { day: string; month: string } => {
  if (!start) {
    return { day: "", month: "" };
  }

  const month = start
    .toLocaleString(undefined, { month: "short" })
    .toUpperCase();

  if (!end || start.toDateString() === end.toDateString()) {
    return {
      day: start.getDate().toString().padStart(2, "0"),
      month,
    };
  }

  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    const startDay = start.getDate();
    const endDay = end.getDate();
    return {
      day: `${startDay}-${endDay}`,
      month,
    };
  }

  return {
    day: start.getDate().toString(),
    month,
  };
};

const getInitials = (fullName?: string): string => {
  if (!fullName) return "";
  const parts = fullName
    .split(" ")
    .filter((p) => !!p && p.trim().length > 0);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const mapItemToTraining = (item: any): ITraining => {
  const start = item.TIREventStartDate
    ? new Date(item.TIREventStartDate)
    : null;
  const end = item.TIREventEndDate ? new Date(item.TIREventEndDate) : null;

  const duration =
    start && end
      ? `${formatTime(start)} - ${formatTime(end)}`
      : start
      ? formatTime(start)
      : "";

  const { day: dateDay, month: dateMonth } = formatDateRange(start, end);

  const description = item.TIRLocation || "Click to view training details";

  let imageUrl = "https://via.placeholder.com/400x250?text=Training";
  const banner = item.BannerImageUrl;

  if (banner) {
    if (typeof banner === "string") {
      const firstPart = banner.split(",")[0].trim();
      if (firstPart) {
        imageUrl = firstPart;
      }
    } else if (banner.Url) {
      imageUrl = banner.Url;
    }
  }

  const joiningUrl: string = (item.TIRJoiningURL || "").trim();
  const fileUrl: string = item.FileRef || "#";
  const url = joiningUrl || fileUrl;

  const instructor = item.TIRInstructor;
  const instructorName: string | undefined =
    instructor && (instructor.Title || instructor.Name);
  const instructorTitle: string | undefined =
    instructor && instructor.JobTitle;

  return {
    id: item.Id.toString(),
    title: item.Title || "Untitled Training",
    description,
    image: imageUrl,
    duration,
    level: "Classroom",
    url,
    dateDay,
    dateMonth,
    location: item.TIRLocation,
    instructorName,
    instructorTitle,
  };
};

export const Training: React.FC<ITrainingProps> = (props) => {
  const [trainings, setTrainings] = React.useState<ITraining[]>(
    props.trainings || []
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (props.trainings && props.trainings.length > 0) {
      setTrainings(props.trainings);
      return;
    }

    if (!props.context) {
      setTrainings(props.trainings || []);
      return;
    }

    const loadTrainings = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const webUrl =
          props.siteUrl || props.context!.pageContext.web.absoluteUrl;
        const listTitle = props.listTitle || "Site Pages";
        const top = props.topCount || 4;

        const fetchTop = Math.max(top * 3, 20);
        const safeListTitle = listTitle.replace(/'/g, "''");

        const requestUrl =
          `${webUrl}/_api/web/lists/getbytitle('${safeListTitle}')/items` +
          `?$select=Id,Title,BannerImageUrl,TIREventStartDate,TIREventEndDate,TIRLocation,TIRJoiningURL,FileRef,ContentType/Name,ContentTypeId,TIRInstructor/Title,TIRInstructor/JobTitle` +
          `&$expand=ContentType,TIRInstructor` +
          `&$orderby=TIREventStartDate desc` +
          `&$top=${fetchTop}`;

        const response: SPHttpClientResponse =
          await props.context!.spHttpClient.get(
            requestUrl,
            SPHttpClient.configurations.v1
          );

        if (!response.ok) {
          throw new Error(`SharePoint request failed: ${response.statusText}`);
        }

        const json = await response.json();

        if (!json.value || json.value.length === 0) {
          setTrainings([]);
          return;
        }

        const trainingItems = (json.value || []).filter(
          (item: any) =>
            item.ContentType && item.ContentType.Name === "TIR Training"
        );

        const mapped: ITraining[] = trainingItems
          .map(mapItemToTraining)
          .slice(0, top);

        setTrainings(mapped);
      } catch (e: any) {
        setError(e?.message || "Unknown error");
        setTrainings([]);
      } finally {
        setLoading(false);
      }
    };

    loadTrainings();
  }, [
    props.trainings,
    props.context,
    props.listTitle,
    props.siteUrl,
    props.topCount,
  ]);

  // ---------- VIEW ALL URL LOGIC ----------
  const web = props.context?.pageContext.web;

  const configured = props.seeAllURL;
  // Default page if property is empty – change this name as you wish
  const raw = configured || "SitePages/Events-And-Trainings.aspx";

  let viewAllUrl: string | undefined;

  if (raw) {
    if (raw.startsWith("http")) {
      viewAllUrl = raw; // absolute
    } else if (raw.startsWith("/")) {
      viewAllUrl = raw; // server-relative
    } else if (web) {
      // site-relative -> prefix current site
      const serverRel = web.serverRelativeUrl.replace(/\/$/, "");
      const rel = raw.replace(/^\//, "");
      viewAllUrl = `${serverRel}/${rel}`;
    } else {
      viewAllUrl = raw;
    }
  }
  // ----------------------------------------

  if (loading) {
    return (
      <div className={styles.trainingContainer}>Loading trainings...</div>
    );
  }

  if (error) {
    return (
      <div className={styles.trainingContainer}>
        <p style={{ color: "red" }}>Error loading trainings: {error}</p>
      </div>
    );
  }

  if (!trainings || trainings.length === 0) {
    return (
      <div className={styles.trainingContainer}>
        <p>No trainings found</p>
      </div>
    );
  }

  return (
    <div className={styles.trainingContainer}>
      {/* Training Grid */}
      <div className={styles.trainingGrid}>
        {trainings.map((training) => (
          <a
            key={training.id}
            href={training.url}
            className={styles.trainingCard}
          >
            <div className={styles.imageContainer}>
              <img
                src={training.image}
                alt={training.title}
                className={styles.trainingImage}
              />
              <div className={styles.imageOverlay} />

              {/* mode pill – Classroom */}
              <div className={styles.modeBadge}>
                {training.level || "Classroom"}
              </div>

              {/* date card – 6-7 / OCT */}
              {training.dateDay && training.dateMonth && (
                <div className={styles.dateBadge}>
                  <div className={styles.dateDay}>{training.dateDay}</div>
                  <div className={styles.dateMonth}>{training.dateMonth}</div>
                </div>
              )}
            </div>

            <div className={styles.trainingInfo}>
              <h3 className={styles.trainingTitle}>{training.title}</h3>

              {/* time + location rows */}
              <div className={styles.metaRow}>
                {training.duration && (
                  <div className={styles.metaItem}>
                    <img
                      src={Time_Icon_URL}
                      className={styles.metaIcon}
                      alt=""
                    />
                    <span className={styles.metaText}>
                      {training.duration}
                    </span>
                  </div>
                )}

                {training.location && (
                  <div className={styles.metaItem}>
                    <img
                      src={Location_Icon_URL}
                      className={styles.metaIcon}
                      alt=""
                    />
                    <span className={styles.metaText}>
                      {training.location}
                    </span>
                  </div>
                )}
              </div>

              {/* instructor row */}
              {training.instructorName && (
                <div className={styles.instructorRow}>
                  <div className={styles.instructorAvatar}>
                    {getInitials(training.instructorName)}
                  </div>
                  <div className={styles.instructorInfo}>
                    <div className={styles.instructorName}>
                      {training.instructorName}
                    </div>
                    {training.instructorTitle && (
                      <div className={styles.instructorTitle}>
                        {training.instructorTitle}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* bottom CTA button */}
              <button
                className={styles.requestButton}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  alert(
                    `Your request for "${training.title}" has been captured.\n\n` +
                      "In the next phase, this button will open the actual approval workflow."
                  );
                }}
              >
                Request for Approval
              </button>
            </div>
          </a>
        ))}
      </div>

      {/* View All Button – like other components */}
      {(props.onViewAll || viewAllUrl) && (
        <div className={styles.buttonContainer}>
          {props.onViewAll ? (
            <button
              type="button"
              className={styles.viewAllButton}
              onClick={props.onViewAll}
            >
              View All
            </button>
          ) : viewAllUrl ? (
            <a href={viewAllUrl} className={styles.viewAllButton}>
              View All
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Training;
