import { useEffect, useState } from 'react';

const LOAN_FIELDS = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'type', label: 'Type', type: 'text' },
  { key: 'total', label: 'Total', type: 'number' },
  { key: 'emi', label: 'EMI', type: 'number' },
  { key: 'due_day', label: 'Due day', type: 'number' },
  { key: 'source', label: 'Source', type: 'text' },
  { key: 'paid', label: 'Paid', type: 'number' },
  { key: 'closed', label: 'Closed', type: 'checkbox' },
];

const LUMPSUM_FIELDS = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'total', label: 'Total', type: 'number' },
  { key: 'paid', label: 'Paid', type: 'number' },
  { key: 'desc', label: 'Description', type: 'text' },
];

function parseFieldValue(field, rawValue) {
  if (field.type === 'checkbox') return rawValue;
  if (field.type === 'number') {
    if (rawValue === '' || rawValue === null || rawValue === undefined) return 0;
    const num = Number(rawValue);
    return Number.isFinite(num) ? num : 0;
  }
  if (field.key === 'source' && rawValue === '') return null;
  return rawValue;
}

function FieldInput({ field, value, onChange }) {
  const inputClass =
    'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

  if (field.type === 'checkbox') {
    return (
      <label className="flex cursor-pointer items-center gap-2 pt-6">
        <input
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        <span className="text-sm font-medium text-slate-700">{field.label}</span>
      </label>
    );
  }

  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-slate-500">{field.label}</span>
      <input
        type={field.type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </label>
  );
}

function buildItemFromDraft(fields, draft, cashflows) {
  const item = { ...draft, cashflows };
  fields.forEach((field) => {
    if (field.type === 'checkbox') {
      item[field.key] = draft[field.key] === true;
      return;
    }
    const raw = draft[field.key];
    item[field.key] = parseFieldValue(field, raw);
  });
  return item;
}

export default function ExpenseEditModal({ open, kind, item, saving, onClose, onSave }) {
  const fields = kind === 'loan' ? LOAN_FIELDS : LUMPSUM_FIELDS;
  const [draft, setDraft] = useState({});
  const [cashflowsText, setCashflowsText] = useState('[]');
  const [cashflowsError, setCashflowsError] = useState(null);

  useEffect(() => {
    if (!open || !item) return;
    setDraft({ ...item });
    setCashflowsText(JSON.stringify(item.cashflows || [], null, 2));
    setCashflowsError(null);
  }, [open, item]);

  if (!open || !item) return null;

  const updateField = (field, rawValue) => {
    setDraft((prev) => ({
      ...prev,
      [field.key]: field.type === 'checkbox' ? rawValue : rawValue,
    }));
  };

  const parseCashflows = () => {
    if (cashflowsText.trim() === '') return [];
    const parsed = JSON.parse(cashflowsText);
    if (!Array.isArray(parsed)) {
      throw new Error('Cashflows must be a JSON array.');
    }
    return parsed;
  };

  const handleCashflowsChange = (text) => {
    setCashflowsText(text);
    if (text.trim() === '') {
      setCashflowsError(null);
      return;
    }
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        setCashflowsError('Cashflows must be a JSON array.');
        return;
      }
      setCashflowsError(null);
    } catch {
      setCashflowsError('Invalid JSON.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cashflowsError) return;
    try {
      const cashflows = parseCashflows();
      onSave(buildItemFromDraft(fields, draft, cashflows));
    } catch (err) {
      setCashflowsError(err.message || 'Invalid JSON.');
    }
  };

  const title = kind === 'loan' ? 'Edit loan' : 'Edit lumpsum';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
        aria-label="Close"
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <FieldInput
              key={field.key}
              field={field}
              value={field.type === 'checkbox' ? draft[field.key] === true : draft[field.key] ?? ''}
              onChange={(value) => updateField(field, value)}
            />
          ))}
        </div>

        <label className="mt-4 block space-y-1.5">
          <span className="text-xs font-medium text-slate-500">Cashflows (JSON)</span>
          <textarea
            value={cashflowsText}
            onChange={(e) => handleCashflowsChange(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            spellCheck={false}
          />
          {cashflowsError && <p className="text-xs text-red-600">{cashflowsError}</p>}
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || Boolean(cashflowsError)}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'OK'}
          </button>
        </div>
      </form>
    </div>
  );
}
