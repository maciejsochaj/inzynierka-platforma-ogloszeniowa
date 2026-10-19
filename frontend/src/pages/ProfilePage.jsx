import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const PLACEHOLDER_IMG = 'https://placehold.co/600x400/e2e8f0/64748b?text=Brak+zdj%C4%99cia'

export default function ProfilePage({ currentUser, onOpenAuth }) {
  const navigate = useNavigate()
  const [myAds, setMyAds] = useState([])
  const [loading, setLoading] = useState(true)

  // Pobranie ogłoszeń zalogowanego użytkownika
  const fetchMyAds = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    fetch('http://localhost:8080/api/advertisements?onlyMine=true&size=100', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Błąd serwera')
        return res.json()
      })
      .then((data) => {
        setMyAds(data.content || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    if (!currentUser) {
      const savedUser = localStorage.getItem('user')
      if (!savedUser) {
        navigate('/')
        return
      }
    }
    fetchMyAds()
  }, [currentUser])

  const handleDelete = (id, title) => {
    const token = localStorage.getItem('token')
    if (!window.confirm(`Czy na pewno chcesz usunąć ogłoszenie "${title}"?`)) return

    fetch(`http://localhost:8080/api/advertisements/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.ok) {
          setMyAds((prev) => prev.filter((ad) => ad.id !== id))
        } else {
          alert('Błąd podczas usuwania.')
        }
      })
      .catch((err) => console.error(err))
  }

  if (!currentUser) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyCard}>
          <h2>Musisz być zalogowany</h2>
          <p>Zaloguj się, aby uzyskać dostęp do swojego panelu profilu.</p>
          <button onClick={onOpenAuth} style={styles.actionBtn}>
            Zaloguj się
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <Link to="/" style={styles.backLink}>
        ← Wróć do strony głównej
      </Link>

      {/* KARTA PROFILU UŻYTKOWNIKA */}
      <div style={styles.profileHeaderCard}>
        <div style={styles.avatarCircle}>
          {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : '👤'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={styles.profileName}>{currentUser.fullName}</h1>
            <span style={styles.roleBadge}>
              {currentUser.role === 'ROLE_ADMIN' ? 'Administrator' : 'Użytkownik'}
            </span>
          </div>
          <p style={styles.profileEmail}>📧 {currentUser.email}</p>
        </div>
        <div style={styles.statsBox}>
          <span style={styles.statsNumber}>{myAds.length}</span>
          <span style={styles.statsLabel}>Twoich ogłoszeń</span>
        </div>
      </div>

      {/* LISTA OGŁOSZEŃ UŻYTKOWNIKA */}
      <div style={styles.sectionHeader}>
        <h2 style={{ fontSize: '20px', color: '#002f34', margin: 0 }}>
          Zarządzaj swoimi ogłoszeniami
        </h2>
        <Link to="/" style={styles.addAdLink}>
          + Dodaj nowe ogłoszenie
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Ładowanie Twoich ofert...
        </div>
      ) : myAds.length === 0 ? (
        <div style={styles.emptyCard}>
          <span style={{ fontSize: '48px' }}>📦</span>
          <h3 style={{ margin: '14px 0 6px 0', color: '#002f34' }}>Nie wystawiłeś jeszcze żadnego ogłoszenia</h3>
          <p style={{ color: '#64748b', margin: '0 0 20px 0' }}>
            Masz coś na sprzedaż? Wystaw swój pierwszy przedmiot w kilka chwil.
          </p>
          <Link to="/" style={styles.actionBtn}>
            Przejdź na stronę główną i dodaj ogłoszenie
          </Link>
        </div>
      ) : (
        <div style={styles.adsList}>
          {myAds.map((ad) => (
            <div key={ad.id} style={styles.adRowCard}>
              <img
                src={ad.imageUrl || PLACEHOLDER_IMG}
                alt={ad.title}
                style={styles.adThumb}
                onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG }}
              />

              <div style={styles.adInfo}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={styles.catBadge}>{ad.category}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {ad.createdAt ? new Date(ad.createdAt).toLocaleDateString('pl-PL') : 'Dzisiaj'}
                  </span>
                </div>
                <Link to={`/ogloszenie/${ad.id}`} style={styles.adTitle}>
                  {ad.title}
                </Link>
                <div style={styles.adPrice}>{Number(ad.price).toFixed(2)} PLN</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                  📍 {ad.location} {ad.contactPhone ? `• 📞 ${ad.contactPhone}` : ''}
                </div>
              </div>

              <div style={styles.adActions}>
                <Link to={`/ogloszenie/${ad.id}`} style={styles.viewBtn}>
                  Podgląd
                </Link>
                <button onClick={() => handleDelete(ad.id, ad.title)} style={styles.deleteBtn}>
                  🗑️ Usuń
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1080px',
    margin: '30px auto',
    padding: '0 20px',
    fontFamily: 'system-ui, sans-serif'
  },
  backLink: {
    display: 'inline-block',
    marginBottom: '20px',
    color: '#002f34',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '14px'
  },
  profileHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '24px 30px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    marginBottom: '35px'
  },
  avatarCircle: {
    width: '74px',
    height: '74px',
    borderRadius: '50%',
    backgroundColor: '#002f34',
    color: '#23e5db',
    fontSize: '32px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileName: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '800',
    color: '#002f34'
  },
  roleBadge: {
    backgroundColor: '#e6f7f8',
    color: '#00757a',
    fontSize: '11px',
    fontWeight: '800',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase'
  },
  profileEmail: {
    margin: '6px 0 0 0',
    fontSize: '14px',
    color: '#64748b'
  },
  statsBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px 24px',
    textAlign: 'center'
  },
  statsNumber: {
    display: 'block',
    fontSize: '28px',
    fontWeight: '900',
    color: '#002f34'
  },
  statsLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  addAdLink: {
    backgroundColor: '#002f34',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '9px 18px',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '13px'
  },
  emptyCard: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  actionBtn: {
    display: 'inline-block',
    backgroundColor: '#002f34',
    color: '#ffffff',
    padding: '11px 22px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer'
  },
  adsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  adRowCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '16px',
    display: 'flex',
    gap: '18px',
    alignItems: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
  },
  adThumb: {
    width: '120px',
    height: '90px',
    borderRadius: '6px',
    objectFit: 'contain',
    backgroundColor: '#f1f5f9'
  },
  adInfo: {
    flex: 1
  },
  catBadge: {
    backgroundColor: '#e6f7f8',
    color: '#00757a',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  adTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#002f34',
    textDecoration: 'none'
  },
  adPrice: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#002f34',
    marginTop: '4px'
  },
  adActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: '100px'
  },
  viewBtn: {
    backgroundColor: '#f1f5f9',
    color: '#002f34',
    textAlign: 'center',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '700',
    textDecoration: 'none',
    border: '1px solid #cbd5e1'
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  }
}