import { useEffect, useMemo, useState } from 'react';
import { getCashFlow } from '../utils/cashFlowApi';
import { getLoans } from '../utils/loansApi';
import { getLumpsum } from '../utils/lumpsumApi';

function formatAmount(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function isClosed(loan) {
  return loan.closed === true;
}

function sumCashflowAmount(cashflows) {
  return (cashflows || []).reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
}

function getRepaidAmount(paid, cashflows) {
  const fromCashflows = sumCashflowAmount(cashflows);
  if (fromCashflows > 0) return fromCashflows;
  return Number(paid) || 0;
}

function ProgressBar({ paid, total }) {
  const percent = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
  const complete = total > 0 && paid >= total;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-emerald-600">{formatAmount(paid)}</span>
        <span className={complete ? 'text-emerald-600' : 'text-slate-600'}>{formatAmount(total)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all ${complete ? 'bg-emerald-500' : 'bg-amber-500'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function SummaryCard({ title, icon, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-lg leading-none">
          {icon}
        </span>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function HomePage() {
  const [loans, setLoans] = useState([]);
  const [lumpsum, setLumpsum] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getLoans(), getLumpsum(), getCashFlow()])
      .then(([loansData, lumpsumData, flowData]) => {
        setLoans(loansData);
        setLumpsum(lumpsumData);
        setTransactions(flowData);
        setError(null);
      })
      .catch((err) => {
        setError('Failed to load summary. Check your password and try again.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const totalLoanAmount = loans.reduce((sum, loan) => sum + (Number(loan.total) || 0), 0);
    const activeLoans = loans.filter((loan) => !isClosed(loan));
    const totalEmi = activeLoans.reduce((sum, loan) => sum + (Number(loan.emi) || 0), 0);
    const totalEmiPaid = activeLoans.reduce((sum, loan) => sum + (Number(loan.paid) || 0), 0);
    const lumpsumTotal = lumpsum.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    const lumpsumPaid = lumpsum.reduce(
      (sum, item) => sum + getRepaidAmount(item.paid, item.cashflows),
      0
    );
    const totalInflow = transactions
      .filter((t) => t.type === 'inflow')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    return {
      totalLoanAmount,
      totalEmi,
      totalEmiPaid,
      lumpsumTotal,
      lumpsumPaid,
      totalInflow,
    };
  }, [loans, lumpsum, transactions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Home</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of loans, lumpsum, and inflow.</p>
      </div>

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

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryCard title="Loans" icon="💳">
            <p className="text-2xl font-bold text-slate-900">{formatAmount(summary.totalLoanAmount)}</p>
            <p className="mt-1 text-xs text-slate-500">Total loan amount</p>
          </SummaryCard>

          <SummaryCard title="Monthly EMI" icon="📅">
            <ProgressBar paid={summary.totalEmiPaid} total={summary.totalEmi} />
            <p className="mt-2 text-xs text-slate-500">Paid vs total EMI (active loans)</p>
          </SummaryCard>

          <SummaryCard title="Lumpsum" icon="💰">
            <ProgressBar paid={summary.lumpsumPaid} total={summary.lumpsumTotal} />
            <p className="mt-2 text-xs text-slate-500">Paid vs total lumpsum</p>
          </SummaryCard>

          <SummaryCard title="Inflow" icon="📥">
            <p className="text-2xl font-bold text-emerald-600">{formatAmount(summary.totalInflow)}</p>
            <p className="mt-1 text-xs text-slate-500">Total inflow received</p>
          </SummaryCard>
        </div>
      )}
    </div>
  );
}
