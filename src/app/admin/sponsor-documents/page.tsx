import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SponsorDocumentsAdmin } from './SponsorDocumentsAdmin';

export const metadata: Metadata = {
  title: 'PDFs Sponsors — Admin',
};

export const dynamic = 'force-dynamic';

export default function SponsorDocumentsPage() {
  const isAdmin = cookies().get('admin_session')?.value === 'authenticated';
  if (!isAdmin) redirect('/admin/login');
  return <SponsorDocumentsAdmin />;
}
