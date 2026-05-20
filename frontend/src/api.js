/**
 * api.js — Cliente centralizado para comunicarse con el backend FastAPI.
 * Cambia BASE_URL si el backend corre en otro puerto o en producción.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(method, path, body = null, isFormData = false) {
  const options = {
    method,
    headers: isFormData ? {} : { "Content-Type": "application/json" },
  };
  if (body) {
    options.body = isFormData ? body : JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, options);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Error desconocido en la API");
  }

  if (res.status === 204) return null;
  return res.json();
}

// ── CV ────────────────────────────────────────────────────────────────────────
export const cvApi = {
  upload: (file) => {
    const form = new FormData();
    form.append("file", file);
    return request("POST", "/api/cv/upload", form, true);
  },
  get: () => request("GET", "/api/cv/"),
};

// ── Applications ──────────────────────────────────────────────────────────────
export const applicationsApi = {
  list: (status = null) =>
    request("GET", `/api/applications/${status ? `?status=${status}` : ""}`),
  create: (data) => request("POST", "/api/applications/", data),
  update: (id, data) => request("PATCH", `/api/applications/${id}`, data),
  delete: (id) => request("DELETE", `/api/applications/${id}`),
  stats: () => request("GET", "/api/applications/stats/summary"),
};

// ── Jobs ──────────────────────────────────────────────────────────────────────
export const jobsApi = {
  scrape: (url) => request("POST", "/api/jobs/scrape", { url }),
  tailor: (data) => request("POST", "/api/jobs/tailor", data),
};
