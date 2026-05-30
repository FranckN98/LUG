'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminNotify } from '@/app/admin/components/AdminToaster';
import type { CountdownAdminPayload } from '@/lib/countdown';
import Countdown from '@/components/Countdown';

type Form = CountdownAdminPayload;

const EMPTY_FORM: Form = {
  isActive: false,
  hideHeroSubtitle: false,
  targetDate: null,
  titleFr: '', titleDe: '', titleEn: '',
  subtitleFr: '', subtitleDe: '', subtitleEn: '',
  endedMessageFr: '', endedMessageDe: '', endedMessageEn: '',
};

/** Convert an ISO UTC string into a local `<input type="datetime-local">` value (YYYY-MM-DDTHH:MM). */
function isoToLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Local input value → ISO UTC string (treat input as local time). */
function localInputToIso(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function CountdownAdmin() {
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [localDate, setLocalDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/countdown', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed');
      const data = (await res.json()) as Form;
      setForm({
        ...EMPTY_FORM,
        ...data,
        titleFr: data.titleFr ?? '',
        titleDe: data.titleDe ?? '',
        titleEn: data.titleEn ?? '',
        subtitleFr: data.subtitleFr ?? '',
        subtitleDe: data.subtitleDe ?? '',
        subtitleEn: data.subtitleEn ?? '',
        endedMessageFr: data.endedMessageFr ?? '',
        endedMessageDe: data.endedMessageDe ?? '',
        endedMessageEn: data.endedMessageEn ?? '',
      });
      setLocalDate(isoToLocalInput(data.targetDate));
    } catch {
      adminNotify.error('Impossible de charger la configuration du countdown.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const iso = localInputToIso(localDate);
    if (!iso) {
      adminNotify.error('Sélectionnez une date et une heure valides.');
      return;
    }
    setSaving(true);
    try {
      const payload: Form = { ...form, targetDate: iso };
      const res = await fetch('/api/admin/countdown', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }
      const saved = (await res.json()) as Form;
      setForm({
        ...saved,
        titleFr: saved.titleFr ?? '',
        titleDe: saved.titleDe ?? '',
        titleEn: saved.titleEn ?? '',
        subtitleFr: saved.subtitleFr ?? '',
        subtitleDe: saved.subtitleDe ?? '',
        subtitleEn: saved.subtitleEn ?? '',
        endedMessageFr: saved.endedMessageFr ?? '',
        endedMessageDe: saved.endedMessageDe ?? '',
        endedMessageEn: saved.endedMessageEn ?? '',
      });
      setLocalDate(isoToLocalInput(saved.targetDate));
      adminNotify.success('Countdown enregistré.');
    } catch (err: any) {
      adminNotify.error(err?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }

  const previewIso = useMemo(() => localInputToIso(localDate), [localDate]);

  if (loading) {
    return <div className="p-6 text-gray-500">Chargement…</div>;
  }

  return (
    <div className="p-6 max-w-5xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Countdown de l&apos;événement</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configurez le compte à rebours affiché dans le hero de la page d&apos;accueil.
        </p>
      </header>

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-6">
          {/* Activation + date */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set('isActive', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Afficher le countdown dans le hero
              </span>
            </label>

            <label className="mt-3 flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.hideHeroSubtitle}
                onChange={(e) => set('hideHeroSubtitle', e.target.checked)}
                disabled={!form.isActive}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
              />
              <span className="text-sm text-gray-900 dark:text-white">
                <span className="font-medium">Masquer le sous-titre du hero</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Quand le countdown est actif, le paragraphe de description sous le titre est caché pour laisser toute la place au compte à rebours. Le sous-titre du countdown (champ ci-dessous) reste affiché.
                </span>
              </span>
            </label>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date &amp; heure cible (heure locale Europe/Berlin)
              </label>
              <input
                type="datetime-local"
                value={localDate}
                onChange={(e) => setLocalDate(e.target.value)}
                required
                className="w-full sm:w-80 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Titres par langue */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Titre court <span className="text-gray-400 font-normal">(ex. « Prochaine édition dans »)</span>
            </h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {(['Fr', 'De', 'En'] as const).map((lng) => (
                <div key={lng}>
                  <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">{lng}</label>
                  <input
                    type="text"
                    value={(form as any)[`title${lng}`] ?? ''}
                    onChange={(e) => set(`title${lng}` as keyof Form, e.target.value as any)}
                    placeholder={lng === 'Fr' ? 'Prochaine édition dans' : lng === 'De' ? 'Nächste Ausgabe in' : 'Next edition in'}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sous-titre */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Sous-titre <span className="text-gray-400 font-normal">(optionnel)</span>
            </h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {(['Fr', 'De', 'En'] as const).map((lng) => (
                <div key={lng}>
                  <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">{lng}</label>
                  <input
                    type="text"
                    value={(form as any)[`subtitle${lng}`] ?? ''}
                    onChange={(e) => set(`subtitle${lng}` as keyof Form, e.target.value as any)}
                    placeholder="Level Up in Germany revient bientôt"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Message de fin */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Message une fois l&apos;événement commencé
            </h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {(['Fr', 'De', 'En'] as const).map((lng) => (
                <div key={lng}>
                  <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">{lng}</label>
                  <input
                    type="text"
                    value={(form as any)[`endedMessage${lng}`] ?? ''}
                    onChange={(e) => set(`endedMessage${lng}` as keyof Form, e.target.value as any)}
                    placeholder={lng === 'Fr' ? "L'événement a commencé !" : lng === 'De' ? 'Die Veranstaltung hat begonnen!' : 'The event has started!'}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-primary text-white font-semibold shadow hover:bg-primary-light disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={() => load()}
              className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white"
            >
              Annuler les modifications
            </button>
          </div>
        </section>

        {/* Aperçu live (FR) */}
        <aside className="self-start sticky top-6">
          <div className="rounded-2xl bg-[#1a0c0c] p-5 shadow-xl border border-black/30">
            <p className="text-xs uppercase tracking-widest text-white/50 mb-3">Aperçu (FR)</p>
            {previewIso ? (
              <Countdown
                targetDate={previewIso}
                locale="fr"
                title={form.titleFr || null}
                subtitle={form.subtitleFr || null}
                endedMessage={form.endedMessageFr || null}
              />
            ) : (
              <p className="text-sm text-white/60">Choisissez une date pour voir l&apos;aperçu.</p>
            )}
          </div>
        </aside>
      </form>
    </div>
  );
}
