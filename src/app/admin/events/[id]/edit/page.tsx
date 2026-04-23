import { notFound } from 'next/navigation';
import EventEditor from '@/app/admin/events/EventEditor';
import { getEventById, serializeEventForForm } from '@/lib/events-db';

export default async function EditAdminEventPage({ params }: { params: { id: string } }) {
  const event = await getEventById(params.id);

  if (!event) {
    notFound();
  }

  return <EventEditor event={serializeEventForForm(event)} />;
}
