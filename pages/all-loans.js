import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { getLoans, updateLoans } from '../utils/loansApi';

export default function AllLoans() {
  const [loans, setLoans] = useState([]);
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLoans()
      .then(data => {
        setLoans(data);
        setError(null);
      })
      .catch(err => {
        setError('Failed to load loans. Invalid password or corrupted data.');
        console.error(err);
      });
  }, []);

  const handleChange = (index, field, value) => {
    setLoans(loans => loans.map((loan, i) => i === index ? { ...loan, [field]: value } : loan));
    setEditing(editing => ({ ...editing, [index]: true }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateLoans(loans);
      setEditing({});
      setError(null);
    } catch (err) {
      setError('Failed to save loans. Invalid password or corrupted data.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async (index) => {
    const updatedLoans = loans.filter((_, i) => i !== index);
    setLoans(updatedLoans);
    setEditing({});
    setLoading(true);
    try {
      await updateLoans(updatedLoans);
      setError(null);
    } catch (err) {
      setError('Failed to delete loan. Invalid password or corrupted data.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 32 }}>
      <Header />
      <h1>All Loans</h1>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {loans[0] && Object.keys(loans[0]).map(key => (
              <th key={key}>{key}</th>
            ))}
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan, idx) => (
            <tr key={idx}>
              {Object.entries(loan).map(([key, value]) => (
                <td key={key}>
                  <input
                    value={value}
                    onChange={e => handleChange(idx, key, e.target.value)}
                    style={{ width: '100%' }}
                  />
                </td>
              ))}
              <td>
                <button onClick={() => handleDelete(idx)} style={{ background: '#e00', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleSave} disabled={loading || Object.keys(editing).length === 0} style={{ marginTop: 16 }}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
