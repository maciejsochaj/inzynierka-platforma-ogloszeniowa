import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function AdminPage({ currentUser }) {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalUsers: 0, totalAds: 0, totalValue: 0 })
  const [users, setUsers] = useState([])
  const [ads, setAds] = useState([])
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'users' | 'ads'
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')

  useEffect(() => {
    // Sprawdzenie czy użytkownik ma uprawnienia
    if (!currentUser || currentUser.role !== 'ROLE_ADMIN') {
      alert('Dostęp do tego panelu mają wyłącznie administratorzy!')
      navigate('/')
      return
    }

    // Pobranie statystyk i danych
    Promise.all([
      fetch('http://localhost:8080/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json()),
      fetch('http://localhost:8080/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json()),
      fetch('http://localhost:8080/api/advertisements?size=100', { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json())
    ])
      .then(([statsData, usersData, adsData]) => {
        setStats(statsData)
        setUsers(usersData || [])
        setAds(adsData.content || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Błąd pobierania danych admina:', err)
        setLoading(false)
      })
  }, [currentUser])

  // Usuwanie ogłoszenia przez moderatora
  const handleDeleteAd = (id, title) => {
    if (!window.confirm(`[MODERACJA] Czy na pewno chcesz usunąć ogłoszenie "${title}"?`)) return

    fetch(`http://localhost:8080/api/advertisements/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (res.ok) {
          setAds((prev) => prev.filter((a) => a.id !== id))
          setStats((prev) => ({ ...prev, totalAds: prev.totalAds - 1 }))
        } else {
          alert('Błąd usuwania ogłoszenia.')
        }
      })
      .catch((err) => console.error(err))
  }

  // Usuwanie użytkownika
  const handleDeleteUser = (id, email) => {
    if (email === currentUser.email) {
      alert('Nie możesz usunąć swojego własnego konta administratora!')
      return
    }

    if (!window.confirm(`Czy na pewno chcesz usunąć konto użytkownika "${email}"?`)) return

    fetch(`http://localhost:8080/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (res.ok) {
          setUsers((prev) => prev.filter((u) => u.id !== id))
          setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers - 1 }))
        } else {
          alert('Błąd usuwania użytkownika.')
        }
      })
      .catch((err) => console.error(err))
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>
        Ładowanie panelu administratora...
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <Link to="/" style={styles.backLink}>← Wróć do serwisu</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={styles.pageTitle}>Panel Administratora</h1>
            <span style={styles.adminBadge}>ROLE_ADMIN</span>
          </div>
        </div>
      </div>

      {/* KAFELKI ZE STATYSTYKAMI */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>👥</span>
          <div>
            <span style={styles.statValue}>{stats.totalUsers}</span>
            <span style={styles.statLabel}>Zarejestrowanych użytkowników</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statIcon}>📢</span>
          <div>
            <span style={styles.statValue}>{stats.totalAds}</span>
            <span style={styles.statLabel}>Aktywnych ogłoszeń</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statIcon}>💰</span>
          <div>
            <span style={styles.statValue}>{Number(stats.totalValue || 0).toFixed(2)} PLN</span>
            <span style={styles.statLabel}>Łączna wartość ofert</span>
          </div>
        </div>
      </div>

      {/* PRZEŁĄCZNIK ZAKŁADEK */}
      <div style={styles.tabsBar}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            ...styles.tabItem,
            borderBottom: activeTab === 'overview' ? '3px solid #002f34' : 'none',
            fontWeight: activeTab === 'overview' ? '800' : '600'
          }}
        >
          Przegląd ogłoszeń ({ads.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            ...styles.tabItem,
            borderBottom: activeTab === 'users' ? '3px solid #002f34' : 'none',
            fontWeight: activeTab === 'users' ? '800' : '600'
          }}
        >
          Użytkownicy serwisu ({users.length})
        </button>
      </div>

      {/* ZAKŁADKA 1: MODERACJA OGŁOSZEŃ */}
      {activeTab === 'overview' && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Tytuł ogłoszenia</th>
                <th style={styles.th}>Kategoria</th>
                <th style={styles.th}>Cena</th>
                <th style={styles.th}>Autor</th>
                <th style={styles.th}>Akcje moderacji</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad.id} style={styles.tr}>
                  <td style={styles.td}>#{ad.id}</td>
                  <td style={styles.td}>
                    <Link to={`/ogloszenie/${ad.id}`} style={{ fontWeight: '700', color: '#002f34' }}>
                      {ad.title}
                    </Link>
                  </td>
                  <td style={styles.td}>{ad.category}</td>
                  <td style={styles.td}>{Number(ad.price).toFixed(2)} PLN</td>
                  <td style={styles.td}>
                    {ad.user ? `${ad.user.fullName} (${ad.user.email})` : 'Anonim / Brak'}
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => handleDeleteAd(ad.id, ad.title)} style={styles.dangerBtn}>
                      🗑️ Usuń z portalu
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ZAKŁADKA 2: ZARZĄDZANIE UŻYTKOWNIKAMI */}
      {activeTab === 'users' && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Imię i nazwisko</th>
                <th style={styles.th}>Adres e-mail</th>
                <th style={styles.th}>Rola w systemie</th>
                <th style={styles.th}>Zarządzanie</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={styles.tr}>
                  <td style={styles.td}>#{u.id}</td>
                  <td style={{ ...styles.td, fontWeight: '700' }}>{u.fullName}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '800',
                        backgroundColor: u.role === 'ROLE_ADMIN' ? '#fee2e2' : '#e0f2fe',
                        color: u.role === 'ROLE_ADMIN' ? '#b91c1c' : '#0369a1'
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {u.email !== currentUser.email && (
                      <button onClick={() => handleDeleteUser(u.id, u.email)} style={styles.dangerBtn}>
                        Zablokuj / Usuń konto
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1280px',
    margin: '30px auto',
    padding: '0 20px',
    fontFamily: 'system-ui, sans-serif'
  },
  headerRow: {
    marginBottom: '25px'
  },
  backLink: {
    display: 'inline-block',
    marginBottom: '10px',
    color: '#002f34',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '14px'
  },
  pageTitle: {
    margin: 0,
    fontSize: '26px',
    fontWeight: '800',
    color: '#002f34'
  },
  adminBadge: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '800',
    padding: '3px 8px',
    borderRadius: '4px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '35px'
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
  },
  statIcon: {
    fontSize: '36px'
  },
  statValue: {
    display: 'block',
    fontSize: '24px',
    fontWeight: '900',
    color: '#002f34'
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '600'
  },
  tabsBar: {
    display: 'flex',
    gap: '20px',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: '20px'
  },
  tabItem: {
    background: 'none',
    border: 'none',
    padding: '12px 6px',
    fontSize: '15px',
    color: '#002f34',
    cursor: 'pointer'
  },
  tableWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    overflowX: 'auto',
    boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  thRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  th: {
    padding: '14px 16px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9'
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#334155'
  },
  dangerBtn: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  }
}