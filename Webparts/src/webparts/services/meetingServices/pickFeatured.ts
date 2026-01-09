import { Meeting } from './IMeetingProvider';

export function pickFeatured(rows: Meeting[]) {
  const now = Date.now();
  let idx = 0;
  for (let i = 0; i < rows.length; i++) {
    if (new Date(rows[i].start).getTime() >= now) { idx = i; break; }
  }
  //const featured3 = rows.slice(idx, idx + 4);
  const latest4 = rows.slice(0, 4);
  return {  latest4 };
}
