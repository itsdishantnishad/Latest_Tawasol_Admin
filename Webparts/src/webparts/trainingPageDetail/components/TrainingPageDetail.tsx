import * as React from "react";
import styles from "./TrainingPageDetail.module.scss";
import type { ITrainingPageDetailProps } from "./ITrainingPageDetailProps";
import { SPFI, spfi, SPFx } from "@pnp/sp";
import { MSGraphClientV3 } from "@microsoft/sp-http";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import "@pnp/sp/files";
import "@pnp/sp/files/web";
import "@pnp/sp/folders";

const safeStr = (v: any): string => String(v ?? "").trim();

const toBase64Utf8 = (input: string): string => {
  // btoa only supports latin1; convert utf8 -> latin1 first
  return btoa(
    encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
};

const getDefaultAvatar = (nameOrEmail: string): string => {
  const safe = safeStr(nameOrEmail) || "User";
  const initials = safe
    .split(" ")
    .map((n) => n?.trim()?.[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const colors = [
    "#0078D4",
    "#00A4EF",
    "#50E6FF",
    "#8764B8",
    "#881798",
    "#E43BA6",
    "#E74856",
    "#F7630C",
    "#FFB900",
    "#00CC6A",
  ];

  const colorIndex =
    safe.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

  const bgColor = colors[colorIndex];

  const svg = `
    <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="${bgColor}"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".35em"
            font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="600" fill="white">
        ${initials}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${toBase64Utf8(svg)}`;
};

const normalizeUpnOrEmail = (raw: string): string => {
  const s = safeStr(raw);
  if (!s) return "";

  // Common SharePoint loginname format: i:0#.f|membership|user@domain.com
  const pipeIdx = s.lastIndexOf("|");
  if (pipeIdx >= 0 && pipeIdx < s.length - 1) return s.substring(pipeIdx + 1);

  return s;
};

interface ITrainingPageDetailState {
  isSubmitting: boolean;
  errorMessage: string;
  approvalStatus: "none" | "pending" | "approved" | "rejected";
  isEventCompleted: boolean;
  registeredItemId: number | null;
  isLoading: boolean;

  joinUrl: string;

  instructorName: string;
  instructorDesignation: string;
  instructorAvatarUrl: string;
}

export default class TrainingPageDetail extends React.Component<
  ITrainingPageDetailProps,
  ITrainingPageDetailState
> {
  private sp: SPFI;

  constructor(props: ITrainingPageDetailProps) {
    super(props);

    this.sp = spfi().using(SPFx(this.props.context));

    this.state = {
      isSubmitting: false,
      errorMessage: "",
      approvalStatus: "none",
      isEventCompleted: false,
      registeredItemId: null,
      isLoading: true,
      joinUrl: "",

      instructorName: "",
      instructorDesignation: "",
      instructorAvatarUrl: "",
    };
  }

  public componentDidMount(): void {
    void this.checkExistingRequest();
    void this.loadJoinUrl();
    void this.loadInstructorFromSitePagesAndGraph();
  }

  // -----------------------------------------
  // Utils
  // -----------------------------------------
  private extractISODate = (value?: string): string => {
    if (!value) return "";
    return value.split("\n").pop()?.trim() || "";
  };

  private isEventCompletedByEndDate = (endDateStr: string): boolean => {
    if (!endDateStr) return false;
    return new Date().getTime() > new Date(endDateStr).getTime();
  };

  private toPositiveNumber = (v: any): number | null => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  private addDays = (d: Date, days: number): Date => {
    const x = new Date(d.getTime());
    x.setDate(x.getDate() + days);
    return x;
  };

  private mapApprovalStatus = (
    val: any
  ): ITrainingPageDetailState["approvalStatus"] => {
    const s = String(val || "").toLowerCase();
    if (s === "approved") return "approved";
    if (s === "rejected") return "rejected";
    if (s === "pending") return "pending";
    return "none";
  };

  private getCurrentUserId = (): number | null => {
    const ctx = this.props.context;
    const raw =
      (ctx as any)?.pageContext?.user?.id ??
      (ctx as any)?.pageContext?.legacyPageContext?.userId;
    return this.toPositiveNumber(raw);
  };

  private safeUrlFromHyperlinkField = (v: any): string => {
    if (!v) return "";
    if (typeof v === "string") return v;
    return String(v?.Url ?? v?.url ?? "").trim();
  };

  private extractTermGuidFromOwstax = (owstax?: string): string => {
    const s = String(owstax || "");
    const m = s.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    );
    return m ? m[0] : "";
  };

  private setDepartmentOnRegisteredTraining = async (
    registrationId: number,
    trainingItem: any
  ): Promise<void> => {
    const label = String(
      trainingItem?.departmentName ||
        trainingItem?.department ||
        trainingItem?.TIRDepartment ||
        ""
    ).trim();

    const guid = this.extractTermGuidFromOwstax(
      trainingItem?.departmentTaxId || trainingItem?.owstaxIdTIRDepartment
    );

    if (!label || !guid) {
      console.warn("Department not available on trainingItem:", {
        label,
        guid,
        keys: Object.keys(trainingItem || {}),
      });
      return;
    }

    const regItem = this.sp.web.lists
      .getByTitle("Registered Training")
      .items.getById(registrationId);

    // Put the MOST likely internal names first
    const fieldCandidates = [
      "TIRDepartment",
      "Department_x0020_Name",
      "DepartmentName", // keep, but it must NOT break the flow
      "Department",
    ];

    // Try a couple of formats because taxonomy fields can differ by config (single/multi)
    const valueCandidates = [
      `-1;#${label}|${guid}`,
      `${label}|${guid}`,
      label, // last fallback if the column is actually plain text
    ];

    for (const fieldName of fieldCandidates) {
      for (const fieldValue of valueCandidates) {
        try {
          const res: any = await regItem.validateUpdateListItem([
            { FieldName: fieldName, FieldValue: fieldValue },
          ]);

          const hasException =
            Array.isArray(res) && res.some((r) => r?.HasException);

          if (!hasException) return; // success
        } catch {
          // swallow and continue
          continue;
        }
      }
    }

    console.warn(
      "Could not set Department on Registered Training item. Check the internal name of 'Department Name' column."
    );
  };

  /**
   * IMPORTANT:
   * This WebPart runs ON the Site Page itself, so we can use pageContext.listItem.id
   * (this is the Site Pages item ID of the training page).
   */
  private getTrainingPageItemId = (): number | null => {
    const ctx = this.props.context;

    const raw =
      (ctx as any)?.pageContext?.listItem?.id ?? // modern pages
      (ctx as any)?.pageContext?.legacyPageContext?.listItemId ?? // fallback
      (ctx as any)?.pageContext?.legacyPageContext?.listItemID;

    return this.toPositiveNumber(raw);
  };

  /**
   * TrainingId that will be saved into Registered Training -> TIRTrainingID
   */
  private getTrainingId = (item: any): number | null => {
    const directCandidates = [
      item?.Id,
      item?.ID,
      item?.id,
      item?.ListItemID,
      item?.ListItemId,
      item?.listItemId,
      item?.listItemID,
      item?.ItemID,
      item?.itemId,
    ];

    for (const c of directCandidates) {
      const n = this.toPositiveNumber(c);
      if (n) return n;
    }

    // main fix for your case
    return this.getTrainingPageItemId();
  };

  // -----------------------------------------
  // Page item id resolver
  // -----------------------------------------
  private resolveTrainingPageItemId = async (): Promise<number | null> => {
    // 1) Best: pageContext.listItem.id
    const fromCtx = this.getTrainingPageItemId();
    if (fromCtx) return fromCtx;

    // 2) Fallback: resolve current page file -> list item id
    try {
      const path = (window?.location?.pathname || "").split("?")[0];
      if (!path) return null;

      const file: any = await this.sp.web
        .getFileByServerRelativePath(path)
        .listItemAllFields.select("Id")();

      return this.toPositiveNumber(file?.Id);
    } catch (e) {
      console.warn(
        "[TrainingPageDetail] Unable to resolve Site Pages item id from current page url.",
        e
      );
      return null;
    }
  };

  // -----------------------------------------
  // Instructor: Site Pages -> TIRInstructor + Graph
  // -----------------------------------------
  private blobToDataUrl = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  private loadInstructorFromSitePagesAndGraph = async (): Promise<void> => {
    const ctx = this.props.context;

    const pageItemId = await this.resolveTrainingPageItemId();
    const item = this.props.trainingItem?.[0];

    // Fallbacks from trainingItem (if ever present)
    const itemFallbackName =
      safeStr(
        item?.instructor?.name ||
          item?.instructorName ||
          item?.OrganizerName ||
          item?.organizerName
      ) || "";
    const itemFallbackTitle = safeStr(item?.instructor?.role || item?.instructorTitle || "");
    const itemFallbackEmail = safeStr(item?.instructor?.email || item?.instructorEmail || "");

    let spName = "";
    let email = "";

    if (pageItemId) {
      // 1) Expanded user field
      try {
        const page: any = await this.sp.web.lists
          .getByTitle("Site Pages")
          .items.getById(pageItemId)
          .select(
            "TIRInstructor/Title",
            "TIRInstructor/EMail",
            "TIRInstructor/Email",
            "TIRInstructor/Name",
            "TIRInstructor/LoginName",
            "TIRInstructor/Id",
            "TIRInstructorId"
          )
          .expand("TIRInstructor")();

        const raw = page?.TIRInstructor;
        const u = Array.isArray(raw) ? raw[0] : raw;

        spName = safeStr(u?.Title || u?.displayName || u?.Name);
        email = normalizeUpnOrEmail(
          u?.EMail || u?.Email || u?.email || u?.UserPrincipalName || u?.LoginName
        );

        // 1b) numeric id fallback
        if (!spName || !email) {
          const uid = this.toPositiveNumber(page?.TIRInstructorId);
          if (uid) {
            const su: any = await this.sp.web.siteUsers.getById(uid)();
            if (!spName) spName = safeStr(su?.Title);
            if (!email) email = normalizeUpnOrEmail(su?.Email || su?.LoginName);
          }
        }
      } catch (e) {
        console.warn("[TrainingPageDetail] Unable to read TIRInstructor from Site Pages.", e);
      }

      // 1c) FieldValuesAsText fallback (at least gives display name)
      if (!spName) {
        try {
          const text: any = await this.sp.web.lists
            .getByTitle("Site Pages")
            .items.getById(pageItemId)
            .fieldValuesAsText();

          const key = Object.keys(text || {}).find((k) => k.toLowerCase().includes("instructor"));
          const val = key ? safeStr(text?.[key]) : "";
          if (val) spName = val;
        } catch {
          // ignore
        }
      }
    }

    // 2) Fallback to trainingItem
    if (!spName) spName = itemFallbackName;
    if (!email) email = normalizeUpnOrEmail(itemFallbackEmail);

    // 3) Pre-fill UI
    const preName = spName || email || "Instructor";
    const preDesignation = itemFallbackTitle;
    const preAvatar = getDefaultAvatar(preName);

    this.setState({
      instructorName: preName,
      instructorDesignation: preDesignation,
      instructorAvatarUrl: preAvatar,
    });

    console.log("[TrainingPageDetail] Instructor prefill:", { pageItemId, spName, email, preName });

    // 4) Graph enrich
    try {
      if (!ctx?.msGraphClientFactory || !email) return;

      const graph: MSGraphClientV3 = await ctx.msGraphClientFactory.getClient("3");

      let displayName = preName;
      let designation = preDesignation;

      try {
        const user = await graph
          .api(`/users/${encodeURIComponent(email)}`)
          .select("displayName,jobTitle,companyName")
          .get();

        if (user?.displayName) displayName = user.displayName;

        const jobTitle = safeStr(user?.jobTitle);
        const companyName = safeStr(user?.companyName);
        if (jobTitle && companyName) designation = `${jobTitle} at ${companyName}`;
        else if (jobTitle) designation = jobTitle;
      } catch (e) {
        console.warn("[TrainingPageDetail] Graph user lookup failed.", e);
      }

      let avatarUrl = "";
      try {
        const photoResponse: any = await graph
          .api(`/users/${encodeURIComponent(email)}/photo/$value`)
          .get();

        let blob: Blob;

        if (photoResponse instanceof ArrayBuffer) {
          blob = new Blob([photoResponse], { type: "image/jpeg" });
        } else if (photoResponse instanceof Blob) {
          blob = photoResponse;
        } else if (photoResponse && typeof photoResponse.arrayBuffer === "function") {
          const ab = await photoResponse.arrayBuffer();
          blob = new Blob([ab], { type: "image/jpeg" });
        } else {
          throw new Error("Unexpected photo response type");
        }

        avatarUrl = await this.blobToDataUrl(blob);
      } catch {
        avatarUrl = getDefaultAvatar(displayName || email);
      }

      this.setState({
        instructorName: displayName,
        instructorDesignation: designation,
        instructorAvatarUrl: avatarUrl,
      });
    } catch (e) {
      console.warn("[TrainingPageDetail] Graph enrich failed.", e);
    }
  };

  // -----------------------------------------
  // Load join URL (Site Pages -> TIRJoiningURL)
  // -----------------------------------------
  private loadJoinUrl = async (): Promise<void> => {
    try {
      const pageItemId = await this.resolveTrainingPageItemId();
      if (!pageItemId) return;

      const page: any = await this.sp.web.lists
        .getByTitle("Site Pages")
        .items.getById(pageItemId)
        .select("TIRJoiningURL")();

      const url = this.safeUrlFromHyperlinkField(page?.TIRJoiningURL);
      if (url) this.setState({ joinUrl: url });
    } catch (e) {
      // don't break page if join URL can't be fetched
      console.warn("Unable to load join url (TIRJoiningURL) from Site Pages.", e);
    }
  };

  private getStartEndDates = (item: any): { start: Date | null; end: Date | null } => {
    const startISO = this.extractISODate(
      item?.eventStartDate || item?.EventStartDate || item?.startDate || item?.StartDate
    );
    const endISO = this.extractISODate(
      item?.eventEndDate || item?.EventEndDate || item?.endDate || item?.EndDate
    );

    const s = startISO ? new Date(startISO) : null;
    const e = endISO ? new Date(endISO) : null;

    return {
      start: s && !isNaN(s.getTime()) ? s : null,
      end: e && !isNaN(e.getTime()) ? e : null,
    };
  };

  // -----------------------------------------
  // Check existing registration
  // -----------------------------------------
  private checkExistingRequest = async (): Promise<void> => {
    const { trainingItem } = this.props;

    if (!trainingItem?.length) {
      this.setState({ isLoading: false });
      return;
    }

    const item = trainingItem[0];
    const currentUserId = this.getCurrentUserId();

    if (!currentUserId) {
      this.setState({
        isLoading: false,
        errorMessage: "Current user id not found",
      });
      return;
    }

    try {
      const trainingId = this.getTrainingId(item);

      if (!trainingId) {
        console.warn(
          "Training ID not found. trainingItem[0] keys:",
          Object.keys(item || {}),
          "pageContext.listItem?.id:",
          (this.props.context as any)?.pageContext?.listItem?.id
        );

        this.setState({
          isLoading: false,
          errorMessage: "Training ID not found in trainingItem",
        });
        return;
      }

      const existingItems = await this.sp.web.lists
        .getByTitle("Registered Training")
        .items.select("Id","TIRApproval","TIRStage","Created")
        .filter(`TIRTrainingID eq ${trainingId} and AuthorId eq ${currentUserId}`)
        .orderBy("Created", false)
        .top(1)();

      const rawEndDate = item?.eventEndDate || item?.EndDate || item?.endDate;
      const cleanEndDate = this.extractISODate(rawEndDate);
      const completed = this.isEventCompletedByEndDate(cleanEndDate);

      if (existingItems.length > 0) {
        const registeredItem = existingItems[0];
        const status = this.mapApprovalStatus(registeredItem?.TIRApproval);

        this.setState({
          approvalStatus: status,
          registeredItemId: registeredItem.Id,
          isEventCompleted: completed,
          isLoading: false,
          errorMessage: "",
        });
      } else {
        this.setState({
          isEventCompleted: completed,
          isLoading: false,
          errorMessage: "",
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Check existing request error:", error);
      this.setState({
        isLoading: false,
        errorMessage: "Failed to check registration status",
      });
    }
  };

  // -----------------------------------------
  // Request approval
  // -----------------------------------------
  private handleRequestApproval = async (): Promise<void> => {
    const { trainingItem } = this.props;

    if (!trainingItem?.length) {
      this.setState({ errorMessage: "No training data available" });
      return;
    }

    const item = trainingItem[0];
    const currentUserId = this.getCurrentUserId();

    if (!currentUserId) {
      this.setState({ errorMessage: "Current user id not found" });
      return;
    }

    this.setState({ isSubmitting: true, errorMessage: "" });

    try {
      const trainingId = this.getTrainingId(item);

      if (!trainingId) {
        console.warn(
          "Training ID not found. trainingItem[0] keys:",
          Object.keys(item || {}),
          "pageContext.listItem?.id:",
          (this.props.context as any)?.pageContext?.listItem?.id
        );

        this.setState({
          isSubmitting: false,
          errorMessage: "Training ID not found in trainingItem",
        });
        return;
      }

      const existingItems = await this.sp.web.lists
        .getByTitle("Registered Training")
        .items.select("Id","TIRApproval","TIRStage","Created")
        .filter(`TIRTrainingID eq ${trainingId} and AuthorId eq ${currentUserId}`)
        .top(1)();

      if (existingItems.length > 0) {
        const existingItem = existingItems[0];
        const status = this.mapApprovalStatus(existingItem?.TIRApproval);

        this.setState({
          isSubmitting: false,
          approvalStatus: status,
          registeredItemId: existingItem?.Id ?? null,
          errorMessage: "",
        });
        return;
      }

      const addRes = await this.sp.web.lists
        .getByTitle("Registered Training")
        .items.add({
          TIRApproval: "Pending",
          TIRStage: "Pending",
          TIRTrainingID: trainingId,
          Title: item?.title || item?.Title,
        });

      let createdId: number | null =
        (addRes as any)?.data?.Id ??
        (addRes as any)?.data?.ID ??
        (addRes as any)?.item?.Id ??
        (addRes as any)?.item?.ID ??
        null;

      if (!createdId) {
        const latest = await this.sp.web.lists
          .getByTitle("Registered Training")
          .items.select("Id", "TIRApproval")
          .filter(`TIRTrainingID eq ${trainingId} and AuthorId eq ${currentUserId}`)
          .orderBy("Created", false)
          .top(1)();

        createdId = latest?.[0]?.Id ?? null;
      }

      // ALWAYS try to set dept, but never break registration if it fails
      if (createdId) {
        try {
          await this.setDepartmentOnRegisteredTraining(createdId, item);
        } catch (e) {
          console.warn("Department update failed, but registration created.", e);
        }
      }

      this.setState({
        isSubmitting: false,
        approvalStatus: "pending",
        registeredItemId: createdId,
        errorMessage: "",
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Request approval error:", error);
      this.setState({
        isSubmitting: false,
        errorMessage: "Failed to submit approval request",
      });
    }
  };

  // -----------------------------------------
  // Actions
  // -----------------------------------------
  private handleJoinTraining = async (): Promise<void> => {
    // Prefer state.joinUrl (Site Pages TIRJoiningURL)
    let link = String(this.state.joinUrl || "").trim();

    // Fallback to MeetingLink if any component ever passes it
    if (!link) {
      link = String((this.props.trainingItem as any)?.[0]?.MeetingLink || "").trim();
    }

    // If still empty, attempt to fetch on-demand once
    if (!link) {
      await this.loadJoinUrl();
      link = String(this.state.joinUrl || "").trim();
    }

    link ? window.open(link, "_blank") : alert("Link will be shared later.");
  };

  private handleGiveFeedback = (): void => {
    const { registeredItemId } = this.state;
    const { context } = this.props;

    window.location.href = `${context.pageContext.web.absoluteUrl}/SitePages/TrainingFeedback.aspx?registrationId=${registeredItemId}`;
  };

  // Date Format
  private formatSchedule = (start: string, end: string): string => {
    if (!start || !end) return "";

    const s = new Date(start);
    const e = new Date(end);

    const startTime = s.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const endTime = e.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const datePart = s
      .toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
      .toUpperCase();

    return `${startTime} - ${endTime} | ${datePart}`;
  };

  // -----------------------------------------
  // Button logic
  // Rule (B): 1 day before Start Date => "Registered Training"
  // During Start..End => "Join Training"
  // -----------------------------------------
  private getButtonConfig = (item: any) => {
    const { approvalStatus, isSubmitting, isLoading } = this.state;

    if (isLoading) return { text: "Loading...", disabled: true };

    const now = new Date();
    const { start, end } = this.getStartEndDates(item);

    const isPast = !!end ? now.getTime() > end.getTime() : this.state.isEventCompleted;

    const isJoinWindow =
      !!start && !!end && now.getTime() >= start.getTime() && now.getTime() <= end.getTime();

    const isRegisteredWindow =
      !!start && now.getTime() >= this.addDays(start, -1).getTime() && now.getTime() < start.getTime();

    if (isPast) {
      if (approvalStatus === "approved") {
        return {
          text: "Give Feedback",
          onClick: this.handleGiveFeedback,
          className: styles.feedbackButton,
        };
      }

      return {
        text: "Past Training",
        disabled: true,
        className: styles.pastTrainingButton,
      };
    }

    if (approvalStatus === "pending") {
      return {
        text: "Request Pending",
        disabled: true,
        className: styles.pendingButton,
      };
    }

    if (approvalStatus === "rejected") {
      return {
        text: "Request Rejected",
        disabled: true,
        className: styles.rejectedButton,
      };
    }

    if (approvalStatus === "approved") {
      if (isJoinWindow) {
        return {
          text: "Join Training",
          onClick: this.handleJoinTraining,
          className: styles.joinButton,
        };
      }

      if (isRegisteredWindow) {
        return {
          text: "Registered Training",
          disabled: true,
          className: styles.pendingButton,
        };
      }

      return {
        text: "Approved",
        disabled: true,
        className: styles.pendingButton,
      };
    }

    return {
      text: isSubmitting ? "Submitting..." : "Request for Approval",
      onClick: this.handleRequestApproval,
      disabled: isSubmitting,
    };
  };

  // -----------------------------------------
  // Render
  // -----------------------------------------
  public render(): React.ReactElement<ITrainingPageDetailProps> | null {
    const { trainingItem } = this.props;
    const { errorMessage } = this.state;

    if (!trainingItem?.length) return null;

    const item = trainingItem[0];
    const btn = this.getButtonConfig(item);

    const startISO = this.extractISODate(item?.eventStartDate);
    const endISO = this.extractISODate(item?.eventEndDate);
    const locationISO = this.extractISODate(item?.location);

    const scheduleText = this.formatSchedule(startISO, endISO);

    return (
      <div className={styles.card}>
        <div className={styles.tag}>Class Room</div>

        <h2 className={styles.title}>{item?.title || item?.Title}</h2>

        <div className={styles.details}>
          <p>
            <span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.0001 1.66602C5.40841 1.66602 1.66675 5.40768 1.66675 9.99935C1.66675 14.591 5.40841 18.3327 10.0001 18.3327C14.5917 18.3327 18.3334 14.591 18.3334 9.99935C18.3334 5.40768 14.5917 1.66602 10.0001 1.66602ZM13.6251 12.9743C13.5084 13.1743 13.3001 13.2827 13.0834 13.2827C12.9751 13.2827 12.8667 13.2577 12.7667 13.191L10.1834 11.6493C9.54175 11.266 9.06675 10.4243 9.06675 9.68268V6.26602C9.06675 5.92435 9.35008 5.64102 9.69175 5.64102C10.0334 5.64102 10.3167 5.92435 10.3167 6.26602V9.68268C10.3167 9.98268 10.5667 10.4243 10.8251 10.5743L13.4084 12.116C13.7084 12.291 13.8084 12.6743 13.6251 12.9743Z" fill="#DA291C" />
              </svg>
            </span>
            {scheduleText}
          </p>

          <p>
            <span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_25344_30036)">
                  <path d="M17.1834 7.04232C16.3084 3.19232 12.9501 1.45898 10.0001 1.45898C10.0001 1.45898 10.0001 1.45898 9.99175 1.45898C7.05008 1.45898 3.68341 3.18398 2.80841 7.03398C1.83341 11.334 4.46675 14.9757 6.85008 17.2673C7.73341 18.1173 8.86675 18.5423 10.0001 18.5423C11.1334 18.5423 12.2667 18.1173 13.1417 17.2673C15.5251 14.9757 18.1584 11.3423 17.1834 7.04232ZM10.0001 11.2173C8.55008 11.2173 7.37508 10.0423 7.37508 8.59232C7.37508 7.14232 8.55008 5.96732 10.0001 5.96732C11.4501 5.96732 12.6251 7.14232 12.6251 8.59232C12.6251 10.0423 11.4501 11.2173 10.0001 11.2173Z" fill="#DA291C" />
                </g>
                <defs>
                  <clipPath id="clip0_25344_30036">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </span>
            {locationISO}
          </p>

          <div className={styles.organizerRow}>
            <img
              src={
                this.state.instructorAvatarUrl ||
                getDefaultAvatar(this.state.instructorName)
              }
              alt={this.state.instructorName}
              className={styles.organizerAvatar}
            />
            <div className={styles.organizerText}>
              <div className={styles.organizerName}>{this.state.instructorName}</div>
              {!!this.state.instructorDesignation && (
                <div className={styles.organizerDesignation}>{this.state.instructorDesignation}</div>
              )}
            </div>
          </div>
        </div>

        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}

        <button
          className={`${styles.button} ${btn.className || ""}`}
          onClick={btn.onClick}
          disabled={btn.disabled}
        >
          {btn.text}
        </button>
      </div>
    );
  }
}
