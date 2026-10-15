import { useState, useEffect } from 'react'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTitle, setNewTitle] = useState('')

  // Pobranie zadan z backendu (GET /api/tasks)
  const fetchTasks = () => {
    fetch('http://localhost:8080/api/tasks')
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error('Blad pobierania:', err))
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // Wyslanie nowego zadania (POST /api/tasks)
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    fetch('http://localhost:8080/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, completed: false })
    })
      .then((res) => res.json())
      .then(() => {
        setNewTitle('')
        fetchTasks() // odswiez liste z bazy
      })
      .catch((err) => console.error('Blad zapisu:', err))
  }

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h1>Lista zadan (z bazy danych)</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Wpisz tytul zadania..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={{ padding: '8px', width: '70%', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Dodaj
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              padding: '10px',
              borderBottom: '1px solid #ddd',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <span>{task.title}</span>
            <span style={{ color: task.completed ? 'green' : 'orange' }}>
              {task.completed ? 'Ukonczone' : 'W trakcie'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App