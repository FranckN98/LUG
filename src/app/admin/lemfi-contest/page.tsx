import { Metadata } from 'next';
import { LemFiAdmin } from './LemFiAdmin';

export const metadata: Metadata = {
  title: 'Jeu concours LemFi — Admin',
};

export default function LemFiContestAdminPage() {
  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70 mb-1">Partenariat</p>
        <h1 className="text-2xl font-bold text-white">Jeu concours LemFi</h1>
        <p className="mt-1 text-sm text-white/40">
          Vérifiez les preuves de transfert, validez ou refusez chaque participation. Seuls les participants validés
          sont éligibles au tirage.
        </p>
      </div>
      <div className="mt-6">
        <LemFiAdmin />
      </div>
    </div>
  );
}
