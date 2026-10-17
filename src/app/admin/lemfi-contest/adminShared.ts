const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Berlin' });

export const fmtDate = (iso: string) => dateFmt.format(new Date(iso));

export async function api<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(url, { cache: 'no-store', ...init });
  if (res.status === 401) {
    window.location.href = '/admin/login?from=/admin/lemfi-contest';
  }
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}
