"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type EventEditorFormData = {
  title: string;
  year: number;
  status: string;
  slug: string;
};

export default function AdminEventEditor({ event }: { event?: Partial<EventEditorFormData> & { id?: string; title?: string } }) {
  const [formData, setFormData] = useState<EventEditorFormData>({
    title: event?.title ?? '',
    year: event?.year ?? new Date().getFullYear(),
    status: event?.status ?? 'draft',
    slug: event?.slug ?? '',
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = event ? 'PUT' : 'POST';
    const url = event ? `/api/admin/events/${event.id}` : '/api/admin/events';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      router.push('/admin/events');
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-8">
        <Link href="/admin/events" className="text-sm text-white/45 hover:text-white">
          ← Retour aux événements
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-white">
          {event ? `Modifier l'événement ${event.title}` : 'Créer un nouvel événement'}
        </h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-white/70">Titre</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-white/20 bg-white/10 p-2 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-white/70">Année</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-white/20 bg-white/10 p-2 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-white/70">Statut</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-white/20 bg-white/10 p-2 text-white"
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/70">Slug</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-white/20 bg-white/10 p-2 text-white"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-accent py-2 text-white hover:bg-accent/90"
          >
            {event ? 'Mettre à jour' : 'Créer'}
          </button>
        </form>
      </div>
    </div>
  );
}