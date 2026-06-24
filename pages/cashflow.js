import { useEffect, useMemo, useState } from 'react';
import ExpenseEditModal from '../components/ExpenseEditModal';
import { getCashFlow, addCashFlow, deleteCashFlow } from '../utils/cashFlowApi';
import { getLoans, updateLoans } from '../utils/loansApi';
import { getLumpsum, updateLumpsum } from '../utils/lumpsumApi';

function todayString() {
  return new Date().toISOString().split('T')[0];
}

function formatAmount(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

const emptyForm = () => ({
  flowType: 'inflow',
  date: todayString(),
  amount: '',
  source: '',
  expenseRef: '',
});

function isLoanPaidAndClosed(loan) {
  return loan.closed === true;
}

function isLumpsumPaidAndClosed(item) {
  const total = Number(item.total) || 0;
  const paid = Number(item.paid) || 0;
  return total > 0 && paid >= total;
}

function sortCashflows(cashflows) {
  return [...(cashflows || [])].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
}

function sumCashflowAmount(cashflows) {
  return (cashflows || []).reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
}

function getRepaidAmount(paid, cashflows) {
  const fromCashflows = sumCashflowAmount(cashflows);
  if (fromCashflows > 0) return fromCashflows;
  return Number(paid) || 0;
}

function aggregateTotals(items) {
  return items.reduce(
    (acc, item) => {
      acc.paid += getRepaidAmount(item.paid, item.cashflows);
      acc.total += Number(item.total) || 0;
      return acc;
    },
    { paid: 0, total: 0 }
  );
}

function getUpdatedTimestamp(item, kind) {
  if (kind === 'inflow') {
    return new Date(item.createdAt || item.date).getTime();
  }
  const times = [];
  if (item.updatedAt) {
    times.push(new Date(item.updatedAt).getTime());
  }
  (item.cashflows || []).forEach((entry) => {
    times.push(new Date(entry.timestamp || entry.date).getTime());
  });
  if (times.length === 0) return 0;
  return Math.max(...times);
}

function withUpdatedAt(item, timestamp = new Date().toISOString()) {
  return { ...item, updatedAt: timestamp };
}

function formatUpdatedAt(timestampMs) {
  if (!timestampMs) return 'Not updated yet';
  return new Date(timestampMs).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function UpdatedLabel({ timestampMs }) {
  return (
    <span className="text-right text-xs text-slate-500">
      Updated {formatUpdatedAt(timestampMs)}
    </span>
  );
}

const TYPE_ICONS = {
  inflow: { icon: '📥', label: 'Inflow' },
  loan: { icon: '💳', label: 'Loan' },
  lumpsum: { icon: '💰', label: 'Lumpsum' },
};

function TypeBadge({ kind }) {
  const { icon, label } = TYPE_ICONS[kind];
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg leading-none"
      title={label}
      aria-label={label}
    >
      {icon}
    </span>
  );
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

function SummaryCard({ title, paid, total }) {
  const complete = total > 0 && paid >= total;

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${
        complete ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'
      }`}
    >
      <p className={`mb-3 text-sm font-semibold ${complete ? 'text-emerald-900' : 'text-slate-900'}`}>
        {title}
      </p>
      <ProgressBar paid={paid} total={total} />
    </div>
  );
}

function InflowItemCard({ source, amount, updatedAt, onDelete, deleting }) {
  return (
    <li className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <TypeBadge kind="inflow" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-slate-900">{source}</p>
              <p className="mt-1 text-sm font-semibold text-emerald-600">{formatAmount(amount)}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                aria-label={`Delete inflow from ${source}`}
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                </svg>
              </button>
              <UpdatedLabel timestampMs={updatedAt} />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

function ExpenseItemCard({ kind, name, paid, total, cashflows, updatedAt, onEdit }) {
  const repaid = getRepaidAmount(paid, cashflows);
  const itemTotal = Number(total) || 0;
  const complete = itemTotal > 0 && repaid >= itemTotal;

  return (
    <li
      className={`rounded-xl border p-4 shadow-sm transition-colors ${
        complete
          ? 'border-emerald-300 bg-emerald-50'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <TypeBadge kind={kind} />
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <p className={`font-medium ${complete ? 'text-emerald-900' : 'text-slate-900'}`}>{name}</p>
              <p className={`text-xs capitalize ${complete ? 'text-emerald-600' : 'text-slate-400'}`}>{kind}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <button
                type="button"
                onClick={onEdit}
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-600"
                aria-label={`Edit ${name}`}
                title="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path d="m2.695 14.763-1.262 3.154a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343Z" />
                </svg>
              </button>
              <UpdatedLabel timestampMs={updatedAt} />
              {complete && (
                <span
                  className="flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white"
                  title="Fully paid"
                >
                  <span aria-hidden="true">✓</span>
                  Paid
                </span>
              )}
            </div>
          </div>
          <ProgressBar paid={repaid} total={itemTotal} />
        </div>
      </div>
    </li>
  );
}

export default function CashFlowPage() {
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [lumpsum, setLumpsum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editTarget, setEditTarget] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [deletingInflowId, setDeletingInflowId] = useState(null);

  const expenseOptions = useMemo(() => {
    const loanOptions = loans.map((loan, index) => ({
      value: `loan:${index}`,
      label: `${loan.name} (Loan)`,
      total: Number(loan.total) || 0,
      kind: 'loan',
      name: loan.name,
      disabled: isLoanPaidAndClosed(loan),
    }));
    const lumpsumOptions = lumpsum.map((item, index) => ({
      value: `lumpsum:${index}`,
      label: `${item.name} (Lumpsum)`,
      total: Number(item.total) || 0,
      kind: 'lumpsum',
      name: item.name,
      disabled: isLumpsumPaidAndClosed(item),
    }));
    return [...loanOptions, ...lumpsumOptions];
  }, [loans, lumpsum]);

  const loanTotals = useMemo(() => aggregateTotals(loans), [loans]);
  const lumpsumTotals = useMemo(() => aggregateTotals(lumpsum), [lumpsum]);
  const unifiedList = useMemo(() => {
    const items = [
      ...transactions
        .filter((t) => t.type === 'inflow')
        .map((item) => ({
          listKey: `inflow-${item.id}`,
          kind: 'inflow',
          updatedAt: getUpdatedTimestamp(item, 'inflow'),
          item,
        })),
      ...loans.map((item, index) => ({
        listKey: `loan-${index}-${item.name}`,
        kind: 'loan',
        index,
        updatedAt: getUpdatedTimestamp(item, 'loan'),
        item,
      })),
      ...lumpsum.map((item, index) => ({
        listKey: `lumpsum-${index}-${item.name}`,
        kind: 'lumpsum',
        index,
        updatedAt: getUpdatedTimestamp(item, 'lumpsum'),
        item,
      })),
    ];
    return items.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [transactions, loans, lumpsum]);

  useEffect(() => {
    if (!form.expenseRef) return;
    const selected = expenseOptions.find((opt) => opt.value === form.expenseRef);
    if (selected?.disabled) {
      setForm((prev) => ({ ...prev, expenseRef: '' }));
    }
  }, [expenseOptions, form.expenseRef]);

  useEffect(() => {
    Promise.all([getCashFlow(), getLoans(), getLumpsum()])
      .then(([flowData, loansData, lumpsumData]) => {
        setTransactions(flowData);
        setLoans(loansData);
        setLumpsum(lumpsumData);
        setError(null);
      })
      .catch((err) => {
        setError('Failed to load cash flow data. Check your password and try again.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const handleExpenseChange = (expenseRef) => {
    const selected = expenseOptions.find((opt) => opt.value === expenseRef);
    if (selected?.disabled) return;
    updateForm({
      expenseRef,
      amount: selected ? String(selected.total) : form.amount,
    });
  };

  const appendExpenseCashflow = async (expenseRef, entry) => {
    const [kind, indexStr] = expenseRef.split(':');
    const index = Number(indexStr);

    const applyUpdate = (item) => {
      const cashflows = [...(item.cashflows || []), entry];
      const updated = withUpdatedAt({ ...item, cashflows }, entry.timestamp);
      if (kind === 'lumpsum') {
        updated.paid = (Number(item.paid) || 0) + (Number(entry.amount) || 0);
      }
      return updated;
    };

    if (kind === 'loan') {
      const updated = loans.map((loan, i) => (i === index ? applyUpdate(loan) : loan));
      await updateLoans(updated);
      setLoans(updated);
      return;
    }

    if (kind === 'lumpsum') {
      const updated = lumpsum.map((item, i) => (i === index ? applyUpdate(item) : item));
      await updateLumpsum(updated);
      setLumpsum(updated);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      setError('Enter a valid amount.');
      return;
    }
    if (!form.source.trim()) {
      setError('Source is required.');
      return;
    }
    if (form.flowType === 'outflow' && !form.expenseRef) {
      setError('Select an expense for outflow.');
      return;
    }

    const selectedExpense = expenseOptions.find((opt) => opt.value === form.expenseRef);
    if (form.flowType === 'outflow' && selectedExpense?.disabled) {
      setError('This expense is already paid and closed.');
      return;
    }

    const payload = {
      type: form.flowType,
      date: form.date,
      amount,
      source: form.source.trim(),
      expense:
        form.flowType === 'outflow' && selectedExpense
          ? {
              ref: form.expenseRef,
              kind: selectedExpense.kind,
              name: selectedExpense.name,
              total: amount,
            }
          : null,
    };

    setSaving(true);
    setError(null);
    try {
      const saved = await addCashFlow(payload);
      setTransactions((prev) => [...prev, saved]);

      if (form.flowType === 'outflow' && form.expenseRef) {
        const cashflowEntry = {
          id: saved.id,
          date: saved.date,
          amount: saved.amount,
          timestamp: saved.createdAt,
        };
        await appendExpenseCashflow(form.expenseRef, cashflowEntry);
      }

      setForm(emptyForm());
      setShowForm(false);
    } catch (err) {
      setError('Failed to save cash flow.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInflow = async (id) => {
    if (!window.confirm('Delete this inflow transaction?')) return;

    setDeletingInflowId(id);
    setError(null);
    try {
      await deleteCashFlow(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete inflow transaction.');
      console.error(err);
    } finally {
      setDeletingInflowId(null);
    }
  };

  const editItem =
    editTarget?.kind === 'loan'
      ? loans[editTarget.index]
      : editTarget?.kind === 'lumpsum'
        ? lumpsum[editTarget.index]
        : null;

  const handleEditSave = async (updatedItem) => {
    if (!editTarget) return;

    setEditSaving(true);
    setError(null);
    try {
      const stampedItem = withUpdatedAt(updatedItem);
      if (editTarget.kind === 'loan') {
        const updated = loans.map((loan, i) => (i === editTarget.index ? stampedItem : loan));
        await updateLoans(updated);
        setLoans(updated);
      } else {
        const updated = lumpsum.map((item, i) => (i === editTarget.index ? stampedItem : item));
        await updateLumpsum(updated);
        setLumpsum(updated);
      }
      setEditTarget(null);
    } catch (err) {
      setError('Failed to save changes.');
      console.error(err);
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cash Flow</h1>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-2xl font-light text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-105 hover:bg-brand-700"
          aria-label="Add cash flow"
        >
          +
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <ExpenseEditModal
        open={Boolean(editTarget && editItem)}
        kind={editTarget?.kind}
        item={editItem}
        saving={editSaving}
        onClose={() => setEditTarget(null)}
        onSave={handleEditSave}
      />

      {showForm && (
        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
            {['inflow', 'outflow'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  updateForm({
                    flowType: type,
                    expenseRef: type === 'inflow' ? '' : form.expenseRef,
                  })
                }
                className={`flex-1 rounded-md py-2 text-sm font-semibold capitalize transition-colors ${
                  form.flowType === type
                    ? type === 'inflow'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-red-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-500">Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => updateForm({ date: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                required
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-500">Source</span>
              <input
                type="text"
                value={form.source}
                onChange={(e) => updateForm({ source: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                required
              />
            </label>
          </div>

          {form.flowType === 'inflow' && (
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-500">Transaction amount</span>
              <input
                type="number"
                min="0"
                step="1"
                value={form.amount}
                onChange={(e) => updateForm({ amount: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                required
              />
            </label>
          )}

          {form.flowType === 'outflow' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-500">Expense</span>
                <select
                  value={form.expenseRef}
                  onChange={(e) => handleExpenseChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  required
                >
                  <option value="">Select loan or lumpsum</option>
                  {expenseOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                      {opt.label}
                      {opt.disabled ? ' — paid & closed' : ''}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-500">Transaction amount</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.amount}
                  onChange={(e) => updateForm({ amount: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  required
                />
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm());
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-brand-600" />
        </div>
      )}

      {!loading && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <SummaryCard title="Loans" paid={loanTotals.paid} total={loanTotals.total} />
            <SummaryCard title="Lumpsum" paid={lumpsumTotals.paid} total={lumpsumTotals.total} />
          </div>

          {unifiedList.length === 0 ? (
            <p className="text-sm text-slate-500">No items found.</p>
          ) : (
            <ul className="space-y-3">
              {unifiedList.map((entry) => {
                if (entry.kind === 'inflow') {
                  return (
                    <InflowItemCard
                      key={entry.listKey}
                      source={entry.item.source}
                      amount={entry.item.amount}
                      updatedAt={entry.updatedAt}
                      deleting={deletingInflowId === entry.item.id}
                      onDelete={() => handleDeleteInflow(entry.item.id)}
                    />
                  );
                }

                return (
                  <ExpenseItemCard
                    key={entry.listKey}
                    kind={entry.kind}
                    name={entry.item.name}
                    paid={entry.item.paid}
                    total={entry.item.total}
                    cashflows={entry.item.cashflows}
                    updatedAt={entry.updatedAt}
                    onEdit={() => setEditTarget({ kind: entry.kind, index: entry.index })}
                  />
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
