/**
 * Rewrites share links from common cloud drives into direct-file URLs, so
 * they can be used as an <audio>/<embed> src or fed to react-pdf. Left
 * as-is if the pattern isn't recognized — the raw URL is still usable.
 */
export function normalizeExternalLink(rawUrl: string): string {
  const url = rawUrl.trim()
  if (!url) return url

  // Dropbox share links default to an HTML preview page (dl=0);
  // dl=1 forces Dropbox to serve the raw file instead.
  if (url.includes('dropbox.com')) {
    if (/[?&]dl=1(&|$)/.test(url)) return url
    if (/[?&]dl=0(&|$)/.test(url)) return url.replace('dl=0', 'dl=1')
    return url + (url.includes('?') ? '&dl=1' : '?dl=1')
  }

  // Google Drive "view" links need to be rewritten to a direct-download form.
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  if (driveMatch) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`
  }

  return url
}

export function isLikelyValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
