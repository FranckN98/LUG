import { Metadata } from 'next';
import { FeedbackAdmin } from './FeedbackAdmin';

export const metadata: Metadata = {
  title: 'Feedback 2e édition — Admin',
};

export default function FeedbackAdminPage() {
  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70 mb-1">Level Up in Germany 2026</p>
        <h1 className="text-2xl font-bold text-white">Feedback — deuxième édition</h1>
        <p className="mt-1 text-sm text-white/40">
          Retours anonymes par défaut. Les réponses et les inscriptions aux prochaines nouvelles sont stockées
          séparément : rien ne permet de relier une adresse e-mail à une réponse.
        </p>
      </div>
      <div className="mt-6">
        <FeedbackAdmin />
      </div>
    </div>
  );
}
