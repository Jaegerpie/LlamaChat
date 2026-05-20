import { getApiUrl } from "./apiUrl";

export async function authedFetch(path, options = {}, getToken) {
  const url = path.startsWith("http") ? path : getApiUrl(path);
  const token = await getToken();

  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
