export function isValidCallback(url: string, baseFallback: string): boolean {
  // Rejeitar protocol-relative URLs (//evil.com) e URLs absolutas (://) — previne open redirect (T-1-01)
  if (url.startsWith("//") || url.includes("://")) return false;
  return url.startsWith(baseFallback);
}
