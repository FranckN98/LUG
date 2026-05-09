'use client';

import { useMemo, useState } from 'react';
import { EventCommunicationPopup, type EventCommunicationPopupData } from '@/components/EventCommunicationPopup';
import { adminNotify } from '@/app/admin/components/AdminToaster';

type CommunicationSettings = {
  id: string;
  isCommunicationModeActive: boolean;
  popupDelaySeconds: number;
  title: string;
  description: string;
  buttonText: string;
  eventId: string | null;
  updatedAt: string;
};

type EventOption = {
  id: string;
  year: number;
  slug: string;
  status: string;
  title: string;
  imageUrl: string | null;
};

type Props = {
  initialSettings: CommunicationSettings;
  events: EventOption[];
};

function fieldCls() {
  return 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10';
}

export default function CommunicationAdmin({ initialSettings, events }: Props) {
  const [form, setForm] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === form.eventId) ?? null,
    [events, form.eventId],
  );

  const previewData: EventCommunicationPopupData | null = selectedEvent
    ? {
        eventId: selectedEvent.id,
        title: form.title,
        description: form.description,
        buttonText: form.buttonText,
        imageUrl: selectedEvent.imageUrl,
        eventTitle: selectedEvent.title,
        eventYear: selectedEvent.year,
        updatedAt: form.updatedAt,
      }
    : null;

  async function saveSettings() {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/admin/communication', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const body = (await res.json()) as CommunicationSettings | { error?: string };
      if (!res.ok || 'error' in body) {
        throw new Error('error' in body ? body.error ?? 'Erreur de sauvegarde.' : 'Erreur de sauvegarde.');
      }

      setForm(body as CommunicationSettings);
      setMessage('Configuration enregistrée.');
      adminNotify.success('Configuration enregistrée.');
    } catch (saveError) {
      const msg = saveError instanceof Error ? saveError.message : 'Erreur de sauvegarde.';
      setError(msg);
      adminNotify.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent/70">Communication</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Pop-up événement</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
              Activez un mode communication temporaire pour promouvoir une édition et capter les emails avant l’ouverture officielle.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              disabled={!previewData}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prévisualiser
            </button>
            <button
              type="button"
              onClick={saveSettings}
              disabled={saving}
              className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Publier'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="rounded-2xl border border-white/8 bg-black/10 p-4 text-sm text-white">
              <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.26em] text-white/40">Mode communication</span>
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, isCommunicationModeActive: !current.isCommunicationModeActive }))}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${form.isCommunicationModeActive ? 'bg-emerald-500/80' : 'bg-white/10'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${form.isCommunicationModeActive ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
              <span className="ml-3 text-sm text-white/70">{form.isCommunicationModeActive ? 'Activé' : 'Désactivé'}</span>
            </label>

            <label className="block rounded-2xl border border-white/8 bg-black/10 p-4 text-sm text-white">
              <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.26em] text-white/40">Délai</span>
              <input
                type="number"
                min={0}
                max={30}
                value={form.popupDelaySeconds}
                onChange={(event) => setForm((current) => ({ ...current, popupDelaySeconds: Number(event.target.value) || 0 }))}
                className={fieldCls()}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.26em] text-white/40">Événement lié</span>
              <select
                value={form.eventId ?? ''}
                onChange={(event) => setForm((current) => ({ ...current, eventId: event.target.value || null }))}
                className={fieldCls()}
              >
                <option value="">Sélectionner une édition</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.year} · {event.title} · {event.status}
                  </option>
                ))}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.26em] text-white/40">Titre</span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className={fieldCls()}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.26em] text-white/40">Description</span>
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className={fieldCls()}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.26em] text-white/40">Texte du bouton</span>
              <input
                type="text"
                value={form.buttonText}
                onChange={(event) => setForm((current) => ({ ...current, buttonText: event.target.value }))}
                className={fieldCls()}
              />
            </label>
          </div>

          {message ? <p className="mt-4 text-sm text-emerald-400">{message}</p> : null}
          {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
        </section>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/40">Flyer utilisé</p>
            {selectedEvent?.imageUrl ? (
              <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="mt-4 aspect-[4/5] w-full rounded-[1.5rem] object-cover" />
            ) : (
              <div className="mt-4 rounded-[1.5rem] border border-dashed border-white/10 bg-black/10 px-5 py-10 text-sm text-white/45">
                L'image principale sera récupérée automatiquement depuis la fiche événement.
              </div>
            )}
          </section>

          <section className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-6 text-sm text-white/65">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/40">Règles</p>
            <ul className="mt-4 space-y-3 leading-relaxed">
              <li>Le pop-up ne s'affiche jamais si le mode communication est désactivé.</li>
              <li>La fermeture visiteur est mémorisée par session pour éviter la répétition.</li>
              <li>Les emails sont associés à l'événement choisi et dédupliqués par événement.</li>
            </ul>
          </section>
        </aside>
      </div>

      {previewData ? (
        <EventCommunicationPopup
          locale="fr"
          data={previewData}
          open={previewOpen}
          previewMode
          display="modal"
          onClose={() => setPreviewOpen(false)}
        />
      ) : null}
    </div>
  );
}