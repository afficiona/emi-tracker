function LoadingState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-brand-600" />
        <p className="text-sm font-medium text-slate-500">Loading data...</p>
      </div>
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl">
        📭
      </div>
      <p className="text-sm font-medium text-slate-600">No {label} found</p>
      <p className="mt-1 text-xs text-slate-400">Data may not be seeded yet. Run npm run db:seed</p>
    </div>
  );
}

export default function DataDump({
  title,
  description,
  icon,
  data,
  loading,
  error,
  countLabel = 'records',
  accent = 'brand',
}) {
  const accentClasses = {
    brand: 'from-brand-500 to-brand-700 shadow-brand-500/20',
    emerald: 'from-emerald-500 to-emerald-700 shadow-emerald-500/20',
    amber: 'from-amber-500 to-amber-700 shadow-amber-500/20',
  };

  const badgeClasses = {
    brand: 'bg-brand-50 text-brand-700 ring-brand-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  };

  const isEmpty = !loading && !error && Array.isArray(data) && data.length === 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {icon && (
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xl text-white shadow-lg ${accentClasses[accent]}`}
            >
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
            {description && (
              <p className="mt-1 max-w-lg text-sm leading-relaxed text-slate-500">{description}</p>
            )}
          </div>
        </div>

        {!loading && !error && Array.isArray(data) && data.length > 0 && (
          <span
            className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${badgeClasses[accent]}`}
          >
            {data.length} {countLabel}
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 shadow-sm">
          <span className="text-lg leading-none" aria-hidden="true">
            ⚠️
          </span>
          <div>
            <p className="text-sm font-semibold text-red-800">Failed to load</p>
            <p className="mt-0.5 text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingState />}

      {/* Empty */}
      {isEmpty && <EmptyState label={countLabel} />}

      {/* Data dump */}
      {!loading && !error && data.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="font-mono text-xs text-slate-400">raw.json</span>
          </div>
          <pre className="scrollbar-thin max-h-[calc(100vh-20rem)] overflow-auto p-5 font-mono text-[13px] leading-6 text-slate-700">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
