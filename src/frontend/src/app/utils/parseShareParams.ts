export interface ShareParams {
  user: string;
  linkTitle: string;
}

export function parseShareParams(): ShareParams | null {
  try {
    const hash = window.location.hash.slice(1); // Remove #
    const parts = hash.split('?');
    const route = parts[0];

    // Expected format: r/USER_PRINCIPAL/LINK_TITLE
    if (!route.startsWith('r/')) {
      return null;
    }

    const routeParts = route.split('/');
    if (routeParts.length < 3) {
      return null;
    }

    const user = decodeURIComponent(routeParts[1]);
    const linkTitle = decodeURIComponent(routeParts.slice(2).join('/'));

    if (!user || !linkTitle) {
      return null;
    }

    return { user, linkTitle };
  } catch (error) {
    console.error('Failed to parse share params:', error);
    return null;
  }
}
