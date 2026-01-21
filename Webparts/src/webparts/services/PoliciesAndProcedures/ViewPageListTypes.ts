// ViewPageListTypes.ts
// Shared types for ViewPageList UI + Services (prevents circular imports)

export type PolicyFileExt = "pdf" | "docx" | "xlsx" | "pptx" | "jpg" | "txt" | "zip";

export type IPoliciesAndProceduresItem = {
  id: string;
  name: string;
  isFolder?: boolean;
  ext?: PolicyFileExt;
  modifiedBy?: string;
  modifiedOn?: Date;
  department?: string;
  tag?: string;
  previewUrl?: string;
  serverRelativeUrl?: string;
};

export type FavouriteIndex = Record<string, number>;
