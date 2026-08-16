import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SocialLinksAdmin } from './SocialLinksAdmin';
import { isAdmin } from '@/lib/adminAuth';

export const metadata: Metadata = {
  title: 'Linktree — Admin',
};

export const dynamic = 'force-dynamic';

export default function SocialLinksAdminPage() {
  if (!isAdmin()) redirect('/admin/login');
  return <SocialLinksAdmin />;
}
