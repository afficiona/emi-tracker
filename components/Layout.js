import Link from 'next/link';
import { useRouter } from 'next/router';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/emi', label: 'EMI', icon: '💳' },
  { href: '/cashflow', label: 'Cash Flow', icon: '📊' },
];

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-6 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-md shadow-brand-500/25">
              ₹
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">EMI Tracker</span>
          </div>

          <nav className="flex rounded-xl border border-slate-200 bg-slate-100/80 p-1">
            {NAV_ITEMS.map(({ href, label, icon }) => {
              const active = router.pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium no-underline transition-all duration-200 sm:px-4 ${
                    active
                      ? 'bg-white text-brand-700 shadow-sm ring-1 ring-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="text-base leading-none" aria-hidden="true">
                    {icon}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>

      <footer className="border-t border-slate-200/80 bg-white/60 py-4 text-center text-xs text-slate-400">
        EMI Tracker · Encrypted Redis storage
      </footer>
    </div>
  );
}
