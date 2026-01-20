import * as React from "react";
import styles from "./PoliciesAndProcedures.module.scss";
import { listServices, DocumentSummary } from "../../services/listServices";

import {
  ICON_PDF,
  ICON_WORD,
  ICON_POWERPOINT,
  ICON_TEXT,
  ICON_JPG,
  ICON_ZIP,
  ICON_TAG,
  ICON_BOARD_RECENTLY_UPDATED,
  ICON_BOARD_MOST_USED,
  ICON_BOARD_FAVOURITES,
} from "../../assets/constants";

type BoardItem = DocumentSummary;

interface IBoardsProps {
  context?: any;
  useSharePointProvider?: boolean;
  dmsLibraryRoot?: string;

  recentlyCount?: number;
  mostUsedCount?: number;

  favouritesCount?: number;
  favouritesListTitle?: string;
}

interface IBoardsState {
  loading: boolean;

  recently: BoardItem[];
  mostUsed: BoardItem[];
  favourites: BoardItem[];

  recentlyError?: string;
  mostUsedError?: string;
  favouritesError?: string;
}

export default class Boards extends React.Component<IBoardsProps, IBoardsState> {
  public state: IBoardsState = {
    loading: true,
    recently: [],
    mostUsed: [],
    favourites: [],
  };

  private _mounted: boolean = false;

  private static readonly ALLOWED_EXT = new Set([
    "pdf",
    "doc",
    "docx",
    "ppt",
    "pptx",
    "pps",
    "ppsx",
    "xls",
    "xlsx",
    "csv",
    "txt",
    "rtf",
    "zip",
    "jpg",
    "jpeg",
    "png",
  ]);

  private getExt(it: BoardItem): string {
    const fromField = (it.ext || "").toLowerCase().trim();
    if (fromField) return fromField;

    const name = (it.name || "").toLowerCase();
    const url = (it.url || "").toLowerCase();

    const pick = (s: string) => {
      const m = s.match(/\.([0-9a-z]+)(?:$|\?)/i);
      return (m?.[1] || "").toLowerCase();
    };

    return pick(name) || pick(url) || "";
  }

  private isAllowedDoc(it: BoardItem): boolean {
    const ext = this.getExt(it);
    if (!ext) return false;
    if (!Boards.ALLOWED_EXT.has(ext)) return false;
    return true;
  }

  private normalizeDocs(items: BoardItem[], limit: number): BoardItem[] {
    return (items || [])
      .map((x) => ({ ...x, ext: this.getExt(x) }))
      .filter((x) => this.isAllowedDoc(x))
      .slice(0, limit);
  }

  private getIconUrl(ext?: string): string {
    const e = (ext || "").toLowerCase();
    if (e === "pdf") return ICON_PDF;
    if (e === "doc" || e === "docx") return ICON_WORD;
    if (e === "ppt" || e === "pptx" || e === "pps" || e === "ppsx") return ICON_POWERPOINT;
    if (e === "jpg" || e === "jpeg" || e === "png") return ICON_JPG;
    if (e === "zip") return ICON_ZIP;
    return ICON_TEXT;
  }

  private formatError(e: any): string {
    try {
      const body = e?.data?.responseBody;
      if (typeof body === "string" && body.trim().startsWith("{")) {
        const j = JSON.parse(body);
        const msg = j?.["odata.error"]?.message?.value || j?.error?.message;
        if (msg) return String(msg);
      }
      const msg = e?.message?.value || e?.message;
      if (msg) return String(msg);
    } catch {
      // ignore
    }
    return "Request failed. Check Network tab for details.";
  }

  private safeDecode(seg: string): string {
    try {
      return decodeURIComponent(seg);
    } catch {
      return seg;
    }
  }

  // Category label (folder name just under the library root)
  private getCategoryLabel(it: BoardItem): string {
    const fallback = "Documents";
    const url = (it.url || "").trim();
    if (!url) return fallback;

    const rootRel = (this.props.dmsLibraryRoot || "").trim().replace(/\/$/, "");
    if (!rootRel) return fallback;

    try {
      const abs = /^https?:\/\//i.test(url)
        ? url
        : `${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`;

      const u = new URL(abs);

      const pathParts = (u.pathname || "")
        .split("/")
        .filter(Boolean)
        .map((p) => this.safeDecode(p));

      const rootParts = rootRel
        .split("/")
        .filter(Boolean)
        .map((p) => this.safeDecode(p));

      const match = rootParts.every(
        (rp, i) => (pathParts[i] || "").toLowerCase() === rp.toLowerCase()
      );

      if (!match) {
        return pathParts.length >= 2 ? pathParts[pathParts.length - 2] : fallback;
      }

      const idxAfterRoot = rootParts.length;
      if (idxAfterRoot >= pathParts.length - 1) return fallback;

      return pathParts[idxAfterRoot] || fallback;
    } catch {
      return fallback;
    }
  }

  public async componentDidMount(): Promise<void> {
    this._mounted = true;

    const recentlyCount: number = this.props.recentlyCount ?? 5;
    const mostUsedCount: number = this.props.mostUsedCount ?? 5;
    const favouritesCount: number = this.props.favouritesCount ?? 3;

    const useSP: boolean =
      (this.props.useSharePointProvider ?? !!this.props.context) && !!this.props.context;

    if (!useSP) {
      if (this._mounted) {
        this.setState({
          loading: false,
          recently: [],
          mostUsed: [],
          favourites: [],
          recentlyError: "SharePoint context/provider not available.",
          mostUsedError: "SharePoint context/provider not available.",
          favouritesError: "SharePoint context/provider not available.",
        });
      }
      return;
    }

    const root = (this.props.dmsLibraryRoot || "").trim();
    const favList = (this.props.favouritesListTitle || "Document Favourites").trim();

    if (!root) {
      if (this._mounted) {
        this.setState({
          loading: false,
          recently: [],
          mostUsed: [],
          favourites: [],
          recentlyError: "dmsLibraryRoot is empty. Pass library server-relative path from Landing.tsx.",
          mostUsedError: "dmsLibraryRoot is empty. Pass library server-relative path from Landing.tsx.",
        });
      }
      // still try favourites even without root
    }

    const svc = new listServices(this.props.context);

    let recentRaw: any[] = [];
    let mostUsedRaw: any[] = [];
    let favRaw: any[] = [];

    let recentlyError: string | undefined;
    let mostUsedError: string | undefined;
    let favouritesError: string | undefined;

    if (root) {
      try {
        recentRaw = await svc.getRecentlyUpdatedDocuments(root, recentlyCount);
      } catch (e: any) {
        recentlyError = this.formatError(e);
      }

      try {
        mostUsedRaw = await svc.getMostUsedDocumentsInLibrary(root, mostUsedCount);
      } catch (e: any) {
        mostUsedError = this.formatError(e);
      }
    }

    try {
      favRaw = await svc.getUserFavouriteDocuments(favList, favouritesCount);
    } catch (e: any) {
      favouritesError = this.formatError(e);
    }

    const recently = this.normalizeDocs(recentRaw || [], recentlyCount);
    const mostUsed = this.normalizeDocs(mostUsedRaw || [], mostUsedCount);
    const favourites = this.normalizeDocs(favRaw || [], favouritesCount);

    if (this._mounted) {
      this.setState({
        loading: false,
        recently,
        mostUsed,
        favourites,
        recentlyError,
        mostUsedError,
        favouritesError,
      });
    }
  }

  public componentWillUnmount(): void {
    this._mounted = false;
  }

  private renderName(it: BoardItem): React.ReactNode {
    const name = it.name || "Document";
    if (it.url) {
      return (
        <a
          className={`${styles.name} ${styles.nameLink}`}
          href={it.url}
          target="_blank"
          rel="noreferrer noopener"
          title={name}
          onClick={(e) => e.stopPropagation()}
        >
          {name}
        </a>
      );
    }
    return (
      <span className={styles.name} title={name}>
        {name}
      </span>
    );
  }

  private renderDocBoard(
    title: string,
    headerIcon: string,
    items: BoardItem[],
    emptyText: string,
    errorText?: string
  ): React.ReactElement {
    const { loading } = this.state;
    const rows = loading ? [] : items;

    return (
      <div className={styles.board}>
        <div className={styles.boardTitleRow}>
          <img src={headerIcon} alt="" className={styles.boardTitleIcon} />
          <span className={styles.boardTitleText}>{title}</span>
        </div>

        <ul className={styles.boardList}>
          {!loading && !!errorText && (
            <li className={styles.boardRowMessage}>
              <span className={styles.dot} />
              <span className={`${styles.meta} ${styles.errorText}`}>{errorText}</span>
              <span />
            </li>
          )}

          {!loading && !errorText && rows.length === 0 && (
            <li className={styles.boardRowMessage}>
              <span className={styles.dot} />
              <span className={styles.meta}>{emptyText}</span>
              <span />
            </li>
          )}

          {!errorText &&
            rows.map((it: BoardItem) => {
              const ext = this.getExt(it);
              const icon = this.getIconUrl(ext);
              const category = this.getCategoryLabel(it);

              return (
                <li key={it.id} className={styles.boardRowDoc}>
                  <img src={icon} alt="" className={styles.boardItemIcon} />

                  <div>
                    {this.renderName(it)}

                    <div className={styles.categoryRow}>
                      <img src={ICON_TAG} alt="" className={styles.categoryIcon} />
                      <span className={styles.meta}>{category}</span>
                    </div>
                  </div>

                  <span className={styles.meta}>{it.dept || ""}</span>
                </li>
              );
            })}
        </ul>
      </div>
    );
  }

  public render(): React.ReactElement {
    const { recently, mostUsed, favourites, recentlyError, mostUsedError, favouritesError } = this.state;

    return (
      <div className={styles.boards}>
        {this.renderDocBoard("Recently Updated", ICON_BOARD_RECENTLY_UPDATED, recently, "No documents found", recentlyError)}
        {this.renderDocBoard("Most Used in DHRE", ICON_BOARD_MOST_USED, mostUsed, "No documents found", mostUsedError)}
        {this.renderDocBoard("Favourites", ICON_BOARD_FAVOURITES, favourites, "No favourites found", favouritesError)}
      </div>
    );
  }
}
