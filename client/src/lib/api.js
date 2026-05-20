export async function authedFetch(url, options = {}, getToken) {
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
