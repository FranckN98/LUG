import { Metadata } from 'next';
import { BoothReservationsAdmin } from './BoothReservationsAdmin';

export const metadata: Metadata = {
  title: 'Réservations de stands — Admin',
};

export default function BoothReservationsPage() {
  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70 mb-1">Billetterie & Événement</p>
        <h1 className="text-2xl font-bold text-white">Réservations de stands</h1>
        <p className="mt-1 text-sm text-white/40">
          Gérez les demandes de réservation de stands et suivez le statut de chaque participation.
        </p>
      </div>
      <div className="mt-8">
        <BoothReservationsAdmin />
      </div>
    </div>
  );
}
