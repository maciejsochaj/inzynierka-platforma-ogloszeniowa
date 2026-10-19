import { Link } from 'react-router-dom'

const PLACEHOLDER_IMG = 'https://placehold.co/600x400/e2e8f0/64748b?text=Brak+zdjęcia'

export default function AdCard({ ad, onDelete }) {
  return (
    <div style={styles.card}>
      <Link to={`/ogloszenie/${ad.id}`} style={styles.imageLink}>
        <img
          src={ad.imageUrl || PLACEHOLDER_IMG}
          alt={ad.title}
          style={styles.image}
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_IMG
          }}
        />
      </Link>

      <div style={styles.body}>
        <div style={styles.content}>
          <div style={styles.badgeRow}>
            <span style={styles.badge}>{ad.category}</span>
            <span style={styles.date}>
              {ad.createdAt ? new Date(ad.createdAt).toLocaleDateString('pl-PL') : 'Dzisiaj'}
            </span>
          </div>

          <Link to={`/ogloszenie/${ad.id}`} style={styles.titleLink}>
            <h3 style={styles.title} title={ad.title}>{ad.title}</h3>
          </Link>
          <p style={styles.price}>{Number(ad.price).toFixed(2)} PLN</p>
          <p style={styles.description}>{ad.description || 'Brak opisu przedmiotu.'}</p>
        </div>

        <div style={styles.footer}>
          <div style={styles.meta}>
            <div>📍 {ad.location}</div>
            {ad.contactPhone && <div>📞 {ad.contactPhone}</div>}
          </div>

          <div style={styles.actions}>
            <Link to={`/ogloszenie/${ad.id}`} style={styles.detailsBtn}>
              Szczegóły
            </Link>
            <button
              onClick={() => onDelete(ad.id, ad.title)}
              style={styles.deleteBtn}
              title="Usuń ofertę"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 2px 5px rgba(0,0,0,0.04)'
  },
  imageLink: {
    display: 'block',
    width: '100%',
    height: '170px',
    backgroundColor: '#f1f5f9',
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
  },
  body: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: 1
  },
  content: {
    marginBottom: '14px'
  },
  badgeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  badge: {
    backgroundColor: '#e6f7f8',
    color: '#00757a',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase'
  },
  date: {
    fontSize: '11px',
    color: '#94a3b8'
  },
  titleLink: {
    textDecoration: 'none',
    color: 'inherit'
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    color: '#002f34',
    fontWeight: '700',
    lineHeight: '1.3'
  },
  price: {
    margin: '0 0 10px 0',
    fontSize: '19px',
    fontWeight: '800',
    color: '#002f34'
  },
  description: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  footer: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  meta: {
    fontSize: '12px',
    color: '#64748b',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  actions: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center'
  },
  detailsBtn: {
    backgroundColor: '#f1f5f9',
    color: '#002f34',
    textDecoration: 'none',
    border: '1px solid #cbd5e1',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '700'
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '6px 9px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  }
}