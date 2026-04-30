import HomepageAdmin from './HomepageAdmin';

export const metadata = {
  title: "Configuration page d'accueil · Admin",
};

export default function HomepageAdminPage() {
  return (
    <div className="min-h-screen bg-[#0f0606] px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <HomepageAdmin />
    </div>
  );
}
