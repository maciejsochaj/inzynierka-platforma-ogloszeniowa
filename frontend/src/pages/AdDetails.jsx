import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

const PLACEHOLDER_IMG = 'https://placehold.co/800x500/e2e8f0/64748b?text=Brak+zdj%C4%99cia'

export default function AdDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [ad, setAd] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPhone, setShowPhone] = useState(false)

  useEffect(() => {
    fetch(`http://localhost:8080/api/advertisements/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Nie znaleziono ogłoszenia')
        return res.json()
      })
      .then((data) => {
        setAd(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  const handleDelete = () => {
    if (!window.confirm(`Czy na pewno chcesz usunąć ogłoszenie "${ad.title}"?`)) return

    fetch(`http://localhost:8080/api/advertisements/${id}`, {
      method: 'DELETE'
    })
      .then((res) => {
        if (res.ok) {
          alert('Ogłoszenie zostało usunięte.')
          navigate('/')
        } else {
          alert('Błąd podczas usuwania.')
        }
      })
      .catch((err) => console.error('Błąd usuwania:', err))
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b', fontSize: '18px' }}>
        ⏳ Ładowanie ogłoszenia...
      </div>
    )
  }

  if (error || !ad) {
    return (
      <div style={styles.errorBox}>
        <span style={{ fontSize: '48px' }}>⚠️</span>
        <h2 style={{ margin: '15px 0 8px 0', color: '#002f34' }}>Nie znaleziono ogłoszenia</h2>
        <p style={{ color: '#64748b', margin: '0 0 20px 0' }}>
          To ogłoszenie mogło zostać usunięte lub podany adres URL jest błędny.
        </p>
        <Link to="/" style={styles.backButton}>
          ← Wróć do strony głównej
        </Link>
      </div>
    )
  }

  const getMaskedPhone = (phone) => {
    if (!phone) return 'Brak numeru telefonu'
    const cleaned = phone.trim()
    if (cleaned.length <= 3) return '••• ••• •••'
    return cleaned.slice(0, 3) + ' ••• •••'
  }

  return (
    <div style={styles.container}>
      <Link to="/" style={styles.backLink}>
        ← Wróć do listy wszystkich ogłoszeń
      </Link>

      <div style={styles.detailsLayout}>
        <div style={styles.leftColumn}>
          <div style={styles.mainImageCard}>
            <img
              src={ad.imageUrl || PLACEHOLDER_IMG}
              alt={ad.title}
              style={styles.mainImage}
              onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG }}
            />
          </div>

          <div style={styles.contentCard}>
            <div style={styles.badgeRow}>
              <span style={styles.categoryBadge}>{ad.category}</span>
              <span style={styles.dateText}>
                Dodano: {ad.createdAt ? new Date(ad.createdAt).toLocaleString('pl-PL') : 'Brak daty'}
              </span>
            </div>

            <h1 style={styles.title}>{ad.title}</h1>

            <div style={styles.section}>
              <h3 style={styles.sectionHeading}>Opis przedmiotu</h3>
              <p style={styles.description}>
                {ad.description || 'Sprzedający nie dodał szczegółowego opisu.'}
              </p>
            </div>
          </div>
        </div>

        <div style={styles.rightColumn}>
          <div style={styles.sidebarCard}>
            <span style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
              Cena
            </span>
            <div style={styles.price}>{Number(ad.price).toFixed(2)} PLN</div>

            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '20px 0' }} />

            <div style={{ marginBottom: '20px' }}>
              <div style={styles.infoRow}>
                <span style={{ fontSize: '20px' }}>📍</span>
                <div>
                  <span style={styles.infoLabel}>Lokalizacja</span>
                  <span style={styles.infoValue}>{ad.location}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={styles.infoRow}>
                <span style={{ fontSize: '20px' }}>📞</span>
                <div style={{ flex: 1 }}>
                  <span style={styles.infoLabel}>Telefon kontaktowy</span>
                  <div style={styles.phoneBox}>
                    <span style={styles.phoneNumber}>
                      {showPhone ? (ad.contactPhone || 'Brak numeru') : getMaskedPhone(ad.contactPhone)}
                    </span>
                    {ad.contactPhone && !showPhone && (
                      <button onClick={() => setShowPhone(true)} style={styles.showPhoneBtn}>
                        Pokaż numer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '20px 0' }} />

            <button onClick={handleDelete} style={styles.deleteBtn}>
              🗑️ Usuń to ogłoszenie
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1280px',
    margin: '25px auto',
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
  detailsLayout: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '25px',
    alignItems: 'start'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  mainImageCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '15px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '380px',
    maxHeight: '520px',
    overflow: 'hidden'
  },
  mainImage: {
    maxWidth: '100%',
    maxHeight: '480px',
    objectFit: 'contain',
    display: 'block'
  },
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '24px'
  },
  badgeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  categoryBadge: {
    backgroundColor: '#e6f7f8',
    color: '#00757a',
    fontSize: '12px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '4px',
    textTransform: 'uppercase'
  },
  dateText: {
    fontSize: '12px',
    color: '#94a3b8'
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '26px',
    fontWeight: '800',
    color: '#002f34'
  },
  section: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '20px'
  },
  sectionHeading: {
    fontSize: '15px',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px'
  },
  description: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#334155',
    whiteSpace: 'pre-line',
    margin: 0
  },
  rightColumn: {
    position: 'sticky',
    top: '90px'
  },
  sidebarCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
  },
  price: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#002f34',
    marginTop: '6px'
  },
  infoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  infoLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  infoValue: {
    fontSize: '16px',
    color: '#002f34',
    fontWeight: '700'
  },
  phoneBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '4px',
    flexWrap: 'wrap'
  },
  phoneNumber: {
    fontSize: '16px',
    color: '#002f34',
    fontWeight: '700'
  },
  showPhoneBtn: {
    backgroundColor: '#002f34',
    color: '#ffffff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '11px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    width: '100%'
  },
  errorBox: {
    maxWidth: '500px',
    margin: '60px auto',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  backButton: {
    display: 'inline-block',
    backgroundColor: '#002f34',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: '700'
  }
}