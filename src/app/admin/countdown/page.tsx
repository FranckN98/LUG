import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/adminAuth';
import { CountdownAdmin } from './CountdownAdmin';

export const metadata: Metadata = {
  title: 'Countdown — Admin',
};

export const dynamic = 'force-dynamic';

export default function CountdownAdminPage() {
  if (!isAdmin()) redirect('/admin/login');
  return <CountdownAdmin />;
}
