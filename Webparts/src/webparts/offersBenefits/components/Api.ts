export async function fetchJson(url: string, abort?: AbortSignal): Promise<any> {
  const res = await fetch(url, { headers: { 'accept': 'application/json' }, signal: abort });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export function readPlaceholder(json: string): any {
  try { return JSON.parse(json); }
  catch { throw new Error('Invalid placeholder JSON'); }
}



