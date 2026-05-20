import React, { useRef, useState } from "react";
import CVUpload from "./components/CVUpload";
import JobAnalyzer from "./components/JobAnalyzer";
import ApplicationsTable from "./components/ApplicationsTable";
import "./index.css";

const VIEWS = [
  { key: "dashboard", label: "Dashboard", icon: "⚡" },
  { key: "analyzer",  label: "Analizar Oferta", icon: "🎯" },
  { key: "applications", label: "Postulaciones", icon: "📋" },
];

function App() {
  const [view, setView] = useState("dashboard");
  const [cvLoaded, setCvLoaded] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const tableRef = useRef();

  const handleApplicationCreated = () => {
    tableRef.current?.reload();
    // Si estamos en el analyzer, no cambiar de vista
  };

  return (
    <div className="app-layout">
      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">JA</div>
          <div>
            <p className="brand-name">JobAgent <span className="brand-ai">AI</span></p>
            <p className="brand-sub">Agente Postulador</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              className={`nav-item ${view === v.key ? "active" : ""}`}
              onClick={() => { setView(v.key); setSelectedApp(null); }}
            >
              <span className="nav-icon">{v.icon}</span>
              <span>{v.label}</span>
            </button>
          ))}
        </nav>

        {/* CV Upload en sidebar */}
        <div style={{ marginTop: "auto", padding: "1rem 0.5rem" }}>
          <CVUpload onCVLoaded={() => setCvLoaded(true)} />
        </div>

        <div className="sidebar-footer">
          <div className={`status-dot ${cvLoaded ? "online" : "offline"}`} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            {cvLoaded ? "CV cargado ✓" : "Sin CV — sube tu PDF"}
          </span>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <main className="main-content">
        {/* Header */}
        <header className="top-bar">
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.1rem" }}>
              {VIEWS.find((v) => v.key === view)?.icon}{" "}
              {VIEWS.find((v) => v.key === view)?.label}
            </h1>
            <p className="text-secondary" style={{ fontSize: "0.82rem" }}>
              {view === "dashboard" && "Resumen de tu actividad de búsqueda"}
              {view === "analyzer" && "Pega una URL o descripción y el agente adaptará tu CV"}
              {view === "applications" && "Gestiona y da seguimiento a todas tus postulaciones"}
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setView("analyzer")}
          >
            + Nueva Postulación
          </button>
        </header>

        <div className="content-area">

          {/* ── DASHBOARD ───────────────────────────────────────── */}
          {view === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {!cvLoaded && (
                <div className="alert-banner">
                  <span>👆</span>
                  <span>
                    Para comenzar, <strong>sube tu CV en PDF</strong> desde el panel izquierdo.
                    El agente lo usará como base para todas las adaptaciones.
                  </span>
                </div>
              )}

              {/* Quick stats */}
              <div className="stats-grid">
                {[
                  { label: "Total", statKey: "total", icon: "📊", color: "var(--primary)" },
                  { label: "Aplicado", statKey: "applied", icon: "✉️", color: "#2563eb" },
                  { label: "Entrevistas", statKey: "interviewing", icon: "💬", color: "#9333ea" },
                  { label: "Ofertas", statKey: "offer", icon: "🏆", color: "var(--success)" },
                ].map((s) => (
                  <StatCard key={s.statKey} {...s} />
                ))}
              </div>

              {/* Recent applications */}
              <ApplicationsTable
                ref={tableRef}
                onSelect={setSelectedApp}
              />
            </div>
          )}

          {/* ── ANALYZER ────────────────────────────────────────── */}
          {view === "analyzer" && (
            <div style={{ maxWidth: 700 }}>
              {!cvLoaded && (
                <div className="alert-banner" style={{ marginBottom: "1rem" }}>
                  <span>⚠️</span>
                  <span>Necesitas subir tu CV primero desde el panel izquierdo.</span>
                </div>
              )}
              <JobAnalyzer onApplicationCreated={handleApplicationCreated} />
            </div>
          )}

          {/* ── APPLICATIONS ─────────────────────────────────────── */}
          {view === "applications" && (
            <ApplicationsTable
              ref={tableRef}
              onSelect={setSelectedApp}
            />
          )}
        </div>
      </main>

      {/* ── Application Detail Drawer ─────────────────────────── */}
      {selectedApp && (
        <AppDrawer app={selectedApp} onClose={() => setSelectedApp(null)} />
      )}
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, key: statKey, icon, color }) {
  const [count, setCount] = React.useState("—");

  React.useEffect(() => {
    import("./api").then(({ applicationsApi }) => {
      applicationsApi.stats().then((s) => {
        setCount(statKey === "total" ? s.total : (s.by_status[statKey] ?? 0));
      }).catch(() => setCount(0));
    });
  }, [statKey]);

  return (
    <div className="stat-card" style={{ "--accent-color": color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-num">{count}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ── Application Detail Drawer ────────────────────────────────────────────────
function AppDrawer({ app, onClose }) {
  const [drawerTab, setDrawerTab] = React.useState("cv");

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h2 style={{ fontSize: "1.1rem" }}>{app.job_title}</h2>
            <p className="text-secondary" style={{ fontSize: "0.82rem" }}>{app.company_name}</p>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div className="tab-row" style={{ margin: "1rem 0" }}>
          {[["cv", "📄 CV Adaptado"], ["cover", "✉️ Carta"], ["details", "📌 Detalles"]].map(([k, l]) => (
            <button key={k} className={`tab-btn ${drawerTab === k ? "active" : ""}`} onClick={() => setDrawerTab(k)}>
              {l}
            </button>
          ))}
        </div>

        {drawerTab === "cv" && (
          <div className="result-content">
            {app.tailored_cv_text
              ? <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.78rem", lineHeight: 1.7 }}>{app.tailored_cv_text}</pre>
              : <p className="text-secondary">No hay CV adaptado para esta postulación.</p>}
          </div>
        )}
        {drawerTab === "cover" && (
          <div className="result-content">
            {app.cover_letter
              ? <p style={{ fontSize: "0.85rem", lineHeight: 1.8 }}>{app.cover_letter}</p>
              : <p className="text-secondary">No hay carta de presentación.</p>}
          </div>
        )}
        {drawerTab === "details" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
            {app.job_url && <p><strong>URL:</strong>{" "}<a href={app.job_url} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>{app.job_url}</a></p>}
            {app.match_score != null && <p><strong>Score:</strong> {app.match_score}%</p>}
            <p><strong>Estado:</strong> {app.status}</p>
            <p><strong>Creado:</strong> {new Date(app.created_at).toLocaleString("es-ES")}</p>
            {app.notes && <p><strong>Notas:</strong> {app.notes}</p>}
            {app.job_description && (
              <>
                <p><strong>Descripción del cargo:</strong></p>
                <div className="result-content" style={{ maxHeight: 200 }}>
                  <p style={{ fontSize: "0.78rem", lineHeight: 1.6 }}>{app.job_description.slice(0, 800)}...</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
