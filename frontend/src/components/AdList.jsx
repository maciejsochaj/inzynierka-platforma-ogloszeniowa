import AdCard from './AdCard'

export default function AdList({ ads, onDelete }) {
  if (ads.length === 0) {
    return (
      <div style={styles.empty}>
        <span style={{ fontSize: '40px' }}>🔍</span>
        <h3 style={{ margin: '10px 0 5px 0', color: '#1e293b' }}>Nie znaleziono ogłoszeń</h3>
        <p style={{ color: '#64748b', margin: 0 }}>
          Spróbuj zmienić parametry filtrów lub dodaj nowe ogłoszenie za pomocą górnego przycisku.
        </p>
      </div>
    )
  }

  return (
    <section>
      <div style={styles.bar}>
        <h2 style={styles.heading}>Wszystkie ogłoszenia</h2>
        <span style={styles.count}>Liczba ofert: {ads.length}</span>
      </div>

      <div style={styles.grid}>
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} onDelete={onDelete} />
        ))}
      </div>
    </section>
  )
}

const styles = {
  bar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  heading: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#002f34',
    margin: 0
  },
  count: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '600'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '18px'
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  }
}