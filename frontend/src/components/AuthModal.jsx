import { useState } from 'react'

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  })
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')

    const url = isLoginMode
      ? 'http://localhost:8080/api/auth/login'
      : 'http://localhost:8080/api/auth/register'

    const payload = isLoginMode
      ? { email: formData.email, password: formData.password }
      : formData

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.message || 'Błąd autoryzacji. Sprawdź wprowadzone dane.')
        }
        return data
      })
      .then((data) => {
        // Zapisujemy token i dane użytkownika w pamięci podręcznej przeglądarki
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify({
          email: data.email,
          fullName: data.fullName,
          role: data.role
        }))
        onAuthSuccess(data)
        onClose()
      })
      .catch((err) => {
        setErrorMsg(err.message)
      })
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={{ margin: 0, color: '#002f34', fontSize: '20px' }}>
            {isLoginMode ? 'Zaloguj się do portalu' : 'Utwórz nowe konto'}
          </h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {errorMsg && (
          <div style={styles.errorBox}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLoginMode && (
            <div>
              <label style={styles.label}>Imię i nazwisko</label>
              <input
                type="text"
                name="fullName"
                required
                placeholder="np. Jan Kowalski"
                value={formData.fullName}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          )}

          <div>
            <label style={styles.label}>Adres e-mail</label>
            <input
              type="email"
              name="email"
              required
              placeholder="twoj@email.com"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Hasło</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.submitBtn}>
            {isLoginMode ? 'Zaloguj się' : 'Zarejestruj konto'}
          </button>
        </form>

        <div style={styles.toggleFooter}>
          {isLoginMode ? (
            <span>
              Nie masz jeszcze konta?{' '}
              <button
                type="button"
                onClick={() => { setIsLoginMode(false); setErrorMsg('') }}
                style={styles.toggleBtn}
              >
                Zarejestruj się
              </button>
            </span>
          ) : (
            <span>
              Masz już konto?{' '}
              <button
                type="button"
                onClick={() => { setIsLoginMode(true); setErrorMsg('') }}
                style={styles.toggleBtn}
              >
                Zaloguj się
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 47, 52, 0.65)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    width: '100%',
    maxWidth: '420px',
    padding: '28px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#64748b'
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '15px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
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
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  submitBtn: {
    marginTop: '6px',
    backgroundColor: '#002f34',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer'
  },
  toggleFooter: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#64748b'
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#00757a',
    fontWeight: '700',
    cursor: 'pointer',
    textDecoration: 'underline'
  }
}