export type StatItem = { label: string; value: number };

export interface IStatsProvider {
  getStats(): Promise<StatItem[]>;
}
