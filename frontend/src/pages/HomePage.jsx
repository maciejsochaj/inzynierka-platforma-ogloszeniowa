import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const PLACEHOLDER_IMG = 'https://placehold.co/600x400/e2e8f0/64748b?text=Brak+zdj%C4%99cia'

export default function HomePage({ showForm, setShowForm, currentUser, onOpenAuth }) {
  const [ads, setAds] = useState([])
  const [editingId, setEditingId] = useState(null)

  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(6)
  const [sortOption, setSortOption] = useState('createdAt,desc')

  const [filters, setFilters] = useState({
    search: '',
    category: 'Wszystkie',
    minPrice: '',
    maxPrice: ''
  })

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Elektronika',
    location: '',
    contactPhone: '',
    imageUrl: ''
  })

  const fetchAds = (page = currentPage, currentSort = sortOption, currentFilters = filters) => {
    const params = new URLSearchParams()
    params.append('page', page)
    params.append('size', pageSize)
    const [sortBy, sortDir] = currentSort.split(',')
    params.append('sortBy', sortBy)
    params.append('sortDir', sortDir)

    if (currentFilters.search && currentFilters.search.trim()) {
      params.append('search', currentFilters.search.trim())
    }
    if (currentFilters.category && currentFilters.category !== 'Wszystkie') {
      params.append('category', currentFilters.category)
    }
    if (currentFilters.minPrice) params.append('minPrice', currentFilters.minPrice)
    if (currentFilters.maxPrice) params.append('maxPrice', currentFilters.maxPrice)

    const url = `http://localhost:8080/api/advertisements?${params.toString()}`

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Błąd serwera: ' + res.status)
        return res.json()
      })
      .then((data) => {
        if (data && Array.isArray(data.content)) {
          setAds(data.content)
          setTotalPages(data.totalPages)
          setTotalElements(data.totalElements)
          setCurrentPage(data.number)
        } else {
          setAds([])
        }
      })
      .catch((err) => {
        console.error('Błąd pobierania ogłoszeń:', err)
        setAds([])
      })
  }

  useEffect(() => {
    fetchAds(0, sortOption, filters)
  }, [])

  const handleSortChange = (e) => {
    const newSort = e.target.value
    setSortOption(newSort)
    setCurrentPage(0)
    fetchAds(0, newSort, filters)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
      fetchAds(newPage, sortOption, filters)
      window.scrollTo({ top: 300, behavior: 'smooth' })
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setCurrentPage(0)
    fetchAds(0, sortOption, filters)
  }

  const handleResetFilters = () => {
    const reset = { search: '', category: 'Wszystkie', minPrice: '', maxPrice: '' }
    setFilters(reset)
    setCurrentPage(0)
    fetchAds(0, sortOption, reset)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target

    // Jeśli pole to numer kontaktowy – pozwól tylko na cyfry (maksymalnie 9 cyfr)
    if (name === 'contactPhone') {
      const onlyDigits = value.replace(/\D/g, '').slice(0, 9)
      setFormData((prev) => ({ ...prev, [name]: onlyDigits }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 800
        const MAX_HEIGHT = 800
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8)
        setFormData((prev) => ({ ...prev, imageUrl: compressedBase64 }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleStartEdit = (ad) => {
    setEditingId(ad.id)
    setFormData({
      title: ad.title || '',
      description: ad.description || '',
      price: ad.price || '',
      category: ad.category || 'Elektronika',
      location: ad.location || '',
      contactPhone: ad.contactPhone || '',
      imageUrl: ad.imageUrl || ''
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      price: '',
      category: 'Elektronika',
      location: '',
      contactPhone: '',
      imageUrl: ''
    })
  }

  const handleSaveSubmit = (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    if (!token) {
      alert('Musisz być zalogowany, aby dodać ogłoszenie!')
      onOpenAuth()
      return
    }

    if (!formData.title.trim() || !formData.price || !formData.location.trim()) {
      alert('Uzupełnij wymagane pola: Tytuł, Cena oraz Lokalizacja!')
      return
    }

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      imageUrl: formData.imageUrl || null
    }

    const isEditing = editingId !== null
    const url = isEditing
      ? `http://localhost:8080/api/advertisements/${editingId}`
      : 'http://localhost:8080/api/advertisements'
    const method = isEditing ? 'PUT' : 'POST'

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Brak uprawnień. Zaloguj się ponownie.')
        }
        if (!res.ok) throw new Error('Błąd zapisu: ' + res.status)
        return res.json()
      })
      .then(() => {
        alert(isEditing ? 'Ogłoszenie zaktualizowane!' : 'Ogłoszenie opublikowane!')
        handleCloseForm()
        fetchAds(currentPage, sortOption, filters)
      })
      .catch((err) => alert(err.message))
  }

  const handleDeleteAd = (id, title) => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Musisz być zalogowany, aby usunąć ogłoszenie!')
      onOpenAuth()
      return
    }

    if (!window.confirm(`Czy na pewno chcesz usunąć ofertę "${title}"?`)) return

    fetch(`http://localhost:8080/api/advertisements/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.status === 403) {
          alert('Możesz usuwać tylko swoje własne ogłoszenia!')
          return
        }
        if (res.ok) {
          fetchAds(currentPage, sortOption, filters)
        }
      })
      .catch((err) => console.error('Błąd usuwania:', err))
  }

  return (
    <main style={{ maxWidth: '1280px', margin: '25px auto', padding: '0 20px' }}>
      
      {showForm && (
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#002f34' }}>
              {editingId ? '✏️ Edytuj ogłoszenie' : 'Dodaj nowe ogłoszenie'}
            </h2>
            <button onClick={handleCloseForm} style={styles.closeBtn}>✕</button>
          </div>

          <form onSubmit={handleSaveSubmit} style={styles.formGrid}>
            <div>
              <label style={styles.label}>Tytuł ogłoszenia *</label>
              <input
                type="text"
                name="title"
                placeholder="np. Rower miejski Romet"
                value={formData.title}
                onChange={handleFormChange}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Kategoria *</label>
              <select name="category" value={formData.category} onChange={handleFormChange} style={styles.input}>
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
                placeholder="np. 450.00"
                value={formData.price}
                onChange={handleFormChange}
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
                onChange={handleFormChange}
                style={styles.input}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={styles.label}>Zdjęcie ogłoszenia (JPG, PNG)</label>
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onChange={handleImageUpload}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '4px',
                  border: '1px dashed #cbd5e1',
                  cursor: 'pointer'
                }}
              />

              {formData.imageUrl && (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img
                    src={formData.imageUrl}
                    alt="Podgląd"
                    style={{
                      width: '90px',
                      height: '70px',
                      objectFit: 'contain',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1'
                    }}
                  />
                  <div>
                    <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 'bold' }}>✓ Zdjęcie ustawione</span>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                      style={{ display: 'block', marginTop: '4px', background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                    >
                      Usuń to zdjęcie
                    </button>
                  </div>
                </div>
              )}
            </div>

          <div style={{ gridColumn: 'span 2' }}>
              <label style={styles.label}>Numer kontaktowy (tylko cyfry, 9 znaków)</label>
              <input
                type="tel"
                inputMode="numeric"
                name="contactPhone"
                placeholder="np. 600700800"
                value={formData.contactPhone}
                onChange={handleFormChange}
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
                onChange={handleFormChange}
                style={{ ...styles.input, resize: 'vertical' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={handleCloseForm} style={styles.cancelBtn}>
                Anuluj
              </button>
              <button type="submit" style={styles.submitBtn}>
                {editingId ? 'Zapisz zmiany' : 'Opublikuj ogłoszenie'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* FILTRY WYSZUKIWARKI */}
      <section style={styles.searchSection}>
        <form onSubmit={handleSearchSubmit} style={styles.searchGrid}>
          <div>
            <label style={styles.filterLabel}>Szukaj frazy</label>
            <input
              type="text"
              name="search"
              placeholder="Czego szukasz?"
              value={filters.search}
              onChange={handleFilterChange}
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.filterLabel}>Kategoria</label>
            <select name="category" value={filters.category} onChange={handleFilterChange} style={styles.input}>
              <option value="Wszystkie">Wszystkie kategorie</option>
              <option value="Elektronika">Elektronika</option>
              <option value="Motoryzacja">Motoryzacja</option>
              <option value="Nieruchomości">Nieruchomości</option>
              <option value="Dom i Ogród">Dom i Ogród</option>
              <option value="Inne">Inne</option>
            </select>
          </div>

          <div>
            <label style={styles.filterLabel}>Cena od (PLN)</label>
            <input
              type="number"
              step="0.01"
              name="minPrice"
              placeholder="od"
              value={filters.minPrice}
              onChange={handleFilterChange}
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.filterLabel}>Cena do (PLN)</label>
            <input
              type="number"
              step="0.01"
              name="maxPrice"
              placeholder="do"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              style={styles.input}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" style={styles.searchBtn}>🔍 Szukaj</button>
            <button type="button" onClick={handleResetFilters} style={styles.resetBtn}>Wyczyść</button>
          </div>
        </form>
      </section>

      {/* LISTA OGŁOSZEŃ */}
      <section>
        <div style={styles.resultsHeader}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#002f34', margin: 0 }}>
              Aktualne ogłoszenia
            </h2>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
              Znaleziono: {totalElements} ofert (strona {totalPages > 0 ? currentPage + 1 : 0} z {totalPages})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Sortuj według:</label>
            <select
              value={sortOption}
              onChange={handleSortChange}
              style={styles.sortSelect}
            >
              <option value="createdAt,desc">Najnowsze</option>
              <option value="createdAt,asc">Najstarsze</option>
              <option value="price,asc">Cena: od najniższej</option>
              <option value="price,desc">Cena: od najwyższej</option>
            </select>
          </div>
        </div>

        {ads.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: '42px' }}>🔍</span>
            <h3 style={{ margin: '10px 0 5px 0', color: '#1e293b' }}>Brak ogłoszeń spełniających kryteria</h3>
            <p style={{ color: '#64748b', margin: 0 }}>
              Zmień parametry wyszukiwania lub zresetuj filtry.
            </p>
          </div>
        ) : (
          <div style={styles.adGrid}>
            {ads.map((ad) => {
              const isOwner = currentUser && ad.user && ad.user.email === currentUser.email
              const isAdmin = currentUser && currentUser.role === 'ROLE_ADMIN'
              const canManage = isOwner || isAdmin

              return (
                <div key={ad.id} style={styles.adCard}>
                  
                  <Link to={`/ogloszenie/${ad.id}`} style={styles.imageLink}>
                    <img
                      src={ad.imageUrl || PLACEHOLDER_IMG}
                      alt={ad.title}
                      style={styles.adImage}
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG }}
                    />
                  </Link>

                  <div style={styles.adBody}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={styles.categoryBadge}>{ad.category}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {ad.createdAt ? new Date(ad.createdAt).toLocaleDateString('pl-PL') : 'Dzisiaj'}
                        </span>
                      </div>

                      <Link to={`/ogloszenie/${ad.id}`} style={{ textDecoration: 'none' }}>
                        <h3 style={styles.adTitle} title={ad.title}>{ad.title}</h3>
                      </Link>

                      <p style={styles.adPrice}>{Number(ad.price).toFixed(2)} PLN</p>
                      <p style={styles.adDesc}>{ad.description || 'Brak opisu przedmiotu.'}</p>
                    </div>

                    <div style={styles.adFooter}>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        <div>📍 {ad.location}</div>
                        {ad.user && (
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                            👤 {ad.user.fullName}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <Link to={`/ogloszenie/${ad.id}`} style={styles.detailsBtn}>
                          Szczegóły
                        </Link>
                        
                        {canManage && (
                          <>
                            <button
                              onClick={() => handleStartEdit(ad)}
                              style={styles.editBtn}
                              title="Edytuj ofertę"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteAd(ad.id, ad.title)}
                              style={styles.deleteBtn}
                              title="Usuń ofertę"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}

        {/* PAGINACJA */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              style={{
                ...styles.pageBtn,
                opacity: currentPage === 0 ? 0.4 : 1,
                cursor: currentPage === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ◀ Poprzednia
            </button>

            {Array.from({ length: totalPages }, (_, idx) => (
              <button
                key={idx}
                onClick={() => handlePageChange(idx)}
                style={{
                  ...styles.pageNumberBtn,
                  backgroundColor: currentPage === idx ? '#002f34' : '#ffffff',
                  color: currentPage === idx ? '#ffffff' : '#002f34',
                  fontWeight: currentPage === idx ? '800' : '600'
                }}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              style={{
                ...styles.pageBtn,
                opacity: currentPage >= totalPages - 1 ? 0.4 : 1,
                cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Następna ▶
            </button>
          </div>
        )}
      </section>

    </main>
  )
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '8px',
    marginBottom: '25px',
    border: '1px solid #cbd5e1',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '10px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#64748b'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '5px',
    color: '#334155',
    textAlign: 'left'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
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
  },
  searchSection: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '25px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
  },
  searchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    alignItems: 'end'
  },
  filterLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#4b5563',
    marginBottom: '5px',
    textTransform: 'uppercase',
    textAlign: 'left'
  },
  searchBtn: {
    flex: 2,
    backgroundColor: '#002f34',
    color: '#ffffff',
    border: 'none',
    padding: '11px',
    borderRadius: '4px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px'
  },
  resetBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '11px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  sortSelect: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    color: '#002f34',
    cursor: 'pointer'
  },
  emptyState: {
    textAlign: 'center',
    padding: '50px 20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  adGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  },
  adCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
    textAlign: 'left'
  },
  imageLink: {
    width: '100%',
    height: '200px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    cursor: 'pointer'
  },
  adImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    display: 'block'
  },
  adBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: 1
  },
  categoryBadge: {
    backgroundColor: '#e6f7f8',
    color: '#00757a',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase'
  },
  adTitle: {
    margin: '0 0 6px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#002f34',
    cursor: 'pointer'
  },
  adPrice: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    fontWeight: '800',
    color: '#002f34'
  },
  adDesc: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  adFooter: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '12px',
    marginTop: '14px',
    display: 'flex',
    justifyContent: 'space-between',
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
  editBtn: {
    backgroundColor: '#e0f2fe',
    color: '#0284c7',
    border: '1px solid #bae6fd',
    padding: '6px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '6px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '35px',
    marginBottom: '20px'
  },
  pageBtn: {
    backgroundColor: '#ffffff',
    color: '#002f34',
    border: '1px solid #cbd5e1',
    padding: '8px 14px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '700'
  },
  pageNumberBtn: {
    border: '1px solid #cbd5e1',
    width: '38px',
    height: '38px',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
}