import CommunicationAdmin from './CommunicationAdmin';
import { getCommunicationAdminData } from '@/lib/event-communication';

export const metadata = { title: 'Communication · Admin Level Up' };

export default async function CommunicationPage() {
  const data = await getCommunicationAdminData('fr');

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <CommunicationAdmin initialSettings={data.settings} events={data.events} />
    </div>
  );
}