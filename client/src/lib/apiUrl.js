export function getApiUrl(path) {
  const base = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/$/, "");

  if (!base) {
    throw new Error(
      "VITE_API_URL is missing. In client/.env use: VITE_API_URL=https://your-backend.vercel.app (no spaces around =)"
    );
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
