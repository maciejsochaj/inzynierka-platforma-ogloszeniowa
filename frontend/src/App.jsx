import { useState, useEffect } from 'react'

function App() {
  const [ads, setAds] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Elektronika',
    location: '',
    contactPhone: ''
  })

  // Pobieranie ogłoszeń z bazy
  const fetchAds = () => {
    fetch('http://localhost:8080/api/advertisements')
      .then((res) => res.json())
      .then((data) => setAds(data))
      .catch((err) => console.error('Błąd pobierania:', err))
  }

  useEffect(() => {
    fetchAds()
  }, [])

  // Obsługa pól formularza
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Zapis nowego ogłoszenia do bazy
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title || !formData.price || !formData.location) {
      alert('Uzupełnij wymagane pola (tytuł, cena, lokalizacja)!')
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
      .then((res) => res.json())
      .then(() => {
        setFormData({
          title: '',
          description: '',
          price: '',
          category: 'Elektronika',
          location: '',
          contactPhone: ''
        })
        fetchAds()
      })
      .catch((err) => console.error('Błąd dodawania:', err))
  }

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <header style={{ borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', margin: 0 }}>Portal Ogłoszeniowy</h1>
        <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>Projekt Inżynierski</p>
      </header>

      {/* Formularz dodawania ogłoszenia */}
      <section style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '40px' }}>
        <h2 style={{ marginTop: 0, fontSize: '20px', color: '#333' }}>Dodaj nowe ogłoszenie</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tytuł *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              placeholder="np. Rower górski Trek"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Kategoria *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            >
              <option value="Elektronika">Elektronika</option>
              <option value="Motoryzacja">Motoryzacja</option>
              <option value="Nieruchomości">Nieruchomości</option>
              <option value="Dom i Ogród">Dom i Ogród</option>
              <option value="Inne">Inne</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Cena (PLN) *</label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              placeholder="np. 1500.00"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Lokalizacja (miasto) *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              placeholder="np. Warszawa"
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Telefon kontaktowy</label>
            <input
              type="text"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              placeholder="np. 600700800"
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Opis</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              placeholder="Szczegółowy opis przedmiotu..."
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <button
              type="submit"
              style={{
                background: '#27ae60',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                fontSize: '16px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Dodaj ogłoszenie
            </button>
          </div>
        </form>
      </section>

      {/* Lista ogłoszeń z bazy */}
      <section>
        <h2 style={{ fontSize: '20px', color: '#333' }}>Aktualne ogłoszenia ({ads.length})</h2>
        {ads.length === 0 ? (
          <p style={{ color: '#888' }}>Brak ogłoszeń w bazie.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {ads.map((ad) => (
              <div
                key={ad.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '16px',
                  background: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <span
                  style={{
                    background: '#e0f2fe',
                    color: '#0369a1',
                    fontSize: '12px',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {ad.category}
                </span>
                <h3 style={{ margin: '10px 0 5px 0', fontSize: '18px' }}>{ad.title}</h3>
                <p style={{ color: '#27ae60', fontSize: '20px', fontWeight: 'bold', margin: '5px 0' }}>
                  {Number(ad.price).toFixed(2)} PLN
                </p>
                <p style={{ color: '#555', fontSize: '14px', margin: '5px 0 10px 0' }}>{ad.description}</p>
                <div style={{ borderTop: '1px solid #eee', paddingTop: '8px', fontSize: '12px', color: '#888' }}>
                  <div>📍 {ad.location}</div>
                  {ad.contactPhone && <div>📞 {ad.contactPhone}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default App