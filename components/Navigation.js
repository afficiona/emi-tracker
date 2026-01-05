export default function Navigation() {
  return (
    <div style={{ padding: '12px 18px 0 18px', width: '100%', display: 'flex', gap: 16, justifyContent: 'center' }}>
      <a href="/" style={{ padding: '8px 16px', background: '#f0f0f0', borderRadius: 8, textDecoration: 'none', color: '#333', fontWeight: 600, fontSize: 14 }}>EMI</a>
      <a href="/office" style={{ padding: '8px 16px', background: '#f0f0f0', borderRadius: 8, textDecoration: 'none', color: '#333', fontWeight: 600, fontSize: 14 }}>Office</a>
      <a href="/friends" style={{ padding: '8px 16px', background: '#f0f0f0', borderRadius: 8, textDecoration: 'none', color: '#333', fontWeight: 600, fontSize: 14 }}>Friends</a>
    </div>
  );
}
