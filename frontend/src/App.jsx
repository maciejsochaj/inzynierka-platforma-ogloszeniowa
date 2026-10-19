import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdDetails from './pages/AdDetails'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import AuthModal from './components/AuthModal'
import './App.css'

function Header({ showForm, setShowForm, currentUser, onOpenAuth, onLogout }) {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const isAdmin = currentUser && currentUser.role === 'ROLE_ADMIN'

  return (
    <header style={styles.nav}>
      <div style={styles.navContainer}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={styles.brand}>
            <span style={{ fontSize: '28px' }}>📢</span>
            <div>
              <h1 style={styles.logoText}>Portal<span style={{ color: '#23e5db' }}>Ogłoszeniowy</span></h1>
              <span style={styles.badge}>Projekt Inżynierski</span>
            </div>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* PRZYCISK PANELU ADMINA DLA ROLE_ADMIN */}
          {isAdmin && (
            <Link to="/admin" style={styles.adminNavBtn} title="Przejdź do panelu administracyjnego">
              🛡️ Panel Admina
            </Link>
          )}

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link to="/profil" style={styles.userProfileLink} title="Przejdź do swojego profilu">
                <span>👤 Witaj, <strong>{currentUser.fullName}</strong></span>
                <span style={styles.profileBadge}>Mój profil</span>
              </Link>

              <button onClick={onLogout} style={styles.logoutBtn}>
                Wyloguj
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} style={styles.loginBtn}>
              Zaloguj się
            </button>
          )}

          {isHomePage && (
            <button
              onClick={() => {
                if (!currentUser) {
                  alert('Musisz być zalogowany, aby dodać ogłoszenie!')
                  onOpenAuth()
                  return
                }
                setShowForm(!showForm)
              }}
              style={{
                ...styles.toggleBtn,
                backgroundColor: showForm ? '#ef4444' : '#23e5db',
                color: showForm ? '#ffffff' : '#002f34'
              }}
            >
              {showForm ? '✕ Zamknij formularz' : '+ Dodaj ogłoszenie'}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

function App() {
  const [showForm, setShowForm] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (savedUser && token) {
      setCurrentUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setCurrentUser(null)
    setShowForm(false)
    window.location.reload()
  }

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: '#f2f4f5', fontFamily: 'system-ui, sans-serif' }}>
        <Header
          showForm={showForm}
          setShowForm={setShowForm}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                showForm={showForm}
                setShowForm={setShowForm}
                currentUser={currentUser}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            }
          />
          <Route path="/ogloszenie/:id" element={<AdDetails currentUser={currentUser} />} />
          <Route
            path="/profil"
            element={
              <ProfilePage
                currentUser={currentUser}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/admin"
            element={<AdminPage currentUser={currentUser} />}
          />
        </Routes>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={(userData) => {
            setCurrentUser(userData)
          }}
        />
      </div>
    </BrowserRouter>
  )
}

const styles = {
  nav: {
    backgroundColor: '#002f34',
    color: '#ffffff',
    padding: '14px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    width: '100%'
  },
  navContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer'
  },
  logoText: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '800'
  },
  badge: {
    fontSize: '11px',
    color: '#a3b8b9',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  adminNavBtn: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    padding: '7px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '800',
    textDecoration: 'none',
    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)'
  },
  userProfileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#ffffff',
    textDecoration: 'none',
    backgroundColor: '#0a3d43',
    padding: '7px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    border: '1px solid #134e55',
    transition: 'all 0.2s ease'
  },
  profileBadge: {
    backgroundColor: '#23e5db',
    color: '#002f34',
    fontSize: '10px',
    fontWeight: '800',
    padding: '2px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase'
  },
  loginBtn: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '1px solid #23e5db',
    padding: '9px 18px',
    borderRadius: '4px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer'
  },
  logoutBtn: {
    backgroundColor: '#334155',
    color: '#ffffff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  toggleBtn: {
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
}

export default App