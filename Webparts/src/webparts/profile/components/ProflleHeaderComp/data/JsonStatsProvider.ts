import { IStatsProvider, StatItem } from "./IStatsProvider";

export class JsonStatsProvider implements IStatsProvider {
  constructor(private json: string | StatItem[] | Record<string, number>) {}

  public async getStats(): Promise<StatItem[]> {
    try {
      const raw = typeof this.json === "string" ? JSON.parse(this.json) : this.json;

      if (Array.isArray(raw)) {
        return raw
          .filter(x => x && typeof x.label === "string" && typeof x.value === "number")
          .slice(0, 4);
      }

      const obj = raw as Record<string, number>;
      const keys = Object.keys(obj || {});
      if (keys.length) {
        return keys.slice(0, 4).map(k => ({ label: k, value: Number(obj[k]) || 0 }));
      }
    } catch {
      // ignore and fall through
    }
    return [];
  }
}
