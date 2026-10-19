import { useState } from 'react'

export default function AdForm({ onAdAdded, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Elektronika',
    location: '',
    contactPhone: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.price || !formData.location.trim()) {
      alert('Proszę wypełnić wymagane pola: Tytuł, Cena oraz Lokalizacja.')
      return
    }

    fetch('http://localhost:8080/api/advertisements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        price: parseFloat(formData.price)
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Błąd zapisu')
        return res.json()
      })
      .then(() => {
        alert('Ogłoszenie zostało pomyślnie dodane!')
        setFormData({
          title: '',
          description: '',
          price: '',
          category: 'Elektronika',
          location: '',
          contactPhone: ''
        })
        onAdAdded()
      })
      .catch((err) => console.error('Błąd dodawania ogłoszenia:', err))
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>Dodaj nowe ogłoszenie</h2>
        <button onClick={onCancel} style={styles.closeBtn}>✕</button>
      </div>

      <form onSubmit={handleSubmit} style={styles.grid}>
        <div>
          <label style={styles.label}>Tytuł ogłoszenia *</label>
          <input
            type="text"
            name="title"
            placeholder="np. iPhone 13 Pro 128GB"
            value={formData.title}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div>
          <label style={styles.label}>Kategoria *</label>
          <select name="category" value={formData.category} onChange={handleChange} style={styles.input}>
            <option value="Elektronika">Elektronika</option>
            <option value="Motoryzacja">Motoryzacja</option>
            <option value="Nieruchomości">Nieruchomości</option>
            <option value="Dom i Ogród">Dom i Ogród</option>
            <option value="Inne">Inne</option>
          </select>
        </div>

        <div>
          <label style={styles.label}>Cena (PLN) *</label>
          <input
            type="number"
            step="0.01"
            name="price"
            placeholder="np. 2500.00"
            value={formData.price}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div>
          <label style={styles.label}>Miejscowość *</label>
          <input
            type="text"
            name="location"
            placeholder="np. Warszawa"
            value={formData.location}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={styles.label}>Numer kontaktowy</label>
          <input
            type="text"
            name="contactPhone"
            placeholder="np. 600 700 800"
            value={formData.contactPhone}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={styles.label}>Opis przedmiotu</label>
          <textarea
            name="description"
            rows="3"
            placeholder="Opisz stan, wyposażenie lub powód sprzedaży..."
            value={formData.description}
            onChange={handleChange}
            style={{ ...styles.input, resize: 'vertical' }}
          />
        </div>

        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onCancel} style={styles.cancelBtn}>
            Anuluj
          </button>
          <button type="submit" style={styles.submitBtn}>
            Opublikuj ogłoszenie
          </button>
        </div>
      </form>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '8px',
    marginBottom: '30px',
    border: '1px solid #cbd5e1',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '10px'
  },
  title: {
    margin: 0,
    fontSize: '20px',
    color: '#002f34',
    fontWeight: '700'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#64748b'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '5px',
    color: '#334155'
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  cancelBtn: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '4px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  submitBtn: {
    backgroundColor: '#002f34',
    color: '#ffffff',
    border: 'none',
    padding: '10px 22px',
    borderRadius: '4px',
    fontWeight: '700',
    cursor: 'pointer'
  }
}