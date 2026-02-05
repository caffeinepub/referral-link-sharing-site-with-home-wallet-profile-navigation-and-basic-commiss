export function buildShareUrl(userPrincipal: string, linkTitle: string): string {
  const origin = window.location.origin;
  const encodedUser = encodeURIComponent(userPrincipal);
  const encodedTitle = encodeURIComponent(linkTitle);
  return `${origin}/#r/${encodedUser}/${encodedTitle}`;
}
