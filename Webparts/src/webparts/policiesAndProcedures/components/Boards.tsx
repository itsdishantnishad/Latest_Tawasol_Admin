// import * as React from 'react';
// import styles from './PoliciesAndProcedures.module.scss';
// import { listServices, DocumentSummary } from '../../services/listServices';

// type BoardItem = DocumentSummary;

// interface IBoardsProps {
//   context?: any;
//   useSharePointProvider?: boolean;
//   dmsLibraryRoot?: string;
//   recentlyCount?: number;
//   mostUsedCount?: number;
// }

// interface IBoardsState {
//   loading: boolean;
//   recently: BoardItem[];
//   mostUsed: BoardItem[];
//   favourites: BoardItem[];
// }

// export default class Boards extends React.Component<IBoardsProps, IBoardsState> {
//   public state: IBoardsState = {
//     loading: true,
//     recently: [],
//     mostUsed: [],
//     favourites: []
//   };

//   private _mounted: boolean = false;

//   public async componentDidMount(): Promise<void> {
//     this._mounted = true;

//     const dummyFavs: BoardItem[] = [
//       { id: 'f1', name: 'Performance Management', ext: 'docx', tag: 'Documents', dept: 'GRC' },
//       { id: 'f2', name: 'Addendum to HC Policy Manual Reference….', ext: 'pptx', tag: 'Awareness Sessions', dept: 'GRC' },
//       { id: 'f3', name: 'Addendum to HC Policy Manual Reference….', ext: 'pdf', tag: 'Forms', dept: 'GRC' }
//     ];

//     const recentlyCount: number = this.props.recentlyCount ?? 6;
//     const mostUsedCount: number = this.props.mostUsedCount ?? 6;

//     const placeholders: BoardItem[] = [];
//     for (let i = 0; i < recentlyCount; i++) {
//       placeholders.push({
//         id: `p${i}`,
//         name: `Sample document ${i + 1}.pdf`,
//         dept: 'GRC'
//       } as BoardItem);
//     }

//     const useSP: boolean =
//       (this.props.useSharePointProvider ?? !!this.props.context) && !!this.props.context;

//     if (!useSP) {
//       if (this._mounted) {
//         this.setState({
//           loading: false,
//           recently: placeholders,
//           mostUsed: placeholders.slice(0, Math.min(4, mostUsedCount)),
//           favourites: dummyFavs
//         });
//       }
//       return;
//     }

//     try {
//       const svc = new listServices(this.props.context);

//       const results = await Promise.all([
//         svc.getRecentlyUpdatedDocuments(this.props.dmsLibraryRoot || '/sites/Intranet/DMS', recentlyCount),
//         svc.getMostUsedDocumentsOnSite(mostUsedCount)
//       ]);

//       const recently: BoardItem[] = (results[0] as BoardItem[]) || placeholders;
//       const mostUsed: BoardItem[] = (results[1] as BoardItem[]) || placeholders.slice(0, Math.min(4, mostUsedCount));

//       if (this._mounted) {
//         this.setState({
//           loading: false,
//           recently,
//           mostUsed,
//           favourites: dummyFavs
//         });
//       }
//     } catch (e: any) {
//       if (this._mounted) {
//         this.setState({
//           loading: false,
//           recently: placeholders,
//           mostUsed: placeholders.slice(0, Math.min(4, mostUsedCount)),
//           favourites: dummyFavs
//         });
//       }
//     }
//   }

//   public componentWillUnmount(): void {
//     this._mounted = false;
//   }

//   private renderSimpleList(title: string, items: BoardItem[]): React.ReactElement {
//     return (
//       <div className={styles.board}>
//         <div className={styles.boardTitle}>{title}</div>
//         <ul className={styles.boardList}>
//           {items.map((it: BoardItem) => (
//             <li key={it.id}>
//               <span className={styles.dot} />
//               <span className={styles.name} title={it.name}>
//                 {it.name}
//               </span>
//               <span className={styles.meta}>{it.dept || ''}</span>
//             </li>
//           ))}
//         </ul>
//       </div>
//     );
//   }

//   public render(): React.ReactElement {
//     const { recently, mostUsed, favourites } = this.state;

//     return (
//       <div className={styles.boards}>
//         {this.renderSimpleList('Recently Updated', recently)}
//         {this.renderSimpleList('Most Used in DHRE', mostUsed)}

//         <div className={styles.board}>
//           <div className={styles.boardTitle}>Favourites</div>
//           <ul className={styles.boardList}>
//             {favourites.map((f: BoardItem) => (
//               <li key={f.id} style={{ gridTemplateColumns: '12px 1fr auto' }}>
//                 <span className={styles.dot} />
//                 <div>
//                   <div className={styles.name} title={f.name}>
//                     {f.name}
//                   </div>
//                   <div className={styles.meta}>{f.tag || 'Documents'}</div>
//                 </div>
//                 <span className={styles.meta}>{f.dept || ''}</span>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     );
//   }
// }





















import * as React from "react";
import styles from "./PoliciesAndProcedures.module.scss";
import { listServices, DocumentSummary } from "../../services/listServices";

// ✅ same icon constants pattern as ViewPageList.tsx
import {
  ICON_PDF,
  ICON_WORD,
  ICON_POWERPOINT,
  ICON_TEXT,
  ICON_JPG,
  ICON_ZIP,
} from "../../assets/constants";

type BoardItem = DocumentSummary;

interface IBoardsProps {
  context?: any;
  useSharePointProvider?: boolean;
  dmsLibraryRoot?: string;

  recentlyCount?: number;
  mostUsedCount?: number;

  favouritesCount?: number;
  favouritesListTitle?: string; // default "Document Favorites"
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

  // only show “real documents” (extra guard: prevents folders + aspx pages)
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
      // PnPjs often has e.data.responseBody JSON
      const body = e?.data?.responseBody;
      if (typeof body === "string" && body.trim().startsWith("{")) {
        const j = JSON.parse(body);
        const msg = j?.["odata.error"]?.message?.value || j?.error?.message;
        if (msg) return String(msg);
      }
      // Sometimes already in message/value
      const msg = e?.message?.value || e?.message;
      if (msg) return String(msg);
    } catch {
      // ignore
    }
    return "Request failed. Check Network tab for details.";
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

    // root is required (you said remove /sites/Intranet/DMS)
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

    // ✅ no Promise.all — each board can fail independently (and show its own error)
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
          className={styles.name}
          href={it.url}
          target="_blank"
          rel="noreferrer noopener"
          title={name}
          style={{ color: "inherit", textDecoration: "none" }}
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
    items: BoardItem[],
    emptyText: string,
    errorText?: string
  ): React.ReactElement {
    const { loading } = this.state;

    // loading => keep empty list (no placeholders)
    const rows = loading ? [] : items;

    return (
      <div className={styles.board}>
        <div className={styles.boardTitle}>{title}</div>

        <ul className={styles.boardList}>
          {!loading && !!errorText && (
            <li style={{ gridTemplateColumns: "12px 1fr auto" }}>
              <span className={styles.dot} />
              <span className={styles.meta} style={{ color: "#b00020" }}>
                {errorText}
              </span>
              <span />
            </li>
          )}

          {!loading && !errorText && rows.length === 0 && (
            <li style={{ gridTemplateColumns: "12px 1fr auto" }}>
              <span className={styles.dot} />
              <span className={styles.meta}>{emptyText}</span>
              <span />
            </li>
          )}

          {!errorText &&
            rows.map((it: BoardItem) => {
              const ext = this.getExt(it);
              const icon = this.getIconUrl(ext);

              return (
                <li key={it.id} style={{ gridTemplateColumns: "12px auto 1fr auto" }}>
                  <img src={icon} alt="" style={{ width: 18, height: 18, alignSelf: "center" }} />

                  <div>
                    {this.renderName(it)}
                    <div className={styles.meta}>{it.tag || "Documents"}</div>
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
        {this.renderDocBoard("Recently Updated", recently, "No documents found", recentlyError)}
        {this.renderDocBoard("Most Used in DHRE", mostUsed, "No documents found", mostUsedError)}
        {this.renderDocBoard("Favourites", favourites, "No favourites found", favouritesError)}
      </div>
    );
  }
}
