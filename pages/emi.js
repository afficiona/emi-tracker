import { useEffect, useState } from 'react';
import { getLoans, updateLoans, resetLoans } from '../utils/loansApi';

function isPaid(loan) {
  return !isClosed(loan) && Number(loan.paid) === Number(loan.emi) && Number(loan.emi) > 0;
}

function isClosed(loan) {
  return loan.closed === true;
}

function formatEmi(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function getLoanTypeIcon(type) {
  return String(type).toLowerCase() === 'self' ? '👤' : '🤝';
}

function getClosestDate(dueDay) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const month = today.getMonth();
  let date = new Date(year, month, dueDay);
  date.setHours(0, 0, 0, 0);
  if (date < today) {
    date = new Date(year, month + 1, dueDay);
    date.setHours(0, 0, 0, 0);
  }
  return date;
}

function getGroupTheme(groupPaid, groupEmi) {
  if (groupEmi > 0 && groupPaid >= groupEmi) {
    return {
      section: 'border-2 border-emerald-400 bg-emerald-50/30',
      header: 'border-b border-emerald-200 bg-emerald-50',
    };
  }
  if (groupPaid > 0) {
    return {
      section: 'border-2 border-amber-400 bg-amber-50/30',
      header: 'border-b border-amber-200 bg-amber-50',
    };
  }
  return {
    section: 'border-2 border-red-400 bg-red-50/30',
    header: 'border-b border-red-200 bg-red-50',
  };
}

function groupLoansByDueDay(loans) {
  const groups = {};
  loans.forEach((loan, index) => {
    const day = String(loan.due_day);
    if (!groups[day]) groups[day] = [];
    groups[day].push({ ...loan, index });
  });

  return Object.keys(groups)
    .sort((a, b) => getClosestDate(Number(a)) - getClosestDate(Number(b)))
    .map((day) => {
      const groupLoans = groups[day];
      return {
        dueDay: day,
        dueDate: getClosestDate(Number(day)),
        loans: groupLoans,
        groupEmi: groupLoans
          .filter((loan) => !isClosed(loan))
          .reduce((sum, loan) => sum + (Number(loan.emi) || 0), 0),
        groupPaid: groupLoans
          .filter((loan) => !isClosed(loan))
          .reduce((sum, loan) => sum + (Number(loan.paid) || 0), 0),
      };
    });
}

export default function EmiPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    getLoans()
      .then((data) => {
        setLoans(data);
        setError(null);
      })
      .catch((err) => {
        setError('Failed to load loans. Check your password and try again.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePaidToggle = (index, checked) => {
    setLoans((prev) =>
      prev.map((loan, i) =>
        i === index && !isClosed(loan)
          ? { ...loan, paid: checked ? Number(loan.emi) : 0 }
          : loan
      )
    );
    setDirty(true);
  };

  const handleCloseLoan = (index) => {
    setLoans((prev) =>
      prev.map((loan, i) =>
        i === index ? { ...loan, closed: true, paid: 0 } : loan
      )
    );
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateLoans(loans);
      setDirty(false);
      setError(null);
    } catch (err) {
      setError('Failed to save. Check your password and try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const code = window.prompt('Enter reset code:');
    if (code === null) return;

    const previousLoans = loans;
    setSaving(true);
    setError(null);
    try {
      const resetLoansData = await resetLoans(code);
      setLoans(resetLoansData);
      setDirty(false);
    } catch (err) {
      setLoans(previousLoans);
      setError(err.message || 'Failed to reset. Check your password and try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const activeLoans = loans.filter((loan) => !isClosed(loan));
  const totalEmi = activeLoans.reduce((sum, loan) => sum + (Number(loan.emi) || 0), 0);
  const totalPaid = activeLoans.reduce((sum, loan) => sum + (Number(loan.paid) || 0), 0);
  const groupedLoans = groupLoansByDueDay(loans);
  const progressPercent = totalEmi > 0 ? Math.min(100, (totalPaid / totalEmi) * 100) : 0;

  const progressBarColor =
    totalEmi > 0 && totalPaid >= totalEmi
      ? 'bg-emerald-500'
      : totalPaid > 0
        ? 'bg-amber-500'
        : 'bg-red-500';

  return (
    <div className="space-y-5">
      {!loading && !error && loans.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 text-sm font-semibold text-slate-800">
            <span>{formatEmi(totalPaid)}</span>
            <span className="text-slate-500">{formatEmi(totalEmi)}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-300 ${progressBarColor}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-end gap-2">
            {dirty && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
            <button
              onClick={handleReset}
              disabled={saving}
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-60"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-brand-600" />
        </div>
      )}

      {!loading && !error && loans.length === 0 && (
        <p className="py-12 text-center text-sm text-slate-500">No loans found.</p>
      )}

      {!loading && !error && loans.length > 0 && (
        <div className="space-y-4">
          {groupedLoans.map((group) => {
            const theme = getGroupTheme(group.groupPaid, group.groupEmi);
            return (
              <section
                key={group.dueDay}
                className={`overflow-hidden rounded-xl shadow-sm ${theme.section}`}
              >
                <div className={`flex items-center justify-between px-4 py-2.5 ${theme.header}`}>
                  <h2 className="text-sm font-semibold text-slate-800">
                    Due day {group.dueDay}
                  </h2>
                  <span className="text-xs font-medium text-slate-500">
                    {formatEmi(group.groupPaid)} / {formatEmi(group.groupEmi)}
                  </span>
                </div>

                <ul className="divide-y divide-slate-100">
                  {group.loans.map((loan) => {
                    const paid = isPaid(loan);
                    const closed = isClosed(loan);
                    return (
                      <li
                        key={`${loan.name}-${loan.index}`}
                        className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${
                          closed
                            ? 'bg-emerald-100/80'
                            : paid
                              ? 'bg-emerald-50/50'
                              : 'hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className="shrink-0 text-base leading-none"
                          title={loan.type}
                          aria-label={loan.type}
                        >
                          {getLoanTypeIcon(loan.type)}
                        </span>
                        <p
                          className={`min-w-0 flex-1 truncate font-medium ${
                            closed ? 'text-emerald-800' : 'text-slate-900'
                          }`}
                        >
                          {loan.name}
                        </p>

                        <p
                          className={`shrink-0 text-sm font-semibold ${
                            closed ? 'text-emerald-700' : 'text-slate-800'
                          }`}
                        >
                          {formatEmi(loan.emi)}
                        </p>

                        {closed ? (
                          <span
                            className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white"
                            title="Closed"
                          >
                            <span aria-hidden="true">✓</span>
                            Closed
                          </span>
                        ) : (
                          <>
                            <label className="flex shrink-0 cursor-pointer items-center gap-2">
                              <input
                                type="checkbox"
                                checked={paid}
                                onChange={(e) => handlePaidToggle(loan.index, e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                              />
                              <span className="text-xs font-medium text-slate-500">Paid</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => handleCloseLoan(loan.index)}
                              title="Close loan"
                              aria-label="Close loan"
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <span className="text-lg leading-none" aria-hidden="true">
                                ×
                              </span>
                            </button>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
