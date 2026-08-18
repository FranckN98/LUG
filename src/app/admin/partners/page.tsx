import { PartnersSection } from '@/app/admin/media/PartnersSection';

export default function AdminPartnersPage() {
  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70 mb-1">Admin</p>
        <h1 className="text-2xl font-bold text-white">Partenaires &amp; Sponsors</h1>
        <p className="mt-1 text-sm text-white/40">
          Gérez les logos, catégorisez en partenaire ou sponsor, masquez ou supprimez les partenaires affichés sur le site public.
        </p>
      </div>
      <PartnersSection />
    </div>
  );
}
