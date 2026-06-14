import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { BoothReservationsAdmin } from './BoothReservationsAdmin';

export const metadata: Metadata = {
  title: 'Réservations de stands — Admin',
};

export const dynamic = 'force-dynamic';

export default function BoothReservationsPage() {
  const isAdmin = cookies().get('admin_session')?.value === 'authenticated';
  if (!isAdmin) redirect('/admin/login');
  return <BoothReservationsAdmin />;
}
