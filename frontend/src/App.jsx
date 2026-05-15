import React, { useState } from 'react'
import './App.css'

function App() {
  const [applications, setApplications] = useState([
    { id: 1, company: 'Google', role: 'Senior Software Engineer', status: 'Applied', date: '2024-05-10' },
    { id: 2, company: 'Meta', role: 'Product Designer', status: 'Interviewing', date: '2024-05-12' },
    { id: 3, company: 'Amazon', role: 'Frontend Developer', status: 'Draft', date: '2024-05-13' },
  ])

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>JobAgent AI</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Tu asistente personal para postulaciones inteligentes</p>
        </div>
        <button className="btn btn-primary">
          <span>+</span> Nueva Postulación
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <main>
          <section className="glass-card animate-fade-in">
            <h2 style={{ marginBottom: '1.5rem' }}>Mis Postulaciones</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem' }}>Empresa</th>
                    <th style={{ padding: '1rem' }}>Cargo</th>
                    <th style={{ padding: '1rem' }}>Estado</th>
                    <th style={{ padding: '1rem' }}>Fecha</th>
                    <th style={{ padding: '1rem' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{app.company}</td>
                      <td style={{ padding: '1rem' }}>{app.role}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge badge-${app.status.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{app.date}</td>
                      <td style={{ padding: '1rem' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.5rem' }}>Ver</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        <aside>
          <section className="glass-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 style={{ marginBottom: '1rem' }}>Agente Postulador</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Pega el link de la oferta para comenzar el proceso de adecuación de CV.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="URL de la oferta..." />
              <button className="btn btn-primary" style={{ width: '100%' }}>Analizar Oferta</button>
            </div>
          </section>
          
          <section className="glass-card animate-fade-in" style={{ marginTop: '1.5rem', animationDelay: '0.2s' }}>
            <h3 style={{ marginBottom: '1rem' }}>Resumen</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total</span>
                <span style={{ fontWeight: '600' }}>{applications.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Activas</span>
                <span style={{ fontWeight: '600', color: 'var(--accent)' }}>2</span>
              </div>
            </div>
          </section>

          <section className="glass-card animate-fade-in" style={{ marginTop: '1.5rem', animationDelay: '0.3s', background: '#000', border: '1px solid #333' }}>
            <h3 style={{ marginBottom: '1rem', color: '#0f0', fontSize: '0.75rem', fontFamily: 'monospace' }}>AGENT_CONSOLE_LOG</h3>
            <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#aaa', height: '150px', overflowY: 'auto' }}>
              <div>> Esperando comando...</div>
              <div style={{ color: '#0f0' }}>> Sistema listo para postular.</div>
              {/* This would be populated by actual agent logs */}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default App
