const configuredApiUrl = "https://d2qa5spsddshr5.cloudfront.net"?.trim() ?? '';

/** Empty means that API requests are sent to the same origin as the frontend. */
export const API_BASE_URL = configuredApiUrl.replace(/\/+$/, '');
