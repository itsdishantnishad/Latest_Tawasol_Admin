import type { WebPartContext } from "@microsoft/sp-webpart-base";
export interface IOurPortfolioProps {
    spfxContext: WebPartContext;
    siteUrl: string;
    listTitle?: string;
    brandField?: string;
    description?: string;
    isDarkTheme?: boolean;
    environmentMessage?: string;
    hasTeamsContext?: boolean;
    userDisplayName?: string;
}
//# sourceMappingURL=IOurPortfolioProps.d.ts.map