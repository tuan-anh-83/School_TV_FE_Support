const originalFetch = globalThis.fetch;

/**
 * @param {URL | string} request
 * @param {Parameters<typeof originalFetch>[1]} requestInit
 * @returns {Promise<Response>}
 */
export default function apiFetch(request, requestInit) {
  const url = new URL(request, import.meta.env.VITE_SERVER_API_URL);
  const token = localStorage.getItem("authToken")?.replaceAll('"', "");
  const headers = {
    Accept: "application/json",
    ...requestInit?.headers,
    Authorization: `Bearer ${token}`,
  };

  return originalFetch(url, { ...requestInit, headers });
}
