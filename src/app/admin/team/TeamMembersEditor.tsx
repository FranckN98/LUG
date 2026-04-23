'use client';

import React, { useState } from 'react';
import { CORE_TEAM_MEMBERS } from '@/content/core-team';
import { MediaPicker } from '@/app/admin/components/MediaPicker';

type DbMember = {
  id: string;
  name: string;
  roleDe: string;
  roleEn: string;
  roleFr: string;
  bioDe: string;
  bioEn: string;
  bioFr: string;
  linkedin: string;
  imageUrl: string;
};

type Props = {
  initialData: DbMember[];
};

type LangTab = 'fr' | 'de' | 'en';

const LANG_LABELS: Record<LangTab, string> = { fr: 'Français', de: 'Deutsch', en: 'English' };

function createDraftMember(index: number): DbMember {
  return {
    id: `draft-${Date.now()}-${index}`,
    name: '',
    roleDe: '',
    roleEn: '',
    roleFr: '',
    bioDe: '',
    bioEn: '',
    bioFr: '',
    linkedin: '',
    imageUrl: '',
  };
}

const roleByName = Object.fromEntries(CORE_TEAM_MEMBERS.map((m) => [m.name, m.role.fr]));

export function TeamMembersEditor({ initialData }: Props) {
  const [members, setMembers] = useState<DbMember[]>(() => initialData);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<LangTab>('fr');

  function addMember() {
    setMembers((prev) => [createDraftMember(prev.length), ...prev]);
  }

  function update(id: string, field: keyof DbMember, value: string) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  }

  async function save(member: DbMember) {
    if (!member.name.trim()) {
      setError(member.id);
      return;
    }

    setSaving(member.id);
    setError(null);

    try {
      const isDraft = member.id.startsWith('draft-');
      const endpoint = isDraft ? '/api/admin/team' : `/api/admin/team?id=${member.id}`;
      const method = isDraft ? 'POST' : 'PATCH';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: member.name.trim(),
          roleDe: member.roleDe,
          roleEn: member.roleEn,
          roleFr: member.roleFr,
          bioDe: member.bioDe,
          bioEn: member.bioEn,
          bioFr: member.bioFr,
          linkedin: member.linkedin,
          imageUrl: member.imageUrl,
        }),
      });

      if (!res.ok) throw new Error('Erreur serveur');

      const savedMember = (await res.json()) as DbMember;
      setMembers((prev) => prev.map((m) => (m.id === member.id ? savedMember : m)));
      setSaved(savedMember.id);
      setTimeout(() => setSaved(null), 2500);
    } catch {
      setError(member.id);
    } finally {
      setSaving(null);
    }
  }

  async function removeMember(member: DbMember) {
    if (member.id.startsWith('draft-')) {
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      return;
    }

    if (!confirm(`Supprimer ${member.name} ?`)) return;

    setDeleting(member.id);
    try {
      const res = await fetch(`/api/admin/team?id=${member.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur serveur');
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="max-w-5xl px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70 mb-1">
          Who We Are
        </p>
        <h1 className="text-2xl font-bold text-white">Gestion de l&apos;équipe</h1>
        <p className="mt-2 text-sm text-white/40">
          Modifiez, ajoutez ou supprimez des membres de l&apos;équipe.
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-xs text-white/35">
          {members.length} membre{members.length > 1 ? 's' : ''}
        </div>
        <button
          type="button"
          onClick={addMember}
          className="inline-flex items-center gap-1.5 rounded-xl border border-accent/25 bg-accent/15 px-3 py-2 text-xs font-semibold text-accent transition hover:bg-accent/25"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un membre
        </button>
      </div>

      {/* Lang tabs */}
      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
        {(Object.keys(LANG_LABELS) as LangTab[]).map((lang) => (
          <button
            key={lang}
            onClick={() => setActiveLang(lang)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeLang === lang
                ? 'bg-primary text-white shadow'
                : 'text-white/40 hover:text-white'
            }`}
          >
            {LANG_LABELS[lang]}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {members.map((data) => {
          const roleField = `role${activeLang.charAt(0).toUpperCase()}${activeLang.slice(1)}` as 'roleDe' | 'roleEn' | 'roleFr';
          const bioField = `bio${activeLang.charAt(0).toUpperCase()}${activeLang.slice(1)}` as 'bioDe' | 'bioEn' | 'bioFr';
          const isSaving = saving === data.id;
          const isSaved = saved === data.id;
          const isError = error === data.id;
          const isDeleting = deleting === data.id;
          const fallbackImage = CORE_TEAM_MEMBERS.find((m) => m.name === data.name)?.image ?? '';
          const currentImage = data.imageUrl || fallbackImage || '/team/core-01.png';

          return (
            <div key={data.id} className="overflow-hidden rounded-2xl border border-white/8 bg-white/3">
              <div className="p-5 space-y-4">

                {/* Header: photo + name + save */}
                <div className="flex items-start gap-4">
                  {/* Current photo preview */}
                  <div className="relative w-14 h-18 shrink-0 rounded-xl overflow-hidden bg-gray-900 border border-white/10">
                    <img
                      src={currentImage}
                      alt={data.name || 'Nouveau membre'}
                      className="w-full h-full object-cover object-top"
                      style={{ aspectRatio: '3/4' }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-white/30">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={data.name}
                        onChange={(e) => update(data.id, 'name', e.target.value)}
                        placeholder="Nom du membre"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/40 transition-all"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-accent/70 mt-0.5">
                          {data[roleField] || roleByName[data.name] || 'Membre de l\'équipe'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => save(data)}
                          disabled={isSaving}
                          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            isSaved
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : isError
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-primary/20 text-white border border-primary/30 hover:bg-primary hover:border-primary'
                          } disabled:opacity-50`}
                        >
                          {isSaving ? (
                            <>
                              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Sauvegarde…
                            </>
                          ) : isSaved ? (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Sauvegardé
                            </>
                          ) : isError ? (
                            'Erreur'
                          ) : (
                            'Sauvegarder'
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeMember(data)}
                          disabled={isDeleting}
                          className="shrink-0 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                        >
                          {isDeleting ? 'Suppression…' : 'Supprimer'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photo picker */}
                <MediaPicker
                  label="Photo de profil"
                  value={data.imageUrl}
                  onChange={(url) => update(data.id, 'imageUrl', url)}
                  defaultCategory="team"
                />

                {/* Role input */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">
                    Rôle ({LANG_LABELS[activeLang]})
                  </label>
                  <input
                    type="text"
                    value={data[roleField]}
                    onChange={(e) => update(data.id, roleField, e.target.value)}
                    placeholder={`Rôle en ${LANG_LABELS[activeLang]}…`}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/40 transition-all"
                  />
                </div>

                {/* Bio textarea */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">
                    Biographie ({LANG_LABELS[activeLang]})
                  </label>
                  <textarea
                    value={data[bioField]}
                    onChange={(e) => update(data.id, bioField, e.target.value)}
                    rows={3}
                    placeholder={`Biographie en ${LANG_LABELS[activeLang]}…`}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/40 transition-all"
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">
                    Lien LinkedIn
                  </label>
                  <input
                    type="url"
                    value={data.linkedin}
                    onChange={(e) => update(data.id, 'linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/…"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/40 transition-all"
                  />
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
