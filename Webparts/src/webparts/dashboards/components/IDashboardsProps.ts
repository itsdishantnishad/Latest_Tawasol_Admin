// Single source of props/types for the React components

export interface IDashboardItem {
  title: string;
  image?: string; // tile/preview placeholder (PNG/JPG)
  url?: string;   // Power BI (embed/publish) URL – if present, iframe dikhega
  desc?: string;  // optional small line under each tile
}

export interface IDashboardsProps {
  heading: string;
  subtitle?: string;
  bgImageUrl?: string;
  categories: string;        // Side nav labels (comma/newline separated)
  items: IDashboardItem[];   // 6 tiles (3 up, 3 down)
}
