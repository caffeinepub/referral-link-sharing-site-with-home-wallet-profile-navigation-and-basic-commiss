/**
 * Environment detection utility for draft vs production builds.
 * Returns true if the app is running in draft/preview mode (development or staging).
 * Returns false if the app is running in production mode.
 */
export function isDraftEnvironment(): boolean {
  // In Vite, import.meta.env.MODE is 'development' during dev server
  // and 'production' during build. We can also check import.meta.env.DEV.
  // For this use case, we treat any non-production build as draft.
  return import.meta.env.DEV || import.meta.env.MODE !== 'production';
}
