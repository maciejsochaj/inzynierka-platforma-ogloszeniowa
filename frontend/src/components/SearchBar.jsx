export default function SearchBar({ filters, onFilterChange, onSearch, onReset }) {
  return (
    <div style={styles.wrapper}>
      <form onSubmit={onSearch} style={styles.formGrid}>
        <div>
          <label style={styles.label}>Szukaj frazy</label>
          <input
            type="text"
            name="search"
            placeholder="Czego szukasz? (np. laptop, auto)"
            value={filters.search}
            onChange={onFilterChange}
            style={styles.input}
          />
        </div>

        <div>
          <label style={styles.label}>Kategoria</label>
          <select
            name="category"
            value={filters.category}
            onChange={onFilterChange}
            style={styles.input}
          >
            <option value="Wszystkie">Wszystkie kategorie</option>
            <option value="Elektronika">Elektronika</option>
            <option value="Motoryzacja">Motoryzacja</option>
            <option value="Nieruchomości">Nieruchomości</option>
            <option value="Dom i Ogród">Dom i Ogród</option>
            <option value="Inne">Inne</option>
          </select>
        </div>

        <div>
          <label style={styles.label}>Cena od (PLN)</label>
          <input
            type="number"
            step="0.01"
            name="minPrice"
            placeholder="Od"
            value={filters.minPrice}
            onChange={onFilterChange}
            style={styles.input}
          />
        </div>

        <div>
          <label style={styles.label}>Cena do (PLN)</label>
          <input
            type="number"
            step="0.01"
            name="maxPrice"
            placeholder="Do"
            value={filters.maxPrice}
            onChange={onFilterChange}
            style={styles.input}
          />
        </div>

        <div style={styles.buttonGroup}>
          <button type="submit" style={styles.searchButton}>
            🔍 Szukaj
          </button>
          <button type="button" onClick={onReset} style={styles.resetButton}>
            Wyczyść
          </button>
        </div>
      </form>
    </div>
  )
}

const styles = {
  wrapper: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    alignItems: 'end'
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#4b5563',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px'
  },
  searchButton: {
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
  resetButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '11px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  }
}