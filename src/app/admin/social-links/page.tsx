import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SocialLinksAdmin } from './SocialLinksAdmin';

export const metadata: Metadata = {
  title: 'Linktree — Admin',
};

export const dynamic = 'force-dynamic';

export default function SocialLinksAdminPage() {
  const isAdmin = cookies().get('admin_session')?.value === 'authenticated';
  if (!isAdmin) redirect('/admin/login');
  return <SocialLinksAdmin />;
}
