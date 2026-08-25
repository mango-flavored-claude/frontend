/**
 * Returns a public asset URL that respects Vite's configured deployment base.
 * This keeps assets working both at a domain root and below a path such as
 * GitHub Pages' /frontend/ URL.
 */
export const publicAsset = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
