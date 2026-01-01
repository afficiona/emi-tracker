import { useEffect, useState } from 'react';
function getClosestDate(dueDay) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  let date = new Date(year, month, dueDay);
  if (date < today) {
    date = new Date(year, month + 1, dueDay);
  }
  return date;
}

export default function Home() {
  const [loans, setLoans] = useState([]);
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/loans')
      .then(res => res.json())
      .then(data => setLoans(data));
  }, []);

  const handlePaidChange = (index, checked) => {
    setLoans(loans => loans.map((loan, i) => i === index ? { ...loan, paid: checked ? loan.emi : null } : loan));
    setEditing(editing => ({ ...editing, [index]: true }));
  };

  const handleSave = async () => {
    setLoading(true);
    await fetch('/api/loans', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loans),
    });
    setEditing({});
    setLoading(false);
  };

  // Calculate unpaid and total EMI
  const totalEmi = loans.reduce((sum, loan) => sum + (Number(loan.emi) || 0), 0);
  const totalPaid = loans.reduce((sum, loan) => sum + (Number(loan.paid) || 0), 0);
  const unpaidEmi = totalEmi - totalPaid;

  // Group loans by due_day
  const groups = {};
  loans.forEach((loan, idx) => {
    if (!groups[loan.due_day]) groups[loan.due_day] = [];
    groups[loan.due_day].push({ ...loan, idx });
  });
  const sortedDays = Object.keys(groups).sort((a, b) => {
    const dateA = getClosestDate(Number(a));
    const dateB = getClosestDate(Number(b));
    return dateA - dateB;
  });

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 360, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 360,
          zIndex: 1000,
          background: '#fff',
          boxShadow: '0 2px 8px #ccc',
          borderRadius: 0,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          fontWeight: 600,
          fontSize: 15,
          gap: 12,
        }}>
          <span style={{ fontSize: 15, color: '#333' }}>
            ₹{unpaidEmi.toLocaleString()} / <span style={{ color: '#0070f3', fontWeight: 700 }}>₹{totalEmi.toLocaleString()}</span>
          </span>
          <button
            onClick={handleSave}
            disabled={loading || Object.keys(editing).length === 0}
            style={{
              marginLeft: 'auto',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: '14px',
              boxShadow: '0 2px 8px #ccc',
            }}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => window.location.href = '/all-loans'}
            style={{
              marginLeft: 8,
              background: '#43a047',
              color: 'white',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: '14px',
              boxShadow: '0 2px 8px #ccc',
              cursor: 'pointer',
            }}
          >
            Edit
          </button>
          <button
            onClick={async () => {
              const code = window.prompt('Enter reset code:');
              if (code === '3722') {
                const resetLoans = loans.map(loan => ({ ...loan, paid: 0 }));
                setLoans(resetLoans);
                setEditing({});
                setLoading(true);
                await fetch('/api/loans', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(resetLoans),
                });
                setLoading(false);
              } else if (code !== null) {
                window.alert('Incorrect code. Reset cancelled.');
              }
            }}
            style={{
              marginLeft: 8,
              background: '#e53935',
              color: 'white',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: '14px',
              boxShadow: '0 2px 8px #ccc',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </div>
        <div style={{ padding: '80px 0 0 0', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Removed 'Upcoming EMIs' heading as requested */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 18, width: '100%' }}>
            {sortedDays.map(day => {
              const group = groups[day];
              const groupDate = getClosestDate(Number(day));
              const groupTotalEmi = group.reduce((sum, loan) => sum + (Number(loan.emi) || 0), 0);
              const groupTotalPaid = group.reduce((sum, loan) => sum + (Number(loan.paid) || 0), 0);
              // Determine border color: green if all paid, orange otherwise
              const allPaid = groupTotalEmi > 0 && groupTotalEmi === groupTotalPaid;
              const borderColor = allPaid ? '#2ecc40' : '#ff9800';
              return (
                <div key={day} style={{
                  borderRadius: 18,
                  background: '#f7f7f7',
                  marginBottom: 0,
                  padding: '14px 10px 10px 10px',
                  boxShadow: '0 2px 12px #eee',
                  border: `2.5px solid ${borderColor}`,
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                    padding: '0 4px',
                    fontWeight: 600,
                    fontSize: 15,
                  }}>
                    <span>Due: {groupDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {allPaid ? null : (
                      <span style={{ color: '#ff9800', fontWeight: 600 }}>
                        ₹{(groupTotalEmi - groupTotalPaid).toLocaleString()} left
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {group.map(loan => {
                      const paid = Number(loan.paid) === Number(loan.emi);
                      return (
                        <div key={loan.idx} style={{
                          background: '#fff',
                          borderRadius: 10,
                          boxShadow: '0 2px 8px #eee',
                          padding: 14,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          position: 'relative',
                          marginBottom: 0,
                        }}>
                          <label style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4, fontSize: 15, fontWeight: 500 }}>
                            <input
                              type="checkbox"
                              checked={paid}
                              onChange={e => handlePaidChange(loan.idx, e.target.checked)}
                              style={{ width: 18, height: 18 }}
                            /> Paid
                          </label>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>{loan.name}</div>
                          <div style={{ fontSize: '1.05rem', color: '#0070f3', marginBottom: 4 }}>₹{Number(loan.emi).toLocaleString()}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {/* Add extra space at the bottom of the list */}
            <div style={{ height: 40 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
