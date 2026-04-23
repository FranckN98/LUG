import Link from 'next/link';
import EventEditor from '../../EventEditor';

export default async function AdminEditEventPage({ params }: { params: { id: string } }) {
  const event = await fetch(`/api/admin/events/${params.id}`).then((res) => res.json());

  return (
    <div className="p-8">
      <div className="max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-8">
        <Link href="/admin/events" className="text-sm text-white/45 hover:text-white">
          ← Retour aux événements
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-accent/70">Events</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Édition {params.id}</h1>
        <p className="mt-3 text-sm text-white/50">
          L’éditeur détaillé arrive dans la prochaine tranche. Cette page servira au formulaire complet par sections.
        </p>
      </div>
      <EventEditor event={event} />
    </div>
  );
}
