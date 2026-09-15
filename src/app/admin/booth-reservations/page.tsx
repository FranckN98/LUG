import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BoothReservationsAdmin } from './BoothReservationsAdmin';
import { isAdmin } from '@/lib/adminAuth';

export const metadata: Metadata = {
  title: 'Réservations de stands — Admin',
};

export const dynamic = 'force-dynamic';

export default function BoothReservationsPage() {
  if (!isAdmin()) redirect('/admin/login');
  return <BoothReservationsAdmin />;
}
