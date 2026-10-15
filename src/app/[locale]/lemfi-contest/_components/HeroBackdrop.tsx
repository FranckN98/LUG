/** Fond premium : dégradé vert profond, halos or et menthe, fin motif losange, fondu vers le bas. */
const LATTICE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cpath d='M28 2 54 28 28 54 2 28z' fill='none' stroke='%23F5B800' stroke-opacity='.13' stroke-width='1'/%3E%3Cpath d='M28 14 42 28 28 42 14 28z' fill='none' stroke='%23F5B800' stroke-opacity='.07' stroke-width='1'/%3E%3C/svg%3E\")";

export function HeroBackdrop({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`relative isolate overflow-hidden text-white ${className}`}>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20"
        style={{
          backgroundImage:
            'radial-gradient(60% 55% at 88% -5%, rgba(245,184,0,0.22), transparent 62%), radial-gradient(55% 50% at -5% 105%, rgba(91,198,147,0.20), transparent 62%), linear-gradient(165deg, #031C13 0%, #0A3D27 52%, #0F5132 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-70"
        style={{
          backgroundImage: LATTICE,
          WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, transparent 85%)',
          maskImage: 'linear-gradient(to bottom, #000 0%, transparent 85%)',
        }}
      />
      {children}
    </section>
  );
}
