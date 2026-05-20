import React, { useState, useRef } from "react";
import { cvApi } from "../api";

export default function CVUpload({ onCVLoaded }) {
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [cvInfo, setCvInfo] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file || !file.name.endsWith(".pdf")) {
      setError("Solo se aceptan archivos PDF.");
      setStatus("error");
      return;
    }
    setStatus("uploading");
    setError("");
    try {
      const result = await cvApi.upload(file);
      setCvInfo(result);
      setStatus("success");
      onCVLoaded?.(result.base_cv_text);
    } catch (e) {
      setError(e.message);
      setStatus("error");
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div className="glass-card animate-fade-in">
      <div className="card-header">
        <span className="card-icon">📄</span>
        <div>
          <h3>Tu CV Base</h3>
          <p className="text-secondary" style={{ fontSize: "0.8rem" }}>
            Se usará para todas las adaptaciones
          </p>
        </div>
      </div>

      {status === "success" && cvInfo ? (
        <div className="cv-success">
          <div className="cv-success-icon">✓</div>
          <div>
            <p className="cv-filename">{cvInfo.base_cv_filename}</p>
            <p className="text-secondary" style={{ fontSize: "0.75rem" }}>
              {cvInfo.base_cv_text?.length?.toLocaleString()} caracteres extraídos
            </p>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => { setStatus("idle"); setCvInfo(null); }}
          >
            Cambiar
          </button>
        </div>
      ) : (
        <div
          className={`drop-zone ${dragOver ? "drag-over" : ""} ${status === "uploading" ? "uploading" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => status !== "uploading" && fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {status === "uploading" ? (
            <div className="upload-spinner">
              <div className="spinner" />
              <p>Extrayendo texto del CV...</p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>☁️</div>
              <p style={{ fontWeight: 600 }}>Arrastra tu PDF aquí</p>
              <p className="text-secondary" style={{ fontSize: "0.8rem" }}>
                o haz clic para seleccionar
              </p>
            </>
          )}
        </div>
      )}

      {status === "error" && (
        <p className="error-msg">{error}</p>
      )}
    </div>
  );
}
