import TicketingAdmin from './TicketingAdmin';

export const metadata = {
  title: 'Billetterie 2026 · Admin',
};

export default function TicketingAdminPage() {
  return (
    <div className="min-h-screen bg-[#0f0606] px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <TicketingAdmin />
    </div>
  );
}
