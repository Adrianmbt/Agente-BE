import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { applicationsApi } from "../api";

const STATUS_CONFIG = {
  draft:        { label: "Borrador",     color: "#475569" },
  applied:      { label: "Aplicado",     color: "#2563eb" },
  interviewing: { label: "Entrevista",   color: "#9333ea" },
  rejected:     { label: "Rechazado",    color: "#dc2626" },
  offer:        { label: "Oferta",       color: "#059669" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span
      style={{
        background: cfg.color + "22",
        color: cfg.color,
        border: `1px solid ${cfg.color}55`,
        padding: "0.2rem 0.6rem",
        borderRadius: 999,
        fontSize: "0.72rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {cfg.label}
    </span>
  );
}

const ApplicationsTable = forwardRef(function ApplicationsTable({ onSelect }, ref) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [data, s] = await Promise.all([
        applicationsApi.list(),
        applicationsApi.stats(),
      ]);
      setApps(data);
      setStats(s);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Exponer función reload al padre via ref
  useImperativeHandle(ref, () => ({ reload: load }));

  const handleStatusChange = async (app, newStatus) => {
    try {
      await applicationsApi.update(app.id, { status: newStatus });
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta postulación?")) return;
    try {
      await applicationsApi.delete(id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const filtered = filterStatus === "all"
    ? apps
    : apps.filter((a) => a.status === filterStatus);

  return (
    <section className="glass-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>📋</span> Mis Postulaciones
          {stats && (
            <span style={{ fontSize: "0.8rem", fontWeight: 400, color: "var(--text-secondary)", marginLeft: "0.25rem" }}>
              ({stats.total} total)
            </span>
          )}
        </h2>

        {/* Stats pills */}
        {stats && (
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              stats.by_status[key] > 0 && (
                <span key={key} style={{ background: cfg.color + "22", color: cfg.color, border: `1px solid ${cfg.color}44`, padding: "0.15rem 0.5rem", borderRadius: 999, fontSize: "0.7rem", fontWeight: 700 }}>
                  {cfg.label} {stats.by_status[key]}
                </span>
              )
            ))}
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="tab-row" style={{ marginBottom: "1rem" }}>
        {[["all", "Todas"], ...Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label])].map(([key, label]) => (
          <button
            key={key}
            className={`tab-btn ${filterStatus === key ? "active" : ""}`}
            onClick={() => setFilterStatus(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          <p>Cargando postulaciones...</p>
        </div>
      ) : error ? (
        <div className="error-msg">{error}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-secondary)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🗂️</div>
          <p>No hay postulaciones aún.</p>
          <p style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>Analiza una oferta para comenzar.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="apps-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Cargo</th>
                <th>Estado</th>
                <th>Match</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id} onClick={() => onSelect?.(app)} className="table-row-hover">
                  <td style={{ fontWeight: 600 }}>{app.company_name}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{app.job_title}</td>
                  <td>
                    <select
                      className="status-select"
                      value={app.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusChange(app, e.target.value)}
                    >
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {app.match_score != null ? (
                      <div className="mini-score" style={{ "--s": app.match_score >= 75 ? "var(--success)" : app.match_score >= 50 ? "var(--warning)" : "var(--danger)" }}>
                        <span>{app.match_score}%</span>
                      </div>
                    ) : "—"}
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                    {new Date(app.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => onSelect?.(app)}>Ver</button>
                      <button className="btn btn-ghost btn-sm danger" onClick={() => handleDelete(app.id)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
});

export default ApplicationsTable;
