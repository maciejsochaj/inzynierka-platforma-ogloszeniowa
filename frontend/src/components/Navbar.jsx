import { Link, useLocation } from 'react-router-dom'

export default function Navbar({ onToggleForm, isFormVisible }) {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <header style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.brandLink}>
          <div style={styles.brand}>
            <span style={styles.logoIcon}>📢</span>
            <div>
              <h1 style={styles.logoText}>Ogłoszenia<span style={{ color: '#23e5db' }}>Lokalne</span></h1>
              <span style={styles.badge}>Projekt Inżynierski</span>
            </div>
          </div>
        </Link>

        {isHomePage && (
          <button
            onClick={onToggleForm}
            style={{
              ...styles.addButton,
              backgroundColor: isFormVisible ? '#ef4444' : '#23e5db',
              color: isFormVisible ? '#ffffff' : '#002f34'
            }}
          >
            {isFormVisible ? '✕ Zamknij formularz' : '+ Dodaj ogłoszenie'}
          </button>
        )}
      </div>
    </header>
  )
}

const styles = {
  nav: {
    backgroundColor: '#002f34',
    color: '#ffffff',
    padding: '14px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brandLink: {
    textDecoration: 'none',
    color: 'inherit'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoIcon: {
    fontSize: '28px'
  },
  logoText: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.5px'
  },
  badge: {
    fontSize: '11px',
    color: '#a3b8b9',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  addButton: {
    border: 'none',
    padding: '10px 22px',
    borderRadius: '4px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
}