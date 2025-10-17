import { INewsArticleItem } from "../models/INewsArticleItem";
import "@pnp/sp/webs";
import "@pnp/sp/items";
import "@pnp/sp/lists";
/** Fetch article by ID (from Site Pages) — NOTE: NAViews REMOVED from select */
export declare function getArticleById(context: any, id: number): Promise<INewsArticleItem>;
/**
 * Get views via the Search API using the page absolute URL (Path).
 * Picks ViewsLifeTime → ViewsRecent → Popularity. Returns a number or undefined.
 */
export declare function getOotbViews(context: any, _id: number, fileUrl: string): Promise<number | undefined>;
//# sourceMappingURL=fetchHelper.d.ts.map