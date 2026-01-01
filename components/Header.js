import Link from 'next/link';

const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  textDecoration: 'none',
  color: '#0070f3',
  fontWeight: 600,
};

export default function Header() {
  return (
    <header style={{ background: '#fff', padding: '16px 32px', boxShadow: '0 2px 8px #eee', display: 'flex', alignItems: 'center', gap: 32 }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link href="/" style={linkStyle}>
          <span style={{ fontSize: 20 }}>🏠</span> Home
        </Link>
        <Link href="/all-loans" style={linkStyle}>
          All Loans
        </Link>
      </nav>
    </header>
  );
}
