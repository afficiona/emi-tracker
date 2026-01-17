import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { getLoans, updateLoans } from '../utils/loansApi';
import { getFriends, updateFriends } from '../utils/friendsApi';
import { getOffice, updateOffice } from '../utils/officeApi';

export default function AllLoans() {
  const [loans, setLoans] = useState([]);
  const [friends, setFriends] = useState([]);
  const [office, setOffice] = useState([]);
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getLoans(), getFriends(), getOffice()])
      .then(([loansData, friendsData, officeData]) => {
        setLoans(loansData);
        setFriends(friendsData);
        setOffice(officeData);
        setError(null);
      })
      .catch(err => {
        setError('Failed to load data. Invalid password or corrupted data.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (type, index, field, value) => {
    if (type === 'loans') {
      setLoans(loans => loans.map((loan, i) => i === index ? { ...loan, [field]: value } : loan));
    } else if (type === 'friends') {
      setFriends(friends => friends.map((friend, i) => i === index ? { ...friend, [field]: value } : friend));
    } else if (type === 'office') {
      setOffice(office => office.map((item, i) => i === index ? { ...item, [field]: value } : item));
    }
    setEditing(editing => ({ ...editing, [`${type}-${index}`]: true }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await Promise.all([updateLoans(loans), updateFriends(friends), updateOffice(office)]);
      setEditing({});
      setError(null);
    } catch (err) {
      setError('Failed to save data. Invalid password or corrupted data.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async (type, index) => {
    if (type === 'loans') {
      const updatedLoans = loans.filter((_, i) => i !== index);
      setLoans(updatedLoans);
      await updateLoans(updatedLoans);
    } else if (type === 'friends') {
      const updatedFriends = friends.filter((_, i) => i !== index);
      setFriends(updatedFriends);
      await updateFriends(updatedFriends);
    } else if (type === 'office') {
      const updatedOffice = office.filter((_, i) => i !== index);
      setOffice(updatedOffice);
      await updateOffice(updatedOffice);
    }
    setEditing({});
  };

  const handleAddEntry = (type) => {
    if (type === 'loans' && loans.length > 0) {
      const newEntry = Object.keys(loans[0]).reduce((acc, key) => ({ ...acc, [key]: '' }), {});
      setLoans([...loans, newEntry]);
      setEditing(editing => ({ ...editing, [`loans-${loans.length}`]: true }));
    } else if (type === 'friends' && friends.length > 0) {
      const newEntry = Object.keys(friends[0]).reduce((acc, key) => ({ ...acc, [key]: '' }), {});
      setFriends([...friends, newEntry]);
      setEditing(editing => ({ ...editing, [`friends-${friends.length}`]: true }));
    } else if (type === 'office' && office.length > 0) {
      const newEntry = Object.keys(office[0]).reduce((acc, key) => ({ ...acc, [key]: '' }), {});
      setOffice([...office, newEntry]);
      setEditing(editing => ({ ...editing, [`office-${office.length}`]: true }));
    }
  };

  const renderTable = (title, type, data) => {
    if (!data || data.length === 0) return null;
    
    return (
      <div style={{ marginBottom: 32 }}>
        <h2>{title}</h2>
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {Object.keys(data[0]).map(key => (
                <th key={key}>{key}</th>
              ))}
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx}>
                {Object.entries(item).map(([key, value]) => (
                  <td key={key}>
                    <input
                      value={value}
                      onChange={e => handleChange(type, idx, key, e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </td>
                ))}
                <td>
                  <button onClick={() => handleDelete(type, idx)} style={{ background: '#e00', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button 
          onClick={() => handleAddEntry(type)} 
          style={{ 
            marginTop: 8,
            background: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: 4, 
            padding: '8px 16px', 
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          + Add Entry
        </button>
      </div>
    );
  };

  if (loading) return <div style={{ padding: 32 }}><Header /><p>Loading...</p></div>;

  return (
    <div style={{ padding: 32 }}>
      <Header />
      <h1>All Debts & Loans</h1>
      {error && <p style={{ color: '#e53935' }}>{error}</p>}
      
      {renderTable('Loans', 'loans', loans)}
      {renderTable('Office Debts', 'office', office)}
      {renderTable('Friends Debts', 'friends', friends)}
      
      <button onClick={handleSave} disabled={loading || Object.keys(editing).length === 0} style={{ marginTop: 16 }}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
