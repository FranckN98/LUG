export async function api<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(url, { cache: 'no-store', ...init });
  if (res.status === 401) window.location.href = '/admin/login?from=/admin/feedback';
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}

// `submittedOn` est un jour (minuit UTC) : on le formate en UTC pour ne pas le décaler.
const dayFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeZone: 'UTC' });
export const fmtDay = (iso: string) => dayFmt.format(new Date(iso));

export type Tag = { id: string; name: string; count: number };
