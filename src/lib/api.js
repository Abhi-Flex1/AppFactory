/**
 * JSON API client. Everything is relative, so the same code works against the
 * Vite dev proxy (:5173 → :3000) and against Express serving dist/ in production.
 */

export async function api(path, { signal } = {}) {
  const res = await fetch(path, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

export const getApps = (opts) => api("/api/apps", opts);
export const getApp = (id, opts) => api(`/api/apps/${id}`, opts);
export const getContributors = (opts) => api("/api/contributors", opts);
export const getShots = (opts) => api("/api/shots", opts);
export const getRelease = (id, opts) => api(`/api/releases/${id}`, opts);