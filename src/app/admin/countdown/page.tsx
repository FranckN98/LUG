import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CountdownAdmin } from './CountdownAdmin';

export const metadata: Metadata = {
  title: 'Countdown — Admin',
};

export const dynamic = 'force-dynamic';

export default function CountdownAdminPage() {
  const isAdmin = cookies().get('admin_session')?.value === 'authenticated';
  if (!isAdmin) redirect('/admin/login');
  return <CountdownAdmin />;
}
