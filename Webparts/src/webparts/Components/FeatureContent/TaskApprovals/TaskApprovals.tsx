// src/webparts/Components/FeatureContent/TaskApprovals/TaskApprovals.tsx

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import styles from "./TaskApprovals.module.scss";

import CategoryView, { ICategoryItem } from "../CategoryView/CategoryView";
import TableView, { TableColumn } from "../../../widgets/TableView/TableView";
import Tag from "../../Tag/Tag";

import { TahweelSVG, SalesforceSVG, ServiceNowSVG, VIEW_DETAILS_EXTERNAL_LINK_SVG } from "../../../assets/constants";

import { SfApprovalService, SFApproval } from "../../../services/Integration/SalesForce";
import { ServiceNowApprovalService, ServiceNowApproval } from "../../../services/Integration/ServiceNow";
import { TahweelService, TahweelApproval } from "../../../services/Integration/TahweelService";
const TaskApprovalPlaceholderIcon: string = require("../images/taskApprovalPlaceholderIcon.svg");
type SystemKey = "Tahweel" | "Salesforce" | "ServiceNow";

const DEFAULT_ACTIVE_TAB: SystemKey = "Tahweel";

type TaskRow = {
  workitemId: string;
  workflowNumber: string;
  taskTitle: string;
  priority: string;
  dueDate: string;
  requestorName: string;
  originSystem: SystemKey;
  redirectURL?: string;
};

interface TaskApprovalsProps {
  context: any;
  seeAllURL?: string;
}

const EMPTY_CELL_TEXT = "—";
const TOP_ROWS = 4;

const DATE_LOCALE = "en-GB";
const DATE_DISPLAY_FORMAT: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };

const PRIORITY_BADGE_BG_BY_LABEL: Record<string, string> = {
  High: "#fdede8",
  Medium: "#feefd4",
  Low: "#e2edfe",
};

const PRIORITY_BADGE_TEXT_BY_LABEL: Record<string, string> = {
  High: "#ff3a00",
  Medium: "#dda338",
  Low: "#2b77d6",
};

const svgToDataUri = (svg: string): string => `data:image/svg+xml;utf8,${encodeURIComponent(svg || "")}`;

const normalizeApiDateString = (value: string): string => {
  if (!value) return "";
  const hasSpace = value.indexOf(" ") !== -1;
  const hasT = value.indexOf("T") !== -1;
  return hasSpace && !hasT ? value.replace(" ", "T") : value;
};

const formatDateForDisplay = (value: string): string => {
  if (!value) return EMPTY_CELL_TEXT;
  const cleaned = normalizeApiDateString(value);
  const d = new Date(cleaned);
  if (isNaN(d.getTime())) return EMPTY_CELL_TEXT;
  return d.toLocaleDateString(DATE_LOCALE, DATE_DISPLAY_FORMAT);
};

const normalizePriorityLabel = (priority: string): string => {
  const p = (priority || "").toString().trim();
  if (!p) return "";
  const match = p.match(/^\s*\d+\s*-\s*(.+)\s*$/);
  return match && match[1] ? match[1].trim() : p;
};

const getInitials = (name: string): string => {
  const n = (name || "").trim();
  if (!n) return "?";
  const parts = n.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "?";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
};

//  SPFx-safe replacement for Promise.allSettled
type Settled<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: any };

const settle = async <T,>(p: Promise<T>): Promise<Settled<T>> => {
  try {
    const value = await p;
    return { status: "fulfilled", value };
  } catch (reason) {
    return { status: "rejected", reason };
  }
};

const TaskApprovals: React.FC<TaskApprovalsProps> = (props) => {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [counts, setCounts] = useState<Record<SystemKey, number>>({
    Tahweel: 0,
    Salesforce: 0,
    ServiceNow: 0,
  });

  const [rowsBySystem, setRowsBySystem] = useState<Record<SystemKey, TaskRow[]>>({
    Tahweel: [],
    Salesforce: [],
    ServiceNow: [],
  });

  const [errorBySystem, setErrorBySystem] = useState<Partial<Record<SystemKey, string>>>({});

  const userEmail: string = (props?.context?.pageContext?.user?.email || "").trim();
  // const userEmail: string = ("mohamed.thahir-c@dhre.ae").trim();
  const httpClient = props?.context?.httpClient;

  const sfService = useMemo(() => new SfApprovalService({ httpClient }), [httpClient]);
  const snService = useMemo(() => new ServiceNowApprovalService({ httpClient }), [httpClient]);
  const tahweelService = useMemo(() => new TahweelService({ httpClient }), [httpClient]);

  const getDefaultIndex = (cats: ICategoryItem[], key: SystemKey): number => {
    const idx = cats.findIndex((c) => (c.id as SystemKey) === key);
    return idx >= 0 ? idx : 0;
  };

  const categories: ICategoryItem[] = useMemo(
    () => [
      { id: "Tahweel", name: "Tahweel", icon: svgToDataUri(TahweelSVG), count: counts.Tahweel },
      { id: "Salesforce", name: "Salesforce", icon: svgToDataUri(SalesforceSVG), count: counts.Salesforce },
      { id: "ServiceNow", name: "ServiceNow", icon: svgToDataUri(ServiceNowSVG), count: counts.ServiceNow },
    ],
    [counts]
  );

  useEffect(() => {
    setActiveCategoryIndex(getDefaultIndex(categories, DEFAULT_ACTIVE_TAB));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeSystem: SystemKey = (categories[activeCategoryIndex]?.id as SystemKey) || "Salesforce";
  const activeRows = rowsBySystem[activeSystem] || [];
  const activeError = errorBySystem[activeSystem];
  const activeCount = counts[activeSystem] || 0;
  // Add these console logs temporarily
  console.log('Active System:', activeSystem);
  console.log('Active Count:', activeCount);
  console.log('Active Rows:', activeRows);
  console.log('Active Error:', activeError);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      if (!httpClient) return;

      if (!userEmail) {
        setErrorBySystem({
          Salesforce: "User email not found.",
          ServiceNow: "User email not found.",
          Tahweel: "User email not found.",
        });
        return;
      }

      setIsLoading(true);
      setErrorBySystem({});
      console.log('Starting fetch for user:', userEmail);

      const sfPromise = sfService.fetchApprovalsByEmail(userEmail);
      const snPromise = snService.fetchApprovalsByEmail(userEmail);
      const tahPromise = (async () => {
        const { personNumber } = await tahweelService.fetchPersonNumberByEmail(userEmail);
        return tahweelService.fetchTahweelApprovalsForWidget(personNumber, TOP_ROWS);
      })();

      //  no allSettled, SPFx safe
      const [sfRes, snRes, tahRes] = await Promise.all([
        settle(sfPromise),
        settle(snPromise),
        settle(tahPromise),
      ]);

      if (cancelled) return;

      const nextCounts: Record<SystemKey, number> = { Tahweel: 0, Salesforce: 0, ServiceNow: 0 };
      const nextRows: Record<SystemKey, TaskRow[]> = { Tahweel: [], Salesforce: [], ServiceNow: [] };
      const nextErrors: Partial<Record<SystemKey, string>> = {};

      // Salesforce
      if (sfRes.status === "fulfilled") {
        const approvals: SFApproval[] = Array.isArray(sfRes.value?.approvals) ? sfRes.value.approvals : [];
        nextCounts.Salesforce = approvals.length;

        nextRows.Salesforce = approvals.slice(0, TOP_ROWS).map((a) => ({
          workitemId: a.workitemId || a.workflowNumber || "",
          workflowNumber: a.workflowNumber || EMPTY_CELL_TEXT,
          taskTitle: a.taskTitle || EMPTY_CELL_TEXT,
          priority: normalizePriorityLabel(a.priority || ""),
          dueDate: a.dueDate || "",
          requestorName: a.requestorName || EMPTY_CELL_TEXT,
          originSystem: "Salesforce",
          redirectURL: a.redirectURL || "",
        }));
      } else {
        nextErrors.Salesforce = sfRes.reason?.message || "Failed to load Salesforce approvals.";
      }

      // ServiceNow
      if (snRes.status === "fulfilled") {
        const approvals: ServiceNowApproval[] = Array.isArray(snRes.value?.approvals) ? snRes.value.approvals : [];
        nextCounts.ServiceNow = approvals.length;

        nextRows.ServiceNow = approvals.slice(0, TOP_ROWS).map((a) => ({
          workitemId: a.workitemId || a.workflowNumber || "",
          workflowNumber: a.workflowNumber || EMPTY_CELL_TEXT,
          taskTitle: a.taskTitle || EMPTY_CELL_TEXT,
          priority: normalizePriorityLabel(a.priority || ""),
          dueDate: a.dueDate || "",
          requestorName: a.requestorName || EMPTY_CELL_TEXT,
          originSystem: "ServiceNow",
          redirectURL: a.redirectURL || "",
        }));
      } else {
        nextErrors.ServiceNow = snRes.reason?.message || "Failed to load ServiceNow approvals.";
      }

      // Tahweel (widget)
      if (tahRes.status === "fulfilled") {
        const approvals: TahweelApproval[] = Array.isArray(tahRes.value?.approvals) ? tahRes.value.approvals : [];
        nextCounts.Tahweel = (tahRes.value?.totalCount ?? approvals.length) || 0;

        nextRows.Tahweel = approvals.slice(0, TOP_ROWS).map((a) => ({
          workitemId: a.workitemId || a.workflowNumber || "",
          workflowNumber: a.workflowNumber || EMPTY_CELL_TEXT,
          taskTitle: a.taskTitle || EMPTY_CELL_TEXT,
          priority: normalizePriorityLabel(a.priority || ""),
          dueDate: a.dueDate || "",
          requestorName: a.requestorName || EMPTY_CELL_TEXT,
          originSystem: "Tahweel",
          redirectURL: a.redirectURL || "",
        }));
      } else {
        nextErrors.Tahweel = tahRes.reason?.message || "Failed to load Tahweel approvals.";
      }

      setCounts(nextCounts);
      setRowsBySystem(nextRows);
      setErrorBySystem(nextErrors);
      setIsLoading(false);
    };

    load().catch((e) => {
      if (cancelled) return;
      setIsLoading(false);
      setErrorBySystem({
        Tahweel: e?.message || "Failed to load approvals.",
        Salesforce: e?.message || "Failed to load approvals.",
        ServiceNow: e?.message || "Failed to load approvals.",
      });
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [httpClient, userEmail]);

  const handleCategoryClick = (_category: ICategoryItem, index: number): void => {
    setActiveCategoryIndex(index);
  };

  // --- View All URL ---
  const webUrl: string = props.context.pageContext.web.absoluteUrl.replace(/\/$/, "");
  const origin: string = new URL(webUrl).origin;

  const viewAllHref = React.useMemo(() => {
    const configured = (props.seeAllURL || "").trim();
    const raw = configured || "SitePages/Tasks.aspx";

    if (/^https?:\/\//i.test(raw)) {
      try {
        const parsed = new URL(raw);
        return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        return raw;
      }
    }

    if (raw.startsWith("/")) return `${origin}${raw}`;
    return `${webUrl}/${raw}`;
  }, [props.seeAllURL, webUrl, origin]);

  const tableColumns: TableColumn<TaskRow>[] = [
    { columnKey: "workflowNumber", label: "Workflow No." },
    { columnKey: "taskTitle", label: "Task Title" },
    {
      columnKey: "priority",
      label: "Priority",
      renderCell: (row) => {
        const label = row.priority || EMPTY_CELL_TEXT;
        return (
          <Tag
            label={label}
            backgroundColor={PRIORITY_BADGE_BG_BY_LABEL[label] || "#f3f3f3"}
            textColor={PRIORITY_BADGE_TEXT_BY_LABEL[label] || "#333"}
          />
        );
      },
    },
    {
      columnKey: "dueDate",
      label: "Due Date",
      renderCell: (row) => formatDateForDisplay(row.dueDate),
    },
    {
      columnKey: "requestedBy",
      label: "Requested By",
      renderCell: (row) => (
        <div className={styles.requestorWrapper}>
          <div className={styles.avatarCircle}>{getInitials(row.requestorName)}</div>
          <span className={styles.requestorName}>{row.requestorName || EMPTY_CELL_TEXT}</span>
        </div>
      ),
    },
    {
      columnKey: "action",
      label: "Action",
      renderCell: (row) => {
        const label = "View Details";

        return row.redirectURL ? (
          <a
            href={row.redirectURL}
            target="_blank"
            rel="noreferrer"
            className={styles.viewDetailsLink}
            aria-label="View Details (opens in new tab)"
          >
            <span className={styles.viewDetailsText}>{label}</span>
            <span
              className={styles.viewDetailsIcon}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: VIEW_DETAILS_EXTERNAL_LINK_SVG }}
            />
          </a>
        ) : (
          EMPTY_CELL_TEXT
        );
      },
    }
  ];

  return (
    <div className={styles.taskApprovalsContainer}>
      <CategoryView categories={categories} activeIndex={activeCategoryIndex} onCategoryClick={handleCategoryClick} />

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.loadingMessage}>Loading approvals...</div>
        ) : (
          <>
            {activeError ? (
              <div className={styles.errormessage}>Error: {activeError}</div>
            ) : activeRows.length === 0 && activeCount === 0 ? (
              <div style={{ textAlign: "center", padding: "34px 12px" }}>
                <img
                  src={TaskApprovalPlaceholderIcon}
                  alt="No tasks"
                  style={{
                    maxWidth: 340,
                    width: "162px",
                    height: "80px",
                    display: "block",
                    margin: "0 auto 10px",
                  }}
                />
                <div className={styles.emptyStateTitle}>You have no new tasks</div>
                <div className={styles.emptyStateDescription}>
                  Any assigned tasks will appear here as soon as they&apos;re available.
                </div>
              </div>
            ) : (
              <TableView
                data={activeRows}
                columns={tableColumns}
                getRowKey={(row) => (row.workitemId || row.workflowNumber) as string}
                ariaLabel="Task Approvals Table"
              />
            )}
          </>
        )}
      </div>

      <div className={styles.buttonContainer}>
        {(activeRows.length > 0 || activeCount > 0) && (
          <a href={viewAllHref} className={styles.viewAllButton}>
            View All
          </a>
        )}
      </div>

    </div>
  );
};

export default TaskApprovals;