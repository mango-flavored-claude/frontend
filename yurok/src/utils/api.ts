const configuredApiUrl = import.meta.env.VITE_API_URL?.trim() ?? '';

/** Empty means that API requests are sent to the same origin as the frontend. */
export const API_BASE_URL = configuredApiUrl.replace(/\/+$/, '');
