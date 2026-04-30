'use client';

import { useEffect, useState, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  birthDate: string;
  address: string;
  activityDomain: string;
  motivation: string | null;
  helpDomains: string;
  applicationStatus: 'pending' | 'accepted' | 'rejected';
  rejectionReason: string | null;
  membershipFeePaid: boolean;
  lastPaymentDate: string | null;
  welcomeShortSentAt: string | null;
  welcomeFullSentAt: string | null;
  infoPackSentAt: string | null;
  lastCustomEmailAt: string | null;
  createdAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function fullName(m: Member) {
  return `${m.firstName} ${m.lastName}`;
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function fmtDateTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Pre-filled brief about Level Up in Germany — admin can insert it into a custom email
// then edit/expand around it.
const LUG_BRIEF_TEMPLATE = `Petit rappel sur Level Up in Germany e.V. : nous sommes une association francophone basée en Allemagne qui accompagne la diaspora dans sa montée en compétences, son intégration et son entrepreneuriat.

Concrètement, en tant que membre tu profites de la Mega Conference annuelle, des workshops et programmes de mentorat, de la communauté WhatsApp privée des Ambassadeurs, de la newsletter mensuelle et de réductions chez nos partenaires (à venir).

La cotisation annuelle est de 30 € et nous permet de faire vivre l'association : louer les salles, produire les contenus et soutenir nos ambassadeurs dans leurs villes. Pour régler, il suffit d'écrire à info@levelupingermany.com — on te transmet les coordonnées bancaires et le reçu officiel.

Plus d'infos : https://www.levelupingermany.com — communauté WhatsApp : https://chat.whatsapp.com/Ip3P51uCMGu0TblrkVBSst`;

function isPaymentExpired(m: Member): boolean {
  if (!m.membershipFeePaid || !m.lastPaymentDate) return false;
  const diff = Date.now() - new Date(m.lastPaymentDate).getTime();
  return diff > 365 * 24 * 60 * 60 * 1000;
}

function nextPaymentDate(lastPayment: string): string {
  const d = new Date(lastPayment);
  d.setFullYear(d.getFullYear() + 1);
  return fmtDate(d.toISOString());
}

// ── Badge ──────────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: 'En attente', cls: 'bg-amber-500/15 text-amber-400' },
    accepted: { label: 'Accepté', cls: 'bg-emerald-500/15 text-emerald-400' },
    rejected: { label: 'Refusé', cls: 'bg-red-500/15 text-red-400' },
  };
  const s = map[status] ?? { label: status, cls: 'bg-white/8 text-white/40' };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

function PaymentBadge({ paid, expired }: { paid: boolean; expired: boolean }) {
  if (!paid || expired) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-red-400">
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {expired ? 'Expiré' : 'Non payé'}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      Payé
    </span>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({
  msg,
  kind,
  onClose,
}: {
  msg: string;
  kind: 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-2xl ${
        kind === 'success' ? 'bg-emerald-600' : 'bg-red-700'
      }`}
    >
      {msg}
      <button onClick={onClose} className="ml-4 opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

// ── Field row (detail panel) ───────────────────────────────────────────────────
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">{label}</p>
      <p className="text-sm text-white/80">{value || '—'}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function MembersAdmin() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<Member | null>(null);

  // Reject flow
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // Payment toggle loading
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  // Reminder loading
  const [reminderLoading, setReminderLoading] = useState<string | null>(null);

  // Email actions
  const [emailActionLoading, setEmailActionLoading] = useState<string | null>(null);
  const [customEmailOpen, setCustomEmailOpen] = useState(false);
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' } | null>(null);
  const showToast = useCallback((msg: string, kind: 'success' | 'error' = 'success') => {
    setToast({ msg, kind });
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/members');
      if (res.ok) setMembers(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Refresh detail panel if members updated
  useEffect(() => {
    if (detail) {
      const fresh = members.find((m) => m.id === detail.id);
      if (fresh) setDetail(fresh);
    }
  }, [members]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    pending: members.filter((m) => m.applicationStatus === 'pending').length,
    accepted: members.filter((m) => m.applicationStatus === 'accepted').length,
    rejected: members.filter((m) => m.applicationStatus === 'rejected').length,
    unpaid: members.filter(
      (m) => m.applicationStatus === 'accepted' && (!m.membershipFeePaid || isPaymentExpired(m)),
    ).length,
  };

  // ── Filtered ───────────────────────────────────────────────────────────────
  const filtered = members.filter((m) => {
    if (m.applicationStatus !== tab) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.email.toLowerCase().includes(q) ||
      fullName(m).toLowerCase().includes(q) ||
      m.activityDomain.toLowerCase().includes(q)
    );
  });

  // ── Actions ────────────────────────────────────────────────────────────────
  async function handleAccept(id: string) {
    const res = await fetch(`/api/admin/members/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'accept' }),
    });
    if (res.ok) {
      showToast('Demande acceptée · email de bienvenue envoyé');
      await fetchAll();
      if (detail?.id === id) setDetail(null);
    } else {
      showToast("Erreur lors de l'acceptation", 'error');
    }
  }

  async function handleRejectConfirm() {
    if (!rejectingId) return;
    setRejectLoading(true);
    try {
      const res = await fetch(`/api/admin/members/${rejectingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', rejectionReason: rejectReason }),
      });
      if (res.ok) {
        showToast('Demande refusée · email envoyé');
        setRejectingId(null);
        setRejectReason('');
        await fetchAll();
        if (detail?.id === rejectingId) setDetail(null);
      } else {
        showToast('Erreur lors du refus', 'error');
      }
    } finally {
      setRejectLoading(false);
    }
  }

  async function handleTogglePayment(member: Member) {
    setPaymentLoading(member.id);
    const newPaid = !member.membershipFeePaid;
    const res = await fetch(`/api/admin/members/${member.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ membershipFeePaid: newPaid }),
    });
    setPaymentLoading(null);
    if (res.ok) {
      showToast(newPaid ? 'Frais marqués comme payés' : 'Frais marqués comme non payés');
      await fetchAll();
    } else {
      showToast('Erreur mise à jour paiement', 'error');
    }
  }

  async function handleReminder(member: Member) {
    setReminderLoading(member.id);
    const res = await fetch(`/api/admin/members/${member.id}/remind`, { method: 'POST' });
    setReminderLoading(null);
    if (res.ok) {
      showToast(`Rappel de paiement envoyé à ${member.email}`);
    } else {
      showToast("Erreur lors de l'envoi du rappel", 'error');
    }
  }

  async function handleSendWelcome(member: Member) {
    setEmailActionLoading('welcome-' + member.id);
    const res = await fetch(`/api/admin/members/${member.id}/welcome`, { method: 'POST' });
    setEmailActionLoading(null);
    if (res.ok) {
      showToast(`Email de bienvenue envoyé à ${member.email}`);
      await fetchAll();
    } else {
      showToast("Erreur lors de l'envoi de l'email", 'error');
    }
  }

  async function handleSendPreset(member: Member, preset: 'welcome-full' | 'info-pack') {
    setEmailActionLoading(`${preset}-${member.id}`);
    const res = await fetch(`/api/admin/members/${member.id}/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preset }),
    });
    setEmailActionLoading(null);
    if (res.ok) {
      showToast(`Email envoyé à ${member.email}`);
      await fetchAll();
    } else {
      showToast("Erreur lors de l'envoi de l'email", 'error');
    }
  }

  async function handleSendCustomEmail(member: Member) {
    if (!customSubject.trim() || !customMessage.trim()) {
      showToast('Sujet et message requis', 'error');
      return;
    }
    setEmailActionLoading('custom-' + member.id);
    const res = await fetch(`/api/admin/members/${member.id}/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: customSubject, message: customMessage }),
    });
    setEmailActionLoading(null);
    if (res.ok) {
      showToast(`Email envoyé à ${member.email}`);
      setCustomEmailOpen(false);
      setCustomSubject('');
      setCustomMessage('');
      await fetchAll();
    } else {
      showToast("Erreur lors de l'envoi de l'email", 'error');
    }
  }

  // ── Render: Detail view ────────────────────────────────────────────────────
  if (detail) {
    const expired = isPaymentExpired(detail);
    const needsReminder =
      detail.applicationStatus === 'accepted' && (!detail.membershipFeePaid || expired);

    return (
      <div className="min-h-screen px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/30">
              Fiche membre
            </p>
            <h2 className="text-xl font-bold text-white mt-0.5">{fullName(detail)}</h2>
          </div>
          <button
            onClick={() => setDetail(null)}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            ← Retour à la liste
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Main info */}
          <div className="xl:col-span-2 space-y-5">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent/60">
                Informations personnelles
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Prénom" value={detail.firstName} />
                <Field label="Nom" value={detail.lastName} />
                <Field label="Date de naissance" value={fmtDate(detail.birthDate)} />
                <Field label="Email" value={detail.email} />
                <Field label="Téléphone" value={detail.phone} />
                <Field label="Adresse" value={detail.address} />
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent/60">
                Adhésion
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Domaine d'activité" value={detail.activityDomain} />
                <Field label="Date de demande" value={fmtDate(detail.createdAt)} />
                <div className="sm:col-span-2">
                  <Field
                    label="Domaines d'aide souhaités"
                    value={detail.helpDomains}
                  />
                </div>
                {detail.motivation && (
                  <div className="sm:col-span-2">
                    <Field label="Motivation" value={detail.motivation} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: status + actions */}
          <div className="space-y-4">
            {/* Status card */}
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent/60">
                Statut
              </p>
              <div className="flex items-center gap-2">
                <StatusBadge status={detail.applicationStatus} />
              </div>
              {detail.applicationStatus === 'rejected' && detail.rejectionReason && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-red-400/70 mb-1">
                    Raison du refus
                  </p>
                  <p className="text-sm text-red-300/80">{detail.rejectionReason}</p>
                </div>
              )}

              {detail.applicationStatus === 'pending' && (
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handleAccept(detail.id)}
                    className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 transition-colors"
                  >
                    ✓ Accepter la demande
                  </button>
                  {rejectingId !== detail.id ? (
                    <button
                      onClick={() => { setRejectingId(detail.id); setRejectReason(''); }}
                      className="w-full rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      ✕ Refuser la demande
                    </button>
                  ) : (
                    <div className="space-y-2 rounded-xl border border-red-500/20 bg-red-500/8 p-3">
                      <p className="text-[11px] text-red-400/80 font-semibold">
                        Raison du refus (optionnel)
                      </p>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                        placeholder="Indiquez une raison…"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-red-500/40 focus:outline-none resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleRejectConfirm}
                          disabled={rejectLoading}
                          className="flex-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
                        >
                          {rejectLoading ? 'Envoi…' : 'Confirmer le refus'}
                        </button>
                        <button
                          onClick={() => setRejectingId(null)}
                          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:text-white transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment card (accepted members only) */}
            {detail.applicationStatus === 'accepted' && (
              <div className={`rounded-2xl border p-5 space-y-3 ${needsReminder ? 'border-red-500/30 bg-red-500/8' : 'border-white/8 bg-white/3'}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent/60">
                  Frais de membre
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Statut</span>
                    <PaymentBadge paid={detail.membershipFeePaid} expired={expired} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Dernier paiement</span>
                    <span className="text-sm text-white/80">{fmtDate(detail.lastPaymentDate)}</span>
                  </div>
                  {detail.membershipFeePaid && detail.lastPaymentDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Prochain paiement</span>
                      <span className={`text-sm font-semibold ${expired ? 'text-red-400' : 'text-white/80'}`}>
                        {nextPaymentDate(detail.lastPaymentDate)}
                      </span>
                    </div>
                  )}
                </div>

                {needsReminder && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5">
                    <p className="text-[11px] font-bold text-red-400">⚠ Frais de membre non payés</p>
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handleTogglePayment(detail)}
                    disabled={paymentLoading === detail.id}
                    className="w-full rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5 disabled:opacity-50 transition-colors"
                  >
                    {paymentLoading === detail.id
                      ? 'Mise à jour…'
                      : detail.membershipFeePaid && !expired
                        ? 'Marquer comme non payé'
                        : 'Marquer comme payé'}
                  </button>
                  {needsReminder && (
                    <button
                      onClick={() => handleReminder(detail)}
                      disabled={reminderLoading === detail.id}
                      className="w-full rounded-xl bg-amber-600/90 px-4 py-2 text-sm font-bold text-white hover:bg-amber-500 disabled:opacity-50 transition-colors"
                    >
                      {reminderLoading === detail.id ? 'Envoi…' : '📧 Envoyer un rappel de paiement'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Email actions card */}
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent/60">
                Emails
              </p>
              <p className="text-xs text-white/50 leading-relaxed">
                Envoie un email manuellement à <strong className="text-white/80">{detail.email}</strong>.
              </p>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => handleSendPreset(detail, 'welcome-full')}
                  disabled={emailActionLoading === `welcome-full-${detail.id}`}
                  className="w-full rounded-xl bg-emerald-600/90 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
                >
                  {emailActionLoading === `welcome-full-${detail.id}`
                    ? 'Envoi…'
                    : detail.welcomeFullSentAt
                    ? '🎉 Renvoyer l\u2019email de bienvenue complet'
                    : '🎉 Envoyer un email de bienvenue complet'}
                </button>
                {detail.welcomeFullSentAt ? (
                  <p className="text-[11px] text-emerald-400/80 leading-snug">
                    ✓ Déjà envoyé le {fmtDateTime(detail.welcomeFullSentAt)}
                  </p>
                ) : (
                  <p className="text-[11px] text-white/40 leading-snug">
                    Mail rédigé : présentation, missions, prochains pas, contacts &amp; communauté.
                  </p>
                )}

                <button
                  onClick={() => handleSendPreset(detail, 'info-pack')}
                  disabled={emailActionLoading === `info-pack-${detail.id}`}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/10 disabled:opacity-50 transition-colors"
                >
                  {emailActionLoading === `info-pack-${detail.id}`
                    ? 'Envoi…'
                    : detail.infoPackSentAt
                    ? '📋 Renvoyer le kit d\u2019informations'
                    : '📋 Envoyer le kit d\u2019informations'}
                </button>
                {detail.infoPackSentAt ? (
                  <p className="text-[11px] text-emerald-400/80 leading-snug">
                    ✓ Déjà envoyé le {fmtDateTime(detail.infoPackSentAt)}
                  </p>
                ) : (
                  <p className="text-[11px] text-white/40 leading-snug">
                    Tous les contacts, événements et liens pour bien démarrer.
                  </p>
                )}

                <button
                  onClick={() => handleSendWelcome(detail)}
                  disabled={emailActionLoading === `welcome-${detail.id}`}
                  className="w-full rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-white/60 hover:bg-white/5 disabled:opacity-50 transition-colors"
                >
                  {emailActionLoading === `welcome-${detail.id}`
                    ? 'Envoi…'
                    : '↺ Renvoyer l\u2019email de bienvenue court'}
                </button>
                {detail.welcomeShortSentAt && (
                  <p className="text-[11px] text-white/40 leading-snug">
                    Dernier envoi : {fmtDateTime(detail.welcomeShortSentAt)}
                  </p>
                )}

                <button
                  onClick={() => {
                    setCustomSubject('');
                    setCustomMessage('');
                    setCustomEmailOpen(true);
                  }}
                  className="w-full rounded-xl bg-primary/80 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary transition-colors"
                >
                  ✍️ Écrire un email personnalisé
                </button>
                {detail.lastCustomEmailAt && (
                  <p className="text-[11px] text-white/40 leading-snug">
                    Dernier email perso : {fmtDateTime(detail.lastCustomEmailAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Custom email modal */}
        {customEmailOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
            <div className="w-full sm:max-w-lg bg-[#1a0c0c] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent/70">
                    Email personnalisé
                  </p>
                  <p className="text-sm font-semibold text-white mt-0.5 truncate">
                    À : {detail.email}
                  </p>
                </div>
                <button
                  onClick={() => setCustomEmailOpen(false)}
                  className="h-9 w-9 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  aria-label="Fermer"
                >
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-5 py-4 space-y-4 overflow-y-auto">
                {/* Email history hint */}
                {(detail.welcomeFullSentAt || detail.infoPackSentAt || detail.welcomeShortSentAt || detail.lastCustomEmailAt) && (
                  <div className="rounded-xl border border-white/8 bg-white/3 px-3 py-2.5 text-[11px] text-white/55 leading-relaxed">
                    <p className="font-bold uppercase tracking-wider text-white/40 mb-1">Historique emails</p>
                    {detail.welcomeFullSentAt && <p>• Bienvenue complet · {fmtDateTime(detail.welcomeFullSentAt)}</p>}
                    {detail.infoPackSentAt && <p>• Kit d'infos · {fmtDateTime(detail.infoPackSentAt)}</p>}
                    {detail.welcomeShortSentAt && <p>• Bienvenue court · {fmtDateTime(detail.welcomeShortSentAt)}</p>}
                    {detail.lastCustomEmailAt && <p>• Dernier email perso · {fmtDateTime(detail.lastCustomEmailAt)}</p>}
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5 block">
                    Sujet
                  </label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Ex : Invitation au prochain workshop"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-accent/40 focus:outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                      Message
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomMessage((prev) => {
                          const trimmed = prev.trim();
                          return trimmed
                            ? `${trimmed}\n\n${LUG_BRIEF_TEMPLATE}`
                            : LUG_BRIEF_TEMPLATE;
                        });
                      }}
                      className="text-[11px] font-semibold text-accent/80 hover:text-accent rounded-lg px-2 py-1 hover:bg-white/5 transition-colors"
                    >
                      📎 Insérer un brief sur LUG
                    </button>
                  </div>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={10}
                    placeholder="Écris ton message ici. Une ligne vide entre 2 paragraphes pour les séparer.&#10;&#10;Astuce : clique sur « Insérer un brief sur LUG » pour ajouter automatiquement un rappel sur l'association, la cotisation et les bénéfices membres — tu peux ensuite l'éditer."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-accent/40 focus:outline-none leading-relaxed resize-y"
                  />
                  <p className="mt-1.5 text-[11px] text-white/40">
                    Le message sera automatiquement entouré du logo, d'une salutation à <strong className="text-white/60">{detail.firstName}</strong> et du pied de page (liens site, réseaux, WhatsApp).
                  </p>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-white/8 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <button
                  onClick={() => setCustomEmailOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/60 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleSendCustomEmail(detail)}
                  disabled={emailActionLoading === `custom-${detail.id}` || !customSubject.trim() || !customMessage.trim()}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-light disabled:opacity-50 transition-colors"
                >
                  {emailActionLoading === `custom-${detail.id}` ? 'Envoi…' : '📨 Envoyer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <Toast msg={toast.msg} kind={toast.kind} onClose={() => setToast(null)} />
        )}
      </div>
    );
  }

  // ── Render: List view ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <p className="mb-1 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-accent/70">
          Administration
        </p>
        <h1 className="text-2xl font-bold text-white">Membres</h1>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
          <p className="text-3xl font-bold text-white">{stats.pending}</p>
          <p className="mt-1 text-sm font-semibold text-white/70">Demandes en attente</p>
          {stats.pending > 0 && (
            <p className="mt-0.5 text-xs font-semibold text-amber-400">Action requise</p>
          )}
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <p className="text-3xl font-bold text-white">{stats.accepted}</p>
          <p className="mt-1 text-sm font-semibold text-white/70">Membres actifs</p>
          <p className="mt-0.5 text-xs text-white/35">adhésions acceptées</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
          <p className="text-3xl font-bold text-white">{stats.rejected}</p>
          <p className="mt-1 text-sm font-semibold text-white/70">Demandes refusées</p>
          <p className="mt-0.5 text-xs text-white/35">archivées</p>
        </div>
        <div className={`rounded-2xl border p-5 ${stats.unpaid > 0 ? 'border-red-500/30 bg-red-500/10' : 'border-white/8 bg-white/4'}`}>
          <p className="text-3xl font-bold text-white">{stats.unpaid}</p>
          <p className="mt-1 text-sm font-semibold text-white/70">Frais non payés</p>
          {stats.unpaid > 0 && (
            <p className="mt-0.5 text-xs font-semibold text-red-400">Rappels à envoyer</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-white/8 bg-white/3 p-1 w-fit">
        {([
          { key: 'pending', label: `Demandes (${stats.pending})` },
          { key: 'accepted', label: `Membres actifs (${stats.accepted})` },
          { key: 'rejected', label: `Refusés (${stats.rejected})` },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              tab === key
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {label}
            {key === 'pending' && stats.pending > 0 && (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                {stats.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom, email, domaine…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent/40 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="py-12 text-center text-sm text-white/40">Chargement…</p>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-white/40">Aucun résultat.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-left text-[11px] font-bold uppercase tracking-wider text-white/30">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="hidden md:table-cell px-4 py-3">Domaine d&apos;activité</th>
                <th className="hidden sm:table-cell px-4 py-3">Date</th>
                {tab === 'accepted' && (
                  <th className="px-4 py-3">Frais</th>
                )}
                {tab === 'rejected' && (
                  <th className="hidden lg:table-cell px-4 py-3">Raison</th>
                )}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => {
                const expired = isPaymentExpired(m);
                return (
                  <tr
                    key={m.id}
                    className={`border-b border-white/5 hover:bg-white/3 transition-colors ${
                      i % 2 === 0 ? '' : 'bg-white/[0.015]'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-white/80 whitespace-nowrap">
                      {fullName(m)}
                    </td>
                    <td className="px-4 py-3 text-white/60 max-w-[200px] truncate">{m.email}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-white/50 max-w-[160px] truncate">
                      {m.activityDomain}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-white/30 whitespace-nowrap">
                      {fmtDate(m.createdAt)}
                    </td>
                    {tab === 'accepted' && (
                      <td className="px-4 py-3">
                        <PaymentBadge paid={m.membershipFeePaid} expired={expired} />
                      </td>
                    )}
                    {tab === 'rejected' && (
                      <td className="hidden lg:table-cell px-4 py-3 text-white/40 max-w-[180px] truncate">
                        {m.rejectionReason || '—'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {tab === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAccept(m.id)}
                              className="rounded-lg bg-emerald-600/80 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-500 transition-colors"
                            >
                              Accepter
                            </button>
                            <button
                              onClick={() => { setRejectingId(m.id); setRejectReason(''); }}
                              className="rounded-lg border border-red-500/30 px-2.5 py-1 text-[11px] font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              Refuser
                            </button>
                          </>
                        )}
                        {tab === 'accepted' && (!m.membershipFeePaid || expired) && (
                          <button
                            onClick={() => handleReminder(m)}
                            disabled={reminderLoading === m.id}
                            className="rounded-lg border border-amber-500/30 px-2.5 py-1 text-[11px] font-semibold text-amber-400 hover:bg-amber-500/10 disabled:opacity-50 transition-colors"
                          >
                            {reminderLoading === m.id ? '…' : 'Rappel'}
                          </button>
                        )}
                        <button
                          onClick={() => setDetail(m)}
                          className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/50 hover:border-accent/40 hover:text-white/80 transition-colors"
                        >
                          Détails →
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Reject modal (inline, above table) */}
          {rejectingId && !detail && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a0808] p-6 shadow-2xl">
                <p className="mb-4 text-base font-bold text-white">Refuser la demande</p>
                <p className="mb-3 text-sm text-white/50">
                  {fullName(members.find((m) => m.id === rejectingId)!)}
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  placeholder="Raison du refus (optionnel, sera incluse dans l'email)"
                  className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-red-500/40 focus:outline-none resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleRejectConfirm}
                    disabled={rejectLoading}
                    className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
                  >
                    {rejectLoading ? 'Envoi…' : 'Confirmer le refus'}
                  </button>
                  <button
                    onClick={() => { setRejectingId(null); setRejectReason(''); }}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          <p className="px-4 py-2.5 text-[11px] text-white/25">
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {toast && (
        <Toast msg={toast.msg} kind={toast.kind} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
