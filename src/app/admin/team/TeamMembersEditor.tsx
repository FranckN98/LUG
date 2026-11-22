'use client';

import React, { useEffect, useState } from 'react';
import { CORE_TEAM_MEMBERS } from '@/content/core-team';
import { MediaPicker } from '@/app/admin/components/MediaPicker';
import { adminNotify } from '@/app/admin/components/AdminToaster';

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
  categoryIds: string[];
};

type TeamCategory = {
  id: string;
  nameDe: string;
  nameEn: string;
  nameFr: string;
  sortOrder: number;
  _count?: { members: number };
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
    categoryIds: [],
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
  const [categories, setCategories] = useState<TeamCategory[]>([]);
  const [categoryDraft, setCategoryDraft] = useState({ nameDe: '', nameEn: '', nameFr: '' });

  useEffect(() => {
    fetch('/api/admin/team-categories')
      .then((res) => res.ok ? res.json() : [])
      .then((rows: TeamCategory[]) => setCategories(rows))
      .catch(() => setCategories([]));
  }, []);

  function addMember() {
    setMembers((prev) => [createDraftMember(prev.length), ...prev]);
  }

  function update(id: string, field: keyof DbMember, value: string) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  }

  async function save(member: DbMember) {
    if (!member.name.trim()) {
      setError(member.id);
      adminNotify.error('Le nom du membre est requis.');
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
          categoryIds: member.categoryIds,
        }),
      });

      if (!res.ok) throw new Error('Erreur serveur');

      const savedMember = (await res.json()) as DbMember;
      setMembers((prev) => prev.map((m) => (m.id === member.id ? savedMember : m)));
      setSaved(savedMember.id);
      setTimeout(() => setSaved(null), 2500);
      adminNotify.success(isDraft ? 'Membre ajouté.' : 'Membre mis à jour.');
    } catch {
      setError(member.id);
      adminNotify.error('Erreur lors de l’enregistrement du membre.');
    } finally {
      setSaving(null);
    }
  }

  async function removeMember(member: DbMember) {
    if (member.id.startsWith('draft-')) {
      if (!confirm('Supprimer ce brouillon de membre ?')) return;
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      return;
    }

    if (!confirm(`Supprimer ${member.name} ?`)) return;

    setDeleting(member.id);
    try {
      const res = await fetch(`/api/admin/team?id=${member.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur serveur');
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      adminNotify.success('Membre supprimé.');
    } catch {
      adminNotify.error('Suppression impossible.');
    } finally {
      setDeleting(null);
    }
  }

  function toggleCategory(memberId: string, categoryId: string) {
    setMembers((prev) => prev.map((member) => member.id === memberId
      ? { ...member, categoryIds: member.categoryIds.includes(categoryId)
        ? member.categoryIds.filter((id) => id !== categoryId)
        : [...member.categoryIds, categoryId] }
      : member));
  }

  async function createCategory() {
    if (!categoryDraft.nameFr.trim() || !categoryDraft.nameEn.trim() || !categoryDraft.nameDe.trim()) {
      adminNotify.error('Renseignez les noms de la catégorie dans les trois langues.');
      return;
    }
    const res = await fetch('/api/admin/team-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...categoryDraft, sortOrder: categories.length * 10 }),
    });
    if (!res.ok) return adminNotify.error('Création de catégorie impossible.');
    const created = await res.json() as TeamCategory;
    setCategories((prev) => [...prev, created]);
    setCategoryDraft({ nameDe: '', nameEn: '', nameFr: '' });
    adminNotify.success('Catégorie créée.');
  }

  async function updateCategory(category: TeamCategory) {
    const res = await fetch(`/api/admin/team-categories?id=${category.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    if (!res.ok) return adminNotify.error('Modification impossible.');
    adminNotify.success('Catégorie mise à jour.');
  }

  async function deleteCategory(category: TeamCategory) {
    if (!confirm(`Supprimer la catégorie « ${category.nameFr} » ?`)) return;
    const res = await fetch(`/api/admin/team-categories?id=${category.id}`, { method: 'DELETE' });
    if (!res.ok) return adminNotify.error('Suppression impossible.');
    setCategories((prev) => prev.filter((item) => item.id !== category.id));
    setMembers((prev) => prev.map((member) => ({ ...member, categoryIds: member.categoryIds.filter((id) => id !== category.id) })));
    adminNotify.success('Catégorie supprimée.');
  }

  async function moveCategory(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const reordered = [...categories];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const updated = reordered.map((category, sortIndex) => ({ ...category, sortOrder: sortIndex * 10 }));
    setCategories(updated);
    await Promise.all(updated.map((category) => fetch(`/api/admin/team-categories?id=${category.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: category.sortOrder }),
    })));
  }

  return (
    <div className="max-w-5xl px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70 mb-1">
          À PROPOS
        </p>
        <h1 className="text-2xl font-bold text-white">À PROPOS</h1>
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

      {/* Category management panel */}
      <div className="mb-6 rounded-2xl border border-white/8 bg-white/3 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent">Catégories d’équipe</p>
            <p className="mt-1 text-xs text-white/40">La vue « Level Up Team » affiche automatiquement tous les membres.</p>
          </div>
        </div>

        <div className="mb-4 grid gap-2 md:grid-cols-3">
          <input value={categoryDraft.nameFr} onChange={(e) => setCategoryDraft((v) => ({ ...v, nameFr: e.target.value }))} placeholder="Nom français" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20" />
          <input value={categoryDraft.nameEn} onChange={(e) => setCategoryDraft((v) => ({ ...v, nameEn: e.target.value }))} placeholder="English name" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20" />
          <div className="flex gap-2">
            <input value={categoryDraft.nameDe} onChange={(e) => setCategoryDraft((v) => ({ ...v, nameDe: e.target.value }))} placeholder="Deutscher Name" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20" />
            <button type="button" onClick={createCategory} className="rounded-xl bg-accent px-3 text-sm font-bold text-white">Ajouter</button>
          </div>
        </div>

        <div className="space-y-2">
          {categories.map((category, index) => (
            <div key={category.id} className="grid gap-2 rounded-xl border border-white/8 bg-black/10 p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
              <input value={category.nameFr} onChange={(e) => setCategories((prev) => prev.map((item) => item.id === category.id ? { ...item, nameFr: e.target.value } : item))} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white" />
              <input value={category.nameEn} onChange={(e) => setCategories((prev) => prev.map((item) => item.id === category.id ? { ...item, nameEn: e.target.value } : item))} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white" />
              <input value={category.nameDe} onChange={(e) => setCategories((prev) => prev.map((item) => item.id === category.id ? { ...item, nameDe: e.target.value } : item))} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white" />
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => moveCategory(index, -1)} disabled={index === 0} className="rounded-lg border border-white/10 px-2 py-1 text-white/60 disabled:opacity-25">↑</button>
                <button type="button" onClick={() => moveCategory(index, 1)} disabled={index === categories.length - 1} className="rounded-lg border border-white/10 px-2 py-1 text-white/60 disabled:opacity-25">↓</button>
                <button type="button" onClick={() => updateCategory(category)} className="rounded-lg border border-primary/30 px-2 py-1 text-xs text-white">OK</button>
                <button type="button" onClick={() => deleteCategory(category)} className="rounded-lg border border-red-500/30 px-2 py-1 text-xs text-red-400">×</button>
              </div>
            </div>
          ))}
        </div>
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
              <div className="p-4 space-y-3">

                {/* Header: photo + name + save */}
                <div className="flex items-start gap-3">
                  {/* Current photo preview */}
                  <div className="relative w-12 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-900 border border-white/10">
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

                {/* Role + LinkedIn in one row */}
                <div className="grid grid-cols-2 gap-3">
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

                {/* Bio textarea */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">
                    Biographie ({LANG_LABELS[activeLang]})
                  </label>
                  <textarea
                    value={data[bioField]}
                    onChange={(e) => update(data.id, bioField, e.target.value)}
                    rows={2}
                    placeholder={`Biographie en ${LANG_LABELS[activeLang]}…`}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/40 transition-all"
                  />
                </div>

                {/* Team categories */}
                {categories.length > 0 && (
                  <div className="rounded-xl border border-white/8 bg-black/10 p-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">Catégories</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => {
                        const checked = data.categoryIds.includes(category.id);
                        const label = activeLang === 'de' ? category.nameDe : activeLang === 'en' ? category.nameEn : category.nameFr;
                        return (
                          <label key={category.id} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs transition ${checked ? 'border-accent bg-accent/15 text-accent' : 'border-white/10 text-white/50 hover:text-white'}`}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleCategory(data.id, category.id)}
                              className="mr-1.5 accent-orange-500"
                            />
                            {label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Categories section */}
      <div className="mt-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70 mb-1">
            CATÉGORIES
          </p>
          <h2 className="text-xl font-bold text-white">Catégories</h2>
          <p className="mt-2 text-sm text-white/40">
            Gérez les catégories des membres de l&apos;équipe.
          </p>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="text-xs text-white/35">
            {categories.length} catégorie{categories.length > 1 ? 's' : ''}
          </div>
          <button
            type="button"
            onClick={addMember}
            className="inline-flex items-center gap-1.5 rounded-xl border border-accent/25 bg-accent/15 px-3 py-2 text-xs font-semibold text-accent transition hover:bg-accent/25"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter une catégorie
          </button>
        </div>

        <div className="space-y-4">
          {categories.map((category, index) => {
            const isFirst = index === 0;
            const isLast = index === categories.length - 1;

            return (
              <div key={category.id} className="overflow-hidden rounded-2xl border border-white/8 bg-white/3">
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {category.nameFr}
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="rounded-full bg-white/10 px-3 py-1.5 font-medium text-white">
                          {category._count?.members ?? 0} membre{(category._count?.members ?? 0) > 1 ? 's' : ''}
                        </span>
                        <span className="rounded-full bg-white/10 px-3 py-1.5 font-medium text-white">
                          Ordre: {category.sortOrder}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveCategory(index, -1)}
                        disabled={isFirst}
                        className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                        title="Déplacer vers le haut"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m4-4H8" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveCategory(index, 1)}
                        disabled={isLast}
                        className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                        title="Déplacer vers le bas"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16V8m4 4H8" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Editable fields: name in 3 languages */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">
                        Nom (FR)
                      </label>
                      <input
                        type="text"
                        value={category.nameFr}
                        onChange={(e) => updateCategory({ ...category, nameFr: e.target.value })}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">
                        Nom (EN)
                      </label>
                      <input
                        type="text"
                        value={category.nameEn}
                        onChange={(e) => updateCategory({ ...category, nameEn: e.target.value })}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">
                        Nom (DE)
                      </label>
                      <input
                        type="text"
                        value={category.nameDe}
                        onChange={(e) => updateCategory({ ...category, nameDe: e.target.value })}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/40 transition-all"
                      />
                    </div>
                  </div>

                  {/* Buttons: save, delete */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteCategory(category)}
                      className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
                    >
                      Supprimer la catégorie
                    </button>
                    <button
                      onClick={() => updateCategory(category)}
                      className="flex-1 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"
                    >
                      Sauvegarder les modifications
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
