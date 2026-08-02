const COMBINING_MARK_START = 0x0300
const COMBINING_MARK_END = 0x036f

/** Normalizes text for accent-insensitive, case-insensitive comparison. */
export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .split('')
    .filter((char) => {
      const code = char.codePointAt(0) ?? 0
      return code < COMBINING_MARK_START || code > COMBINING_MARK_END
    })
    .join('')
    .toLowerCase()
    .trim()
}

export function matchesSearch(candidate: string, query: string): boolean {
  if (!query.trim()) return true
  return normalizeForSearch(candidate).includes(normalizeForSearch(query))
}
