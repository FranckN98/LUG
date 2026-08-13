import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SponsorDocumentsAdmin } from './SponsorDocumentsAdmin';
import { isAdmin } from '@/lib/adminAuth';

export const metadata: Metadata = {
  title: 'PDFs Sponsors — Admin',
};

export const dynamic = 'force-dynamic';

export default function SponsorDocumentsPage() {
  if (!isAdmin()) redirect('/admin/login');
  return <SponsorDocumentsAdmin />;
}
