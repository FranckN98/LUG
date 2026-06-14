'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminNotify } from '@/app/admin/components/AdminToaster';

type BoothReservation = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  brandName: string;
  boothPurpose: string;
  brandDescription: string;
  visitorTakeaway: string;
  exhibitionMaterials: string | null;
  equipmentNeeds: string | null;
  peopleCount: string;
  peopleNames: string | null;
  websiteOrSocial: string | null;
  additionalComment: string | null;
  locale: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  new: { label: 'Nouveau', cls: 'bg-blue-500/15 text-blue-300 border-blue-400/40' },
  in_review: { label: 'En cours d’étude', cls: 'bg-amber-500/15 text-amber-300 border-amber-400/40' },
  contacted: { label: 'Contacté', cls: 'bg-purple-500/15 text-purple-300 border-purple-400/40' },
  accepted: { label: 'Accepté', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40' },
  rejected: { label: 'Refusé', cls: 'bg-rose-500/15 text-rose-300 border-rose-400/40' },
};

const STATUS_ORDER: Array<keyof typeof STATUS_LABELS | 'all'> = [
  'all',
  'new',
  'in_review',
  'contacted',
  'accepted',
  'rejected',
];

const PURPOSE_LABELS: Record<string, string> = {
  showcase_brand: 'Présenter une marque',
  sell_product: 'Vendre un produit',
  present_service: 'Présenter un service',
  run_demo: 'Faire une démonstration',
  build_connections: 'Créer des contacts pro',
  recruit_partners: 'Recruter / partenaires',
  other: 'Autre',
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function BoothReservationsAdmin() {
  const [items, setItems] = useState<BoothReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(() => items.find((i) => i.id === selectedId) || null, [items, selectedId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      const res = await fetch(`/api/admin/booth-reservations?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed');
      const data = (await res.json()) as BoothReservation[];
      setItems(data);
    } catch {
      adminNotify.error('Impossible de charger les réservations.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/booth-reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed');
      adminNotify.success('Statut mis à jour.');
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    } catch {
      adminNotify.error('Mise à jour impossible.');
    }
  }

  async function deleteOne(id: string) {
    if (!confirm('Supprimer définitivement cette demande ?')) return;
    try {
      const res = await fetch(`/api/admin/booth-reservations/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      adminNotify.success('Demande supprimée.');
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch {
      adminNotify.error('Suppression impossible.');
    }
  }

  function contactMailto(r: BoothReservation) {
    const subject = 'Votre demande de stand — Level Up in Germany';
    const body =
      `Bonjour ${r.fullName},\n\n` +
      `Merci pour votre demande de réservation de stand pour Level Up in Germany.\n\n` +
      `Nous avons bien reçu les informations concernant votre marque/projet : ${r.brandName}.\n\n` +
      `Nous revenons vers vous concernant la disponibilité du stand et les prochaines étapes.\n\n` +
      `Cordialement,\nL'équipe Level Up in Germany`;
    const href = `mailto:${encodeURIComponent(r.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  }

  function copyPhone(phone: string) {
    navigator.clipboard
      .writeText(phone)
      .then(() => adminNotify.success('Numéro copié.'))
      .catch(() => adminNotify.error('Copie impossible.'));
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    for (const key of Object.keys(STATUS_LABELS)) c[key] = 0;
    for (const i of items) {
      if (c[i.status] != null) c[i.status]++;
    }
    return c;
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Réservations de stands</h1>
          <p className="text-sm text-white/60">Demandes envoyées via la page publique de réservation.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/admin/booth-reservations/export"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200 transition hover:border-emerald-300/60 hover:bg-emerald-500/20"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
            Export CSV
          </a>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.08]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-3-6.7L21 8M21 3v5h-5" /></svg>
            Rafraîchir
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_ORDER.map((key) => {
            const active = statusFilter === key;
            const label = key === 'all' ? 'Tous' : STATUS_LABELS[key].label;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  active
                    ? 'border-accent/60 bg-accent/15 text-accent'
                    : 'border-white/15 bg-white/[0.04] text-white/70 hover:border-white/30 hover:bg-white/[0.08]'
                }`}
              >
                {label}{' '}
                <span className="ml-1 rounded-full bg-black/30 px-1.5 text-[10px] text-white/60">
                  {counts[key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
        <div className="ml-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (nom, email, marque, téléphone)…"
            className="w-72 rounded-full border border-white/15 bg-[#0f0606]/80 px-4 py-2 text-xs text-white placeholder:text-white/35 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/[0.04] text-left text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/55">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Marque</th>
                <th className="px-4 py-3">But</th>
                <th className="px-4 py-3">Pers.</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-white/55">
                    Chargement…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-white/55">
                    Aucune demande.
                  </td>
                </tr>
              ) : (
                items.map((r) => {
                  const st = STATUS_LABELS[r.status] || STATUS_LABELS.new;
                  return (
                    <tr
                      key={r.id}
                      className={`transition hover:bg-white/[0.04] ${selectedId === r.id ? 'bg-white/[0.05]' : ''}`}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-white/65">{formatDate(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-white">{r.fullName}</td>
                      <td className="px-4 py-3 text-white/80">
                        <a href={`mailto:${r.email}`} className="hover:text-accent">{r.email}</a>
                      </td>
                      <td className="px-4 py-3 text-white/80">
                        <a href={`tel:${r.phone}`} className="hover:text-accent">{r.phone}</a>
                        <button
                          onClick={() => copyPhone(r.phone)}
                          className="ml-2 text-[10px] uppercase tracking-wider text-white/40 hover:text-white"
                          title="Copier"
                        >
                          copier
                        </button>
                      </td>
                      <td className="px-4 py-3 text-white/85">{r.brandName}</td>
                      <td className="px-4 py-3 text-xs text-white/70">{PURPOSE_LABELS[r.boothPurpose] || r.boothPurpose}</td>
                      <td className="px-4 py-3 text-white/75">{r.peopleCount}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedId(r.id === selectedId ? null : r.id)}
                            className="rounded-md border border-white/15 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/75 hover:border-white/30 hover:bg-white/[0.08]"
                          >
                            {selectedId === r.id ? 'Fermer' : 'Détails'}
                          </button>
                          <button
                            onClick={() => contactMailto(r)}
                            className="rounded-md border border-accent/40 bg-accent/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent hover:bg-accent/25"
                          >
                            Contacter
                          </button>
                          <select
                            value={r.status}
                            onChange={(e) => updateStatus(r.id, e.target.value)}
                            className="rounded-md border border-white/15 bg-[#0f0606]/80 px-2 py-1 text-[10px] font-semibold text-white/85 focus:border-accent/60 focus:outline-none"
                          >
                            {Object.entries(STATUS_LABELS).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => deleteOne(r.id)}
                            className="rounded-md border border-rose-400/40 bg-rose-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-rose-200 hover:bg-rose-500/20"
                            title="Supprimer"
                          >
                            Suppr.
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <DetailPanel item={selected} onClose={() => setSelectedId(null)} onContact={contactMailto} />
      )}
    </div>
  );
}

function DetailPanel({
  item,
  onClose,
  onContact,
}: {
  item: BoothReservation;
  onClose: () => void;
  onContact: (r: BoothReservation) => void;
}) {
  const equipment = (item.equipmentNeeds || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">{item.brandName}</h2>
          <p className="text-xs text-white/60">
            Demande de <span className="text-white/85">{item.fullName}</span> — {formatDate(item.createdAt)}
            {item.locale ? ` · langue ${item.locale.toUpperCase()}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onContact(item)}
            className="rounded-full border border-accent/40 bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/25"
          >
            Contacter par email
          </button>
          <button
            onClick={onClose}
            className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/75 hover:border-white/30 hover:bg-white/[0.08]"
          >
            Fermer
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <DetailRow label="Email" value={<a href={`mailto:${item.email}`} className="text-accent hover:underline">{item.email}</a>} />
        <DetailRow label="Téléphone" value={<a href={`tel:${item.phone}`} className="text-accent hover:underline">{item.phone}</a>} />
        <DetailRow label="But du stand" value={PURPOSE_LABELS[item.boothPurpose] || item.boothPurpose} />
        <DetailRow label="Personnes présentes" value={item.peopleCount} />
        <DetailRow
          label="Lien web / réseau"
          value={
            item.websiteOrSocial ? (
              <a href={item.websiteOrSocial} target="_blank" rel="noreferrer noopener" className="text-accent hover:underline">
                {item.websiteOrSocial}
              </a>
            ) : (
              <span className="text-white/40">—</span>
            )
          }
        />
        <DetailRow
          label="Équipement demandé"
          value={
            equipment.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {equipment.map((e) => (
                  <span key={e} className="rounded-full border border-white/15 bg-white/[0.05] px-2 py-0.5 text-[0.65rem] text-white/80">{e}</span>
                ))}
              </div>
            ) : (
              <span className="text-white/40">—</span>
            )
          }
        />
      </div>

      <div className="mt-6 space-y-5">
        <LongText label="Description de la marque / produit / service" value={item.brandDescription} />
        <LongText label="Ce que les visiteurs en retiendront" value={item.visitorTakeaway} />
        {item.exhibitionMaterials && <LongText label="Produits / supports exposés" value={item.exhibitionMaterials} />}
        {item.peopleNames && <LongText label="Noms des personnes au stand" value={item.peopleNames} />}
        {item.additionalComment && <LongText label="Remarque" value={item.additionalComment} />}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[0.6rem] font-bold uppercase tracking-[0.25em] text-white/45">{label}</div>
      <div className="mt-1 text-sm text-white/90">{value}</div>
    </div>
  );
}

function LongText({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[0.6rem] font-bold uppercase tracking-[0.25em] text-white/45">{label}</div>
      <p className="mt-1 whitespace-pre-line rounded-xl border border-white/10 bg-[#0f0606]/60 p-3 text-sm leading-relaxed text-white/85">
        {value}
      </p>
    </div>
  );
}
