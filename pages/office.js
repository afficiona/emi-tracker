import { useEffect, useState } from 'react';
import { getOffice, updateOffice } from '../utils/officeApi';
import Navigation from '../components/Navigation';

export default function Office() {
  const [office, setOffice] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState({});

  useEffect(() => {
    getOffice()
      .then(data => {
        setOffice(data);
        setError(null);
      })
      .catch(err => {
        setError('Failed to load office debts. Invalid password or corrupted data.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePaidChange = (index, value) => {
    const newOffice = [...office];
    newOffice[index].Paid = value ? Number(value) : 0;
    setOffice(newOffice);
    setEditing(prev => ({ ...prev, [index]: true }));
  };

  const handlePaidCheckbox = (index, checked) => {
    const newOffice = [...office];
    if (checked) {
      newOffice[index].Paid = newOffice[index].Amt;
    } else {
      newOffice[index].Paid = 0;
    }
    setOffice(newOffice);
    setEditing(prev => ({ ...prev, [index]: true }));
  };

  const handleSave = async () => {
    try {
      await updateOffice(office);
      setEditing({});
      setError(null);
    } catch (err) {
      setError('Failed to save office data.');
      console.error(err);
    }
  };

  const getBoderColor = (index) => {
    const debt = office[index];
    const paid = debt.Paid || 0;
    const total = debt.Amt;
    
    if (paid >= total) return '#2ecc40'; // Green - fully paid
    if (paid > 0) return '#ff9800'; // Orange - partially paid
    return '#e53935'; // Red - unpaid
  };

  const totalAmt = office.reduce((sum, debt) => sum + (debt.Amt || 0), 0);
  const totalPaid = office.reduce((sum, debt) => sum + (debt.Paid || 0), 0);
  const totalUnpaid = totalAmt - totalPaid;

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 360, width: '100%', padding: '20px' }}>
        <Navigation />
        <div style={{ marginBottom: 16, padding: 12, background: '#f7f7f7', borderRadius: 8, marginTop: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            ₹{totalUnpaid.toLocaleString()} / <span style={{ color: '#0070f3' }}>₹{totalAmt.toLocaleString()}</span>
          </div>
          <button
            onClick={handleSave}
            disabled={Object.keys(editing).length === 0}
            style={{
              marginTop: 8,
              background: '#0070f3',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: '14px',
              cursor: Object.keys(editing).length === 0 ? 'not-allowed' : 'pointer',
              opacity: Object.keys(editing).length === 0 ? 0.6 : 1
            }}
          >
            Save
          </button>
        </div>

        <h1>Office Debts</h1>
        {error && <p style={{ color: '#e53935' }}>{error}</p>}
        {loading && <p>Loading...</p>}
        {!loading && office.length === 0 && <p>No office debts</p>}
        {!loading && office.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {office.map((debt, idx) => {
              const paid = debt.Paid || 0;
              const remaining = debt.Amt - paid;
              return (
                <li key={idx} style={{
                  padding: '12px',
                  margin: '8px 0',
                  background: '#f7f7f7',
                  borderRadius: 8,
                  border: `2.5px solid ${getBoderColor(idx)}`
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>
                    {debt.Name}: ₹{debt.Amt}
                  </div>
                  {debt.Desc && <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>{debt.Desc}</div>}
                  <div style={{ fontSize: 12, color: paid >= debt.Amt ? '#2ecc40' : paid > 0 ? '#ff9800' : '#666', marginBottom: 8 }}>
                    Remaining: ₹{remaining.toLocaleString()}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <input
                      type="number"
                      value={paid || ''}
                      onChange={(e) => handlePaidChange(idx, e.target.value)}
                      max={debt.Amt}
                      min={0}
                      placeholder="Amount paid"
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        fontSize: 12
                      }}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={paid >= debt.Amt}
                        onChange={(e) => handlePaidCheckbox(idx, e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 12 }}>Paid off</span>
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
