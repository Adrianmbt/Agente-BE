import React, { useState } from "react";
import { jobsApi } from "../api";

export default function JobAnalyzer({ onApplicationCreated }) {
  const [tab, setTab] = useState("url"); // "url" | "text"
  const [jobUrl, setJobUrl] = useState("");
  const [jobText, setJobText] = useState("");
  const [step, setStep] = useState("idle"); // idle | scraping | tailoring | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState("cv"); // cv | cover | analysis

  const handleAnalyze = async () => {
    setError("");
    setResult(null);

    const payload = {
      save_as_application: true,
    };

    if (tab === "url") {
      if (!jobUrl.trim()) return setError("Ingresa una URL.");
      payload.job_url = jobUrl.trim();
      setStep("scraping");
    } else {
      if (!jobText.trim()) return setError("Ingresa la descripción del cargo.");
      payload.job_description = jobText.trim();
      setStep("tailoring");
    }

    try {
      setStep("tailoring");
      const data = await jobsApi.tailor(payload);
      setResult(data);
      setStep("done");
      onApplicationCreated?.();
    } catch (e) {
      setError(e.message);
      setStep("error");
    }
  };

  const steps = [
    { key: "scraping", label: "Analizando oferta..." },
    { key: "tailoring", label: "Adaptando CV con IA..." },
  ];

  return (
    <div className="glass-card animate-fade-in" style={{ animationDelay: "0.05s" }}>
      <div className="card-header">
        <span className="card-icon">🎯</span>
        <div>
          <h3>Analizar Oferta</h3>
          <p className="text-secondary" style={{ fontSize: "0.8rem" }}>
            El agente adapta tu CV automáticamente
          </p>
        </div>
      </div>

      {/* Tabs input */}
      <div className="tab-row" style={{ marginBottom: "1rem" }}>
        <button
          className={`tab-btn ${tab === "url" ? "active" : ""}`}
          onClick={() => setTab("url")}
        >
          🔗 Por URL
        </button>
        <button
          className={`tab-btn ${tab === "text" ? "active" : ""}`}
          onClick={() => setTab("text")}
        >
          📝 Pegar texto
        </button>
      </div>

      {tab === "url" ? (
        <input
          type="url"
          placeholder="https://linkedin.com/jobs/view/..."
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
          disabled={step === "tailoring" || step === "scraping"}
        />
      ) : (
        <textarea
          rows={5}
          placeholder="Pega aquí la descripción completa del trabajo..."
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          disabled={step === "tailoring"}
          style={{ resize: "vertical" }}
        />
      )}

      {error && <p className="error-msg" style={{ marginTop: "0.5rem" }}>{error}</p>}

      {(step === "scraping" || step === "tailoring") && (
        <div className="progress-bar-wrap">
          <div className={`progress-bar ${step}`} />
          <p className="text-secondary" style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
            {step === "scraping" ? "⛏ Extrayendo información de la oferta..." : "🤖 Adaptando tu CV con IA..."}
          </p>
        </div>
      )}

      {step !== "tailoring" && step !== "scraping" && (
        <button
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "1rem" }}
          onClick={handleAnalyze}
        >
          {step === "done" ? "✓ Analizar otra oferta" : "🚀 Adaptar mi CV"}
        </button>
      )}

      {/* Results */}
      {step === "done" && result && (
        <div className="result-panel animate-fade-in">
          {/* Score */}
          <div className="match-score-wrap">
            <div
              className="match-score-ring"
              style={{ "--score": `${result.match_score}%` }}
            >
              <span className="match-score-num">{result.match_score}%</span>
            </div>
            <div>
              <p style={{ fontWeight: 700 }}>Compatibilidad</p>
              <p className="text-secondary" style={{ fontSize: "0.8rem" }}>
                {result.match_score >= 75
                  ? "¡Excelente match! Postula con confianza."
                  : result.match_score >= 50
                  ? "Buen match. Considera destacar más experiencias."
                  : "Match moderado. Revisa las brechas detectadas."}
              </p>
            </div>
          </div>

          {/* Tabs result */}
          <div className="tab-row" style={{ margin: "1rem 0 0.75rem" }}>
            {["cv", "cover", "analysis"].map((v) => (
              <button
                key={v}
                className={`tab-btn ${activeView === v ? "active" : ""}`}
                onClick={() => setActiveView(v)}
              >
                {v === "cv" ? "📄 CV" : v === "cover" ? "✉️ Carta" : "🔍 Análisis"}
              </button>
            ))}
          </div>

          {activeView === "cv" && (
            <div className="result-content">
              <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.78rem", lineHeight: 1.6 }}>
                {result.tailored_cv}
              </pre>
            </div>
          )}
          {activeView === "cover" && (
            <div className="result-content">
              <p style={{ fontSize: "0.85rem", lineHeight: 1.7 }}>{result.cover_letter}</p>
            </div>
          )}
          {activeView === "analysis" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
              <div>
                <p style={{ fontWeight: 600, color: "var(--success)", marginBottom: "0.4rem" }}>
                  ✅ Tienes ({result.key_matches?.length})
                </p>
                <div className="tag-list">
                  {result.key_matches?.map((k) => (
                    <span key={k} className="tag tag-match">{k}</span>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontWeight: 600, color: "var(--warning)", marginBottom: "0.4rem" }}>
                  ⚠️ Brechas ({result.missing_skills?.length})
                </p>
                <div className="tag-list">
                  {result.missing_skills?.map((k) => (
                    <span key={k} className="tag tag-missing">{k}</span>
                  ))}
                </div>
              </div>
              {result.application_id && (
                <p className="text-secondary" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                  ✓ Guardado en postulaciones (ID: {result.application_id.slice(0, 8)}...)
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
